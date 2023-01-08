//import Score from 'data/interface/js/jquery.min.js';
//importScripts('interface/js/recordRTC.js');

var isContentInjected = false;
var maintabs = [];
var camtabs = [];
var isScreenSharingActive = false;


chrome.runtime.onStartup.addListener(function () {
    console.log('open chrooooooooooooom');
    isContentInjected = false;

});


//=== start ture incase first recording
function injectContent(start) {

    chrome.windows.getCurrent(w => {

        chrome.tabs.query({active: true, windowId: w.id}, tabs => {

            isContentInjected = true;
            console.log('Is recording Status:' + isContentInjected);

            var activeTabId = tabs[0].id;
            console.log('Init camera content with Id=' + activeTabId);

            //---- If content not exist on current tab inject it.
            if (maintabs.indexOf(activeTabId) == -1 && isContentInjected) {

                chrome.scripting.executeScript({
                    target: {tabId: activeTabId, allFrames: true},
                    files: ['data/interface/js/jquery.min.js', 'data/interface/js/recordRTC.js', 'data/interface/js/content.js'],
                });

                chrome.scripting.insertCSS({
                    target: {tabId: activeTabId},
                    files: ['data/interface/css/index.css']
                });

                maintabs.push(activeTabId);
            }

        });
    });
}


function startRecord() {
    injectContent(true); // camera init
}


function stopScreenShare() {
    isContentInjected = false;
    maintabs.length = 0; //clear 

    chrome.storage.sync.set({isScreenSharingActive: false}, function () {
    });

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 'stop-screen-share', function (response) {});
    });
}




//=== Tab switch
chrome.tabs.onActivated.addListener(function (activeTabInfo) {

    console.log('ON Activated and recording status:' + isContentInjected);
    if (isContentInjected) {
        clearContentFromCurrentTab(activeTabInfo.tabId);
    }
});


//=== New tab
chrome.tabs.onCreated.addListener(function (activeTabInfo) {
    if (isContentInjected) {
        clearContentFromCurrentTab(activeTabInfo.tabId);
    }
});

//=== Tab refresh
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if (isContentInjected) {
        clearContentFromCurrentTab(tabId);
    }

});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    console.log('Message sent:' + message);
    if (message === 'initCameraBubble') {
        startRecord();
    } else if (message === 'stop-screen-share') {
        stopScreenShare();
    }
});





function clearContentFromCurrentTab(tabId) {

    chrome.tabs.sendMessage(maintabs[0], "removeContent", function (response) {
        maintabs.length = 0
        injectContent(false);
    });
}

function removeTabByIdFromMainTabs(tabId) {
    //=== Remove tabId from maintab to init again
    for (var i = 0; i < maintabs.length; i++) {
        if (maintabs[i] === tabId) {
            maintabs.splice(i, 1);
        }
    }

}

//===================================


function getDesktop() {
    var constraints = {
        audio: true,
        video: true,
        maxframeRate: fps
    };
    navigator.mediaDevices.getDisplayMedia(constraints).then(function (stream) {
        output = new MediaStream();
        if (stream.getAudioTracks().length == 0) {
            // Get microphone audio (system audio is unreliable & doesn't work on Mac)
            if (micable) {
                micsource.connect(destination);
                output.addTrack(destination.stream.getAudioTracks()[0]);
            }
        } else {
            syssource = audioCtx.createMediaStreamSource(stream);
            if (micable) {
                micsource.connect(destination);
            }
            syssource.connect(destination);
            output.addTrack(destination.stream.getAudioTracks()[0]);
        }
        output.addTrack(stream.getVideoTracks()[0]);

        // Set up media recorder & inject content
        newRecording(output);

        // Hide the downloads shelf
        chrome.downloads.setShelfEnabled(false);

        // This will write the stream to the filesystem asynchronously
        const { readable, writable } = new TransformStream({
            transform: (chunk, ctrl) => chunk.arrayBuffer().then(b => ctrl.enqueue(new Uint8Array(b)))
        })
        const writer = writable.getWriter()
        readable.pipeTo(streamSaver.createWriteStream('screenity.webm'));

        // Record tab stream
        var recordedBlobs = [];
        mediaRecorder.ondataavailable = event => {
            if (event.data && event.data.size > 0) {
                writer.write(event.data);
                recordedBlobs.push(event.data);
            }
        };

        // When the recording is stopped
        mediaRecorder.onstop = () => {
            endRecording(stream, writer, recordedBlobs);
        }

        // Stop recording if stream is ended via Chrome UI or another method
        stream.getVideoTracks()[0].onended = function () {
            cancel = false;
            mediaRecorder.stop();
        }
    })
}





