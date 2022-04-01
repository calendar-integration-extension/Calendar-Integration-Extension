const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const days = [
  'Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'
];

let el = {
  currMonthYearHeaderEl: document.getElementById('calendar-month-year'),
  weekDaysLabelEl: document.getElementsByClassName('weekdays')[0],
  addNewEventBtnEl: document.getElementById('addEventButton'),
  changeViewToggleEl: document.getElementById('viewType'),
  prevMonthOrWeekBtnEl: document.getElementById('lessthanButton'),
  nextMonthOrWeekBtnEl: document.getElementById('greaterthanButton'),
  calendarDatesEl: document.getElementById('thedays'),
  calendarUpcomingEventsEl: document.getElementById('calendar_events')
};

main();

function main() {
  chrome.identity.getAuthToken({ interactive: true }, function(token) {
      let fetch_options = {
          method: 'GET',
          headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
      };

      fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          fetch_options
      )
      .then((response) => response.json()) 
      .then(function (data) {
          buildCalendarPage(data.items);
      })
      .catch(err => {
          error.log(err);
          chrome.identity.removeCachedAuthToken({ 'token': token });
      });
  });
}

function buildCalendarPage(events) {
  let currDate = new Date();
  let curr = {
      month: currDate.getMonth(),
      year: currDate.getFullYear(),
      numDays: 0,
      datesWithEvents: []
  };

  curr.numDays = daysInMonth(curr.month + 1, curr.year);

  // Set curr.datesWithEvents content.
  events.forEach(ev => {
      let evStartDate = getEventDate(ev.start);
  
      if (evStartDate.getFullYear() === curr.year && evStartDate.getMonth() === curr.month) {
          if (!curr.datesWithEvents.includes(evStartDate.getDate())) {
              curr.datesWithEvents.push(evStartDate.getDate());
          }
      }
  });
  curr.datesWithEvents.sort();

  el.currMonthYearHeaderEl.textContent = `${months[curr.month]} ${curr.year}`;
  buildMonthCalendarDates(curr);
  buildUpcomingEvents(events);

  chrome.storage.local.set({'currMonthView': {
      'month': curr.month,
      'year': curr.year,
      'events': events
  }});

  chrome.storage.local.set({'currWeekView': {
      'week': 1,
      'month': curr.month,
      'year': curr.year,
      'events': events
  }});

  el.prevMonthOrWeekBtnEl.addEventListener('click', goToPrevMonthOrWeek);
  el.nextMonthOrWeekBtnEl.addEventListener('click', goToNextMonthOrWeek);
  el.changeViewToggleEl.addEventListener('click', changeView);
}

function buildMonthCalendarDates(date) {
  
  // Fill the Calendar's blank dates.
  
  el.calendarDatesEl.innerHTML = '';
  const daysMonthVersion = [
    'Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'
  ];

  for (let i = 0; i < 7; i++) {
    document.getElementById(`day-${i+1}`).textContent = daysMonthVersion[i];
  }

  const dayOne = new Date(date.year, date.month, 1);
  const blankDaysAmount = dayOne.getDay();

  for (let i = 0; i < blankDaysAmount; i++) {
      let blankDate = document.createElement('div');
      blankDate.disabled = true;
      blankDate.textContent = '';
      el.calendarDatesEl.appendChild(blankDate);
  }

  // Fill the Calendar's dates.

  for (let i = 1; i <= date.numDays; i++) {
      let dateEl = document.createElement('div');
      let dateInnerHTML = '';

      if (date.datesWithEvents.includes(i)) {
          dateInnerHTML = `
            <div>
              <a href="dayEvents.html">
                <button id= "${date.year}-${date.month}-${i}" type="button" style="background-color: #456178; border-color: transparent; cursor: pointer;">
                  ${i}
                </button>
              </a>
            </div>
          `;
      } else {
          dateInnerHTML = `
            <div>
              <a href="dayEvents.html">
                <button id= "${date.year}-${date.month}-${i}" type="button" style="background-color: transparent; border-color: transparent; cursor: pointer;">
                  ${i}
                </button>
              </a>
            </div>
          `;
      }

      dateEl.innerHTML = dateInnerHTML;
      el.calendarDatesEl.appendChild(dateEl);
      document.getElementById(`${date.year}-${date.month}-${i}`).addEventListener('click', () => {
          chrome.storage.local.set({
              'event': {'year': date.year, 'month': date.month, 'date': i}
          });
      });
  }
}

