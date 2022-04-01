main();

function main(){
    var today2 = new Date();
    if(today2.getMonth()+1 < 10 & +today2.getDate() < 10){
        var date2 = today2.getFullYear()+'-0'+(today2.getMonth()+1)+'-0'+today2.getDate();
    }else if(today2.getMonth()+1 < 10){
        var date2 = today2.getFullYear()+'-0'+(today2.getMonth()+1)+'-'+today2.getDate();
    }else if(today2.getDate() < 10){
        var date2 = today2.getFullYear()+'-'+(today2.getMonth()+1)+'-0'+today2.getDate();
    }else{
        var date2 = today2.getFullYear()+'-'+(today2.getMonth()+1)+'-'+today2.getDate();
    }
    
    console.log(date2)
    document.getElementById('start-date').defaultValue = date2;
    document.getElementById('end-date').defaultValue = date2;
    var checkWholeDay = document.getElementById("wholeDayCheckbox");
    checkWholeDay.addEventListener('change', toggleTimeVisibility,checkWholeDay)

    
    makeMinutes();

    var addEventBtn = document.getElementById("AddEventBtn");
    addEventBtn.addEventListener('click', addToCalendar);



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

function addToCalendar(){
    var eventTitle = document.getElementById("eventTitle").value;
    var eventDescription = document.getElementById("eventDescription").value;
    //var monthOfEvent = document.getElementById("month").value;
    //var dayOfEvent = document.getElementById("day").value;
    //var yearOfEvent = document.getElementById("year").value;
    var startDateElmt = document.getElementById('start-date').value;
    var endDateElmt = document.getElementById('end-date').value;
    
    var wholeDayCheckbox = document.getElementById("wholeDayCheckbox").checked;
    
    //dateOfEvent = yearOfEvent.concat("-",monthOfEvent,"-",dayOfEvent)
    if(wholeDayCheckbox == true){
        console.log("???")
        dateOfEventA = new Date(startDateElmt)
        dateOfEventA.setHours("00")
        dateOfEventA.setMinutes("00")
        dateOfEventB = new Date(endDateElmt)
        dateOfEventB.setDate(dateOfEventB.getDate()+1)
        dateOfEventB.setHours("00")
        dateOfEventB.setMinutes("00")

        console.log(dateOfEventA)
        console.log(dateOfEventB)
    }else{
        var hourStart = document.getElementById("hourStart").value;
        console.log(hourStart)
        var minutesStart = document.getElementById("minutesStart").value;
        console.log(minutesStart)
        if(document.getElementById("partStart").value == "PM"){
            hourStart = parseInt(hourStart) + 12
            hourStart = String(hourStart)
        }
        dateOfEventA = new Date(startDateElmt)
        dateOfEventA.setHours(hourStart)
        dateOfEventA.setMinutes(minutesStart)

        var hourEnd = document.getElementById("hourEnd").value;
        console.log(hourEnd)
        var minutesEnd = document.getElementById("minutesEnd").value;
        console.log(minutesEnd)
        if(document.getElementById("partEnd").value == "PM"){
            hourEnd = parseInt(hourEnd) + 12
            hourEnd = String(hourEnd)
        }
        dateOfEventB = new Date(endDateElmt)
        dateOfEventB.setHours(hourEnd)
        dateOfEventB.setMinutes(minutesEnd)
        console.log(dateOfEventA)
        console.log(dateOfEventB)

    }
    
    if(eventTitle != ""){
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            console.log(token);
            //details about the event
            //reference: https://stackoverflow.com/questions/55935126/how-can-i-use-the-google-api-in-a-chrome-extension
            let event = {
                summary: String(eventTitle),
                description: String(eventDescription),
                start: {
                    'dateTime': dateOfEventA,
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                end: {
                    'dateTime': dateOfEventB,
                    'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            };
        
            let fetch_options = {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(event),
            };
        
            fetch(
              'https://www.googleapis.com/calendar/v3/calendars/primary/events',
              fetch_options
            )
              .then((response) => response.json()) // Transform the data into json
              .then(function (data) {
                console.log(data);//contains the response of the created event
              });
          });
    }

}