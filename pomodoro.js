const SESSION_MINUTES = 25;
const BREAK_MINUTES = 5;

class Pomodoro {
    constructor(root) {
        root.innerHTML = Pomodoro.getHTML();

        this.el = {
            minutes: root.querySelector('.pomodoro-timer-display-minutes'),
            seconds: root.querySelector('.pomodoro-timer-display-seconds'),
            control: root.querySelector('.pomodoro-timer-control-btn'),
            status: root.querySelector('.pomodoro-status')
        };

        this.interval = null;

        let message = { command: 'GET_TIME_LEFT' };
        chrome.runtime.sendMessage(message, (response) => {
            console.log('response: ', response);
            this.remainingSeconds = response.timeLeft;

            if (response.running) {
                if (response.alarm_type === 'SESSION_ALARM') {
                    this.startSession(true);
                } else if (response.alarm_type === 'BREAK_ALARM') {
                    this.startBreak();
                }
            }
        });

        this.el.control.addEventListener('click', () => {
            if (this.interval === null) {
                this.startSession(false);
            } else {
                this.stopSession();
            }
        });
    }

    startSession(popUpRecentlyOpened) {
        if (!popUpRecentlyOpened) {
            let message = { command: 'START_SESSION' };
            chrome.runtime.sendMessage(message);
        }
        this.el.status.textContent = 'In session...';
        this.el.control.textContent = 'Stop Session';
        this.interval = setInterval(() => {
            this.remainingSeconds--;
            this.updateTimerDisplay();

            if (this.remainingSeconds === 0) {
                clearInterval(this.interval);
                this.remainingSeconds = BREAK_MINUTES * 60;
                this.updateTimerDisplay();
                this.startBreak();
            }
        }, 1000);
    }
    
    startBreak() {
        this.el.status.textContent = 'Taking a break...';
        this.el.control.textContent = 'Stop Session';
        this.interval = setInterval(() => {
            this.remainingSeconds--;
            this.updateTimerDisplay();
            
            if (this.remainingSeconds === 0) {
                clearInterval(this.interval);
                this.remainingSeconds = SESSION_MINUTES * 60;
                this.updateTimerDisplay();
                this.startSession();
            }
        }, 1000);
    }
    
    stopSession() {
        let message = { command: 'STOP_SESSION' };
        chrome.runtime.sendMessage(message);
        this.el.status.textContent = '';
        this.el.control.textContent = 'Start Session';
        clearInterval(this.interval);
        this.interval = null;
        this.remainingSeconds = SESSION_MINUTES * 60;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor((this.remainingSeconds / 60));
        const seconds = this.remainingSeconds % 60;
        this.el.minutes.textContent = minutes.toString().padStart(2, '0');
        this.el.seconds.textContent = seconds.toString().padStart(2, '0');
    }

    static getHTML() {
        return `
            <div class="pomodoro-status"></div>
            <div class="pomodoro-timer-display">
                <span class="pomodoro-timer-display-minutes">--</span>
                <span class="pomodoro-timer-display-delim">:</span>
                <span class="pomodoro-timer-display-seconds">--</span>
            </div> 
            <div class="pomodoro-timer-control">
                <button type="button" class="pomodoro-timer-control-btn">Start Session</button>
            </div>
        `
    }
}

new Pomodoro(   
    document.querySelector('.pomodoro-timer')
);