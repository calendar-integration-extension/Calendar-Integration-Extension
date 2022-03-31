let eventsDates = [];

main();

function makeStructure(){
  var eventsElement = document.getElementById("calendar_events");
  const date = new Date();
  buildCalendarDates(date);
}
function main() {
  
  chrome.identity.getAuthToken({interactive: true}, function(token) { 
    // console.log(token); 
    var x = new XMLHttpRequest();
    var retry = true;
    // code modified from Google Developers for checking authentication
    x.onload = function () {
      if (this.status === 401 && retry) {
        retry = false;
        chrome.identity.removeCachedAuthToken(
            { 'token': token },
            main);
        return;
      }
    }
    x.addEventListener("load", buildUpcomingEvents, x);
    x.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=' + token, true);
    x.send();

    const addEventButton = document.getElementById("addEventButton");
    addEventButton.addEventListener('click', addEventToCalendar,token);

    const backButton = document.getElementById("lessthanButton");
    backButton.addEventListener('click', moveBack);

    const forwardButton = document.getElementById("greaterthanButton");
    forwardButton.addEventListener('click', moveForward);
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
  
  const listOfEvents = [];
  // console.log(data['items']);
  if(typeof data['items'] !== 'undefined'){
    
    for(let i = 0; i < data['items'].length; i++){
      if (data['items'][i]['start']['dateTime'] == null) {
        let startDate = data['items'][i]['start']['date'];
        const len = startDate.length;
        startDate = startDate.slice(len-2, len);
        startDate = Number(startDate);

        // console.log(startDate);

        if (!eventsDates.includes(startDate)) {
          eventsDates.push(startDate);
        }

        var TZOffset = getOffSet();
        listOfEvents.push({nameOfEvent:data['items'][i]['summary'], startDate:data['items'][i]['start']['date'].concat('','T00:00:00', TZOffset), endDate: data['items'][i]['end']['date'].concat('','T00:00:00',TZOffset)})
      }else{
        let startDate = data['items'][i]['start']['dateTime'];
        let tPos = startDate.indexOf('T');
        startDate = startDate.slice(tPos - 2, tPos);
        startDate = Number(startDate);

        // console.log(startDate);
        
        if (!eventsDates.includes(startDate)) {
          eventsDates.push(startDate);
        }

        listOfEvents.push({nameOfEvent:data['items'][i]['summary'], startDate:data['items'][i]['start']['dateTime'], endDate: data['items'][i]['end']['dateTime']})
      }
    }

    console.log(eventsDates);
  
    listOfEvents.sort(objectCompare);
    // console.log(listOfEvents);
    var anyUpcomingEvents = 0;

    for(let i = 0; i < data['items'].length; i++){
      var dateNow = new Date();
      // console.log(dateNow.toLocaleString())
      var eventDate = new Date(listOfEvents[i].endDate);
      var diff = eventDate - dateNow;

      if(diff > 0){
        anyUpcomingEvents = 1;

        eventsElement.appendChild(document.createElement("tr"));
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const event = new Date(listOfEvents[i].startDate);

        var eventTLDR = listOfEvents[i].nameOfEvent+" from "+ event.toLocaleDateString(undefined, options) + " " + event.toLocaleTimeString('en-US') + " to "
        const event2 = new Date(listOfEvents[i].endDate);
        eventTLDR = eventTLDR + event2.toLocaleDateString(undefined, options) + " " + event2.toLocaleTimeString('en-US')

        addUpcomingEvent('button', eventTLDR, eventsElement,'text-align: left;outline-offset: 2rem');

      }
    }
    const listedEventUpdate = document.getElementsByClassName("eventShortcutButton");
    for(var ii = 0; ii < listedEventUpdate.length; ii++){
      listedEventUpdate[ii].addEventListener('click', passVariables);
    }
    if(anyUpcomingEvents == 0){
      eventsElement.appendChild(document.createElement("tr"));
      addUpcomingEvent('td', "No upcoming events!", eventsElement,'padding-right:1rem');
    }
  }

  makeStructure();
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


function addUpcomingEvent(tags, text, eventsElement, style = null) {
  var uniqueToButton = false;
  if(tags == 'button'){
    uniqueToButton = true;
  }
  // console.log(tags)
  // console.log(uniqueToButton)
  var tag = document.createElement(tags)
  if(uniqueToButton == true){
    tag.className = 'eventShortcutButton';
    // console.log(text);
  }
  var text = document.createTextNode(text)
  if (style != null) {
    tag.style.cssText = style;
  }
  tag.appendChild(text);
  if(uniqueToButton == true){
    var tagLink = document.createElement('a')
    tagLink.href = "updateEventPage.html";
    tagLink.appendChild(tag)
    eventsElement.appendChild(tagLink)
  }else{
    eventsElement.appendChild(tag)
  }
  
}

function buildCalendarDates(date) {

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];


  const currentMonthStr = months[date.getMonth()];
  let currentMonthEl = document.getElementById('calendar-month');
  currentMonthEl.innerHTML = currentMonthStr;
  
  // Amount of blank dates that must be included in the calendar before starting
  // at the first date of the month.
  const dayOne = new Date(date.getFullYear(), date.getMonth(),1);
  const blankDatesAmount = dayOne.getDay();
  var calDates = document.getElementById("thedays");
  
  
  for (let i = 1; i <= blankDatesAmount; i++){
    var blankSpace = document.createElement("div");
    // console.log(blankSpace);
    blankSpace.disabled = true;
    blankSpace.innerHTML = "";
    calDates.appendChild(blankSpace);
  }
  const toDate = new Date();
  dayOfMonth = toDate.getDate();
  
  //get events here

  for (let i = 1; i <=new Date(date.getFullYear(), date.getMonth()+1,0).getDate(); i++){
    let tag = document.createElement("div");
    let tagInnerHTML = '';

    if (eventsDates.includes(i)) {
      tagInnerHTML = `
        <div>
          <a href="dayEvents.html">
            <button id= "date-${i}" type="button" style="background-color: #456178; border-color: transparent; cursor: pointer;">
              ${i}
            </button>
          </a>
        </div>
      `;
    } else {
      tagInnerHTML = `
        <div>
          <a href="dayEvents.html">
            <button id= "date-${i}" type="button" style="background-color: transparent; border-color: transparent; cursor: pointer;">
              ${i}
            </button>
          </a>
        </div>
      `;
    }

    tag.innerHTML = tagInnerHTML;
    calDates.appendChild(tag);
    document.getElementById(`date-${i}`).addEventListener('click', () => {
      chrome.storage.local.set({ 'date': i });
    });
  }  
}

function passVariables(listedEventUpdate){
  console.log(this.innerHTML);
  //might need to get event credential (for next sprint run)
  localStorage.setItem("eventToUpdate", Date.now());
}



function addEventToCalendar(token) {
  
  console.log("Function runs!")
}


function moveBack(){
  document.getElementById('thedays').innerHTML = "";
  date.setMonth(date.getMonth()-1);

  buildCalendarDates(date);
}

function moveForward(){
  document.getElementById('thedays').innerHTML = "";
  date.setMonth(date.getMonth()+1);

  buildCalendarDates(date);
}