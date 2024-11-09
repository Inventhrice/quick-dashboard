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
    fetch((window.location.href + "task"), {
        method: "POST",
        body: JSON.stringify(data),
        headers: {"Content-type": "application/json"}
    }).then((response) => response.json()).then(() => refreshTaskList())
    .catch(error => console.error('Error:', error))
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
    const assignees = [...new Set([...(listOfTasks.map(task => task.assignee)).values()])];
    for(let j = 0; j < assignees.length; j++){
        
        returnVal += `<option value="${assignees[j]}"></option>\n`
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
   
        summaryViewTaskTemplate = 
			`<div id="checklist-${theTaskInQuestion.id}" class="checklistItem list-group list-group-item-action ps-2 pt-2 mb-2" data-bs-toggle="modal" data-bs-target="#task${theTaskInQuestion.id}">
				<h5>${theTaskInQuestion.taskTitle}</h5>
                <i class=\"bi bi-person\">${theTaskInQuestion.assignee}</i>
			</div>`

        if(theTaskInQuestion.complete == false){
            document.getElementById("checklist").innerHTML += summaryViewTaskTemplate;
        }

        else{
            document.getElementById("completedTasksLists").innerHTML += summaryViewTaskTemplate;
        }

        // Code for the modal that pops up when clicking on the task
        
        detailedViewTaskTemplate = 
			`<div class="modal fade" id="task${theTaskInQuestion.id}" tabindex="-1" aria-labelledby="task${theTaskInQuestion.id}" aria-hidden="true">
				<div class="modal-dialog modal-dialog-centered">
					<div class="modalBackground modal-content">
						<form id="taskform-${theTaskInQuestion.id}">
							<div class="modal-header">
								<input type="text" class="form-control" id="taskform-${theTaskInQuestion.id}-taskTitle" placeholder="Enter title of task" value="${theTaskInQuestion.taskTitle}">
								<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
							</div>
							<div class="modal-body">
								<div class="input-group">
									<span id="taskform-${theTaskInQuestion.id}-assignee-desc" for="taskform-${theTaskInQuestion.id}-assignee" class="input-group-text"><i>Assigned to:</i></span>
									<input aria-described-by="taskform-${theTaskInQuestion.id}-assignee-desc" type="text" class="form-control" id="taskform-${theTaskInQuestion.id}-assignee" list="listOfUsers" placeholder="Enter a person's name" value="${theTaskInQuestion.assignee}">
									<datalist id="listOfUsers">${getListOfPeople()}</datalist>
								</div>
								<div>
									<label for="taskform-${theTaskInQuestion.id}-description" class="form-label fs-5">Description:</label>
									<textarea class="form-control" rows="3" id="taskform-${theTaskInQuestion.id}-description">${theTaskInQuestion.description == "" ? "No Description Provided" : theTaskInQuestion.description}</textarea>
								</div>
								<div>
									<input type="checkbox" class="form-check-input" id="taskform-${theTaskInQuestion.id}-completed" ${theTaskInQuestion.complete ? " checked" : ""}>
									<label for="taskform-${theTaskInQuestion.id}-completed" class="form-check-label">Complete</label>
								</div>
							</div>
							<div class="modal-footer">
								<button class="btn btn-success" data-bs-dismiss="modal" onclick="updateTask${theTaskInQuestion.id}">Save Changes</button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							</div>
						</form>
					</div>
				</div>
			</div>`
        document.getElementById("listTasks").innerHTML += detailedViewTaskTemplate;
    }
    
    document.getElementById("listOfUsers-addTask").innerHTML = getListOfPeople()

}

document.addEventListener("DOMContentLoaded", function(){
    if(listOfTasks.length == null) loadJSON();
    else refreshTaskList();
});