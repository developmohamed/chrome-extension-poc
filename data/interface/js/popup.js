
// General interaction at popup 

$(document).ready(function () {

    

//    chrome.storage.local.set({isCameraContentActive: false});
//
//    chrome.storage.local.get(["isCameraContentActive"]).then((result) => {
//        alert("Value currently is " + result.isCameraContentActive);
//    });

    // Check if current tab is unable to be recorded
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        if (tabs[0].url.includes("chrome://") || tabs[0].url.includes("chrome-extension://") || tabs[0].url.includes("chrome.com") || tabs[0].url.includes("chrome.google.com")) {
            console.log("Can't Record this page!");
            $('.video-record-btn').hide();
        } else {
            $('.unable-to-record-msg').hide();
            $('.video-record-btn').show();
        }
    });


    var recordButton = document.getElementById('record-button');
    var stopRecordButton = document.getElementById('stop-record-button');

    chrome.storage.local.get(['isCameraContentActive'], function (result) {
        // alert('fff=>' + result.isCameraContentActive);
        if (result.isCameraContentActive) {
            recordButton.style.display = "none"; // start disappear
        } else {
            stopRecordButton.style.display = "none"; // stop disappear
        }
    });


    $("#record-button").click(function () {
        injectCameraContent();

    });

    $("#stop-record-button").click(function () {
        stopRecord();
    });


    function injectCameraContent() {

        chrome.runtime.sendMessage('initCameraBubble', (response) => {
        });
    }

    function stopRecord() {
        chrome.runtime.sendMessage('stop-screen-share', (response) => {
            console.log('received reocrd data', response);
        });
    }

});