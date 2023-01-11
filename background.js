//import Score from 'data/interface/js/jquery.min.js';
//importScripts('interface/js/recordRTC.js');

var isContentInjected = false;
var visitedTabs = [];
var camtabs = [];
var isScreenSharingActive = false;


chrome.runtime.onStartup.addListener(function () {
    console.log('open chrooooooooooooom');
    isContentInjected = false;

});


//=== start ture incase first recording
function injectCameraContent() {

    chrome.windows.getCurrent(w => {

        chrome.tabs.query({active: true, windowId: w.id}, tabs => {

            var activeTabId = tabs[0].id;
            console.log('Init camera content with Id=' + activeTabId);

            if (visitedTabs.indexOf(activeTabId) == -1) {
                chrome.scripting.executeScript({
                    target: {tabId: activeTabId, allFrames: true},
                    files: ['data/interface/js/jquery.min.js', 'data/interface/js/content.js'],
                });
                chrome.scripting.insertCSS({
                    target: {tabId: activeTabId},
                    files: ['data/interface/css/index.css']
                });
                visitedTabs.push(activeTabId);
            }
        });
    });
}


function startRecording() {
    injectCameraContent(); // camera init
    chrome.storage.local.set({isCameraContentActive: true});
}


function stopRecording() {
    removeCameraContentFromAllTabs();
    chrome.storage.local.set({isCameraContentActive: false});
}


//====================================== Tabs handling =================================

//=== Tab refresh
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    chrome.storage.local.get(["isCameraContentActive"]).then((result) => {
        if (result.isCameraContentActive) {
            removeTabByIdFromVisitedTabList(tabId);
            injectCameraContent();
        }
    });

});

//=== Tab switch
chrome.tabs.onActivated.addListener(function (activeTabInfo) {
    reInitCameraContents();
});

//=== New tab
chrome.tabs.onCreated.addListener(function (activeTabInfo) {
    reInitCameraContents();
});


function reInitCameraContents() {
    
    chrome.storage.local.get(["isCameraContentActive"]).then((result) => {
        if (result.isCameraContentActive) {
            console.log("reInit Camera Contents");
            removeCameraContentFromAllTabs();
            injectCameraContent();
        }
    });
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    console.log('Backgroup Script JS ==> Message sent:' + message);
    if (message === 'initCameraBubble') {
        startRecording();
    } else if (message === 'stop-screen-share') {
        stopRecording();
    }
});



function removeTabByIdFromVisitedTabList(tabId) {
    //=== Remove tabId from maintab to init again
    for (var i = 0; i < visitedTabs.length; i++) {
        if (visitedTabs[i] === tabId) {
            visitedTabs.splice(i, 1);
        }
    }

}

function removeCameraContentFromAllTabs() {

    for (var i = 0; i < visitedTabs.length; i++) {
        chrome.tabs.sendMessage(visitedTabs[i], "removeContent", function (response) {
            console.log("Remove Content at Tab Id=" + visitedTabs[i])
        });
    }

}


