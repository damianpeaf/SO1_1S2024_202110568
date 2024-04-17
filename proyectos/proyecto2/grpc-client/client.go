package main

import (
	"context"
	"fmt"
	pb "grpc-client/proto"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var ctx = context.Background()

type VoteStruct struct {
	Name  string
	Album string
	Year  string
	Rank  string
}

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = ":3000"
	} else {
		port = ":" + port
	}

	return port
}

func getServerURL() string {
	url := os.Getenv("GRPC_SERVER_URL")
	if url == "" {
		url = "localhost:3001"
	}

	return url
}

func processVote(c *fiber.Ctx) error {
	var data map[string]string
	e := c.BodyParser(&data)
	if e != nil {
		return e
	}
	fmt.Println("Processing vote")

	voto := VoteStruct{
		Name:  data["name"],
		Album: data["album"],
		Year:  data["year"],
		Rank:  data["rank"],
	}

	go sendToServer(voto)
	return nil
}

func sendToServer(voto VoteStruct) {
	fmt.Println("Enviando voto al server")
	fmt.Println(getServerURL())
	conn, err := grpc.Dial(getServerURL(), grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock())
	if err != nil {
		log.Fatalln(err)
	}

	cl := pb.NewGetInfoClient(conn)
	defer func(conn *grpc.ClientConn) {
		err := conn.Close()
		if err != nil {
			log.Fatalln(err)
		}
	}(conn)

	ret, err := cl.ReturnInfo(ctx, &pb.RequestId{
		Name:  voto.Name,
		Album: voto.Album,
		Year:  voto.Year,
		Rank:  voto.Rank,
	})
	if err != nil {
		log.Fatalln(err)
	}

	fmt.Println("Respuesta del server " + ret.GetInfo())
}

func main() {
	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"res": "hola mundo",
		})
	})
	app.Post("/vote", processVote)

	err := app.Listen(getPort())
	if err != nil {
		return
	}
}
