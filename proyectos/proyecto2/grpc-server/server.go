package main

import (
	"context"
	"encoding/json"
	"fmt"
	pb "grpc-server/proto"
	"log"
	"net"
	"os"

	"github.com/IBM/sarama"
	"github.com/joho/godotenv"
	"google.golang.org/grpc"
)

type server struct {
	pb.UnimplementedGetInfoServer
}

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = ":3001"
	} else {
		port = ":" + port
	}

	return port
}

type Data struct {
	Name  string
	Album string
	Year  string
	Rank  string
}

func getKafkaBrokerURL() string {
	defaultURL := "localhost:9092"
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error cargando el archivo .env: %s", err)
		return defaultURL
	}

	url := os.Getenv("KAFKA_BROKER")
	if url == "" {
		return defaultURL
	}
	return url
}

var producer sarama.SyncProducer

func kafkaConnection() {

	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error cargando el archivo .env: %s", err)
	}

	broker := getKafkaBrokerURL()
	config := sarama.NewConfig()
	config.Producer.Return.Successes = true
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5

	var err error
	producer, err = sarama.NewSyncProducer([]string{broker}, config)
	if err != nil {
		log.Fatalln("Error al conectar con Kafka: ", err)
	}

}

func sendVote(data Data) {

	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Fatalln("Error al convertir a JSON: ", err)
	}

	msg := &sarama.ProducerMessage{
		Topic: "votes",
		Value: sarama.StringEncoder(jsonData),
	}
	partition, offset, err := producer.SendMessage(msg)
	if err != nil {
		log.Fatalln("Error al enviar mensaje a Kafka: ", err)
	}
	fmt.Printf("Mensaje enviado a partición %d en offset %d\n", partition, offset)
}

func (s *server) ReturnInfo(ctx context.Context, in *pb.RequestId) (*pb.ReplyInfo, error) {
	fmt.Println("Recibí de cliente: ", in.GetRank())
	data := Data{
		Name:  in.GetName(),
		Album: in.GetAlbum(),
		Year:  in.GetYear(),
		Rank:  in.GetRank(),
	}
	fmt.Println(data)
	sendVote(data)
	return &pb.ReplyInfo{Info: "Hola cliente, recibí el comentario"}, nil
}

func main() {

	defer producer.Close()

	listen, err := net.Listen("tcp", getPort())
	if err != nil {
		log.Fatalln(err)
	}
	s := grpc.NewServer()
	pb.RegisterGetInfoServer(s, &server{})

	kafkaConnection()

	if err := s.Serve(listen); err != nil {
		log.Fatalln(err)
	}
}
