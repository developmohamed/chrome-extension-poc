
// General interaction at popup 

$(document).ready(function () {

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


    chrome.storage.sync.get(['isScreenSharingActive'], function (result) {

        var isScreenSharingActive = result.isScreenSharingActive;
        if (!isScreenSharingActive) {
            stopRecordButton.style.display = "none";
        } else {
            recordButton.style.display = "none";
        }
    });







    $("#record-button").click(function () {
        injectCameraContent();

    });

    $("#stop-record-button").click(function () {
        stopRecord();
    });

    //=== init camera bubble event
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