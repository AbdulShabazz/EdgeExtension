
// background.js (runs as a service worker in Edge/Chrome extension)

let buffer = {};
let uploadQueue = [];
let activePorts = {};
let activeTabId = null;
let InprocessQueue = [];
let totalLikesInt64 = new Set ();

chrome.alarms.create("bg-keepAlive", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener ((alarm) => { console.info ("keep alive (background.js)")});

function generateVideo (details) {

} // generateVideo

function updateLikes (u) {
    let ret = false;
    if (!totalLikesInt64.has (u)) {
        totalLikesInt64.add (u);
        ret = true;
    }
    return ret;
} // end updateLikes

function openTab (url, setActiveTab = false) {
    chrome.tabs.create({ url: url, active: setActiveTab }, tab => {
        buffer[tab.id] = {};
    });
} // end openTab

chrome.tabs.onActivated.addListener ((activeInfo) => {
    activeTabId = activeInfo.tabId;
});

function preEvaluateVideo () {
    //const dataIndex = msg.element.getAttribute('data-index');
    if (InprocessQueue.length < 1)
        return;
    const msg = InprocessQueue.shift ();
    if (updateLikes (msg?.dataIndex)) {
        openTab (msg.url, true);
    }
} // end preEvaluateVideo

function calcVideoDetails (res,dur) {
    let status = 'skip';
    let resolution = 720;
    let duration = 5;
    let remix = 0; // remix strength [0,7]
    const temp_resInt64 = new Number (res.replace(/[sp]/g,''));
    const temp_durInt64 = new Number (dur.replace(/[sp]/g,''));
    if (temp_durInt64 > 10) {
        return { status, resolution, duration, remix };
    }
    status = 'continue';
    if (temp_durInt64 < 6 ) {
        resolution = 720;
        duration = 5;
        remix = (temp_resInt64 > 480) ? 0 /* none */: 4 /* mild */ ;
    }
    else if (temp_durInt64 > 5 ) {
        resolution = 480;
        duration = -1;
        remix = (temp_resInt64 > 480) ? 0 /* none */: 4 /* mild */ ;
    }
    return { status, resolution, duration, remix };
} // end getResolutionAndDuration

/**
 * Truncate a string to meet a specific quota of characters.
 * 
 * @param {string} inputString - The input string to truncate
 * @param {number} quota - The maximum number of characters to retain
 * @returns {string} The truncated string
 */
function truncateToQuota(inputString, quota) {
    // Handle edge cases
    if (!inputString) {
        return "";
    }
    if (quota <= 0) {
        return "";
    }
    if (inputString.length <= quota) {
        return inputString;
    }
    
    // Split the string into words
    const words = inputString.split(" ");
    
    // Initialize result
    const result = [];
    let currentLength = 0;
    
    // Add words until we reach the quota
    for (const word of words) {
        // If adding this word would exceed the quota
        if (currentLength + word.length + (result.length > 0 ? 1 : 0) > quota) {
            // If we can't add even one more word, return what we have
            if (result.length === 0) {
                // Take as many characters as possible from the first word
                return word.substring(0, quota);
            }
            break;
        }        
        // Add the word
        result.push(word);
        currentLength += word.length + (result.length > 1 ? 1 : 0);
    }
    
    // Join the words with spaces
    return result.join(" ");
} // end truncateToQuota

function stripSymbols (promptW) {
    const MAXLENGTH = 2230;
    const prompt = promptW
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1FAFF}\u2700-\u27BF\u2600-\u26FF\u2190-\u21FF\u2500-\u257F\u2B50-\u2BFF\uFE0F\u23F3\*<>]/gu, '')
      .replace(/\#\w+/g,'')
      .replace(/https\S+/g,'')
      .replace(/\s+/g, ' ')
      .substring (0, MAXLENGTH);
    if (promptW.length < MAXLENGTH)
        return prompt;
    else {
        const prompt_refactored = truncateToQuota (prompt, MAXLENGTH);
        return `${prompt_refactored} ...`;
    } // end if (promptW.length ...)
} // end stripSymbols

