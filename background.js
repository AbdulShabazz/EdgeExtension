
// background.js (runs as a service worker in Edge/Chrome extension)

let InprocessQueue = [];
let totalLikesInt64 = new Set ();

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
    if (temp_durInt64 > 15) {
        return { status, resolution, duration, remix };
    }
    status = 'continue';
    if (temp_durInt64 < 6 ) {
        resolution = 720;
        duration = 5;
        remix = (temp_resInt64 > 480) ? 0 /* none */: 3 /* mild */ ;
    }
    else if (temp_durInt64 > 5 ) {
        resolution = 480;
        duration = -1;
        remix = (temp_resInt64 > 480) ? 0 /* none */: 3 /* mild */ ;
    }
    return { status, resolution, duration, remix };
} // end getResolutionAndDuration

function stripSymbols (promptW) {
    const prompt = promptW
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1FAFF}\u2700-\u27BF\u2600-\u26FF\u2190-\u21FF\u2500-\u257F\u2B50-\u2BFF\uFE0F]/gu, '')
      .replace(/\s+/g, ' ');
    return prompt;
} // end stripSymbols

function downloadLog (msg) {
    const fileTitle = `${message.title.replace (/\s/g, '_')}.log`;
    let f = new Blob ();
    chrome.downloads.download({
        url: videoUrl,
        filename: videoTitle,   // Save as this name in the user's Downloads folder
        saveAs: false           // No Save As dialog, download automatically
    }, downloadId => {
      if (chrome.runtime.lastError || !downloadId) {
          console.error('Download failed:', chrome.runtime.lastError);
      } else {
          // Monitor the download until it’s complete.
          chrome.downloads.onChanged.addListener(function onChanged(delta) {
              if (delta.id === downloadId && delta.state && delta.state.current === 'complete') {
                  // Download is complete&#8203;:contentReference[oaicite:15]{index=15}.
                  chrome.downloads.onChanged.removeListener(onChanged);
                  console.log('Video .log downloaded.');

                  // Get the file size from the download item
                  chrome.downloads.search({ id: downloadId }, function(results) {
                      let fileSizeBytes = results && results[0] ? results[0].fileSize : 0;
                      let fileSizeMB = fileSizeBytes ? (fileSizeBytes / (1024*1024)).toFixed(2) + ' MB' : '';
                      
                      // Find an open YouTube tab.
                      chrome.tabs.query({ url: "*://*.youtube.com/*" }, function(tabs) {
                          if (tabs.length === 0) {
                              console.warn('No open YouTube tab found. Opening a new one.');
                              openTab({ url: "https://www.youtube.com/upload" });
                          } else {
                              // Use the first YouTube tab found (could refine to specific tab if needed).
                              let ytTab = tabs[0];
                              // Navigate it to the upload page (if not already there).
                              chrome.tabs.update(ytTab.id, { url: "https://www.youtube.com/upload", active: false }, 
                              updatedTab => {
                                  ;;
                              });
                          }
                      });
                  });
              }
          });
        }
    });
} // end downloadLog

function standardizeEnglishPrompt (prompt) {
    // Find an open YouTube tab.
    const urlSearch = "*://translate.google.com/*";
    const url = 'https://translate.google.com';
    chrome.tabs.query({ url: urlSearch }, function(tabs) {
        if (tabs.length === 0) {
            console.warn('No open translate tab found. Opening a new one.');
            openTab (url);
        } else {
            // Use the first YouTube tab found (could refine to specific tab if needed).
            let ytTab = tabs[0];
            // Navigate it to the upload page (if not already there).
            chrome.tabs.update(ytTab.id, { url: url, active: false }, 
            updatedTab => {
                ;;
            });
        }
    });
} // end standardizePrompt

