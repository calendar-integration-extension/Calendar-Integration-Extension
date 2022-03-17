makeStructure();
main();

function makeStructure(){
  var eventsElement = document.getElementById("calendar_events");
  eventsElement.appendChild(document.createElement("tr"));
  addUpcomingEvent('th', "Event Name", eventsElement, 'text-align: left; padding-right:1rem');
  //addUpcomingEvent('th', "Start", eventsElement, 'text-align: left; padding-right:1rem');
  //addUpcomingEvent('th', "End", eventsElement, 'text-align: left');
  buildCalendarDates();
}
function main() {
  
  chrome.identity.getAuthToken({interactive: true}, function(token) { 
    console.log(token); 
    var x = new XMLHttpRequest();
    var retry = true;
    //code modified from Google Developers for checking authentication
    x.onload = function () {
      if (this.status === 401 && retry) {
        retry = false;
        chrome.identity.removeCachedAuthToken(
            { 'token': token },
            main);
        return;
      }
    }
    x.addEventListener("load", buildUpcomingEvents,x);
    x.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=' + token, true);
    x.send();

    const addEventButton = document.getElementById("addEventButton");
    addEventButton.addEventListener('click', addEventToCalendar,token);
    
    

  });
   
  var el = document.querySelector('viewType');
  
}

function objectCompare(firstDate, secondDate){
  if(firstDate.startDate > secondDate.startDate){
    return 1;
  }
  if(firstDate.startDate < secondDate.startDate){
    return -1;
  }
  return 0;
}

function getOffSet(){
  date = new Date();
  var TZOffset = date.getTimezoneOffset();

  if(TZOffset < 0){
    var sign = '+';
  }else{
    var sign = '-';
  }   
  var offset = Math.abs(TZOffset);
  var hour = Math.floor(offset/60);
  if(hour < 10){
    hour = '0' + hour;
  }
  var min = offset % 60;
  if(min < 10){
    min = '0' + min;
  }
  return sign + hour + ":" + min;
}

function buildUpcomingEvents(x) {
  const data = JSON.parse(this.responseText);
  var eventsElement = document.getElementById("calendar_events");
  
  const listOfEvents = []
  console.log(data['items']);
  if(typeof data['items'] !== 'undefined'){
    
    for(let i = 0; i < data['items'].length; i++){
      if (data['items'][i]['start']['dateTime'] == null) {
        var TZOffset = getOffSet();
        listOfEvents.push({nameOfEvent:data['items'][i]['summary'], startDate:data['items'][i]['start']['date'].concat('','T00:00:00', TZOffset), endDate: data['items'][i]['end']['date'].concat('','T00:00:00',TZOffset)})
      }else{
        listOfEvents.push({nameOfEvent:data['items'][i]['summary'], startDate:data['items'][i]['start']['dateTime'], endDate: data['items'][i]['end']['dateTime']})
      }
    }
  
    listOfEvents.sort(objectCompare);
    console.log(listOfEvents);
    var anyUpcomingEvents = 0;

    for(let i = 0; i < data['items'].length; i++){
      var dateNow = new Date();
      console.log(dateNow.toLocaleString())
      var eventDate = new Date(listOfEvents[i].endDate);
      var diff = eventDate - dateNow;

      if(diff > 0){
        anyUpcomingEvents = 1;
        console.log(listOfEvents[i].nameOfEvent);

        eventsElement.appendChild(document.createElement("tr"));
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const event = new Date(listOfEvents[i].startDate);

        var eventTLDR = listOfEvents[i].nameOfEvent+" from "+ event.toLocaleDateString(undefined, options) + " " + event.toLocaleTimeString('en-US') + " to "
        const event2 = new Date(listOfEvents[i].endDate);
        eventTLDR = eventTLDR + event2.toLocaleDateString(undefined, options) + " " + event2.toLocaleTimeString('en-US')

        console.log(eventTLDR)
        addUpcomingEvent('button', eventTLDR, eventsElement,'text-align: left;outline-offset: 2rem');


        //eventsElement.appendChild(document.createElement("tr"));

        //addUpcomingEvent('td', listOfEvents[i].nameOfEvent, eventsElement,'padding-right:1rem');
        //addUpcomingEvent('td', listOfEvents[i].startDate, eventsElement,'padding-right:1rem');
        //addUpcomingEvent('td', listOfEvents[i].endDate, eventsElement);

        
        console.log(event.toLocaleDateString(undefined, options));
        console.log(event.toLocaleTimeString('en-US'));
      }
    }
    if(anyUpcomingEvents == 0){
      eventsElement.appendChild(document.createElement("tr"));
      addUpcomingEvent('td', "No upcoming events!", eventsElement,'padding-right:1rem');
    }
  }

}

function getHumanDate(date){
  year = date.getFullYear()
  month = date.getMonth()
  dt = date.getDate();
  var monthsList = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];
  if (dt< 10){
    dt = '0' + dt;
  }

}


function addUpcomingEvent(tag, text, eventsElement, style = null) {
  var tag = document.createElement(tag)
  var text = document.createTextNode(text)
  if (style != null) {
    tag.style.cssText = style;
  }
  tag.appendChild(text);
  eventsElement.appendChild(tag)
}

function buildCalendarDates() {
  const date = new Date();
  
  // Amount of blank dates that must be included in the calendar before starting
  // at the first date of the month.
  const dayOne = new Date(date.getFullYear(), date.getMonth(),1);
  const blankDatesAmount = dayOne.getDay();
  var calDates = document.getElementById("thedays");
  
  
  const toDate = new Date();
  dayOfMonth = toDate.getDate();
  
  //get events here


  var dayOfWeek = toDate.getDay();
  var startOfWeek = dayOfMonth-dayOfWeek

  for(let i = 0;i < 7; i++){
      console.log(i)
    var tag = document.createElement("div");

    var tag2 = document.createElement("button");
    if(startOfWeek > 0 & startOfWeek <=new Date(date.getFullYear(), date.getMonth()+1,0).getDate()){
        console.log()
        tag2.innerText = startOfWeek;
    }
    tag.appendChild(tag2)
    calDates.appendChild(tag);
    
    startOfWeek = startOfWeek + 1;
  }

  /**for (let i = 1; i <=new Date(date.getFullYear(), date.getMonth()+1,0).getDate(); i++){
    var tag = document.createElement("div");
    console.log("Date")

    var tag2 = document.createElement("button");
    tag2.innerText = i;


    //color the day Today
    if(parseInt(dayOfMonth) == i){
      tag2.style.cssText = "background-color: #1a73e8; color: white";
      console.log("This happened")
    }


    tag.appendChild(tag2)
    calDates.appendChild(tag);
  }**/
}





function addEventToCalendar(token) {
  /**var y = new XMLHttpRequest();
  var retry2 = true;
  y.onload = function () {
    if (this.status === 401 && retry2) {
      retry2 = false;
      chrome.identity.removeCachedAuthToken(
          { 'token': token },
          main);
      return;
    }
  }
  y.addEventListener("load", buildUpcomingEvents,y);
  y.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=' + token, true);
  //y.send();
  console.log("function runs")**/


  console.log("Function runs!")
}



