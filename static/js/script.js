const title = ""
const listTasks = []

function loadJSON(){
    const selectedFile = document.getElementById("input").files[0];
    const reader = new FileReader();
    reader.readAsText(selectedFile);

    reader.addEventListener(
        "load",
        () => {
            // this will then display a text file
            const obj = JSON.parse(reader.result);
            console.debug(obj);

            loadJSONHelper_loadTitle(obj.title);
            loadJSONHelper_loadTasks(obj.tasks);
        },
        false,
    );
    //console.log(title)
    //console.log(listTasks)
}

function loadJSONHelper_loadTitle(title){
    document.getElementById("applicationTitle").innerHTML = title;
}

function loadJSONHelper_loadTasks(tasks){
    console.debug(tasks.length)
    document.getElementById("checklist").innerHTML = "";
    document.getElementById("listTasks").innerHTML = "";
    for(let i = 0; i < tasks.length; i++){
        theTaskInQuestion = tasks[i]
        console.debug(theTaskInQuestion)
   
        checklistTemplate = `<div id="checklist-ID" class="checklistItem list-group list-group-item-action ps-2 pt-2 mb-2" data-bs-toggle="modal" data-bs-target="#taskID">`
        checklistTemplate = checklistTemplate.replaceAll("ID", theTaskInQuestion.id);

        checklistTemplate += "\n<h5>" + theTaskInQuestion.taskTitle + "</h5>"
                + "\n<p>" + theTaskInQuestion.assignee + "</p>" + "\n</div>\n"

        document.getElementById("checklist").innerHTML += checklistTemplate;
        
        completeTaskTemplate = `<div class="modal fade" id="taskID" tabindex="-1" aria-labelledby="taskID" aria-hidden="true">`.replaceAll("ID", theTaskInQuestion.id)
        completeTaskTemplate += `<div class="modal-dialog">\n<div class="modal-content" id="modalBackground">\n<div class="modal-header">`
        completeTaskTemplate += `<h1 class="modal-title fs-5" id="modalLabel">TASKTITLE</h1>`.replaceAll("TASKTITLE", theTaskInQuestion.taskTitle)
        completeTaskTemplate += `<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>`

        //if this is empty, write No descirption provided, also allow new lines here
        completeTaskTemplate += `<div class="modal-body">TASKDESCRIPTION</div>`.replaceAll("TASKDESCRIPTION", theTaskInQuestion.description)
        completeTaskTemplate += `<div class="modal-footer">\n<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>\n</div>\n</div>\n</div>\n</div>`

        document.getElementById("listTasks").innerHTML += completeTaskTemplate;
    }
    

}