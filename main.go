// https://go.dev/doc/tutorial/web-service-gin
// https://www.golinuxcloud.com/golang-sqlite3/
// https://go.dev/doc/tutorial/database-access
// https://go.dev/doc/effective_go#concurrency
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/skip2/go-qrcode"
)

type Task struct {
	Id          float64 `json:"id"`
	Title       string  `json:"taskTitle"`
	Description string  `json:"description"`
	Assignee    string  `json:"assignee"`
	Complete    bool    `json:"complete"`
}

type TaskJSON struct {
	Title string `json:"title"`
	Tasks []Task `json:"tasks"`
}

var (
	InfoLogger  *log.Logger
	ErrorLogger *log.Logger
	tasksDB     TaskJSON
	pathToFile  string
)

var pathToQRCode = "static/qr.png"

// minutes between writing the files
const duration = 5

func initLogging() {
	file, err := os.OpenFile("log.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatal(err)
	}

	InfoLogger = log.New(file, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	ErrorLogger = log.New(file, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func writeTaskDBToFile() {
	output, err := json.Marshal(tasksDB)
	if err != nil {
		ErrorLogger.Println(err)
	}
	f, err := os.Create(pathToFile)
	if err != nil {
		ErrorLogger.Println(err)
	}
	defer f.Close()
	_, err = f.Write(output)
	if err != nil {
		ErrorLogger.Println(err)
	}
}

func writeToFileAsync(done <-chan bool) {
	ticker := time.NewTicker(duration * time.Minute)
	go func() {
		for {
			select {
			case <-done:
				InfoLogger.Println("Stopping ticker") //replace with serverlogging
				ticker.Stop()
				return
			case <-ticker.C:
				writeTaskDBToFile()
				InfoLogger.Println("Wrote to file!") //replace with serverlogging
			}
		}
	}()
}

func initTaskDB() {
	dataFromFile, err := os.Open(pathToFile)
	if err != nil {
		panic(err)
	} else {
		defer dataFromFile.Close()

		var data TaskJSON

		decoder := json.NewDecoder(dataFromFile)
		if err = decoder.Decode(&data); err != nil {
			ErrorLogger.Println(err)
		}

		InfoLogger.Println("Imported Tasks DB:")
		InfoLogger.Println(data) //replace with serverlogging
		tasksDB = data
	}

}
func serveFiles(c *gin.Context, contenttype string, path string) {
	filename := path + c.Param("name")
	_, err := os.Open(filename)
	if err != nil {
		ErrorLogger.Println(err)
		c.JSON(404, gin.H{"error": err.Error()})
	} else {
		c.Header("Content-Type", contenttype)
		c.File(filename)
	}
}

func servePage(c *gin.Context) {
	serveFiles(c, "text/html", "./static/")
}

func serveScripts(c *gin.Context) {
	serveFiles(c, "text/javascript", "./static/js/")
}

func serveCSS(c *gin.Context) {
	serveFiles(c, "text/css", "./static/css/")
}

func getFileName() string {
	var userInput string
	yn := "n"
	for strings.ToLower(yn) != "y" {
		fmt.Println("Please enter the filepath to grab data from: ")
		fmt.Scan(&userInput)

		fmt.Printf("Confirm getting data from \"%s\"? [Y/N]: ", userInput)
		fmt.Scan(&yn)

		for strings.ToLower(yn) != "n" && strings.ToLower(yn) != "y" {
			fmt.Printf("Please enter a valid input.\nConfirm getting data from \"%s\"? [Y/N]: ", userInput)
			fmt.Scan(&yn)
		}
	}

	return userInput
}

// To be implemented: get the actual IP of the machine
func getServerIP() string {
	listoFIPs, err := net.InterfaceAddrs()
	if err != nil {
		ErrorLogger.Println(err)
	}

	ipserver, _, err := net.ParseCIDR(listoFIPs[0].String())
	ipOfServer := ipserver.String()
	port := 80

	userInput := ""
	fmt.Printf("Use default value \"%s:%d\"? [Y/N]: ", ipOfServer, port)
	fmt.Scan(&userInput)

	for strings.ToLower(userInput) != "n" && strings.ToLower(userInput) != "y" {
		fmt.Printf("Please enter a valid input.\nUse default value \"%s:%d\"? [Y/N]: ", ipOfServer, port)
		fmt.Scan(&userInput)
	}

	if strings.ToLower(userInput) == "n" {
		fmt.Print("Enter the IP address: ")
		fmt.Scan(&ipOfServer)
		fmt.Print("Enter port number: ")
		fmt.Scan(&port)
	}

	return fmt.Sprintf("%s:%d", ipOfServer, port)
}

// Add Task:
// This function adds a task to the database (tasksDB) via a POST request from the user
// It replies with a 201 if created, along with the new task details
// It replies with a 406 if not created, with the error message
func addTask(c *gin.Context) {
	var newTask Task

	if err := c.BindJSON(&newTask); err != nil {
		ErrorLogger.Println(err)
		c.AbortWithStatus(http.StatusNotAcceptable)
		return
	}

	InfoLogger.Println("Task Added:")
	InfoLogger.Println(newTask)

	// Add the new album to the slice.
	tasksDB.Tasks = append(tasksDB.Tasks, newTask)
	c.IndentedJSON(http.StatusCreated, newTask)
}

func updateTask(c *gin.Context) {
	var newTask Task

	if err := c.BindJSON(&newTask); err != nil {
		ErrorLogger.Println(err)
		c.AbortWithStatus(http.StatusNotAcceptable)
		return
	}

	InfoLogger.Println("Task Updated:")
	InfoLogger.Println(newTask)

	for i := 0; i < len(tasksDB.Tasks); i++ {
		if tasksDB.Tasks[i].Id == newTask.Id {
			tasksDB.Tasks[i] = newTask
			i = len(tasksDB.Tasks)
		}
	}

	c.IndentedJSON(http.StatusCreated, newTask)
}

func generateQRCode(serverIP string) {
	err := qrcode.WriteFile(serverIP, qrcode.Medium, 256, pathToQRCode)
	if err != nil {
		ErrorLogger.Println(err)
	}
	InfoLogger.Println("Wrote server URL to a QR code at " + pathToQRCode)
}

func initRouter() *gin.Engine {
	router := gin.Default()

	// Serve the index html page
	router.GET("/", servePage)

	// Default routes for the static stuff
	router.GET("/static/css/:name", serveCSS)
	router.GET("/static/js/:name", serveScripts)

	// Return the data stored server side
	router.GET("/static/data.json", func(c *gin.Context) {
		serveFiles(c, "application/json", pathToFile)
	})

	router.GET("/static/qr.png", func(c *gin.Context) {
		serveFiles(c, "image/png", pathToQRCode)
	})

	router.PATCH("/task/:id", updateTask)
	router.POST("/task/", addTask)

	return router
}

func main() {
	gin.SetMode(gin.ReleaseMode)
	initLogging()
	pathToFile = getFileName()
	serverIP := getServerIP()

	//initalize the Tasks variable from the filepath provided
	initTaskDB()

	generateQRCode(serverIP)

	router := initRouter()

	c := make(chan bool)
	writeToFileAsync(c)

	InfoLogger.Println("Writing to " + pathToFile) //replace with serverlogging

	fmt.Println("Running server on " + serverIP)
	router.Run(serverIP)

}
