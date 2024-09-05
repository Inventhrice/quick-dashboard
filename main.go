// https://go.dev/doc/tutorial/web-service-gin
// https://www.golinuxcloud.com/golang-sqlite3/
// https://go.dev/doc/tutorial/database-access
// https://go.dev/doc/effective_go#concurrency
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
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

var tasksDB TaskJSON
var serverLogging *log.Logger
var pathToFile string

// minutes between writing the files
const duration = 5

// Add Task:
// This function adds a task to the database (tasksDB) via a POST request from the user
// It replies with a 201 if created, along with the new task details
// It replies with a 406 if not created, with the error message
func addTask(c *gin.Context) {
	var newTask Task

	if err := c.BindJSON(&newTask); err != nil {
		c.AbortWithStatus(http.StatusNotAcceptable)
		return
	}

	// Add the new album to the slice.
	tasksDB.Tasks = append(tasksDB.Tasks, newTask)
	c.IndentedJSON(http.StatusCreated, newTask)
}

func writeTaskDBToFile() {
	output, err := json.Marshal(tasksDB)
	if err != nil {
		panic(err) //replace with serverLogging
	}
	f, err := os.Create(pathToFile)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	_, err = f.Write(output)
	if err != nil {
		panic(err)
	}
}

func writeToFileAsync(done <-chan bool) {
	ticker := time.NewTicker(duration * time.Minute)
	go func() {
		for {
			select {
			case <-done:
				fmt.Println("Stopping ticker") //replace with serverlogging
				ticker.Stop()
				return
			case <-ticker.C:
				writeTaskDBToFile()
				fmt.Println("Wrote to file!") //replace with serverlogging
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
			panic(err)
		}

		//fmt.Println(data) //replace with serverlogging
		tasksDB = data
	}

}

func updateTask(c *gin.Context) {

}

func serveFiles(c *gin.Context, contenttype string, path string) {
	filename := path + c.Param("name")
	_, err := os.Open(filename)
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
	} else {
		c.Header("Content-Type", contenttype)
		c.File(filename)
	}
}

func servePage(c *gin.Context) {
	serveFiles(c, "text/html", "./")
}

func serveScripts(c *gin.Context) {
	serveFiles(c, "text/javascript", "./static/js/")
}

func serveCSS(c *gin.Context) {
	serveFiles(c, "text/css", "./static/css/")
}

// To be implemented in more detail
// For now, default value is in the test data, but we will prompt the user for the location of the file
func getFileName() string {
	return "./testData/prettifiedData.json"
}

// To be implemented: get the actual IP of the machine
func getServerIP() string {
	return "localhost:80"
}

func main() {
	pathToFile = getFileName()

	//initalize the Tasks variable from the filepath provided
	initTaskDB()

	router := gin.Default()

	// Serve the index html page
	router.GET("/", servePage)

	// Default routes for the static stuff
	router.GET("/static/css/:name", serveCSS)
	router.GET("/static/js/:name", serveScripts)

	// Return the data stored server side
	router.GET("/data.json", func(c *gin.Context) {
		serveFiles(c, "application/json", pathToFile)
	})

	router.PATCH("/task/:id", updateTask)
	router.POST("/task/", addTask)

	c := make(chan bool)
	writeToFileAsync(c)

	fmt.Println("Writing to \"data.json\"") //replace with serverlogging

	router.Run(getServerIP())

}
