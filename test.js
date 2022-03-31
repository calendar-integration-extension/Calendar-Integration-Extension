function createEvent() {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        console.log(token);
        
        let event = {
            summary: 'Google Api Implementation',
            start: {
                'date': '2022-03-30',
                'timeZone': 'Asia/Manila'
            },
            end: {
                'date': '2022-03-30',
                'timeZone': 'Asia/Manila'
            }
        };

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
        .then((response) => response.json()) 
        .then(function (data) {
            console.log(data);
        })
        .catch(err => {
            console.error(err)
        });
    });
}

function updateEvent() {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        console.log(token);

        let event = {
            summary: 'I changed it hehe',
            start: {
                'date': '2022-03-30',
                'timeZone': 'Asia/Manila'
            },
            end: {
                'date': '2022-03-30',
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
            'https://www.googleapis.com/calendar/v3/calendars/primary/events/vsbcfgpa1817921fkdce250k5s',
            fetch_options
        )
        .then((response) => response.json()) 
        .then(function (data) {
            console.log('Success!');
            console.log(data);
        })
        .catch(err => {
            console.log('Error!');
            console.error(err);
        });
    });
}

function getEvents() {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
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
            console.log(data);
        })
        .catch(err => {
            console.error(err)
        });
    });
}

document.getElementById('add-button').addEventListener('click', createEvent);
document.getElementById('update-button').addEventListener('click', updateEvent);
document.getElementById('get-button').addEventListener('click', getEvents);