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

const doorsCollection = [{
    isLocked: undefined,
    lastLocked: "10/02/2019",
    lastUnlocked: "20/03/4023"
}]

readDoorStatus()

const lock = () => {
    buttonLock.style.backgroundColor = 'rgb(250, 184, 2)'
    buttonLock.setAttribute("class", "btn btn-warning")
    buttonLock.innerHTML = 'Lock'
    buttonLock.style.color = 'rgb(0, 0, 0)'

    content_door.innerHTML = "Unlocked at " + doorsCollection[0].lastLocked
}

const unlock = () => {
    buttonLock.style.backgroundColor = 'rgba(54, 58, 50, 0.596)'
    buttonLock.innerHTML = 'Unlock'
    buttonLock.style.color = 'rgb(199, 184, 184)'

    content_door.innerHTML = "Locked at " + doorsCollection[0].lastUnlocked
}

function readDoorStatus() {
    database.ref(`/servo/` + 1 + `/isLocked`).on('value', function (snapshot) {
        let status = snapshot.val();
        if (status) {
            unlock()
            doorsCollection[0].isLocked = 1
        } else {
            lock()
            doorsCollection[0].isLocked = 0
        }
    })
}

const onclickButton = () => buttonLock.addEventListener('click', setTimeout(writeStatusToFirebase(), 1000))

const writeStatusToFirebase = () => {
    let updates = {}
    updates[`/servo/` + 1 + `/isLocked`] = (!doorsCollection[0].isLocked) ? 1 : 0
    database.ref().update(updates)
}