// Listen for one-time messages from content scripts&#8203;:contentReference[oaicite:13]{index=13}.
chrome.runtime.onConnect.addListener ((port) => {
    port.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.action) {
            case 'NewDataIndexElementsFound':
              ;;
            break;

            case 'DataIndexElementClicked':
            InprocessQueue.push (message);
            break;

            case 'videoFound':
            const uuid = message.uuid;
            const tmpResolutionW = message.resolution;
            const tmpDurationW = message.duration;
            const tmpPrompt = message.prompt;
            const videoTitleW = message.videoTitle;
            const prompt = stripSymbols(tmpPrompt);
            const fullPrompt = standardizeEnglishPrompt (prompt);
            const { status, resolution, duration, remix } = calcResolutionAndDuration (tmpResolutionW, tmpDurationW);
            if (status === 'continue') {
                port.postMessage({
                    action:"doRemix",
                    uuid: uuid,
                    title: videoTitleW,
                    prompt: prompt,
                    resolution: resolution,
                    duration: duration,
                    remix: remix
                });
            } // end if (status === 'continue')
            break;

            case 'downloadCompleted':
            chrome.tabs.query ({ url:message.url }, (tabs) => {
                tabs.forEach (tab => {
                    if (tab.id) {
                        chrome.tabs.remove (tab.id);
                    }
                });
            });
            downloadLog(message);
            break;
        } // end switch (message.action)

        // Periodically check for new videos (small overhead)
        setInterval(preEvaluateVideo, 1);

        /*
        if (message.action === 'videoFound') {
          /*
          const videoUrl = message.url;
          let videoTitle = message.title || 'Video';
          if (!videoTitle.toLowerCase().endsWith('.mp4')) {
            videoTitle += '.mp4';  // ensure the filename has .mp4 extension
          }

          //console.log('Downloading video:', videoUrl);
          // Initiate download of the video file using the Downloads API&#8203;:contentReference[oaicite:14]{index=14}.
          /*
          chrome.downloads.download({
            url: videoUrl,
            filename: videoTitle,   // Save as this name in the user's Downloads folder
            saveAs: false           // No Save As dialog, download automatically
          }, downloadId => {
            if (chrome.runtime.lastError || !downloadId) {
              console.error('Download failed:', chrome.runtime.lastError);
            } else {
              // Monitor the download until it’s complete.
              chrome.downloads.onChanged.addListener(function onChanged(delta) {
                if (delta.id === downloadId && delta.state && delta.state.current === 'complete') {
                  // Download is complete&#8203;:contentReference[oaicite:15]{index=15}.
                  chrome.downloads.onChanged.removeListener(onChanged);
                  console.log('Video downloaded. Preparing to upload to YouTube.');

                  // Get the file size from the download item
                  chrome.downloads.search({ id: downloadId }, function(results) {
                    let fileSizeBytes = results && results[0] ? results[0].fileSize : 0;
                    let fileSizeMB = fileSizeBytes ? (fileSizeBytes / (1024*1024)).toFixed(2) + ' MB' : '';

                    // Find an open YouTube tab.
                    chrome.tabs.query({ url: "*://*.youtube.com/*" }, function(tabs) {
                      if (tabs.length === 0) {
                        console.warn('No open YouTube tab found. Opening a new one.');
                        chrome.tabs.create({ url: "https://www.youtube.com/upload", active: true }, tab => {
                          sendUploadMessageWhenReady(tab.id, videoTitle, fileSizeMB, videoUrl);
                        });
                      } else {
                        // Use the first YouTube tab found (could refine to specific tab if needed).
                        let ytTab = tabs[0];
                        // Navigate it to the upload page (if not already there).
                        chrome.tabs.update(ytTab.id, { url: "https://www.youtube.com/upload", active: true }, updatedTab => {
                          sendUploadMessageWhenReady(updatedTab.id, videoTitle, fileSizeMB, videoUrl);
                        });
                      }
                    });
                  });
                }
              });
            }
          });
        * /
        }
        */
        // Return true to indicate we'll send a response asynchronously (if needed).
        return true;
    });
});

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
