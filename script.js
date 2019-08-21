const firebaseConfig = {
    apiKey: "AIzaSyACjO2yV4oeWgXCDGCP738bsXI3RYnkSXo",
    authDomain: "firstprojectiot-5eeec.firebaseapp.com",
    databaseURL: "https://firstprojectiot-5eeec.firebaseio.com",
    projectId: "firstprojectiot-5eeec",
    storageBucket: "firstprojectiot-5eeec.appspot.com",
    messagingSenderId: "295179932144",
    appId: "1:295179932144:web:309ff6416339f638"
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get the Database service for the default app
let database = firebase.database();

var totalSec, timer, isTurnOn

let synchronizedLamps = 3
let priceHTML = document.getElementById("buttonCount")

let status1 = document.getElementById("status1");
let status2 = document.getElementById("status2");
let status3 = document.getElementById("status3");

let allButtonOn = document.getElementById("allButtonOn");
let allButtonOff = document.getElementById("allButtonOff");

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
    allButtonOn.innerHTML = 'Turn On All'
    allButtonOn.style.backgroundColor = 'rgb(250, 184, 2)'
    allButtonOn.style.color = 'rgb(0, 0, 0)'

    allButtonOff.innerHTML = 'Turn Off All'
    allButtonOff.style.backgroundColor = 'rgba(54, 58, 50, 0.596)'
    allButtonOff.style.color = 'rgb(199, 184, 184)'

    buttonLamps[led].style.backgroundColor = 'rgb(250, 184, 2)'
    buttonLamps[led].setAttribute("class", "btn btn-warning")
    buttonLamps[led].innerHTML = 'Turn On'
    buttonLamps[led].style.color = 'rgb(0, 0, 0)'
}

const turnOff = (led) => {
    allButtonOff.innerHTML = 'Turn Off All'
    allButtonOff.style.backgroundColor = 'rgba(54, 58, 50, 0.596)'
    allButtonOff.style.color = 'rgb(199, 184, 184)'

    allButtonOn.innerHTML = 'Turn On All'
    allButtonOn.style.backgroundColor = 'rgb(250, 184, 2)'
    allButtonOn.style.color = 'rgb(0, 0, 0)'

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
        setTimeout(recordTimeToFirebase(led), 1000)
    })
}

//write to firebase database
const onclickLamps = (led) => buttonLamps[led].addEventListener('click', setTimeout(writeStatusToFirebase(led), 1000))

const onclickAllLamps = (status) => {
    (status === "ToTurnOn") ?
    allButtonOn.addEventListener('click', setTimeout(writeAllStatusToFirebase(status), 1000)):
        allButtonOff.addEventListener('click', setTimeout(writeAllStatusToFirebase(status), 1000))
}

const onclickCalculatePrice = () => priceHTML.addEventListener('click', calculateTotalPrice())

const writeStatusToFirebase = (led) => {
    let updates = {}
    updates[`leds/` + led + `/status`] = ((buttonLamps[led].innerText) === "Turn Off") ? 0 : 1
    database.ref().update(updates)
    setTimeout(recordTimeToFirebase(led), 1000)
}

const writeAllStatusToFirebase = (status) => {
    let updates = {}
    if (status === "ToTurnOn") {
        for (let index = 1; index <= 3; index++) updates[`leds/` + index + `/status`] = 1
    } else {
        for (let index = 1; index <= 3; index++) updates[`leds/` + index + `/status`] = 0
    }
    database.ref().update(updates)
}

const recordTimeToFirebase = (led) => {
    let updateTotalSeconds = {}
    updateTotalSeconds[`leds/` + led + `/seconds`] = lampsCollection[led].totalSec
    database.ref().update(updateTotalSeconds)
}

//TIMER SECTION 
function lampHandler(led, totalSec, timer, watt) {
    this.led = led
    this.totalSec = totalSec
    this.timer = timer
    this.watt = watt
}

const timerLamp = (led, isTurnOn) => {
    resumeTimeFirebase(led, isTurnOn)

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

    function resumeTimeFirebase(led, isTurnOn) {
        let secondsFirebase = 0
        database.ref(`/leds/` + led + `/seconds`).on('value', function (snapshot) {
        console.log("lamp " + led + " is "  + isTurnOn)
            if (isTurnOn) {
                secondsFirebase = parseInt(snapshot.val());
                //replace null value to new objects
                lampsCollection[led] = new lampHandler(led, parseInt(secondsFirebase), setInterval(start, 1000), 10)
                console.log("success turned on lamp " + led)
            } else if (!isTurnOn) {
                console.log("Lamp " + led + " turned off , stopping timer...")
                stopTimer()
            }            
        })
    }
}

//For calculating the electricity price
const calculateTotalPrice = () => {
    let totalPrice = 0
    let updates ={}
    for(let index = 1;index < lampsCollection.length;index++) {
        updates[`leds/` + index + `/status`] = 1
        setTimeout(database.ref().update(updates), 1000)
    }
    for (let led = 1; led < lampsCollection.length; led++) {
        totalPrice += calculateElectricityPricePerLamp(led)
        let timer = lampsCollection[led].timer
        setTimeout(recordTimeToFirebase(led), 1000)
        hour = Math.floor(lampsCollection[led].totalSec / 3600)
        minute = Math.floor((lampsCollection[led].totalSec - hour * 3600) / 60)
        seconds = lampsCollection[led].totalSec - (hour * 3600 + minute * 60)
        timerLamps[led].innerHTML = hour + " : " + minute + " : " + seconds
        clearInterval(timer)
        
    }
    
    alert("Total price : " + totalPrice.toFixed(3) + " Rupiah")
}

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