function downloadLog (msg) {
    const totalVideosInt64 = totalLikesInt64.length;
    const fileTitle = `${totalVideosInt64}-${message.videoTitle.replace(/[\W\s]/g, '_')}.log`;
    const fileContents = JSON.stringify (message, null, 2);
    const blob = new Blob ([fileContents], { type: 'application/json' });
    const videoUrl = URL.createObjectURL (blob);
    chrome.downloads.download ({
        url: videoUrl,
        filename: fileTitle,   // Save as this name in the user's Downloads folder
        saveAs: false           // No Save As dialog, download automatically
    }, (downloadId) => {
      if (chrome.runtime.lastError || !downloadId) {
          console.error('Download failed:', chrome.runtime.lastError);
      } else {
            // Monitor the download until it’s complete.
            chrome.downloads.onChanged.addListener(function onChanged(delta) {
                if (delta.id === downloadId && delta.state && delta.state.current === 'complete') {
                    // Download is complete&#8203;:contentReference[oaicite:15]{index=15}.
                    chrome.downloads.onChanged.removeListener(onChanged);
                    console.info (`${totalVideosInt64}. video log downloaded.`);
                } // end if (delta.id === downloadId ... )
            }); // end chrome.downloads.onChanged.addListener
            // cleanup url //
            setTimeout (() => {URL.revokeObjectURL(videoUrl)});
        } // end if/else
    }); // end chrome.downloads.download
} // end downloadLog

function findTabByURL (url, allowNewTab = true, cb) {
    let ret = false;
    chrome.tabs.query({ url: urlSearch }, function(tabs) {
        if ((tabs.length === 0) && allowNewTab) {
            console.warn('No open translate tab found. Opening a new one.');
            openTab (url); // open tab in the bg
        } else {
            // Use the first translate tab found
            const translateTab = tabs[0];
            // Navigate it to the translate page (if not already there)
            cb (translateTab);
            ret = true;
        }
    });
    return ret;
} // end findTabByURL

function openTranslationTab (message) {
    // Find an open YouTube tab.
    const urlSearch = "*://translate.google.com/*";
    const url = `https://translate.google.com/?sl=auto&tl=en&op=translate&text=${encodeURIComponent (message.prompt)}`;
    chrome.tabs.query({ url: urlSearch }, function(tabs) {
        if (tabs.length === 0) {
            console.warn('No open translate tab found. Opening a new one.');
            openTab (url); // open tab in the bg
        } else {
            // Use the first translate tab found
            let translateTab = tabs[0];
            // Navigate it to the translate page (if not already there)
            chrome.tabs.update(
                translateTab.id, 
                { url: url, active: false }, 
                function (updatedTab) {
                    console.log('Updating existing translate.google.com tab...');
                }
            );
        }
    });
} // end standardizePrompt

