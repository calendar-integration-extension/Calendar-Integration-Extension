let el = {
    eventNameElmt: document.getElementById('event-name-input'),
    eventDescriptionElmt: document.getElementById('event-description-input'),
    startDateElmt: document.getElementById('start-date'),
    startDateLabel: document.getElementById('start-date-label'),
    startTimeElmt: document.getElementById('start-time'),
    startTimeLabel: document.getElementById('start-time-label'),
    endDateElmt: document.getElementById('end-date'),
    endDateLabel: document.getElementById('end-date-label'),
    endTimeElmt: document.getElementById('end-time'),
    endTimeLabel: document.getElementById('end-time-label'),
    wholeDayElmt: document.getElementById('whole-day-checkbox'),
    includeDayElmt: document.getElementById('include-day-checkbox'),
    includeDayLabel: document.getElementById('include-day-label'),
    addEventBtnElmt: document.getElementById('add-event-btn'),
};

class UpdateEventPage {
    constructor() {
        el.wholeDayElmt.addEventListener('change', function() {
            if (this.checked) {
                el.startDateLabel.textContent = 'Date';
                el.endDateElmt.style.visibility = 'hidden';
                el.endDateLabel.style.visibility = 'hidden';

                if (el.includeDayElmt.checked) {
                    el.startTimeElmt.style.visibility = 'hidden';
                    el.startTimeLabel.style.visibility = 'hidden';
                    el.endTimeElmt.style.visibility = 'hidden';
                    el.endTimeLabel.style.visibility = 'hidden';
                }

                el.includeDayElmt.style.visibility = 'hidden';
                el.includeDayLabel.style.visibility = 'hidden';
            } else {
                el.startDateLabel.textContent = 'Start Date';
                el.endDateElmt.style.visibility = 'visible';
                el.endDateLabel.style.visibility = 'visible';

                if (el.includeDayElmt.checked) {
                    el.startTimeElmt.style.visibility = 'visible';
                    el.startTimeLabel.style.visibility = 'visible';
                    el.endTimeElmt.style.visibility = 'visible';
                    el.endTimeLabel.style.visibility = 'visible';
                }

                el.includeDayElmt.style.visibility = 'visible';
                el.includeDayLabel.style.visibility = 'visible';
            }
        });

        el.includeDayElmt.addEventListener('change', function() {
            if (this.checked) {
                el.startTimeElmt.style.visibility = 'visible';
                el.startTimeLabel.style.visibility = 'visible';
                el.endTimeElmt.style.visibility = 'visible';
                el.endTimeLabel.style.visibility = 'visible';
            } else {
                el.startTimeElmt.style.visibility = 'hidden';
                el.startTimeLabel.style.visibility = 'hidden';
                el.endTimeElmt.style.visibility = 'hidden';
                el.endTimeLabel.style.visibility = 'hidden';
            }
        });

        el.addEventBtnElmt.addEventListener('click', this.addEvent);

        chrome.storage.local.get(['addEventInfo'], items => {
            let addEventInitialData = items.addEventInfo;
            let startDate = `${addEventInitialData.year}-${String(addEventInitialData.month + 1).padStart(2, '0')}-${addEventInitialData.date}`;
            el.startDateElmt.value = startDate;
        });
    }

    addEvent() {
        if (isFormValid()) {
            chrome.identity.getAuthToken({ interactive: true }, function(token) {
                let event = {};

                if (el.wholeDayElmt.checked || (el.startTimeElmt.value === '' && el.endTimeElmt.value === '')) {
                    console.log(el.startDateElmt.value);
                    event = {
                        summary: el.eventNameElmt.value,
                        description: el.eventDescriptionElmt.value,
                        start: {
                            'date': el.startDateElmt.value,
                            'timeZone': 'Asia/Manila'
                        },
                        end: {
                            'date': (el.wholeDayElmt.checked) ? el.startDateElmt.value : el.endDateElmt.value,
                            'timeZone': 'Asia/Manila'
                        }
                    };
                } else if (el.startTimeElmt.value !== '' && el.endTimeElmt.value !== '') {
                    console.log(el.startTimeElmt.value);
                    console.log(el.endTimeElmt.value);
                    event = {
                        summary: el.eventNameElmt.value,
                        description: el.eventDescriptionElmt.value,
                        start: {
                            'dateTime': `${el.startDateElmt.value}T${el.startTimeElmt.value}:00+08:00`,
                            'timeZone': 'Asia/Manila'
                        },
                        end: {
                            'dateTime': `${el.endDateElmt.value}T${el.endTimeElmt.value}:00+08:00`,
                            'timeZone': 'Asia/Manila'
                        }
                    };
                }

        
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
                .then(response => response.json())
                .then(eventResource => {
                    console.log(eventResource);
                    window.location.href = 'calendar.html';
                })
                .catch(err => {
                    console.log(err);
                });
            });
            
        }
    }
}

function getEventDate(eventBoundary) {
    let chosenEvent = {date: '', time: ''};
    if ('dateTime' in eventBoundary) {
        const tCharDelim = eventBoundary.dateTime.indexOf('T');
        const plusCharDelim = eventBoundary.dateTime.indexOf('+');
        chosenEvent.date = eventBoundary.dateTime.slice(0, tCharDelim);
        chosenEvent.time = eventBoundary.dateTime.slice(tCharDelim + 1, plusCharDelim);
    } else {
        chosenEvent.date = eventBoundary.date;
    }

    return chosenEvent;
}

function isFormValid() {
    let title = el.eventNameElmt.value;
    let startDate = (el.startDateElmt.value === '') ? '' : new Date(el.startDateElmt.value);
    let endDate = (el.endDateElmt.value === '') ? '' : new Date(el.endDateElmt.value);
    let startTime = el.startTimeElmt.value;
    let endTime = el.endTimeElmt.value;
    let wholeDay = el.wholeDayElmt.checked;
    let includeDay = el.includeDayElmt.checked;

    if (title === '') {
        alert('The event must have a title.');
        return false;
    }

    if (!wholeDay) {
        if (startDate === '') {
            alert('Please fill the Start Date completely.');
            return false;
        } else if (endDate === '') {
            alert('Please fill the End Date completely.');
            return false;
        } else if (includeDay) {
            if (startTime === '' && endTime === '') {
                alert('Please fill the Start Time and End Time completely.');
                return false;
            } else if (startTime === '' && endTime !== '') {
                alert('Please fill the Start Time completely.');
                return false;
            } else if (startTime !== '' && endTime === '') {
                alert('Please fill the End Time completely.');
                return false;
            }
        } else if (endDate - startDate < 0) {
            alert('Start Date should be earlier than the End Date.');
            return false;
        } else if (startTime !== '' && endTime !== '' && startDate.getTime() === endDate.getTime()) {
            console.log('hello');
            startTime = startTime.split(':');
            startTime = { hour: Number(startTime[0]), minute: Number(startTime[1]) };
            startTimeTotalMinutes = startTime.hour * 60 + startTime.minute

            endTime = endTime.split(':');
            endTime = { hour: Number(endTime[0]), minute: Number(endTime[1]) };
            endTimeTotalMinutes = endTime.hour * 60 + endTime.minute

            console.log(startTimeTotalMinutes);
            console.log(endTimeTotalMinutes);

            if (startTimeTotalMinutes >= endTimeTotalMinutes) {
                alert('Start Time should be earlier than the End Time.')
                return false;
            }
        }
    } else {
        if (startDate === '') {
            alert('Please fill the Start Date completely.');
            return false;
        }
    }

    return true;
}

new UpdateEventPage();