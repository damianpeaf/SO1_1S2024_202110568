package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

func getKafkaBrokerURL() string {
	defaultURL := "localhost:42555" // localhost:42555
	url := os.Getenv("KAFKA_BROKER")
	if url == "" {
		return defaultURL
	}
	return url
}

func main() {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": getKafkaBrokerURL(),
		"group.id":          "consumer-default-group",
		"auto.offset.reset": "earliest",
	})

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

		}
	}

	c.Close()
}