// Listen for one-time messages from content scripts&#8203;:contentReference[oaicite:13]{index=13}.
chrome.runtime.onConnect.addListener ((port) => {
    activePorts[port.name] = port;  // Maintain a reference to keep the port open
    port.onMessage.addListener((message, sender, sendResponse) => {
        try {
            switch (message.action) {
                case 'DataIndexElementClicked':
                    InprocessQueue.push (message);
                    preEvaluateVideo ();
                    break;

                case 'videoFound':
                    // cache workload //
                    if (activeTabId){
                        //buffer[activeTabId] = message;
                        message.action = 'doRemix';
                        activePorts['video-details'].postMessage(message);
                    }
                    break;

                case 'openTranslationTab':
                    const msg = message; //buffer[activeTabId];
                    msg.prompt = stripSymbols(msg.prompt);
                    msg.action = 'generateEnglishPrompt';
                    msg.url = message.url;
                    msg.urlSearch = message.urlSearch;
                    const uuid = msg.uuid;
                    const tmpResolutionW = msg.resolution;
                    const tmpDurationW = msg.duration;
                    const videoTitleW = msg.videoTitle = message.videoTitle;
                    const prompt = msg.prompt;
                    const { status, resolution, duration, remix } = calcVideoDetails (tmpResolutionW, tmpDurationW);
                    if (status == 'continue') {    
                        msg.resolution = resolution;
                        msg.duration = duration;
                        msg.remix = remix;
                        buffer[activeTabId] = msg;
                        uploadQueue.push (msg);
                        openTranslationTab (msg);
                    } // end if (status == 'continue')
                    break;

                case 'translateSiteReady':
                    const msg_2 = uploadQueue[0];
                    activePorts['google-translate'].postMessage (msg_2); // target translate.google.com
                    break;

                case 'EnglishPromptCompleted':
                    const msg_3 = uploadQueue.shift ();
                    msg_3.prompt = message.prompt;
                    const url = msg_3.url = "https://www.youtube.com/upload";// message.url;
                    const urlSearch = msg_3.urlSearch = "*://www.youtube.com/*";// message.urlSearch;
                    uploadQueue.push (msg_3); 
                    //openTab (url, true); // target Youtube.com/upload
                    /*
                    BUG:

                    SYMP: there is a strange bug where after pressing SHIFT, you have to mouse over the google translate tab
                        to open the Youtube upload window.
                    SOLU: ?? ??
                    */
                   const hasFocus = true;
                    chrome.tabs.query({ url: urlSearch }, function(tabs) {
                        if (tabs.length === 0) {
                            console.warn('No open youtube tabs found. Opening a new one.');
                            openTab (url, hasFocus); // open tab in the f/g
                        } else {
                            // Use the first translate tab found
                            let translateTab = tabs[0];
                            // Navigate it to the translate page (if not already there)
                            chrome.tabs.update(
                                translateTab.id, 
                                { url: url, active: hasFocus}, 
                                function (updatedTab) {
                                    console.log('Updating existing Youtube tab...');
                                }
                            );
                        }
                    });
                    break;

                case 'url-youtube': // site-ready //
                    const msg_4 = uploadQueue.shift ();
                    msg_4.action = "startUpload";
                    activePorts['youtube-upload'].postMessage (msg_4);
                    break;

                case 'downloadCompleted':
                    chrome.tabs.query ({ url:message.url }, (tabs) => {
                        tabs.forEach (tab => {
                            if (tab.id) {
                                chrome.tabs.update (tab.id, { url:'https://www.youtube.com/upload' });
                            }
                        });
                    });
                    downloadLog(message);
                    break;

                case "release-tabID":
                    if (activeTabId in buffer) {
                        buffer[activeTabId] = null;
                        delete buffer[activeTabId];
                    }
                    break;

                case 'keepalive':
                    // idle sessionn keepalive //
                    break;

            } // end switch (message.action)
        }
        catch (e) {
          
        } // end try/catch
        // Return true to indicate we'll send a response asynchronously (if needed).
        return true;
    }); // end port.onMessage.addListener
    port.onDisconnect.addListener (() => {
        console.info ('background.js connection to background service worker port, disconnected. Reconnecting...')
        port = chrome.runtime.connect({ name: "service-worker" });
    }); // end port.onDisconnect
}); // end chrome.runtime.onConnect

// Helper function to message the YouTube content script once the upload page is loaded.
function sendUploadMessageWhenReady(tabId, title, sizeText, videoUrl) {
  // Use tabs.onUpdated to wait for the YouTube upload page to finish loading.
  chrome.tabs.onUpdated.addListener(function listener(updatedTabId, info, tab) {
    if (updatedTabId === tabId && info.status === 'complete') {
      chrome.tabs.onUpdated.removeListener(listener);
      // Send a message to the YouTube content script with video details.
      chrome.tabs.sendMessage(tabId, {
        action: 'startUpload',
        videoTitle: title,
        videoSizeText: sizeText,
        videoUrl: videoUrl
      });
    }
  });
}
