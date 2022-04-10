const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

let root = document.getElementById('dayEvents-root');
let addEventBtnEl = document.getElementById('add-event-btn');

chrome.storage.local.get(['event'], items => {
    const chosenEvent = items.event;

    chrome.identity.getAuthToken({ interactive: true }, token => {
        console.log(token);

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
            let events = data.items;
            let noEvents = true;
            
            events.forEach((ev) => {
                let evStartDate;
                
                if ("dateTime" in ev.start) {
                    evStartDate = ev.start.dateTime;
                    const tPos = evStartDate.indexOf('T');
                    evStartDate = evStartDate.slice(0, tPos);
                } else {
                    evStartDate = ev.start.date;
                }
                evStartDate = new Date(evStartDate);
                
                if (evStartDate.getFullYear() === chosenEvent.year && 
                    evStartDate.getMonth() === chosenEvent.month && 
                    evStartDate.getDate() === chosenEvent.date
                    ) {      
                    console.log(evStartDate);
                    noEvents = false;
                    let evTitle = (ev.summary != null) ? ev.summary : 'No Title';
                    let startDateString = getDateString(ev.start);
                    let endDateString = getDateString(ev.end);
                    let evInterval = '';

                    if (startDateString === endDateString) {
                        evInterval = `${startDateString}`;
                    } else {
                        evInterval = `From ${startDateString} to ${endDateString}.`;
                    }

                    let evId = ev.id;

                    let evBtn = document.createElement('div');
                    evBtn.innerHTML = `
                        <div>
                            <a href="updateEventPage.html">
                                <button class="dayEvents-butns dayEvents-events">
                                    ${evTitle} - ${evInterval}
                                </button>
                            </a>
                        </div>
                    `;

                    evBtn.addEventListener('click', () => {
                        chrome.storage.local.set({ 'evId': evId });
                    });

                    root.appendChild(evBtn);
                }
            });

            addEventBtnEl.addEventListener('click', () => {
                chrome.storage.local.set({'addEventInfo': chosenEvent});
            });

            let pageHeader = document.getElementById('dayEvents-header');
            let chosenDateString = `${months[chosenEvent.month]} ${chosenEvent.date}, ${chosenEvent.year}`;
            if (noEvents) {
                pageHeader.textContent = `No recorded events for ${chosenDateString}.`;
            } else {
                pageHeader.textContent = `Here are your events for ${chosenDateString}.`;
            }
        })
        .catch(err => {
            console.error(err)
        });

    });
});

function getDateString(boundary) {
    let boundaryDateString = '';
    if (boundary.date == null) {
        let boundaryDateFull = new Date(boundary.dateTime);
        let boundaryDate = boundaryDateFull.toLocaleDateString();
        let boundaryDateParsed = boundaryDate.split('/');
        boundaryDateParsed = {
            month: boundaryDateParsed[0],
            date: boundaryDateParsed[1],
            year: boundaryDateParsed[2],
        }
        boundaryTime = boundaryDateFull.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        boundaryDateString = `${months[Number(boundaryDateParsed.month) - 1]} ${boundaryDateParsed.date}, ${boundaryDateParsed.year}, ${boundaryTime}`;
    } else {
        let boundaryDateFull = new Date(boundary.date);
        let boundaryDate = boundaryDateFull.toLocaleDateString();
        console.log(boundaryDate);
        let boundaryDateParsed = boundaryDate.split('/');
        boundaryDateParsed = {
            month: boundaryDateParsed[0],
            date: boundaryDateParsed[1],
            year: boundaryDateParsed[2],
        }
        boundaryDateString = `${months[Number(boundaryDateParsed.month) - 1]} ${boundaryDateParsed.date}, ${boundaryDateParsed.year}`;
    }

    return boundaryDateString;
}