function buildWeekCalendarDates(date) {
  el.calendarDatesEl.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    if (i < date.numDays) {
      let d = new Date(`${date.year}-${date.month + 1}-${date.daysRange[i]}`);
      let day = days[d.getDay()];
      document.getElementById(`day-${i+1}`).textContent = day;
    } else {
      console.log('hello');
      document.getElementById(`day-${i+1}`).textContent = '';
    }
  }
  
  for (let i = 1; i <= date.numDays; i++) {
      let weekDate = (date.week - 1) * 7 + i;
      let dateEl = document.createElement('div');
      let dateInnerHTML = '';
  
      if (date.datesWithEvents.includes(weekDate)) {
          dateInnerHTML = `
            <div>
              <a href="dayEvents.html">
                <button id= "${date.year}-${date.month}-${weekDate}" type="button" style="background-color: #456178; border-color: transparent; cursor: pointer;">
                  ${weekDate}
                </button>
              </a>
            </div>
          `;
      } else {
          dateInnerHTML = `
            <div>
              <a href="dayEvents.html">
                <button id= "${date.year}-${date.month}-${weekDate}" type="button" style="background-color: transparent; border-color: transparent; cursor: pointer;">
                  ${weekDate}
                </button>
              </a>
            </div>
          `;
      }
  
      dateEl.innerHTML = dateInnerHTML;
      el.calendarDatesEl.appendChild(dateEl);
      document.getElementById(`${date.year}-${date.month}-${weekDate}`).addEventListener('click', () => {
          chrome.storage.local.set({
              'event': {'year': date.year, 'month': date.month, 'date': weekDate}
          });
      });
  }
  
}

function buildUpcomingEvents(events) {
  const today = new Date();
  let upcomingEventsNum = 0;

  events.forEach(ev => {
      let evStartDate = getEventDate(ev.start);
      let evEndDate = getEventDate(ev.end);
      
      if (isUpcomingEvent(today, evStartDate)) {
          upcomingEventsNum++;
          el.calendarUpcomingEventsEl.appendChild(document.createElement("tr"));
          let evPreview = {
              title: ev.summary,
              start: `${months[evStartDate.getMonth()]} ${evStartDate.getDate()}, ${evStartDate.getFullYear()}`,
              end: `${months[evEndDate.getMonth()]} ${evEndDate.getDate()}, ${evEndDate.getFullYear()}`
          };
          let evPreviewText = `${evPreview.title} - ${evPreview.start} to ${evPreview.end}`;
          let evPreviewEl = document.createElement('div');

          evPreviewEl.innerHTML = `
              <a href="updateEventPage.html">
                  <button style="text-align: left; outline-offset: 2rem">
                      ${evPreviewText}
                  </button>
              </a>
          `;

          evPreviewEl.addEventListener('click', () => {
              chrome.storage.local.set({ 'evId': ev.id });
          });
          el.calendarUpcomingEventsEl.appendChild(evPreviewEl);
      }
  });

  if (upcomingEventsNum === 0) {
      const noEventsMsg = document.createElement('h2');
      noEventsMsg.textContent = 'No upcoming events!';
      el.calendarUpcomingEventsEl.appendChild(noEventsMsg);
  }
}

