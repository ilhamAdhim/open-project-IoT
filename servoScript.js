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
const database = firebase.database();


const buttonLock = document.getElementById("buttonLock");
const content_door = document.getElementById("content");
var today = new Date();

const doorsCollection = [{
    isLocked: undefined,
    lastLocked: undefined,
    lastUnlocked: undefined
}]

for (let index = 0; index < 1; index++) {
    readDoorStatus(index)
}

const lock = (servo) => {
    buttonLock.style.backgroundColor = 'rgb(250, 184, 2)'
    buttonLock.setAttribute("class", "btn btn-warning")
    buttonLock.innerHTML = 'Lock'
    buttonLock.style.color = 'rgb(0, 0, 0)'

    database.ref(`/servo/` + (servo + 1) + `/lastUnlocked`).on('value', function (snapshot) {
        doorsCollection[servo].lastUnlocked = snapshot.val()
        content_door.innerHTML = "Unlocked at " + doorsCollection[servo].lastUnlocked
    })

    var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear()
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    doorsCollection[0].lastUnlocked = date + ' ' + time

}

const unlock = (servo) => {
    buttonLock.style.backgroundColor = 'rgba(54, 58, 50, 0.596)'

    buttonLock.innerHTML = 'Unlock'
    buttonLock.style.color = 'rgb(199, 184, 184)'

    database.ref(`/servo/` + (servo + 1) + `/lastLocked`).on('value', function (snapshot) {
        doorsCollection[servo].lastLocked = snapshot.val()
        content_door.innerHTML = "Locked at " + doorsCollection[servo].lastLocked
    })


    var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear()
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    doorsCollection[0].lastLocked = date + ' ' + time

}

function readDoorStatus(servo) {

    database.ref(`/servo/` + (servo + 1) + `/isLocked`).on('value', function (snapshot) {
        let status = snapshot.val();
        if (status) {
            unlock(servo)
            doorsCollection[servo].isUnlocked = 0
        } else {
            lock(servo)
            doorsCollection[servo].isLocked = 90
        }
    })
}

const onclickButton = (servo) => buttonLock.addEventListener('click', setTimeout(writeStatusToFirebase(servo), 1000))

const writeStatusToFirebase = () => {
    let updates = {}
    let updateLastTime = {}

    updates[`/servo/` + 1 + `/isLocked`] = (!doorsCollection[0].isLocked) ? 0 : 90
    var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear()
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    if (doorsCollection[0].isLocked) {
        doorsCollection[0].lastUnlocked = date + ' ' + time
        updateLastTime[`/servo/` + 1 + '/lastUnlocked'] = doorsCollection[0].lastUnlocked
    } else {
        doorsCollection[0].lastLocked = date + ' ' + time
        updateLastTime[`/servo/` + 1 + '/lastLocked'] = doorsCollection[0].lastLocked

    }
    database.ref().update(updateLastTime)
    database.ref().update(updates)

    window.location.reload(false)
}