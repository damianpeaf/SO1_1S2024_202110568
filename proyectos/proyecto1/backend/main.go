package main

import (
	"bytes"
	"fmt"
	"os/exec"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// Crea una nueva instancia de la aplicación Fiber
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Ruta de ejemplo
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("¡Hola, mundo!")
	})

	app.Get("/proc-tree-info", func(c *fiber.Ctx) error {
		cmd := exec.Command("cat", "/proc/cpu_so1_1s2024")
		var out bytes.Buffer
		cmd.Stdout = &out
		err := cmd.Run()
		if err != nil {
			fmt.Println(err)
			return c.SendString("Error al ejecutar el comando")
		}
		c.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSONCharsetUTF8)
		return c.SendString(out.String())
	})

	app.Get("/cpu-info", func(c *fiber.Ctx) error {
		cmd := exec.Command("sh", "-c", "mpstat | awk 'NR==4 {print $NF}'")
		// Capturar la salida estándar
		var stdout bytes.Buffer
		cmd.Stdout = &stdout

		// Ejecutar el comando
		err := cmd.Run()
		if err != nil {
			return c.SendString("Error al ejecutar el comando")
		}

		trimmedOutput := strings.Replace(strings.TrimSpace(stdout.String()), ",", ".", -1)

		// Convertir la cadena a un número con dos decimales
		number, err := strconv.ParseFloat(trimmedOutput, 64)
		if err != nil {
			fmt.Println("Error al convertir la cadena a número:", err)
			return c.SendString("Error al convertir la cadena a número")
		}
		formattedNumber := fmt.Sprintf("%.2f", number)

		c.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSONCharsetUTF8)
		return c.JSON(
			fiber.Map{
				"idle": formattedNumber,
			})
	})

	app.Get("/ram-info", func(c *fiber.Ctx) error {
		cmd := exec.Command("cat", "/proc/ram_so1_1s2024")
		var out bytes.Buffer
		cmd.Stdout = &out
		err := cmd.Run()
		if err != nil {
			fmt.Println(err)
			return c.SendString("Error al ejecutar el comando")
		}
		c.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSONCharsetUTF8)
		return c.SendString(out.String())
	})

	// Escucha en el puerto 3000 y maneja errores si hay alguno
	err := app.Listen(":8080")
	if err != nil {
		panic(err)
	}
}
