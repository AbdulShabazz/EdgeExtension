
const select_text_translate_xpath = "//*[@id=\"yDmH0d\"]/c-wiz/div/div[2]/c-wiz/div[1]/nav/div[1]/div/button";

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

let port;

function connectPort (MSG){
    port = chrome.runtime.connect ({ name: "google-translate" });

    port.onMessage.addListener((message, sender, sendResponse) => {
        message = MSG || message; // message cached ?
        switch (message.action) {
            case 'generateEnglishPrompt':
                const inputText = document.querySelector('textarea[aria-label]');
                observeDOMForNewElement ('[jsname="W297wb"]', (_) => {
                    const translatedText_textContent = Array
                        .from (document.querySelectorAll('span[jsname="W297wb"]'))
                        .map ((sentence) => sentence.textContent)
                        .join (' '); // [span.r97qvb, ...]
                    if (translatedText_textContent != inputText.textContent) {
                        const langElement = document
                        .querySelector('[class="VfPpkd-jY41G-V67aGc"]')
                        .textContent
                        .replace(/\s*\-\s*Detected$/,'');
                        message.prompt = `${translatedText_textContent} (Original ${langElement}: ${message.prompt})`;
                    }
                    message.prompt = message.prompt || message.videoTitle; // No empty prompts //
                    message.action = "EnglishPromptCompleted";
                    if (port)
                        port.postMessage (message);
                    else {
                        connectPort ();
                        port.postMessage (message);
                    }
                });
                break;
        }
    });
        
    // Add disconnection listener
    port.onDisconnect.addListener(() => {
        console.log("Port 'google-translate' disconnected. Reconnecting...");
        // Optional: attempt to reconnect after a short delay
        setTimeout(connectPort, 10);
    });
} // end connectPort

connectPort ();

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

function getValueFromXPath(xpath) {
    let ret = '';
    const result = getElementByXPath(xpath);
    if (result) {
        ret = result.textContent.trim();
    }
    return ret;
} // end getValueFromXPath

function parseBody () {
    const textTranslatOption = getValueFromXPath(select_text_translate_xpath);
    if (textTranslatOption === '')
        return;
    clearInterval (intID);
    // Init bg listener
    port.postMessage ({ action: "translateSiteReady" });
} // end parseBody

let intID = setInterval(parseBody, false);