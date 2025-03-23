
let eventListeners = [];

function trackEventListener (target, event, handler, options) {
    target.addEventListener (event, handler, options);
    eventListeners.push ({ target, event, handler, options });
} // end trackEventListener

function removeAllEventListeners () {
    for ( const { target, event, handler, options } of eventListeners ) {
        target.removeEventListener (event, handler, options);
    }
    eventListeners.length = 0;
} // end removeAllEventListeners

// globals
let _uuid_ = "";
let downloadID = null;
let UI_BUTTON = {};
let UI_RESULT_BUTTON = {};

let keyCodeShift = false;

function onKeyDown (keyCodeEvent) {
    if (keyCodeEvent.shiftKey) { // [Shift] Youtube
        keyCodeShift = true;
    } // end if (document.location.href...)
    else {
        keyCodeShift = false;
    }
} // end onKeyDown

trackEventListener (document, "keydown", onKeyDown, { passive: true });

// content.js (runs on video-gens.com pages)

// Store the port reference
let port;

// Function to establish connection
function connectPort(MSG) {
    port = chrome.runtime.connect({ name: "video-details" });
    
    // Add disconnection listener
    port.onDisconnect.addListener(() => {
        console.log("Port disconnected. Reconnecting...");
        // Optional: attempt to reconnect after a short delay
        setTimeout(connectPort, 10);
    });
    
    // Add message listener
    port.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.action) {
        case 'doRemix':
            UI_BUTTON['remix'].click();
            const iid = setInterval(() => {
                if (!keyCodeShift)
                    return;

                let ui_buttons = document.querySelectorAll('button'); // (28) //
                let I = ui_buttons.length-1;

                UI_RESULT_BUTTON['settings'] = ui_buttons[I-0];
                UI_RESULT_BUTTON['tasks'] = ui_buttons[I-1];
                UI_RESULT_BUTTON['folder/report/archive'] = ui_buttons[I-2];
                UI_RESULT_BUTTON['download'] = ui_buttons[I-3];
                UI_RESULT_BUTTON['share/unpublish'] = ui_buttons[I-4];
                UI_RESULT_BUTTON['downvote'] = ui_buttons[I-5];
                UI_RESULT_BUTTON['like'] = ui_buttons[I-6];
                UI_RESULT_BUTTON['favorite'] = ui_buttons[I-7];
                UI_RESULT_BUTTON['menu'] = ui_buttons[I-8];
                UI_RESULT_BUTTON['loop'] = ui_buttons[I-9];
                UI_RESULT_BUTTON['blend'] = ui_buttons[I-10];
                UI_RESULT_BUTTON['remix'] = ui_buttons[I-11];
                UI_RESULT_BUTTON['recut'] = ui_buttons[I-12];
                UI_RESULT_BUTTON['edit'] = ui_buttons[I-13];

                // Update favorites
                UI_RESULT_BUTTON['favorite'].click ();
                
                const urlSearch = "*://sora.com/*";
                const url = "https://www.youtube.com/upload";
                
                // Check if port is connected before sending message
                if (port && !chrome.runtime.lastError) {
                    try {
                        const nodes = document.querySelectorAll('div[class="truncate"]');
                        const newVideoTitle = nodes[1] || nodes[0]; // add fallback;
                        message = MSG || message; // connection reset ?
                        message.action = "openTranslationTab";
                        message.videoTitle = `OpenAI Sora - ${newVideoTitle.textContent}`;
                        message.url = url;
                        message.urlSearch = urlSearch;
                        postMessageW(message);
                    } catch (err) {
                        console.error("Error posting message:", err);
                        // Attempt to reconnect
                        connectPort();
                    }
                } else {
                    console.log("Port disconnected, reconnecting before sending message");
                    connectPort(message);
                }
                
                clearInterval(iid);

            }, 60);
            break;

        case 'startUpload':
            break;

        case 'completeDownload':
            break;

        case 'navigateToVideoURL':
            break;

        case 'doDownload':
            break;
        }
        return true;
    });
} // end connectPort

// Initialize connection
connectPort();

function postMessageW (message){
    if (port)
        port.postMessage (message);
    else {
        connectPort ();
        port.postMessage (message);
    }
} // end postMessageW

trackEventListener (window, "beforeunload", () => {
    removeAllEventListeners ();
    postMessageW ({ action: "release-tabID" });
}, {});

// Video Details
const videoName_xpath = "/html/body/main/div/div[2]/div/div/div/div[2]/div/div/div/div[1]/div[3]/div"; // name
const resolution_xpath = "/html/body/main/div/div[2]/div/div/div/div[2]/div/div/div/div[2]/div[1]"; // resolution
const duration_xpath = "/html/body/main/div/div[1]/div/div/div[2]/div/div/div/div[2]/div/div[2]"; // duration
const prompt_xpath = "/html/body/main/div/div[1]/div/div/div[2]/div/div/div/div[1]/div/div/div/button"; // prompt

function getElementByXPath (xpath) {
    let ret = null;
    const elem = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );
    if (elem.singleNodeValue) {
        ret = elem.singleNodeValue;
    }
    return ret;
} // end getElementByXPath

function invokeCtlFromXPath (xpath) {
    let ret = false;
    const ctl = getElementByXPath(xpath);
    if (ctl) {
        try {
            ctl.click();
            ret = true;
        }
        catch (e) {
            console.warn (`Method call: push_video_details_content_script::invokeCtlFromXPath: ${JSON.stringify(e)}`);
        }
    }
    return ret;
} // end invokeCtlFromXPath

function getValueFromXPath(xpath) {
    let ret = '';
    const result = getElementByXPath(xpath);
    if (result) {
        ret = result.textContent.trim();
    }
    return ret;
} // end getValueFromXPath

function parseBody () {
    // Send message to background script to initiate video remix.
    const resolutionW = getValueFromXPath(resolution_xpath);
    if (resolutionW === '')
        return;
    const durationW = getValueFromXPath(duration_xpath);
    const promptW = getValueFromXPath(prompt_xpath);
    const videoTitleW = _uuid_ = getValueFromXPath(videoName_xpath);
    clearInterval (intID);
    let ui_buttons = document.querySelectorAll('button'); // (17) //
    let I = ui_buttons.length-1;
    UI_BUTTON['settings'] = ui_buttons[I-0];
    UI_BUTTON['tasks'] = ui_buttons[I-1];
    UI_BUTTON['folder/report/archive'] = ui_buttons[I-2];
    UI_BUTTON['like'] = ui_buttons[I-3];
    UI_BUTTON['menu'] = ui_buttons[I-4];
    UI_BUTTON['loop'] = ui_buttons[I-5];
    UI_BUTTON['blend'] = ui_buttons[I-6];
    UI_BUTTON['remix'] = ui_buttons[I-7];
    UI_BUTTON['recut'] = ui_buttons[I-8];
    UI_BUTTON['storyboard'] = ui_buttons[I-9];
    UI_BUTTON['edit'] = ui_buttons[I-10];
    // Init bg listener
    postMessageW ({
        action: 'videoFound',
        uuid: videoTitleW,
        videoTitle: videoTitleW,
        resolution: resolutionW,
        duration: durationW,
        prompt: promptW
    });
} // end parseBody

let intID = setInterval(parseBody, 1);