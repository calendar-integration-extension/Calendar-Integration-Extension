main();

function main() {
  chrome.identity.getAuthToken({interactive: true}, function(token) {  
    var x = new XMLHttpRequest();
    x.addEventListener("load", buildUpcomingEvents);
    x.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=' + token, true);
    x.send();
  });  
  buildCalendarDates();
}

function objectCompare(a, b){
  if(a.startDate < b.startDate){
    return -1;
  }
  if(a.startDate > b.startDate){
    return 1;
  }
  return 0;
}

function buildUpcomingEvents() {
  const data = JSON.parse(this.responseText);
  var eventsElement = document.getElementById("calendar_events");
  eventsElement.appendChild(document.createElement("tr"));
  addUpcomingEvent('th', "Event Name", eventsElement, 'text-align: left; padding-right:1rem');
  addUpcomingEvent('th', "Start", eventsElement, 'text-align: left; padding-right:1rem');
  addUpcomingEvent('th', "End", eventsElement, 'text-align: left');
  const listOfEvents = []
  
  for(let i = 0; i < data['items'].length; i++){
    if (data['items'][i]['start']['dateTime'] == null) {
      listOfEvents.push({nameOfEvent:data['items'][i]['summary'], startDate:data['items'][i]['start']['date'].concat('','T00:00:00.000Z'), endDate: data['items'][i]['start']['date'].concat('','T23:59:59.999Z')})
    }else{
      listOfEvents.push({nameOfEvent:data['items'][i]['summary'], startDate:data['items'][i]['start']['dateTime'], endDate: data['items'][i]['start']['dateTime']})
    }
  }
  listOfEvents.sort(objectCompare);
  console.log(listOfEvents);

  for(let i = 0; i < data['items'].length; i++){
    var dateNow = new Date();
    var eventDate = new Date(listOfEvents[i].endDate);
    var diff = eventDate - dateNow;
    console.log(dateNow.toISOString());
    console.log(eventDate);
    console.log(dateNow);
    console.log(diff);
    if(diff > 0){
      console.log(listOfEvents[i].nameOfEvent);
      eventsElement.appendChild(document.createElement("tr"));
      addUpcomingEvent('td', listOfEvents[i].nameOfEvent, eventsElement,'padding-right:1rem');
      addUpcomingEvent('td', listOfEvents[i].startDate, eventsElement,'padding-right:1rem');
      addUpcomingEvent('td', listOfEvents[i].endDate, eventsElement);

    }
    

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
  const monthDays = document.querySelector(".days");
  const firstDay = new Date(date.getFullYear(), date.getMonth(),1);
  const lastDay = new Date(date.getFullYear(), date.getMonth()+1,0).getDate();

  // Amount of blank dates that must be included in the calendar before starting
  // at the first date of the month.
  const blankDatesAmount = firstDay.getDay();

  let days = "";
  
  for (let i = 1; i <= blankDatesAmount; i++){
    days += `<div></div>`;
  }
  
  for (let i = 1; i <=lastDay; i++){
    days += `<div>${i}</div>`;
  }

  monthDays.innerHTML = days;
}








