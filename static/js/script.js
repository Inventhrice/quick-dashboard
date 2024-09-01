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
            console.log(obj);

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
    console.log(tasks.length)
    document.getElementById("checklist").innerHTML = "";
    for(let i = 0; i < tasks.length; i++){
        theTaskInQuestion = tasks[i]
        console.log(theTaskInQuestion)
        template = `<div id="ID" class="checklistItem list-group list-group-item-action ps-2 pt-2 mb-2" data-bs-toggle="modal" data-bs-target="#taskID">`
        template = template.replaceAll("ID", theTaskInQuestion.id);

        template += "\n<h5>" + theTaskInQuestion.taskTitle + "</h5>"
                + "\n<p>" + theTaskInQuestion.assignee + "</p>" + "\n</div>\n"

        document.getElementById("checklist").innerHTML += template;        
    }
    

}