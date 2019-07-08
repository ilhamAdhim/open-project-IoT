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
var lampsCollectionTimer = [null, ]
var totalSec, timer, isTurnOn
var trial = 0

let status1 = document.getElementById("status1");
let status2 = document.getElementById("status2");
let status3 = document.getElementById("status3");

let allButton = document.getElementById("allButton");
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
    allButton.innerHTML = 'Turn On All'
    allButton.style.backgroundColor = 'rgb(250, 184, 2)'
    allButton.style.color = 'rgb(0, 0, 0)'
    buttonLamps[led].style.backgroundColor = 'rgb(250, 184, 2)'
    buttonLamps[led].setAttribute("class", "btn btn-warning")
    buttonLamps[led].innerHTML = 'Turn On'
    buttonLamps[led].style.color = 'rgb(0, 0, 0)'

}

function turnOff(led) {
    allButton.innerHTML = 'Turn Off All'
    allButton.style.backgroundColor = 'rgba(54, 58, 50, 0.596)'
    allButton.style.color = 'rgb(199, 184, 184)'
    buttonLamps[led].setAttribute("class", "btn")
    buttonLamps[led].style.backgroundColor = 'rgba(54, 58, 50, 0.596)'
    buttonLamps[led].innerHTML = 'Turn Off'
    buttonLamps[led].style.color = 'rgb(199, 184, 184)'

}

function readLampStatus(led) {
    database.ref(`/leds/` + led).on('value', function (snapshot) {
        let status = parseInt(snapshot.val());
        if (status) {
            statusLampsHTML[led].innerHTML = 'On';
            statusLampsHTML[led].style.color = 'black';
            statusLampsHTML[led].style.backgroundColor = 'rgb(236, 193, 1)';
            isTurnOn = true
            turnOff(led);
        } else {

            statusLampsHTML[led].innerHTML = 'Off';
            statusLampsHTML[led].style.color = 'rgb(230, 222, 222)';
            statusLampsHTML[led].style.backgroundColor = "";
            isTurnOn = false
            turnOn(led);
        }
        timerLamp(led, isTurnOn)
    })
}

function onclickLamps(led) {
    //write to firebase database
    buttonLamps[led].addEventListener('click', setTimeout(writeToFirebase(led), 1000))
}

function onclickAllLamps() {
    allButton.addEventListener('click', setTimeout(writeAllToFirebase(), 1000))
}

function writeToFirebase(led) {
    let updates = {}
    updates[`leds/` + led] = ((buttonLamps[led].innerText) === 'Turn Off') ? 0 : 1
    database.ref().update(updates)
}

function writeAllToFirebase(led) {
    let updateAllLamps = {}
    for (let index = 1; index <= 3; index++)
        updateAllLamps[`leds/` + index] = (allButton.innerText == 'Turn Off All') ? 0 : 1
    database.ref().update(updateAllLamps)
}

//TIMER SECTION 
//--> count up 3 lampu menumpuk perhitungan totalSec ( Jul 6 ) ===> Solusi : pakai OOP dan masukkan ke array
//--> ada bug timer tetep lanjut walau di turn off lampnya (Jul 8 : 2.40 PM) ===> Pakai OOP dan update array di index tertentu
//--> SUDAH SELESAI DONG HAHAHAHA ( Jul 8 : 3.10PM) 
// Note 8 Juli 2019 : Client harus menyalakan seluruh lampu dulu, supaya disinkronisasi dengan kodingan ini

function lampHandler(led, totalSec, timer) {
    this.led = led
    this.totalSec = totalSec
    this.timer = timer
}

function timerLamp(led, isTurnOn) {
    if (timerLamps[led].innerHTML && isTurnOn) {
        console.log("Timer of lamp " + led + " is already exist")
        resumeTimer()
    } else if (isTurnOn == false) {
        stopTimer()
    } else {
        lampsCollectionTimer.push(new lampHandler(led, parseInt(0), setInterval(start, 1000)))
    }

    function start() {
        lampsCollectionTimer[led].totalSec++
        hour = Math.floor(lampsCollectionTimer[led].totalSec / 3600)
        minute = Math.floor((lampsCollectionTimer[led].totalSec - hour * 3600) / 60)
        seconds = lampsCollectionTimer[led].totalSec - (hour * 3600 + minute * 60)
        timerLamps[led].innerHTML = hour + " : " + minute + " : " + seconds
    }

    function stopTimer() {
        console.log("timer at lamp " + led + " stopped")
        let timer = lampsCollectionTimer[led].timer
        clearInterval(timer)
    }

    function resumeTimer() {
        let tmpSecond = lampsCollectionTimer[led].totalSec
        //create new object that starting totalSec is the value from previous totalSec before getting sremoved
        lampsCollectionTimer[led] = new lampHandler(led, parseInt(tmpSecond), setInterval(start, 1000))
    }
}