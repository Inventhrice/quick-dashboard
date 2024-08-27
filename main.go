// https://go.dev/doc/tutorial/web-service-gin
// https://www.golinuxcloud.com/golang-sqlite3/
// https://go.dev/doc/tutorial/database-access
// https://go.dev/doc/effective_go#concurrency
package main

import (
	"fmt"
	"net/http"

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
var log *log.Logger

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

func changeStatus(c *gin.Context) {

}

func servePage(c *gin.Context) {

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

func main() {
	initTaskDB()

	router := gin.Default()
	router.GET("/", servePage)
	router.Run("localhost:8080")

	fmt.Println("Server is running!")

}
