const MAX_YEARS = 2050;

let el = {
    eventNameElmt: document.getElementById('event-name-input'),
    eventDescriptionElmt: document.getElementById('event-description-input'),
    startDateElmt: document.getElementById('start-date'),
    endDateElmt: document.getElementById('end-date'),
    wholeDayElmt: document.getElementById('whole-day-checkbox'),
    updateEventBtnElmt: document.getElementById('update-event-btn'),
    deleteEventBtnElmt: document.getElementById('delete-event-btn')
};

let eventId = '';

class UpdateEventPage {
    constructor() {
        el.wholeDayElmt.addEventListener('change', function() {
            let endDateLabel = document.getElementById('end-date-label');

            if (this.checked) {
                el.endDateElmt.style.visibility = 'hidden';
                endDateLabel.style.visibility = 'hidden';
            } else {
                el.endDateElmt.style.visibility = 'visible';
                endDateLabel.style.visibility = 'visible';
            }
        });

        el.updateEventBtnElmt.addEventListener('click', this.updateEvent);
        el.deleteEventBtnElmt.addEventListener('click', this.deleteEvent);

        chrome.storage.local.get(['evId'], items => {
            eventId = items.evId;
            
            chrome.identity.getAuthToken({ interactive: true }, function(token) {
                let fetch_options = {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                };
                fetch(
                    'https://www.googleapis.com/calendar/v3/calendars/primary/events/' + eventId,
                    fetch_options
                )
                .then((response) => response.json()) 
                .then(function(event) {
                    console.log(event.description);
                    let eventTitle = (event.summary == null) ? '' : event.summary;
                    let eventDescription = (event.description == null) ? '' : event.description;
                    let startDateObj = getEventDate(event.start);
                    let endDateObj = getEventDate(event.end);

                    let chosenEvent = {
                        title: eventTitle,
                        description: eventDescription,
                        startDate: startDateObj,
                        endDate: endDateObj,
                    };

                    el.eventNameElmt.value = chosenEvent.title;
                    el.eventDescriptionElmt.value = chosenEvent.description;
                    el.startDateElmt.value = chosenEvent.startDate;
                    el.endDateElmt.value = chosenEvent.endDate;
                });
            });
        });
    }

    updateEvent() {
        if (isFormValid()) {
            chrome.identity.getAuthToken({ interactive: true }, function(token) {
                let endDate = (el.wholeDayElmt.checked) ? 
                    el.startDateElmt.value : el.endDateElmt.value;

                let event = {
                    summary: el.eventNameElmt.value,
                    description: el.eventDescriptionElmt.value,
                    start: {
                        'date': el.startDateElmt.value,
                        'timeZone': 'Asia/Manila'
                    },
                    end: {
                        'date': endDate,
                        'timeZone': 'Asia/Manila'
                    }
                };
        
                let fetch_options = {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(event),
                };
        
                fetch(
                    'https://www.googleapis.com/calendar/v3/calendars/primary/events/' + eventId,
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
    
    deleteEvent() {
        const confirmDelete = confirm('Are you sure you want to delete this event?');
        
        if (confirmDelete) {
            chrome.identity.getAuthToken({ interactive: true }, function(token) {
                let fetch_options = {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                };
            
                fetch(
                    'https://www.googleapis.com/calendar/v3/calendars/primary/events/' + eventId,
                    fetch_options
                )
                .then(response => {
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
    let date;
    if ('dateTime' in eventBoundary) {
        const tPos = eventBoundary.dateTime.indexOf('T');
        date = eventBoundary.dateTime.slice(0, tPos);
    } else {
        date = eventBoundary.date;
    }

    return date;
}

function isFormValid() {
    let title = el.eventNameElmt.value;
    let startDate = new Date(el.startDateElmt.value);
    let endDate = new Date(el.endDateElmt.value);
    let wholeDay = el.wholeDayElmt.checked;

    if (title === '') {
        alert('The event must have a title.');
        return false;
    }

    if (!wholeDay && endDate - startDate < 0) {
        alert('Start Date should be earlier than the End Date.');
        return false;
    }

    return true;
}

new UpdateEventPage();