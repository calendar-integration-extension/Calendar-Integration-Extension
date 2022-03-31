let root = document.getElementById('dayEvents-root');

chrome.storage.local.get(['date'], items => {
    const chosenDate = items.date;

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
                    evStartDate = evStartDate.slice(tPos-2, tPos);
                } else {
                    evStartDate = ev.start.date;
                    const len = evStartDate.length;
                    evStartDate = evStartDate.slice(len-2, len);
                }
                evStartDate = Number(evStartDate);
                
                if (evStartDate === chosenDate) {        
                    noEvents = false;
                    let evTitle = (ev.summary !== null) ? ev.summary : 'No Title';
                    let startDate = (ev.start.date !== null) ? ev.start.date : ev.start.dateTime;
                    let endDate = (ev.end.date !== null) ? ev.end.date : ev.end.dateTime;
                    let evInterval = startDate + ' to ' + endDate;  
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

            let pageHeader = document.getElementById('dayEvents-header');
            if (noEvents) {
                pageHeader.textContent = 'No recorded events for this date.'
            } else {
                pageHeader.textContent = 'Here are your events for today!';
            }
        })
        .catch(err => {
            console.error(err)
        });

    });
});