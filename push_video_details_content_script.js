
// globals
let _uuid_ = "";

// content.js (runs on video-gens.com pages)

const port = chrome.runtime.connect ({ name: "video-details" });
port.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'doRemix':
        message.xpath = select_remix_xpath;
        doRemixF (message);
        break;

        case 'navigateToVideoURL':
        break;

        case 'doDownload':
        break;
    }
});
port.onDisconnect.addListener (() => {
    console.info ('push_video_details_content_script.js connection to background service worker port, disconnected.')
});

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
const focus_activity_window_xpath = "//*[@id=\"radix-:r1p:\"]/div/div[2]/div/div/div/div[3]/div[1]/button";
const select_latest_activity_xpath = "//*[@id=\"radix-:r64:\"]/div/a[1]";
const select_AddToFAVS_xpath = "//*[@id=\"radix-:r12:\"]/div/div[2]/div/div/div/div[3]/div[1]/button";
const select_confirm_download_xpath = "//*[@id=\"radix-:r9c:\"]/div[2]/button[2]";

// Simulating mouse clicks

function clickAboveElement(element, pixelsAbove = 12) {
    // Get element's position relative to the viewport
    const rect = element.getBoundingClientRect();
    
    // Calculate position (center of element, pixelsAbove pixels above the top)
    const x = rect.left + rect.width / 2;
    const y = rect.top - pixelsAbove;
    
    // Add scroll position to get absolute coordinates
    const absoluteX = x + window.scrollX;
    const absoluteY = y + window.scrollY;
    
    // Create and dispatch mouse event
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        screenX: absoluteX,
        screenY: absoluteY,
        clientX: x,
        clientY: y
    });
    
    // Dispatch the event at the calculated position
    document.elementFromPoint(x, y)?.dispatchEvent(clickEvent);

} // end clickAboveElement

/*

// Usage example //
const element = document.getElementById('my-element');

// Click 5px above the element //
clickAboveElement(element, 5);

*/

// Shortcut keys + keyCodes

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

let downloadID = null;

function confirmDownloadFromXPath () {
    if (invokeCtlFromXPath (select_confirm_download_xpath)) {
        clearInterval (downloadID);
        port.postMessage ({ 
            action: 'downloadCompleted',
            url: window.location.href
        });
    };
} // end confirmDownloadFromXPath

// Observes when the element first appears in the DOM
function observeDOMForNewElement(selector, callback) {
    const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
            observer.disconnect(); // Stop observing once the element appears
            callback(element);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
} // end observeDOMForNewElement

function doDownload () {
    simulateKeyPress ("d");
    downloadID = setInterval (confirmDownloadFromXPath, 1);
} // end doDownload

function setResolution (msg) {
    //let resolution_button = document.querySelector('[aria-controls="radix-:rb:"]'); // resolution button
    observeDOMForNewElement ('[aria-controls="radix-:rb:"]', // or '[aria-controls="radix-:34:"]'
    (resolution_button) => {
        resolution_button.click ();
        switch (msg.resolution) {
            case 480:
            clickAboveElement (resolution_button, '100px');
            break;
    
            case 720:
            clickAboveElement (resolution_button, '150px');
            break;
        } // end switch (msg.resolution)
    })
} // end setResolution

function setTotalNewVideos (msg) {
    //let total_videos_button = document.querySelector('[aria-controls="radix-:rf:"]'); // total new videos button
    observeDOMForNewElement ('[aria-controls="radix-:rf:"]', // or '[aria-controls="radix-:36:"]'
    (total_videos_button) => {
        total_videos_button.click ();
        clickAboveElement (total_videos_button, '100px');
    });
} // end setTotalnewVideos

