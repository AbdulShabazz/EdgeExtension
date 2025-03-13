
// background.js (runs as a service worker in Edge/Chrome extension)

let InprocessInt64 = 0;
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

function preEvaluateVideo (msg) {
    //const dataIndex = msg.element.getAttribute('data-index');
    if (updateLikes (msg.dataIndex)) {
        openTab (msg.url);
    }
} // end generateVideo

// Listen for one-time messages from content scripts&#8203;:contentReference[oaicite:13]{index=13}.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
      case 'DataIndexElementClicked':
          preEvaluateVideo (message);
          break;
      case 'NewDataIndexElementsFound':
        break;
      case 'videoFound':
          break;
  } // end switch (message.action)
  
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
  */
  }
  // Return true to indicate we'll send a response asynchronously (if needed).
  return true;
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
