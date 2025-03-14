

/*
// Run initialization based on document state
if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', parseBody);
} else {
    // If DOM is already loaded
    parseBody();
} // end if (document.readyState === 'loading')

/*
(function() {
  // Wait for the DOM to load or video element to be ready
  window.addEventListener('DOMContentLoaded', () => {
    /*
    const videoElem = document.querySelector('video');
    if (!videoElem) return;  // No video element found

    // Get video source URL
    let videoUrl = videoElem.currentSrc || videoElem.src;
    if (!videoUrl) {
      // If video source not directly in <video>, check for <source> tag
      const source = videoElem.querySelector('source');
      if (source) videoUrl = source.src;
    }
    if (!videoUrl) {
      console.warn('No video URL found on video-gens page.');
      return;
    }

    // Extract video title/name. Use page title or filename as a fallback.
    let videoTitle = document.title || 'video';
    // Optional: sanitize title to use as filename (remove illegal characters)
    videoTitle = videoTitle.replace(/[^A-Za-z0-9 _.-]/g, '_');

    // Extract encoding metadata if available
    let resolutionText = '';
    if (videoElem.videoWidth && videoElem.videoHeight) {
      resolutionText = `${videoElem.videoWidth}x${videoElem.videoHeight}`;  // e.g. "1920x1080"
    }
    // Suppose the page has bitrate info in an element with id "bitrate"
    let bitrateText = '';
    const bitrateElem = document.querySelector('#bitrate');
    if (bitrateElem) {
      bitrateText = bitrateElem.innerText.trim();  // e.g. "Bitrate: 5000 kbps"
    }

    console.log(`Detected video: ${videoUrl}, resolution: ${resolutionText}, bitrate: ${bitrateText}`);
    // Send message to background script to initiate download&#8203;:contentReference[oaicite:22]{index=22}.
    chrome.runtime.sendMessage({
      action: 'videoFound',
      url: videoUrl,
      title: videoTitle,
      resolution: resolutionText,
      bitrate: bitrateText
    });
    // The background script will handle the rest (download and upload).
    * /
  });
})();
*/

    /*
    function simulateKeyPress () {
        let evt = new KeyboardEvent("keydown", {
            key: "r",
            code: "KeyR",
            keyCode: 82,
            which: 82,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(evt);
    }
    let script = document.createElement('script');
    script.textContent = `(${simulateKeyPress.toString()})();`;
    document.documentElement.appendChild(script);
    script.remove ();
    */

                    /* 
                    chrome.tabs.onUpdated.addListener(function listener(id, info) {
                        if (id === updatedTab && info.status === 'complete') {
                            // Remove the listener to avoid memory leaks
                            chrome.tabs.onUpdated.removeListener(listener);
                            
                            // Now the tab is fully loaded, send your message
                            message.action = 'generateEnglishPrompt';
                            chrome.tabs.sendMessage(message);
                        }
                    });
                    */

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

let taskQueue = [];
let callbackID = null
let siteReadyFlag = false;

function waitForElementRefresh(selector, callback) {
    const targetNode = document.querySelector(selector);

    if (!targetNode) {
        console.error("Element not found:", selector);
        return;
    }

    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList" || mutation.type === "attributes") {
                observer.disconnect(); // Stop observing after detecting a change
                callback(targetNode);
                return;
            }
        }
    });

    observer.observe(targetNode, { childList: true, subtree: true, attributes: true });
} // end waitForElementRefresh

const keyCodeMap = {
    "a": 65, "b": 66, "c": 67, "d": 68, "e": 69, "f": 70, "g": 71,
    "h": 72, "i": 73, "j": 74, "k": 75, "l": 76, "m": 77, "n": 78,
    "o": 79, "p": 80, "q": 81, "r": 82, "s": 83, "t": 84, "u": 85,
    "v": 86, "w": 87, "x": 88, "y": 89, "z": 90,
    "0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54,
    "7": 55, "8": 56, "9": 57,
    "Enter": 13, "Escape": 27, "Space": 32, "Tab": 9,
    "ArrowUp": 38, "ArrowDown": 40, "ArrowLeft": 37, "ArrowRight": 39
};

function simulateKeyPress (key, keyCode) {
    let evt = new KeyboardEvent("keydown", {
        key: key,
        //code: "KeyR",
        keyCode: keyCodeMap[key] || keyCode,
        which: keyCodeMap[key] || keyCode,
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(evt);
} // end simulateKeyPress

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

function parseBody () {
    // Allow updates when page is ready
    // Send message to background script to initiate video remix.
    const textTranslatOption = getValueFromXPath(select_text_translate_xpath);
    if (textTranslatOption === '')
        return;
    clearInterval (intID);
    /* 
    invokeCtlFromXPath (select_text_translate_xpath);
    invokeCtlFromXPath (select_auto_detect_input_xpath);
    invokeCtlFromXPath (select_english_output_xpath);
     */
    // Init bg listener
    port.postMessage ({ action: "translateSiteReady" });
} // end parseBody

const select_text_translate_xpath = "//*[@id=\"yDmH0d\"]/c-wiz/div/div[2]/c-wiz/div[1]/nav/div[1]/div/button";
const select_auto_detect_input_xpath = "//*[@id=\"yDmH0d\"]/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]/div[1]/c-wiz/div[2]/c-wiz/div[1]/div/div[3]/div/div[1]/span/div[1]/div[2]";
const select_english_output_xpath = "//*[@id=\"i15\"]";
const textarea_input_xpath = "//*[@id=\"yDmH0d\"]/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]/div[2]/div[2]/div/c-wiz/span/span/div/div[1]";
const textarea_translation_xpath = "//*[@id=\"yDmH0d\"]/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]/div[2]/div[2]/c-wiz/div/div[6]/div/div[1]/span[1]/span/span";
const detected_language_xpath = "//*[@id=\"c58\"]/span[1]";

const port = chrome.runtime.connect ();
port.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'generateEnglishPrompt':
        /* 
        let ret = message.prompt;
        message.xpath = select_remix_xpath;
        invokeCtlFromXPath (select_text_translate_xpath);
        invokeCtlFromXPath (select_auto_detect_input_xpath);
        invokeCtlFromXPath (select_english_output_xpath);
         */
        const inputText = document.querySelector('textarea[aria-label]'); //getElementByXPath (textarea_input_xpath);
        // simulate input event //
        /*
        let event = new Event ({ 
            type:'input',
            bubbles: true,
            cancelable: true,
            data: message.prompt // update input in the bg
        });
        inputText.value = message.prompt;
        inputText.textContent = message.prompt;
        inputText.dispatchEvent(event);
        * /
        inputText.focus();
        inputText.value = message.prompt;        
        // Create and dispatch an input event to trigger Google Translate
        const inputEvent = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
        });
        inputEvent.dispatchEvent(inputEvent);
        */
        // Finally dispatch the input event
        //inputText.dispatchEvent(new Event('input', { bubbles: true }));
        // todo: wait for page to render //
        observeDOMForNewElement ('[jsname="W297wb"]', (translatedText) => {
            if (translatedText.textContent != inputText.textContent) {
                const langElement = document.querySelector('.source-language div span') || document.querySelector('.sl-wrap span');
                message.prompt = `${translatedText.textContent} (Original ${ langElement.textContent.trim() }: ${message.prompt})`;
            }
            message.action = "EnglishPromptCompleted";
            port.postMessage (message);
        });
        /*
        const translatedText = document.querySelector ('[jsname="W297wb"]'); //getElementByXPath (textarea_translation_xpath);
        if (translatedText == null) {
            translatedText.addListener('')
        }
        */
        break;
    }
});