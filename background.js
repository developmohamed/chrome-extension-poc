//import Score from 'data/interface/js/jquery.min.js';
//importScripts('interface/js/recordRTC.js');

var visitedTabs = [];

chrome.runtime.onStartup.addListener(function () {
    console.log('open chrooooooooooooom');

});


//=== start ture incase first recording
function injectCameraContent() {

    chrome.windows.getCurrent(w => {

        chrome.tabs.query({active: true, windowId: w.id}, tabs => {

            var activeTabId = tabs[0].id;
            console.log('Init camera content with Id=' + activeTabId);

            if (visitedTabs.indexOf(activeTabId) == -1) {

                visitedTabs.push(activeTabId);

                chrome.scripting.executeScript({
                    target: {tabId: activeTabId, allFrames: true},
                    files: ['data/interface/js/jquery.min.js', 'data/interface/js/content.js'],
                });
                chrome.scripting.insertCSS({
                    target: {tabId: activeTabId},
                    files: ['data/interface/css/index.css']
                });

            }
        });
    });
}


function startRecording() {
    injectCameraContent(); // camera init
    chrome.storage.local.set({isCameraContentActive: true});
    chrome.runtime.sendMessage({type: "start-recording"});
    //  getDesktop();
}



function stopRecording() {

    if (visitedTabs.length > 0) {
        chrome.tabs.sendMessage(visitedTabs[0], "removeContent", function (response) {
            reInitCameraContentsParams();
        });
    } else {
        reInitCameraContentsParams();
    }

    chrome.runtime.sendMessage({type: "stop-recording"});
}

function reInitCameraContentsParams() {
    chrome.storage.local.set({isCameraContentActive: false});
    visitedTabs = [];
}

//====================================== Tabs handling =================================

//=== Tab refresh
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//To:Do

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
            chrome.tabs.sendMessage(visitedTabs[0], "removeContent", function (response) {
                console.log("Remove Content at Tab Id=" + visitedTabs[0])
                visitedTabs.splice(0, 1);
                injectCameraContent();
            });
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
            visitedTabs.splice(i, 1);
        });
    }

}

//==================================== Desktop sharing==============


//var output = new MediaStream();
//const streamSaver = window.streamSaver;
var output = '';
const streamSaver = '';
var quality = "max";
var mediaConstraints;
var mediaRecorder = '';
var fps = 60;

// Start recording the entire desktop / specific application
function getDesktop2() {


    if (!navigator.getDisplayMedia && !navigator.mediaDevices.getDisplayMedia) {
        var error = 'Your browser does NOT support the getDisplayMedia API.';
        throw new Error(error);
    } else {
        console.log('Support');
    }


    var constraints = {
        audio: true,
        video: true,
        maxframeRate: fps
    };
    navigator.mediaDevices.getDisplayMedia(constraints).then(function (stream) {
        output = new MediaStream();
        streamSaver = window.streamSaver;
        if (stream.getAudioTracks().length == 0) {

        }
        output.addTrack(stream.getVideoTracks()[0]);

        // Set up media recorder & inject content
        newRecording(output);

        // Hide the downloads shelf
        chrome.downloads.setShelfEnabled(false);

        // This will write the stream to the filesystem asynchronously
        const {readable, writable} = new TransformStream({
            transform: (chunk, ctrl) => chunk.arrayBuffer().then(b => ctrl.enqueue(new Uint8Array(b)))
        })
        const writer = writable.getWriter()
        readable.pipeTo(streamSaver.createWriteStream('moooooooooo.webm'));

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



// Set up recording
function newRecording(stream) {

    // Start Media Recorder
    if (quality == "max") {
        mediaConstraints = {
            mimeType: 'video/webm;codecs=vp8,vp9,opus'
        }
    } else {
        mediaConstraints = {
            mimeType: 'video/webm;codecs=vp8,vp9,opus',
            bitsPerSecond: 1000
        }
    }
    mediaRecorder = new MediaRecorder(stream, mediaConstraints);
    // injectContent(true);
}


// Stop recording
function endRecording(stream, writer, recordedBlobs) {


    // Hide injected content


    // Stop tab and microphone streams
    stream.getTracks().forEach(function (track) {
        track.stop();
    });

    // Show download shelf again
    chrome.downloads.setShelfEnabled(true);

    setTimeout(() => {
        writer.close();
        chrome.downloads.search({limit: 1}, function (data) {
            // Save recording if requested
            if (!cancel) {
                saveRecording("file://" + data[0].filename, recordedBlobs);
            } else {
                chrome.downloads.removeFile(data[0].id);
            }
        });
    }, 1000)
}

