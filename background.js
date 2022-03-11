var running = false;
var interval = null;

const SESSION_MINUTES = 25 * 60;
const BREAK_MINUTES = 5 * 60;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'START_SESSION') {
        if (interval != null) clearInterval(interval);
        let onSession = true;
        let seconds = SESSION_MINUTES;
        running = true;
        interval = setInterval(() => {
            seconds--;
            console.log(seconds);
            let color = onSession ? '#0000ff' : '#03c04a';
            chrome.browserAction.setBadgeText({
                text: Math.ceil(seconds / 60).toString()
            });
            chrome.browserAction.setBadgeBackgroundColor({
                color: color
            });
            if (seconds === 0) {
                let options = onSession ?
                    {
                        type: 'basic',
                        iconUrl: 'images/2-48.png',
                        message: 'Time to take a break. :)',
                        title: 'Pomodoro Session Finished.'
                    } :
                    {
                        type: 'basic',
                        iconUrl: 'images/2-48.png',
                        message: 'Get back to work. Go go go!',
                        title: 'Break Session Finished.'
                    };
                chrome.notifications.create(options);
                seconds = onSession ? BREAK_TIME : SESSION_TIME;
                onSession = onSession ? false : true;
            }
        }, 1000);
        return true;
    } else if (message.command === 'STOP_SESSION') {
        chrome.browserAction.setBadgeText({ text: '' });
        running = false;
        clearInterval(interval);
        interval = null;
        return true;
    } else if (message.command === 'GET_STATE') {
        sendResponse({ running: running });
        return true;
    }
});