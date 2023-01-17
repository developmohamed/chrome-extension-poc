
var recorder; // globally accessible
var recording = false;
let receivedMediaStream = null;
var wapperExistBefore = false;

$(document).ready(function () {

    injectContent(true);

    function injectContent(inject) {

        if (inject) {
            var videoTag = "<div id='videoContainer'> <video autoplay='true' class='capture-video-bubble' id='videoElement'></video></div>  ";
            document.body.innerHTML += videoTag;
            openCameraStream();
            recording = true;

            wapperExistBefore = true;
            chrome.storage.sync.set({"recording": true});

        } else {
            recording = false;
        }
    }

    function openCameraStream() {
        const videoElem = document.getElementById('videoElement');
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        }).then(async function (stream) {

            videoElem.srcObject = stream;
            receivedMediaStream = stream;
        });
    }

});



