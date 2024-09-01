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
            console.log(reader.result);
            const obj = JSON.parse(reader.result);
            console.log(obj)
        },
        false,
    );
    //console.log(title)
    //console.log(listTasks)
}

