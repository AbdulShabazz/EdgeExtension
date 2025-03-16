
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

// Store the port reference
let port;

// Function to establish connection
function connectPort() {
    port = chrome.runtime.connect({ name: "google-translate" });
    
    // Add disconnection listener
    port.onDisconnect.addListener(() => {
        console.log("Port disconnected. Reconnecting...");
        // Optional: attempt to reconnect after a short delay
        setTimeout(connectPort, 250);
    });
    
    // Add message listener
    port.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.action) {
        case 'generateEnglishPrompt':
            const inputText = document.querySelector('textarea[aria-label]');
            observeDOMForNewElement ('[jsname="W297wb"]', (translatedText) => {
                if (translatedText.textContent != inputText.textContent) {
                    const langElement = document
                      .querySelector('[class="VfPpkd-jY41G-V67aGc"]')
                      .textContent
                      .replace(/\s*\-\s*Detected$/,'');
                    message.prompt = `${translatedText.textContent} (Original ${langElement} Prompt: ${message.prompt})`;
                }
            });
            message.action = "EnglishPromptCompleted";
            port.postMessage (message);
            break;
        }
        return true;
    });
} // end connectPort

// Initialize connection
connectPort();

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