
// General interaction at popup 

$(document).ready(function () {

    // Check if current tab is unable to be recorded
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        if (tabs[0].url.includes("chrome://") || tabs[0].url.includes("chrome-extension://")) {
            console.log("Can't Record this page!");
            $('.video-record-btn').hide();
        } else {
            $('.unable-to-record-msg').hide();
            $('.video-record-btn').show();
        }
    });

    handlePopUpPageState();
    $("#record-button").click(function () {
        injectCameraContent();
    });

    $("#stop-record-button").click(function () {
        stopRecord();
    });

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

// Receive messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type == 'start-recording' || request.type == 'stop-recording') {
        window.close();
    }
});


function handlePopUpPageState() {
    var recordButton = document.getElementById('record-button');
    var stopRecordButton = document.getElementById('stop-record-button');

    chrome.storage.local.get(['isCameraContentActive'], function (result) {
        if (result.isCameraContentActive) {
            recordButton.style.display = "none"; // start disappear
        } else {
            stopRecordButton.style.display = "none"; // stop disappear
        }
    });
}

