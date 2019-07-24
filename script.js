const firebaseConfig = {
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

var totalSec, timer, isTurnOn

let synchronizedLamps = 3
let priceHTML = document.getElementById("buttonCount")
let resetTime = document.getElementById("buttonReset")

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
var lampsCollection = [{}, {}, {}, {}]

checkLampStatus();

//Check each lamp status
function checkLampStatus() {
    for (let index = 1; index < statusLampsHTML.length; index++)
        readLampStatus(index);
}

const turnOn = (led) => {
    allButton.innerHTML = 'Turn On All'
    allButton.style.backgroundColor = 'rgb(250, 184, 2)'
    allButton.style.color = 'rgb(0, 0, 0)'
    buttonLamps[led].style.backgroundColor = 'rgb(250, 184, 2)'
    buttonLamps[led].setAttribute("class", "btn btn-warning")
    buttonLamps[led].innerHTML = 'Turn On'
    buttonLamps[led].style.color = 'rgb(0, 0, 0)'

}

const turnOff = (led) => {
    allButton.innerHTML = 'Turn Off All'
    allButton.style.backgroundColor = 'rgba(54, 58, 50, 0.596)'
    allButton.style.color = 'rgb(199, 184, 184)'
    // buttonLamps[led].setAttribute("class", "btn")
    buttonLamps[led].style.backgroundColor = 'rgba(54, 58, 50, 0.596)'
    buttonLamps[led].innerHTML = 'Turn Off'
    buttonLamps[led].style.color = 'rgb(199, 184, 184)'
}

function readLampStatus(led) {
    database.ref(`/leds/` + led + `/status`).on('value', function (snapshot) {
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

//write to firebase database
const onclickLamps = (led) => buttonLamps[led].addEventListener('click', setTimeout(writeStatusToFirebase(led), 1000))

const onclickAllLamps = () => allButton.addEventListener('click', setTimeout(() => {
    for (let index = 1; index <= 3; index++) writeStatusToFirebase(index)
}, 1000))

const onclickCalculatePrice = () => priceHTML.addEventListener('click', () => {
    let totalPrice = 0
    for (let led = 1; led < lampsCollection.length; led++) {
        totalPrice += calculateElectricityPricePerLamp(led)

        let timer = lampsCollection[led].timer
        setTimeout(recordTimeToFirebase(led), 1000)
        clearInterval(timer)
    }
    alert("Total price : " + totalPrice.toFixed(3) + " Rupiah")
})

const writeStatusToFirebase = (led) => {
    let updates = {}
    updates[`leds/` + led + `/status`] = ((buttonLamps[led].innerText) === "Turn Off") ? 0 : 1
    database.ref().update(updates)
    setTimeout(recordTimeToFirebase(led), 1000)
}


const recordTimeToFirebase = (led) => {
    let updateTotalSeconds = {}
    updateTotalSeconds[`leds/` + led + `/seconds`] = lampsCollection[led].totalSec
    database.ref().update(updateTotalSeconds)
}

const onclickResetTimerFirebase = () => {
    buttonReset.addEventListener('click', function () {
        let resetTimerFirebase = {}
        for (let index = 1; index <= synchronizedLamps; index++) {
            resetTimerFirebase[`leds/` + index + `/seconds`] = 0
        }
        database.ref().update(resetTimerFirebase)
        window.location.reload(true)
    })

}

//TIMER SECTION 
function lampHandler(led, totalSec, timer, watt) {
    this.led = led
    this.totalSec = totalSec
    this.timer = timer
    this.watt = watt
}

const timerLamp = (led, isTurnOn) => {
    resumeTimerFromFirebase(led, isTurnOn)

    function start() {
        lampsCollection[led].totalSec++
        hour = Math.floor(lampsCollection[led].totalSec / 3600)
        minute = Math.floor((lampsCollection[led].totalSec - hour * 3600) / 60)
        seconds = lampsCollection[led].totalSec - (hour * 3600 + minute * 60)
        timerLamps[led].innerHTML = hour + " : " + minute + " : " + seconds
    }

    function stopTimer() {
        let timer = lampsCollection[led].timer
        clearInterval(timer)
    }

    function resumeTimer() {
        //Hold current value of totalSec to tmpSecond
        let tmpSecond = lampsCollection[led].totalSec
        //create new object that totalSec parameter is the value from tmpSecond
        lampsCollection[led] = new lampHandler(led, parseInt(tmpSecond), setInterval(start, 1000), 10)
    }

    function resumeTimerFromFirebase(led, isTurnOn) {
        let secondsFirebase = 0
        database.ref(`/leds/` + led + `/seconds`).on('value', function (snapshot) {
            if (timerLamps[led].innerHTML && isTurnOn) {
                console.log("Lamp " + led + " turned on , starting timer...")
                resumeTimer()
            } else if (isTurnOn == false) {
                console.log("Lamp " + led + " turned off , stopping timer...")
                stopTimer()
            } else {
                secondsFirebase = parseInt(snapshot.val());
                //replace null value to new objects
                lampsCollection[led] = new lampHandler(led, parseInt(secondsFirebase), setInterval(start, 1000), 10)
                console.log("success turned on lamp " + led)
            }
        })
    }
}

//For calculating the electricity price

const calculateElectricityPricePerLamp = (led) => {
    kiloWatt = (lampsCollection[led].watt * (lampsCollection[led].totalSec / 3600)) / 1000
    let priceKwH = kiloWatt * 1352
    return priceKwH
}

//Catatan Progress
//--> count up 3 lampu menumpuk perhitungan totalSec ( Jul 6 ) ===> Solusi : pakai OOP dan masukkan ke array (fixed)
//--> ada bug timer tetep lanjut walau di turn off lampnya (Jul 8 : 2.40 PM) ===> Pakai OOP dan update array di index tertentu
//--> finished bugs ( Jul 8 : 3.10PM) 
// Note 8 Juli 2019 : Client harus menyalakan seluruh lampu dulu, supaya disinkronisasi dengan kodingan ini ===> Isi array = null, (fixed)

//update array[indeks] dengan mengganti value dari null ke object

// 11 Juli 2019 : Ketika posisi awal semua lampu dalam posisi mati, tidak bisa menghitung harga
// --> coba buat objek dari query firebase yang bisa menyimpan info : (fixed)

//24 Juli 2019 : Update ke arrow function