function goToPrevMonthOrWeek() {
  // In Month View.
  if (document.getElementById('viewText').textContent === 'Weekly View') {
      
      let newCurrMonthView = {};
      
      chrome.storage.local.get(['currMonthView'], items => {
          let currMonthView = items.currMonthView;
          
          if (currMonthView.month === 0) {
              newCurrMonthView = {
                  month: 11,
                  year: currMonthView.year - 1,
                  events: currMonthView.events
              };
          } else {
              newCurrMonthView = {
                  month: currMonthView.month - 1,
                  year: currMonthView.year,
                  events: currMonthView.events
              };
          }
          
          chrome.storage.local.set({'currMonthView': newCurrMonthView});
          
          el.currMonthYearHeaderEl.textContent = `${months[newCurrMonthView.month]} ${newCurrMonthView.year}`;
          let date = buildMonthViewObject(newCurrMonthView.events, newCurrMonthView.month, newCurrMonthView.year);
          buildMonthCalendarDates(date);
      });
    } else {
      let newCurrWeekView = {week: 0, month: 0, year: 0, events: null};
      
      chrome.storage.local.get(['currWeekView'], items => {
          let currWeekView = items.currWeekView;

          if (currWeekView.week === 1) {
            if (currWeekView.month === 0) {
              newCurrWeekView.month = 11;
              newCurrWeekView.year = currWeekView.year - 1;
            } else {
              newCurrWeekView.month = currWeekView.month - 1;
              newCurrWeekView.year = currWeekView.year;
            }
            newCurrWeekView.week = 5;
            newCurrWeekView.events = currWeekView.events;
          } else {
            newCurrWeekView = currWeekView;
            newCurrWeekView.week--;
          }
          
          chrome.storage.local.set({'currWeekView': newCurrWeekView});
          
          el.currMonthYearHeaderEl.textContent = `Week ${newCurrWeekView.week} of ${months[newCurrWeekView.month]} ${newCurrWeekView.year}.`;
          let date = buildWeekViewObject(newCurrWeekView.events, newCurrWeekView.week, newCurrWeekView.month, newCurrWeekView.year);
          buildWeekCalendarDates(date);
      });
  }
}

function goToNextMonthOrWeek() {
  // In Month View.
  if (document.getElementById('viewText').textContent === 'Weekly View') {
      let newCurrMonthView = {};
      
      chrome.storage.local.get(['currMonthView'], items => {
          let currMonthView = items.currMonthView;
          
          if (currMonthView.month === 11) {
              newCurrMonthView = {
                  month: 0,
                  year: currMonthView.year + 1,
                  events: currMonthView.events
              };
          } else {
              newCurrMonthView = {
                  month: currMonthView.month + 1,
                  year: currMonthView.year,
                  events: currMonthView.events
              };
          }
          
          chrome.storage.local.set({'currMonthView': newCurrMonthView});
          
          el.currMonthYearHeaderEl.textContent = `${months[newCurrMonthView.month]} ${newCurrMonthView.year}`;
          let date = buildMonthViewObject(newCurrMonthView.events, newCurrMonthView.month, newCurrMonthView.year);
          buildMonthCalendarDates(date);
    });
  } else {
    let newCurrWeekView = {week: 0, month: 0, year: 0, events: null};
      
    chrome.storage.local.get(['currWeekView'], items => {
        let currWeekView = items.currWeekView;

        if (currWeekView.week === 5) {
          if (currWeekView.month === 11) {
            newCurrWeekView.month = 0;
            newCurrWeekView.year = currWeekView.year + 1;
          } else {
            newCurrWeekView.month = currWeekView.month + 1;
            newCurrWeekView.year = currWeekView.year;
          }
          newCurrWeekView.week = 1;
          newCurrWeekView.events = currWeekView.events;
        } else {
          newCurrWeekView = currWeekView;
          newCurrWeekView.week++;
        }
        console.log(newCurrWeekView.month);
        
        chrome.storage.local.set({'currWeekView': newCurrWeekView});
        
        el.currMonthYearHeaderEl.textContent = `Week ${newCurrWeekView.week} of ${months[newCurrWeekView.month]} ${newCurrWeekView.year}.`;
        let date = buildWeekViewObject(newCurrWeekView.events, newCurrWeekView.week, newCurrWeekView.month, newCurrWeekView.year);
        buildWeekCalendarDates(date);
    });
  }
}

