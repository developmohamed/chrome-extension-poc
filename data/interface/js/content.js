

$(document).ready(function () {

    chrome.storage.local.get(["isShareScreenActive"]).then((result) => {
        if (!result.isShareScreenActive) {
            getDesktop();
        }
    });

    injectContent();

    function injectContent() {

        const uniqueid = "gv-wrapper-extention";
        var wrapper = "<div id='" + uniqueid + "' ></div>";
        $("body").prepend(wrapper);
        // Inject the camera iframe
        var iframeinject = "<div id='camera-hide'></div><div class='wrap-iframe-camera'><iframe class='camera-iframe-content' src='" + chrome.runtime.getURL('data/interface/camera.html') + "' allow='camera'></iframe></div>";
        $("#" + uniqueid).prepend(iframeinject);

        /*
         //====Others contents
         chrome.storage.sync.get(['isScreenSharingActive'], function (result) {
         
         var isScreenSharingActive = result.isScreenSharingActive;
         if (!isScreenSharingActive) {
         // ScreenRecord();
         }
         });
         */
    }


    function removeCameraContent() {
        console.log("Remove  contents");
        $('#gv-wrapper-extention').remove();
        // stopRecordingCallback();
    }


    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

        console.log('Content Script JS Message =>' + message.streamId);

        if (message === 'removeContent') {
            removeCameraContent();
        } else if (message === 'screen-share-init') {
            console.log('Content --- screen-share-init');
            //ScreenRecord();
        }
    });



//===========================================
    let recorder;
    function getDesktop() {

        navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
                .then((stream) => {
                    // Use the stream here
                    // Create a MediaRecorder and start recording
                    recorder = new MediaRecorder(stream);
                    const chunks = [];
                    recorder.ondataavailable = (e) => {
                        chunks.push(e.data);
                    };

                    recorder.start();
                    recorder.onstop = (e) => saveToFile(new Blob(chunks), "Screen sharing.webm");
                    chrome.storage.local.set({isShareScreenActive: true});
                });



    }

    function saveToFile(blob, name) {

        console.log('calll saveToFile fn');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
        removeCameraContent();
        chrome.storage.local.set({isCameraContentActive: false});
        chrome.storage.local.set({isShareScreenActive: false});
    }


    function stopRecordingCallback() {
        const url = URL.createObjectURL(recorder.getBlob());
        const a = document.createElement("a");
        a.href = url;
        a.download = "gv-recording.webm";
        a.click();
        URL.revokeObjectURL(url);
        recorder.screen.stop();
        recorder.destroy();
        recorder = null;
        chrome.storage.local.set({isShareScreenActive: false});

    }


//===////////////////////////////////

    function enableScreenSharing(streamId) {



        var port = chrome.runtime.connect();

        navigator.mediaDevices.getUserMedia({
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop'
                }
            }
        }).then(function (stream) {
            port.postMessage({type: "capture", stream: stream});
        }).catch(function (error) {
            console.error(error);
        });


    }




//================================== Share Screen handling ===================



    if (!navigator.getDisplayMedia && !navigator.mediaDevices.getDisplayMedia) {
        var error = 'Your browser does NOT support the getDisplayMedia API.';
        throw new Error(error);
    } else {
        console.log('Support');
    }

    function invokeGetDisplayMedia(success, error) {
        var displaymediastreamconstraints = {
            video: {
                displaySurface: 'monitor', // monitor, window, application, browser
                logicalSurface: true,
                cursor: 'always' // never, always, motion
            }
        };


        // above constraints are NOT supported YET
        // that's why overriding them
        displaymediastreamconstraints = {
            video: true,
            audio: true
        };

        if (navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
        } else {
            navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
        }
    }



    function captureScreen(callback) {
        invokeGetDisplayMedia(function (screen) {
            addStreamStopListener(screen, function () {
                //document.getElementById('btn-stop-recording').click();
            });
            callback(screen);
        }, function (error) {
            console.error(error);
            alert('Unable to capture your screen. Please check console logs.\n' + error);
        });
    }




    function ScreenRecord() {

        captureScreen(function (screen) {
            // video.srcObject = screen;

            recorder = RecordRTC(screen, {
                type: 'video'
            });

            recorder.startRecording();

            // release screen on stopRecording
            recorder.screen = screen;

            //  document.getElementById('btn-stop-recording').disabled = false;
        });

        chrome.storage.sync.set({isScreenSharingActive: true}, function () {
        });
    }

    function stopScreenRecord() {
        recorder.stopRecording(stopRecordingCallback);
    }


    function addStreamStopListener(stream, callback) {
        stream.addEventListener('ended', function () {
            callback();
            callback = function () {};
        }, false);
        stream.addEventListener('inactive', function () {
            callback();
            callback = function () {};
        }, false);
        stream.getTracks().forEach(function (track) {
            track.addEventListener('ended', function () {
                callback();
                callback = function () {};
            }, false);
            track.addEventListener('inactive', function () {
                callback();
                callback = function () {};
            }, false);
        });
    }






});


