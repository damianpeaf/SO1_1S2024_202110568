package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"

	"encoding/json"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/go-redis/redis/v8"
)

type Vote struct {
	Name  string `json:"name"`
	Album string `json:"album"`
	Rank  string `json:"rank"`
	Year  string `json:"year"`
}

func getKafkaBrokerURL() string {
	defaultURL := "localhost:42555" // localhost:42555
	url := os.Getenv("KAFKA_BROKER")
	if url == "" {
		return defaultURL
	}
	return url
}

func getMongoURL() string {
	defaultURL := "mongodb://localhost:27017"
	url := os.Getenv("MONGO_URL")
	if url == "" {
		return defaultURL
	}
	return url
}

func getRedisURL() string {
	defaultURL := "localhost:6379"
	url := os.Getenv("REDIS_URL")
	if url == "" {
		return defaultURL
	}
	return url
}

func getRedisPassword() string {
	defaultPassword := ""
	password := os.Getenv("REDIS_PASSWORD")
	if password == "" {
		return defaultPassword
	}
	return password
}

func main() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": getKafkaBrokerURL(),
		"group.id":          "consumer-default-group",
		"auto.offset.reset": "earliest",
	})

	mongoOptions := options.Client().ApplyURI(getMongoURL())

	mongoClient, err := mongo.Connect(nil, mongoOptions)
	if err != nil {
		log.Fatalf("Error al conectar a la base de datos: %s\n", err)
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:     getRedisURL(),
		Password: getRedisPassword(),
		DB:       0,
	})

	fmt.Println("Conectado a la base de datos")

	defer func() {
		err := mongoClient.Disconnect(nil)
		if err != nil {
			log.Fatalf("Error al desconectar de la base de datos: %s\n", err)
		}
	}()

	if err != nil {
		log.Fatalf("Error al crear el consumidor: %s\n", err)
	}

	topic := "votes"
	err = c.SubscribeTopics([]string{topic}, nil)
	if err != nil {
		log.Fatalf("Error al subscribirse al topic: %s\n", err)
	}

	sigchan := make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)

	run := true
	for run {

		select {
		case sig := <-sigchan:
			log.Printf("Terminando por señal: %v\n", sig)
			run = false
		default:
			msg, err := c.ReadMessage(100 * time.Millisecond)
			if err != nil {
				continue
			}

			log.Printf("Mensaje recibido: %s\n", string(msg.Value))
			// value is like { "name": "Band B", "album": "Album A1", "rank": "1", "year": "1924" } (byte)

			vote := Vote{}
			err = json.Unmarshal(msg.Value, &vote)
			if err != nil {
				log.Printf("Error al decodificar el mensaje: %s\n", err)
				continue
			}

			collection := mongoClient.Database("so1_proyecto2").Collection("votes")
			_, err = collection.InsertOne(nil, vote)
			if err != nil {
				log.Printf("Error al insertar en la base de datos: %s\n", err)
				continue
			}

			// Grabando en redis los votos por banda y por album

			// Votos por banda
			err = rdb.HIncrBy(nil, "votos_banda", vote.Name, 1).Err()
			if err != nil {
				log.Printf("Error al incrementar votos por banda: %s\n", err)
			}

			// Votos por album
			err = rdb.HIncrBy(nil, "votos_album", vote.Album, 1).Err()
			if err != nil {
				log.Printf("Error al incrementar votos por album: %s\n", err)
			}

			log.Printf("Voto insertado: %s\n", vote)
		}
	}

	c.Close()
}