function changeView() {
  // Change to Weekly view.
  if (document.getElementById('viewText').textContent === 'Weekly View') {
      document.getElementById('viewText').textContent = 'Monthly View';

      chrome.storage.local.get(['currWeekView'], items => {
          let currWeekView = items.currWeekView;

          el.currMonthYearHeaderEl.textContent = `
              Week ${currWeekView.week} of ${months[currWeekView.month]} ${currWeekView.year}.
          `;

          let WeekViewObj = buildWeekViewObject(
            currWeekView.events, currWeekView.week, currWeekView.month, currWeekView.year
          );

          buildWeekCalendarDates(WeekViewObj);
      });
    } else {
      chrome.storage.local.get(['currMonthView'], items => {
          let currMonthView = items.currMonthView;

          el.currMonthYearHeaderEl.textContent = `
              ${months[currMonthView.month]} ${currMonthView.year}
          `;

          let MonthViewObj = buildMonthViewObject(
            currMonthView.events, currMonthView.month, currMonthView.year
          );

          buildMonthCalendarDates(MonthViewObj);
      });
      document.getElementById('viewText').textContent = 'Weekly View';
  }
}

function daysInMonth(month,year) {
  return new Date(year, month, 0).getDate();
}

function getEventDate(eventBoundary) {
  let date;
  if ('dateTime' in eventBoundary) {
      const tPos = eventBoundary.dateTime.indexOf('T');
      date = eventBoundary.dateTime.slice(0, tPos);
  } else {
      date = eventBoundary.date;
  }

  return new Date(date);
}

function isUpcomingEvent(today, evDate) {
  return today.getFullYear() - evDate.getFullYear() <= 0 && 
         today.getMonth() - evDate.getMonth() <= 0 && 
         today.getDate() - evDate.getDate() <= 0;
}

function buildMonthViewObject(events, month, year) {
  let curr = {
      month: month,
      year: year,
      numDays: 0,
      datesWithEvents: []
  };

  curr.numDays = daysInMonth(curr.month + 1, curr.year);

  // Set curr.datesWithEvents content.
  events.forEach(ev => {
      let evStartDate = getEventDate(ev.start);
  
      if (evStartDate.getFullYear() === curr.year && evStartDate.getMonth() === curr.month) {
          if (!curr.datesWithEvents.includes(evStartDate.getDate())) {
              curr.datesWithEvents.push(evStartDate.getDate());
          }
      }
  });
  curr.datesWithEvents.sort();

  return curr;
}
function buildWeekViewObject(events, week, month, year) {
  let curr = {
      week: week,
      month: month,
      year: year,
      numDays: 0,
      daysRange: [],
      datesWithEvents: []
  };

  if (week === 5) {
    curr.numDays = daysInMonth(curr.month + 1, curr.year) % 7;
  } else {
    curr.numDays = 7;
  }

  for (let i = 1; i <= curr.numDays; i++) {
    curr.daysRange.push((week - 1) * 7 + i);
  }

  // Set curr.datesWithEvents content.
  events.forEach(ev => {
      let evStartDate = getEventDate(ev.start);
  
      if (evStartDate.getFullYear() === curr.year && 
          evStartDate.getMonth() === curr.month &&
          curr.daysRange.includes(evStartDate.getDate())
          ) {
          if (!curr.datesWithEvents.includes(evStartDate.getDate())) {
              curr.datesWithEvents.push(evStartDate.getDate());
          }
      }
  });
  curr.datesWithEvents.sort();
  
  return curr;
}
