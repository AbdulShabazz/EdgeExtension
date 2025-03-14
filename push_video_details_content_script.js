
// content.js (runs on video-gens.com pages)

const port = chrome.runtime.connect ();
port.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'doRemix':
        message.xpath = select_remix_xpath;
        doRemixF (message);
        break;

        case 'addToFAVS':
        break;

        case 'd/l':
        break;
    }
});

// globals
let _uuid_ = "";

// Video Details
const videoName_xpath = "/html/body/main/div/div[2]/div/div/div/div[2]/div/div/div/div[1]/div[3]/div"; // name
const resolution_xpath = "/html/body/main/div/div[2]/div/div/div/div[2]/div/div/div/div[2]/div[1]"; // resolution
const duration_xpath = "/html/body/main/div/div[1]/div/div/div[2]/div/div/div/div[2]/div/div[2]"; // duration
const prompt_xpath = "/html/body/main/div/div[1]/div/div/div[2]/div/div/div/div[1]/div/div/div/button"; // prompt

// Remix Controls
const select_remix_xpath = "/html/body/main/div/div[1]/div/div/div[2]/div/div/div/div[3]/div/div[5]/button"; // remix ctl
const focus_resolution_xpath = "//*[@id=\"radix-:r1o:\"]/div/div[1]/div/div/div[2]/div/div/div/div/div/div[2]/div[2]/div[1]/button[1]"; // Show available Screen Resolutions
const select_480p_xpath = "";
const select_720p_xpath = "";
const select_1080p_xpath = "";
const focus_new_videos_xpath = "//*[@id=\"radix-:r1o:\"]/div/div[1]/div/div/div[2]/div/div/div/div/div/div[2]/div[2]/div[1]/button[2]";
const select_1_new_videos_xpath = "";
const select_2_new_videos_xpath = "";
const focus_remix_strength_xpath = "//*[@id=\"radix-:r1o:\"]/div/div[1]/div/div/div[2]/div/div/div/div/div/div[2]/div[2]/div[1]/button[3]";
const select_strong_remix_strength_xpath = "";
const select_mild_remix_strength_xpath = "";
const select_subtle_remix_strength_xpath = "";
const select_custom_remix_strength_xpath = "";
const select_7_remix_strength_xpath = "";
const select_6_remix_strength_xpath = "";
const select_5_remix_strength_xpath = "";
const select_4_remix_strength_xpath = "";
const select_3_remix_strength_xpath = "";
const select_2_remix_strength_xpath = "";
const select_1_remix_strength_xpath = "";
const select_0_remix_strength_xpath = "";

// Form Details

function doRemixF (msg) {
    const uuid = msg.uuid;
    const xpath = msg.xpath;
    if (uuid === _uuid_ ) {
        invokeCtlFromXPath (xpath);
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
    } // end if(uuid === _uuid_ )
} // end doRemixF

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
    const ctl = getElementByXPath(xpath);
    if (ctl) {
        ctl.click();
    }
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
    const durationW = getValueFromXPath(duration_xpath);
    const promptW = getValueFromXPath(prompt_xpath);
    const videoTitleW = _uuid_ = getValueFromXPath(videoName_xpath);
    if (resolutionW === '')
        return;
    clearInterval (intID);
    // Init bg listener
    port.postMessage ({
        action: 'videoFound',
        uuid: videoTitleW,
        videoTitle: videoTitleW,
        resolution: resolutionW,
        duration: durationW,
        prompt: promptW
    });
} // end parseBody
/*
function Init () {
    if ((document.readyState != 'complete') || getValueFromXPath(resolution_xpath) === '')
        return;
    clearInterval (intID);
    document.addEventListener('DOMContentLoaded', parseBody);
} // end Init
 */
let intID = setInterval(parseBody, false);

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