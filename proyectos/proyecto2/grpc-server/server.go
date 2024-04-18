package main

import (
	"context"
	"encoding/json"
	"fmt"
	pb "grpc-server/proto"
	"log"
	"net"
	"os"

	"github.com/confluentinc/confluent-kafka-go/kafka"
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
	url := os.Getenv("KAFKA_BROKER")
	if url == "" {
		return defaultURL
	}
	return url
}

func sendVote(data Data) {

	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Fatalln("Error al convertir a JSON: ", err)
	}

	topic := "votes"
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": getKafkaBrokerURL()})
	if err != nil {
		log.Fatalln("Error al crear el productor: ", err)
	}

	defer producer.Close()

	deliveryChan := make(chan kafka.Event)

	producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Value:          jsonData,
	}, deliveryChan)

	e := <-deliveryChan
	m := e.(*kafka.Message)

	if m.TopicPartition.Error != nil {
		log.Fatalln("Error al enviar mensaje: ", m.TopicPartition.Error)
	} else {
		fmt.Println("Mensaje enviado a la partición: ", m.TopicPartition)
	}
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

	listen, err := net.Listen("tcp", getPort())
	if err != nil {
		log.Fatalln(err)
	}
	s := grpc.NewServer()
	pb.RegisterGetInfoServer(s, &server{})

	if err := s.Serve(listen); err != nil {
		log.Fatalln(err)
	}
}
