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

	"github.com/gin-gonic/gin"
)

type Task struct {
	Id          float64 `json:"id"`
	Title       string  `json:"taskTitle"`
	Description string  `json:"description"`
	Assignee    string  `json:"assignee"`
	Complete    bool    `json:"complete"`
}

type Tasks struct {
	Title string `json:"title"`
	Tasks []Task `json:"tasks"`
}

var tasksDB []Task
var serverLogging *log.Logger

// Add task
func addTask(c *gin.Context) {
	var newTask Task

	if err := c.BindJSON(&newTask); err != nil {
		c.AbortWithStatus(http.StatusNotAcceptable)
		return
	}

	// Add the new album to the slice.
	tasksDB = append(tasksDB, newTask)
	c.IndentedJSON(http.StatusCreated, newTask)
}

func writeToFile() {
	go func() {
		//insert code to write allTasks to file
		// sleep for 5 minutes, make a hash for file and DB, if diff, write to file
	}()
}

func initTaskDB(dataFilePath string) {
	dataFromFile, err := os.Open(dataFilePath)
	if err != nil {
		panic(err)
	} else {
		defer dataFromFile.Close()

		var data Tasks

		decoder := json.NewDecoder(dataFromFile)
		if err = decoder.Decode(&data); err != nil {
			panic(err)
		}

		fmt.Println(data)
		tasksDB = data.Tasks
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

func getFileName() string {
	return "./testData/prettifiedData.json"
}

func main() {
	pathToFile := getFileName()

	initTaskDB(pathToFile)

	router := gin.Default()
	router.GET("/", servePage)
	router.GET("/static/css/:name", serveCSS)
	router.GET("/static/js/:name", serveScripts)
	router.GET("/data.json", func(c *gin.Context) {
		serveFiles(c, "application/json", pathToFile)
	})
	router.Run("localhost:8080")

	fmt.Println("Server is running!")

}
