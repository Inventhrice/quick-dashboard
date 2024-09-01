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
            updateTasks(obj.tasks);
        },
        false,
    );
    //console.log(title)
    //console.log(listTasks)
}

function loadJSONHelper_loadTitle(title){
    document.getElementById("applicationTitle").innerHTML = title;
}

function updateTasks(tasks){
    console.debug(tasks.length)
    document.getElementById("checklist").innerHTML = "";
    document.getElementById("listTasks").innerHTML = "";
    for(let i = 0; i < tasks.length; i++){
        theTaskInQuestion = tasks[i]
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
        
        detailedViewTaskTemplate = `<div class="modal fade" id="taskID" tabindex="-1" aria-labelledby="taskID" aria-hidden="true">`.replaceAll("ID", theTaskInQuestion.id)
        detailedViewTaskTemplate += `<div class="modal-dialog">\n<div class="modalBackground modal-content">\n<div class="modal-header">`
        detailedViewTaskTemplate += `<h1 class="modal-title fs-5" id="modalLabel">TASKTITLE</h1>`.replaceAll("TASKTITLE", theTaskInQuestion.taskTitle)
        detailedViewTaskTemplate += `<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body">`
        detailedViewTaskTemplate += `<p><i>Assigned to: </i>` + theTaskInQuestion.assignee + `</p>`
        if(theTaskInQuestion.description == ""){
            detailedViewTaskTemplate += `<p class="fst-italic">No Description Provided</p>`
        }
        else{
            detailedViewTaskTemplate += theTaskInQuestion.description.replaceAll("\n","<br>")
        }

        detailedViewTaskTemplate += `</div>\n<div class="modal-footer">\n<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>\n</div>\n</div>\n</div>\n</div>`

        document.getElementById("listTasks").innerHTML += detailedViewTaskTemplate;
    }
    

}