package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"os/exec"
	"strconv"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type CpuInfo struct {
	Id              int    `json:"id"`
	UsagePercentage string `json:"usage_percentage"`
	CreatedAt       string `json:"created_at"`
}

type MemoryInfo struct {
	Id              int    `json:"id"`
	UsagePercentage string `json:"usage_percentage"`
	CreatedAt       string `json:"created_at"`
}

type HistoricalInfo struct {
	CpuInfo    []CpuInfo    `json:"cpu_info"`
	MemoryInfo []MemoryInfo `json:"memory_info"`
}

func getCpuIdle() (string, error) {
	cmd := exec.Command("sh", "-c", "mpstat | awk 'NR==4 {print $NF}'")
	// Capturar la salida estándar
	var stdout bytes.Buffer
	cmd.Stdout = &stdout

	// Ejecutar el comando
	err := cmd.Run()
	if err != nil {
		return "", err
	}

	trimmedOutput := strings.Replace(strings.TrimSpace(stdout.String()), ",", ".", -1)

	// Convertir la cadena a un número con dos decimales
	number, err := strconv.ParseFloat(trimmedOutput, 64)
	if err != nil {
		fmt.Println("Error al convertir la cadena a número:", err)
		return "", err
	}
	formattedNumber := fmt.Sprintf("%.2f", number)
	return formattedNumber, nil
}

func getRamUsage() (string, error) {
	cmd := exec.Command("cat", "/proc/ram_so1_1s2024")
	var out bytes.Buffer
	cmd.Stdout = &out
	err := cmd.Run()
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	return out.String(), nil
}

func main() {
	// Crea una nueva instancia de la aplicación Fiber
	db, err := sql.Open("mysql", "so1-proyecto1:so1-proyecto1@tcp(database:3306)/so1-proyecto1")
	if err != nil {
		panic(err)
	}
	defer db.Close()

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
		idle, error := getCpuIdle()
		if error != nil {
			return c.SendString("Error al obtener el uso de la CPU")
		}
		c.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSONCharsetUTF8)
		return c.JSON(
			fiber.Map{
				"idle": idle,
			})
	})

	app.Get("/ram-info", func(c *fiber.Ctx) error {

		out, error := getRamUsage()
		if error != nil {
			return c.SendString("Error al obtener el uso de la RAM")
		}

		c.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSONCharsetUTF8)
		return c.SendString(out)
	})

	app.Get("/historical-info", func(c *fiber.Ctx) error {
		results := HistoricalInfo{}

		rows, err := db.Query("SELECT * FROM cpu_info ORDER BY id DESC LIMIT 60")
		if err != nil {
			return c.SendString("Error al obtener el uso de la CPU")
		}
		defer rows.Close()
		for rows.Next() {
			var cpuInfo CpuInfo
			err := rows.Scan(&cpuInfo.Id, &cpuInfo.UsagePercentage, &cpuInfo.CreatedAt)
			if err != nil {
				return c.SendString("Error al escanear la fila")
			}
			results.CpuInfo = append(results.CpuInfo, cpuInfo)
		}

		rows, err = db.Query("SELECT * FROM memory_info")
		if err != nil {
			return c.SendString("Error al obtener el uso de la RAM")
		}

		defer rows.Close()
		for rows.Next() {
			var memoryInfo MemoryInfo
			err := rows.Scan(&memoryInfo.Id, &memoryInfo.UsagePercentage, &memoryInfo.CreatedAt)
			if err != nil {
				return c.SendString("Error al escanear la fila")
			}
			results.MemoryInfo = append(results.MemoryInfo, memoryInfo)
		}

		c.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSONCharsetUTF8)
		return c.JSON(results)
	})

	go func() {
		err := app.Listen(":8080")
		if err != nil {
			panic(err)
		}
	}()

	// timer for saving the data
	interval := 5
	ticker := time.NewTicker(time.Duration(interval) * time.Second)
	defer ticker.Stop()

	go func() {
		for range ticker.C {
			cpu_idle, err1 := getCpuIdle()
			ram_info, err2 := getRamUsage()

			if err1 != nil || err2 != nil {
				fmt.Println("Error al obtener el uso: ", err1, err2)
			}
			cpu_idle_float, err3 := strconv.ParseFloat(cpu_idle, 64)
			if err3 != nil {
				fmt.Println("Error al convertir la cadena a número:", err3)
			}

			cpu_usage := 100 - cpu_idle_float
			formated_cpu_usage := fmt.Sprintf("%.2f", cpu_usage)

			var data struct {
				Total      int
				Used       int
				Percentage int
				Free       int
			}

			// Decodifica la cadena JSON en la estructura de datos de Go
			err := json.Unmarshal([]byte(ram_info), &data)
			if err != nil {
				fmt.Println("Error al decodificar JSON:", err)
				return
			}

			// Obtén el valor del campo "percentage" como un float64
			percentage := float64(data.Percentage)
			formated_percentage := fmt.Sprintf("%.2f", percentage)

			fmt.Println("CPU usage:", formated_cpu_usage)
			fmt.Println("RAM usage:", formated_percentage)

			// save the data in the database
			_, err = db.Exec("INSERT INTO cpu_info (usage_percentage) VALUES (?)", formated_cpu_usage)
			if err != nil {
				fmt.Println("Error al insertar el uso de la CPU en la base de datos:", err)
			}

			_, err = db.Exec("INSERT INTO memory_info (usage_percentage) VALUES (?)", formated_percentage)
			if err != nil {
				fmt.Println("Error al insertar el uso de la RAM en la base de datos:", err)
			}
		}
	}()

	select {}
}
