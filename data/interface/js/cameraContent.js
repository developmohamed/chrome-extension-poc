
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


            //  startRecord();
            //  const sleep = m => new Promise(r => setTimeout(r, m));
            // await sleep(3000);
            // stopRecord();

        });
    }


    function startRecord() {

        recorder = RecordRTC(receivedMediaStream, {
            type: 'video'
        });
        recorder.startRecording();
    }

    function stopRecord() {
        recorder.stopRecording(function () {
            let blob = recorder.getBlob();
            invokeSaveAsDialog(blob);
        });
    }

    function closeAllCurrentMediaStream() {
        receivedMediaStream.getTracks().forEach(mediaTrack => {
            mediaTrack.stop();
        });
    }


    function  isCameraWapperExist() {
        var videoContainer = document.getElementById('videoContainer');
        console.log("Here:" + isRecording);
        // console.log('Stattttus:'+isRecording && videoContainer !== null);
        return   isRecording && videoContainer !== null;

    }


    function checkCamerPermissionF() {

        //        navigator.permissions.query({name: 'camera'}).then(function (result) {
//            if (result.state == 'granted') {
//                console.log('granted');
//            } else if (result.state == 'prompt') {
//                console.log('prompt');
//            } else if (result.state == 'denied') {
//                console.log('denied');
//            }
//            result.onchange = function () {};
//        });


        navigator.permissions.query({name: "camera"}).then(res => {
            if (res.state == "granted") {
                console.log('granted');
            }
        });

    }


    //=================capture screen

    //////////////////////////////////


});



