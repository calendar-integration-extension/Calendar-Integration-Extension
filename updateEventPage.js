main();

function main(){
    var checkWholeDay = document.getElementById("wholeDayCheckbox");
    checkWholeDay.addEventListener('change', toggleTimeVisibility,checkWholeDay)

    
    makeMinutes();
    
}

function toggleTimeVisibility(checkWholeDay){
    var timeInput = document.getElementById("timeInputStart");
    var timeInput2 = document.getElementById("timeInputEnd");
    if(this.checked == true){
        timeInput.style.visibility = "hidden";
        timeInput2.style.visibility = "hidden";
        console.log("Whole day");
    }else{
        timeInput.style.visibility = "visible";
        timeInput2.style.visibility = "visible";
        console.log("Not whole Day");
    }
}

function makeMinutes(){
    var createMinutes1 = document.getElementById("minutesStart");
    var createMinutes2 = document.getElementById("minutesEnd");
    for(i = 0;i < 60;i++){
        createMinutes1.appendChild(new Option(i,i));
        createMinutes2.appendChild(new Option(i,i));
    }
}