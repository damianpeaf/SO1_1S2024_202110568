package main

import (
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = ":8080"
	} else {
		port = ":" + port
	}

	return port
}

func main() {

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Get("/data", func(c *fiber.Ctx) error {
		fmt.Println("GET /data")

		return c.JSON(struct {
			Name string `json:"name"`
			ID   int    `json:"id"`
		}{
			Name: "Damián Ignacio Peña Afre",
			ID:   202110568,
		})

	})

	app.Listen(getPort())

}
