var eventsElement = document.getElementById("calendar_events");
eventsElement.appendChild(document.createElement("tr"));
addUpcomingEvent('th', "Event Name", eventsElement, 'text-align: left; padding-right:1rem');
addUpcomingEvent('th', "Start", eventsElement, 'text-align: left; padding-right:1rem');
addUpcomingEvent('th', "End", eventsElement, 'text-align: left'); 
main();

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
  });
   
  buildCalendarDates();
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
  let calendarDays = "";
  
  for (let i = 1; i <= blankDatesAmount; i++){
    calendarDays += `<div></div>`;
  }
  
  for (let i = 1; i <=new Date(date.getFullYear(), date.getMonth()+1,0).getDate(); i++){
    calendarDays += `<div>${i}</div>`;
  }

  document.querySelector(".days").innerHTML = calendarDays;
}








