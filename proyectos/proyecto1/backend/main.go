package main

import (
	"github.com/gofiber/fiber/v2"
)

func main() {
	// Crea una nueva instancia de la aplicación Fiber
	app := fiber.New()

	// Ruta de ejemplo
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("¡Hola, mundo!")
	})

	// Escucha en el puerto 3000 y maneja errores si hay alguno
	err := app.Listen(":3000")
	if err != nil {
		panic(err)
	}
}
