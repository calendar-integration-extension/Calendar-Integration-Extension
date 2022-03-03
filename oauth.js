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

function buildUpcomingEvents() {
  const data = JSON.parse(this.responseText);
  var eventsElement = document.getElementById("calendar_events");
  eventsElement.appendChild(document.createElement("tr"));
  addUpcomingEvent('th', "Event Name", eventsElement, 'text-align: left; padding-right:1rem');
  addUpcomingEvent('th', "Start", eventsElement, 'text-align: left; padding-right:1rem');
  addUpcomingEvent('th', "End", eventsElement, 'text-align: left');
  
  for(let i = 0; i < data['items'].length; i++){
    eventsElement.appendChild(document.createElement("tr"));
    addUpcomingEvent('td', data['items'][i]['summary'], eventsElement,'padding-right:1rem');
    if (data['items'][i]['start']['dateTime'] == null) {
      addUpcomingEvent('td', data['items'][i]['start']['date'], eventsElement,'padding-right:1rem');
      addUpcomingEvent('td', data['items'][i]['end']['date'], eventsElement);
    } else {
      addUpcomingEvent('td', data['items'][i]['start']['dateTime'], eventsElement,'padding-right:1rem');
      addUpcomingEvent('td', data['items'][i]['end']['dateTime'], eventsElement);
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