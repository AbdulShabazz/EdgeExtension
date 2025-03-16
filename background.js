
// background.js (runs as a service worker in Edge/Chrome extension)

let buffer = [];
let uploadQueue = [];
let activePorts = {};
let InprocessQueue = [];
let totalLikesInt64 = new Set ();

chrome.alarms.create("keepAlive", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener ((alarm) => {});

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

function openTab (url) {
    chrome.tabs.create({ url: url, active: false }, tab => {
        tab;
    });
} // end openTab

function preEvaluateVideo () {
    //const dataIndex = msg.element.getAttribute('data-index');
    if (InprocessQueue.length < 1)
        return;
    const msg = InprocessQueue.shift ();
    if (updateLikes (msg?.dataIndex)) {
        openTab (msg.url);
    }
} // end preEvaluateVideo

function calcResolutionAndDuration (res,dur) {
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

function stripSymbols (promptW) {
    const MAXLENGTH = 2236;
    const prompt = promptW
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1FAFF}\u2700-\u27BF\u2600-\u26FF\u2190-\u21FF\u2500-\u257F\u2B50-\u2BFF\uFE0F]/gu, '')
      .replace(/\s+/g, ' ')
      .substring (0, MAXLENGTH);
    return `${prompt}${(promptW.length < MAXLENGTH ? '' : ' ...')}`;
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

function standardizeEnglishPrompt (message) {
    // Find an open YouTube tab.
    const urlSearch = "*://translate.google.com/*";
    const url = `https://translate.google.com/?sl=auto&tl=en&op=translate&text=${message.prompt}`;
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
                case 'NewDataIndexElementsFound':
                  ;;
                break;

                case 'DataIndexElementClicked':
                InprocessQueue.push (message);
                break;

                case 'videoFound':
                message.prompt = stripSymbols(message.prompt);
                standardizeEnglishPrompt (message);
                message.action = 'generateEnglishPrompt';
                // cache workload //
                buffer.push (message);
                break;

                case 'translateSiteReady':
                activePorts['google-translate'].postMessage (buffer.shift());
                break;

                case 'EnglishPromptCompleted':
                const uuid = message.uuid;
                const tmpResolutionW = message.resolution;
                const tmpDurationW = message.duration;
                const videoTitleW = message.videoTitle;
                const prompt = message.prompt;
                const { status, resolution, duration, remix } = calcResolutionAndDuration (tmpResolutionW, tmpDurationW);
                const msg_body = {
                    action: "doRemix",
                    uuid: uuid,
                    videoTitle: videoTitleW,
                    prompt: prompt,
                    resolution: resolution,
                    duration: duration,
                    remix: remix
                };
                const msg_upload_body = {
                    action: "startUpload",
                    uuid: uuid,
                    videoTitle: videoTitleW,
                    prompt: prompt,
                    resolution: resolution,
                    duration: duration,
                    remix: remix
                };
                //uploadQueue.push (msg_upload_body);
                if (status == 'continue') {
                    activePorts['video-details'].postMessage(msg_body);
                } // end if (status == 'continue')
                break;

                case 'url-navigate':
                const url = message.url;
                const urlSearch = message.urlSearch;
                uploadQueue.push (message);
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
                            { url: url, active: true }, 
                            function (updatedTab) {
                                console.log('Updating existing translate.google.com tab...');
                            }
                        );
                    }
                });
                break;

                case 'url-youtube': // site-ready //
                const msg_2 = uploadQueue.shift ();
                msg_2.action = "startUpload";
                activePorts['youtube-upload'].postMessage (msg_2);
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
            } // end switch (message.action)

            // Periodically check for new videos (small overhead)
            setInterval(preEvaluateVideo, 1);
        }
        catch (e) {
          
        } // end try/catch
        // Return true to indicate we'll send a response asynchronously (if needed).
        return true;
    }); // end port.onMessage.addListener
    port.onDisconnect.addListener (() => {
        console.info ('background.js connection to background service worker port, disconnected.')
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
