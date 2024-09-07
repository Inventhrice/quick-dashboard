let listOfTasks = {};

async function loadJSON(){
    const url = (window.location.href + "static/data.json").replace("?", "")

    try {
        await fetch(url).then(response => {
            if(!response.ok){
                throw new Error(`Response Status: ${response.status}`);
            }
            return response.json()
        }).then(json => {
            console.debug(json)
            document.getElementById("applicationTitle").innerHTML = json.title    
            listOfTasks = json.tasks
            refreshTaskList();
        })
    }
    catch (error){
        console.error(error.message);
    }
}

//Comment out this code if you want to run this locally
/* function loadJSON_local(){
    const selectedFile = document.getElementById("input").files[0];
    const reader = new FileReader();
    reader.readAsText(selectedFile);

    reader.addEventListener(
        "load",
        () => {
            // this will then display a text file
            obj = JSON.parse(reader.result);
            console.debug(obj);
            listOfTasks = obj.tasks;
            document.getElementById("applicationTitle").innerHTML = obj.title;
            updateTasks();
        },
        false,
    );
} */

function getHighestIDNum(){
    ret = -1
    for(let i = 0; i < listOfTasks.length; i++){
        if(ret < listOfTasks[i].id) ret = listOfTasks[i].id
    }
    return ret
}

function addTask(){
    console.debug("ENTERING: addTask()")
    const subElement = "taskform-addTask-"
    let id = getHighestIDNum() + 1
    console.log("Add task ID: " + id)
    let data = {
        "id": id,
        "taskTitle": document.getElementById(subElement + "taskTitle").value,
        "assignee": document.getElementById(subElement + "assignee").value,
        "description": document.getElementById(subElement + "description").innerHTML,
        "complete": document.getElementById(subElement + "completed").checked
    }
    console.debug(data)
    
    listOfTasks.push(data)
    fetch((window.location.href + "task/"), {
        method: "POST",
        body: JSON.stringify(data),
        headers: {"Content-type": "application/json"}
    }).then((response) => response.json()).then(refreshTaskList())
}

function updateTask(id){
    console.debug("ENTERING: updateTask(" + id + ")")

    const subElement = "taskform-" + id + "-"

    let data = {
        "id": id,
        "taskTitle": document.getElementById(subElement + "taskTitle").value,
        "assignee": document.getElementById(subElement + "assignee").value,
        "description": document.getElementById(subElement + "description").value,
        "complete": document.getElementById(subElement + "completed").checked
    }
    console.debug(data)

    let index = listOfTasks.findIndex(task => task.id === id)

    if(index != -1){
        listOfTasks[index] = data
    }

    fetch((window.location.href + "task/" + id), {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {"Content-type": "application/json"}
    }).then((response) => response.json()).then(refreshTaskList())
}

function getListOfPeople(){
    let returnVal = ""
    const assignees = listOfTasks.map(task => task.assignee);
    for(let j = 0; j < assignees.length; j++){
        
        returnVal += `<option value="` + assignees[j] + `"></option>\n`
    }
    return returnVal
}

function refreshTaskList(){
    console.debug("ENTERING: refreshTaskList()")
    console.debug(listOfTasks.length)
    document.getElementById("checklist").innerHTML = "";
    document.getElementById("listTasks").innerHTML = "";
    document.getElementById("completedTasksLists").innerHTML = "";
    for(let i = 0; i < listOfTasks.length; i++){
        theTaskInQuestion = listOfTasks[i]
        console.debug(theTaskInQuestion)
   
        summaryViewTaskTemplate = `<div id="checklist-ID" class="checklistItem list-group list-group-item-action ps-2 pt-2 mb-2" data-bs-toggle="modal" data-bs-target="#taskID">`
        summaryViewTaskTemplate = summaryViewTaskTemplate.replaceAll("ID", theTaskInQuestion.id);

        summaryViewTaskTemplate += "\n<h5>" + theTaskInQuestion.taskTitle + "</h5>"
                + "\n<i class=\"bi bi-person\"> " + theTaskInQuestion.assignee + "</i>\n</div>\n"

        if(theTaskInQuestion.complete == false){
            document.getElementById("checklist").innerHTML += summaryViewTaskTemplate;
        }

        else{
            document.getElementById("completedTasksLists").innerHTML += summaryViewTaskTemplate;
        }

        // Code for the modal that pops up when clicking on the task
        
        detailedViewTaskTemplate 
            = `<div class="modal fade" id="task{{ID}}" tabindex="-1" aria-labelledby="task{{ID}}" aria-hidden="true">\n<div class="modal-dialog modal-dialog-centered">\n<div class="modalBackground modal-content">\n<form id="taskform-{{ID}}">`
        // Modal Header Code
            + `\n<div class="modal-header">\n<textarea class="modal-title fs-5" row="1" id="taskform-{{ID}}-taskTitle" placeholder="Enter title of task">` 
        
        detailedViewTaskTemplate += theTaskInQuestion.taskTitle + `</textarea>\n<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>\n</div>\n`
        // Assignee code
            + `<div class="modal-body">\n<div>\n<label for="taskform-{{ID}}-assignee" class="form-label"><i>Assigned to:</i></label>\n<input type="text" class="form-control" id="taskform-{{ID}}-assignee" list="listOfUsers" placeholder="Enter a person's name" value="` 
            + theTaskInQuestion.assignee + `"><datalist id="listOfUsers">\n`
            + getListOfPeople()
            + `</datalist>\n</div>\n<div>\n<label for="taskform-{{ID}}-description" class="form-label">Description</label>\n<textarea class="form-control" rows="3" id="taskform-{{ID}}-description">`

        if(theTaskInQuestion.description == ""){
            detailedViewTaskTemplate += `No Description Provided`
        }
        else{
            detailedViewTaskTemplate += theTaskInQuestion.description
        }
        detailedViewTaskTemplate += `</textarea>\n</div><div><input type="checkbox" class="form-check-input" id="taskform-{{ID}}-completed"`

        if(theTaskInQuestion.complete) detailedViewTaskTemplate += " checked"

        detailedViewTaskTemplate += `>\n<label for="taskform-1-completed" class="form-check-label">Complete</label>\n</div>\n</div>\n<div class="modal-footer">\n<button class="btn btn-success" data-bs-dismiss="modal" onclick="updateTask({{ID}})">Save Changes</button>`
                                 + `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>\n</div>\n</form>\n</div>\n</div>\n</div>`

        detailedViewTaskTemplate = detailedViewTaskTemplate.replaceAll("{{ID}}", theTaskInQuestion.id)
        document.getElementById("listTasks").innerHTML += detailedViewTaskTemplate;
    }
    
    document.getElementById("listOfUsers-addTask").innerHTML = getListOfPeople()

}

document.addEventListener("DOMContentLoaded", function(){
    if(listOfTasks.length == null) loadJSON();
    else refreshTaskList();
});