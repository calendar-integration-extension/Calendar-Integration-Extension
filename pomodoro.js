let pomodoroBtn = document.querySelector('#pomodoro-button');
let message = { command: 'GET_STATE' };

chrome.runtime.sendMessage(message, (response) => {
    pomodoroBtn.src = response.running ? 
        'images/pomodoro-stop.png' : 
        'images/pomodoro-play.png';
});

pomodoroBtn.addEventListener('click', () => {
    // console.log('clicked');
    let message = { command: 'GET_STATE' };
    chrome.runtime.sendMessage(message, (response) => {
        // console.log('response: ', response);
        controlTimer(response.running);
    });
});

async function controlTimer(running) {
    console.log('running?',  running);
    let message = {}; 
    if (running) {
        message = { command: 'STOP_SESSION'};
        pomodoroBtn.src = 'images/pomodoro-play.png';
    } else {
        message = { command: 'START_SESSION'};
        pomodoroBtn.src = 'images/pomodoro-stop.png';
    }
    chrome.runtime.sendMessage(message);
}