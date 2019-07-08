let firebaseConfig = {
    apiKey: "AIzaSyACjO2yV4oeWgXCDGCP738bsXI3RYnkSXo",
    authDomain: "firstprojectiot-5eeec.firebaseapp.com",
    databaseURL: "https://firstprojectiot-5eeec.firebaseio.com",
    projectId: "firstprojectiot-5eeec",
    storageBucket: "firstprojectiot-5eeec.appspot.com",
    messagingSenderId: "295179932144",
    appId: "1:295179932144:web:309ff6416339f638"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get the Database service for the default app
let database = firebase.database();

var timer
var totalSeconds

let status1 = document.getElementById("status1");
let status2 = document.getElementById("status2");
let status3 = document.getElementById("status3");

let button1 = document.getElementById("button1");
let button2 = document.getElementById("button2");
let button3 = document.getElementById("button3");

let timer1 = document.getElementById("timer1");
let timer2 = document.getElementById("timer2");
let timer3 = document.getElementById("timer3");

let statusLampsHTML = [null, status1, status2, status3];
let buttonLamps = [null, button1, button2, button3];
let timerLamps = [null, timer1, timer2, timer3];

checkLampStatus();

//Check each lamp status
function checkLampStatus() {
    for (let index = 1; index < statusLampsHTML.length; index++) {
        readLampStatus(index);
    }
}

function turnOn(led) {
    buttonLamps[led].style.backgroundColor = 'rgb(250, 184, 2)'
    buttonLamps[led].setAttribute("class", "btn btn-warning")
    buttonLamps[led].innerHTML = 'Turn On'
    buttonLamps[led].style.color = 'rgb(0, 0, 0)'


}

function turnOff(led) {
    buttonLamps[led].setAttribute("class", "btn")
    buttonLamps[led].style.backgroundColor = 'rgba(54, 58, 50, 0.596)'
    buttonLamps[led].innerHTML = 'Turn Off'
    buttonLamps[led].style.color = 'rgb(199, 184, 184)'

    timerLamp(led)

}

function readLampStatus(led) {
    database.ref(`/leds/` + led).on('value', function (snapshot) {
        let status = parseInt(snapshot.val());
        if (status) {
            statusLampsHTML[led].innerHTML = 'On';
            statusLampsHTML[led].style.color = 'black';
            statusLampsHTML[led].style.backgroundColor = 'rgb(236, 193, 1)';
            turnOff(led);

        } else {
            statusLampsHTML[led].innerHTML = 'Off';
            statusLampsHTML[led].style.color = 'rgb(230, 222, 222)';
            statusLampsHTML[led].style.backgroundColor = "";
            turnOn(led);
            // pauseTimerLamp(led)
        }
    })
}

function onclickLamps(led) {
    //write to firebase database
    buttonLamps[led].addEventListener('click', setTimeout(writeToFirebase(led), 1000))
}

function writeToFirebase(led) {
    let updates = {}
    updates[`leds/` + led] = ((buttonLamps[led].innerText) === 'Turn Off') ? 0 : 1
    database.ref().update(updates)
}



//TIMER SECTION


let countLamps = [null,
    {
        totalSeconds: 0,
    },

    {
        totalSeconds: 0,
    },

    {
        totalSeconds: 0,
    }
]

function timerLamp(led) {
    timer = setInterval(start, 1000)
    totalSeconds = 0

    function start() {
        totalSeconds++
        hour = Math.floor(totalSeconds / 3600)
        minute = Math.floor((totalSeconds - hour * 3600) / 60)
        seconds = totalSeconds - (hour * 3600 + minute * 60)
        timerLamps[led].innerHTML = hour + " : " + minute + " : " + seconds
    }

    function stopTimer() {
        timer = clearInterval(timer)
    }
}

function startTimer(led) {
    timer = setInterval(start, 1000)
    totalSeconds = 0
}

function resumeTimer() {
    timer = setInterval(start, 1000);
}