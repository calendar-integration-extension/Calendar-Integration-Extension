const SESSION_MINUTES = 25;
const BREAK_MINUTES = 5;

chrome.windows.onCreated.addListener((window) => {
    chrome.alarms.create('WINDOW_INIT', {delayInMinutes: 0});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'GET_TIME_LEFT') {
        let response = {};
        chrome.alarms.getAll(alarms => {
            if (alarms.length === 0) {
                response = { timeLeft: SESSION_MINUTES * 60, running: false, alarm_type: null };
                sendResponse(response);
            } else {
                let alarm = alarms[0];
                response = { timeLeft: Math.ceil((alarm.scheduledTime - Date.now()) / 1000), running: true, alarm_type: alarm.name };
                sendResponse(response);
            }
        });
        return true;
    } else if (message.command === 'START_SESSION') {
        chrome.action.setBadgeText({ text: 'POM' });
        chrome.action.setBadgeBackgroundColor({ color: '#0000ff' });
        chrome.action.setTitle({ title: 'Calendaring at your finest.\nCurrently in a 25-minute Pomodoro session.' });
        chrome.alarms.create('SESSION_ALARM', { delayInMinutes: SESSION_MINUTES });
        chrome.alarms.getAll(alarms => {
            console.log(alarms);
        });
        return true;
    } else if (message.command === 'STOP_SESSION') {
        chrome.action.setBadgeText({ text: '' });
        chrome.alarms.clearAll();
        return true;
    }
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'SESSION_ALARM') {
        chrome.action.setBadgeText({ text: 'BRK' });
        chrome.action.setBadgeBackgroundColor({ color: '#03c04a' });
        chrome.action.setTitle({ title: 'Calendaring at your finest.\nCurrently taking a 5-minute break.' });
        chrome.alarms.create('BREAK_ALARM', {delayInMinutes: BREAK_MINUTES} );
        sendNotification(alarm.name);
    } else if (alarm.name === 'BREAK_ALARM') {
        chrome.action.setBadgeText({ text: 'POM' });
        chrome.action.setBadgeBackgroundColor({ color: '#0000ff' });
        chrome.action.setTitle({ title: 'Calendaring at your finest.\nCurrently in a 25-minute Pomodoro session.' });
        chrome.alarms.create('SESSION_ALARM', {delayInMinutes: SESSION_MINUTES} );
        sendNotification(alarm.name);
    } else if (alarm.name === 'WINDOW_INIT') {
        chrome.action.setBadgeText({ text: '' });
        chrome.alarms.clearAll();
    }
})

function sendNotification(alarmName) {
    let options = {};
    if (alarmName === 'SESSION_ALARM') {
        options = {
            type: 'basic',
            iconUrl: 'images/2-48.png',
            message: 'Time to take a break. :)',
            title: 'Pomodoro Session Finished.'
        };
    } else if (alarmName === 'BREAK_ALARM') {
        options = {
            type: 'basic',
            iconUrl: 'images/2-48.png',
            message: 'Get back to work. Go go go!',
            title: 'Break Session Finished.'
        };
    }
    chrome.notifications.create(options);
}