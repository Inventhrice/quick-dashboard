// https://go.dev/doc/tutorial/web-service-gin
// https://www.golinuxcloud.com/golang-sqlite3/
// https://go.dev/doc/tutorial/database-access
// https://go.dev/doc/effective_go#concurrency
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type task struct {
	id          string `json:"id"`
	title       string `json:"title"`
	description string `json:"description"`
	assignee    string `json:"assignee"`
	complete    bool   `json: "complete"`
}

var tasksDB []task
var serverLogging *log.Logger

// Add task
func addTask(c *gin.Context) {
	var newTask task

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

func initTaskDB() {
	// insert code to read from file to put into all tasks
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

func main() {
	initTaskDB()

	router := gin.Default()
	router.GET("/", servePage)
	router.GET("/static/css/:name", serveCSS)
	router.GET("/static/js/:name", serveScripts)
	router.Run("localhost:8080")

	fmt.Println("Server is running!")

}