function setRemixStrength (msg) {
    //let remix_strength_button = document.querySelector('[aria-controls="radix-:rd:"]'); // remix strength button
    observeDOMForNewElement ('[aria-controls="radix-:rd:"]', // or '[aria-controls="radix-:38:"]' 
    (remix_strength_button) => {
        remix_strength_button.click ();
        switch (msg.remix) {
            case 7:
            clickAboveElement (remix_strength_button, '100px');
            break;
    
            case 'strong': // 6
            case 6:
            clickAboveElement (remix_strength_button, '250px');
            break;
    
            case 5:
            clickAboveElement (remix_strength_button, '100px');
            break;
    
            case 'mild': // 4
            case 4:
            clickAboveElement (remix_strength_button, '200px');
            break;
    
            case 3:
            clickAboveElement (remix_strength_button, '100px');
            break;
    
            case 'subtle': // 2
            case 2:
            clickAboveElement (remix_strength_button, '150px');
            break;
    
            case 1:
            clickAboveElement (remix_strength_button, '100px');
            break;
    
            case 0:
            clickAboveElement (remix_strength_button, '100px');
            break;
        } // end switch (msg.resolution) 
    });
} // end setRemixStrength

function doRemixF (msg) {
    const uuid = msg.uuid;
    const xpath = msg.xpath;
    if (uuid === _uuid_ ) {
        const resolution = msg.resolution;
        const duration = msg.duration;
        const remix = msg.remix;
        invokeCtlFromXPath (xpath); // set focus remix_window.click ()
        setResolution (msg);
        setTotalNewVideos(msg);
        setRemixStrength (msg);
        // generate video ...
        // wait for video [body] to generate ...
        // navigate to new video url
        // add to Favorites
        // get video title
        // doDownload (); // d/l [video].mp4
        // doDownload (); // d/l [video].log (title + english prompt [+ prompt])
        /*
        // close window
        port.postMessage ({
            //action:"videoCompleted",
            action:"downloadCompleted",
            uuid: uuid,
            title: newVideoTitleW,
            prompt: prompt,
            resolution: resolution,
            duration: duration,
            remix: remix
        });
        */
    } // end if(uuid === _uuid_ )
} // end doRemixF

/**
 * Triggers a mouse click event at a specified distance above an HTML element
 * @param {HTMLElement|string} element - The target element or its CSS selector
 * @param {number} pixelsAbove - The number of pixels above the element to click
 * @return {boolean} - True if successful, false otherwise
 */
function clickAboveElement(element, _pixelsAbove_) {
    const pixelsAbove = new Number (_pixelsAbove_.toString().replace(/\D+/g,''));
    try {
      // If a selector string is provided, get the actual element
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      
      // Check if element exists
      if (!element) {
        console.error('Element not found');
        return false;
      }
      
      // Get the element's position relative to the viewport
      const rect = element.getBoundingClientRect();
      
      // Calculate the target coordinates
      // Using the horizontal center of the element
      const x = rect.left + (rect.width / 2);
      // Using the specified distance above the top of the element
      const y = rect.top - pixelsAbove;
      
      // Add scroll position to get absolute page coordinates
      const absoluteX = x + window.scrollX;
      const absoluteY = y + window.scrollY;
      
      // Create and dispatch mousedown event
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        screenX: absoluteX,
        screenY: absoluteY
      });
      document.elementFromPoint(x, y)?.dispatchEvent(mousedownEvent);
      
      // Create and dispatch mouseup event
      const mouseupEvent = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        screenX: absoluteX,
        screenY: absoluteY
      });
      document.elementFromPoint(x, y)?.dispatchEvent(mouseupEvent);
      
      // Create and dispatch click event
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        screenX: absoluteX,
        screenY: absoluteY
      });
      
      // Dispatch to the element at those coordinates
      const targetElement = document.elementFromPoint(x, y);
      if (targetElement) {
        targetElement.dispatchEvent(clickEvent);
        console.log(`Click triggered ${pixelsAbove}px above element at coordinates: (${x}, ${y})`);
        return true;
      } else {
        console.error('No element found at the target coordinates');
        return false;
      }
    } catch (error) {
      console.error('Error triggering click:', error);
      return false;
    }
} // end clickAboveElement

// Example usage:
// clickAboveElement('#myButton', 30); // Click 30px above the element with id="myButton"
// clickAboveElement(document.getElementById('dropdown'), "50px"); // Click 50px above the dropdown element

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

let intID = setInterval(parseBody, false);