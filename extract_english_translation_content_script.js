try {
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
    let MSG;

    function connectPort (){
        port = chrome.runtime.connect ({ name: "google-translate" });

        port.onMessage.addListener((message, sender, sendResponse) => {
            message = MSG || message; // message cached ?
            switch (message.action) {
                case 'generateEnglishPrompt':
                    observeDOMForNewElement ('textarea[aria-label]', (inputText) => {
                        //const inputText = document.querySelector('textarea[aria-label]');
                        if (inputText?.textContent) {
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
                                postMessageW (message,'cache');
                            });
                        } // end if (inputText?.textContent) 
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

    function postMessageW (message, cache = false){
        if (port)
            port.postMessage (message);
        else if (cache){
            MSG = message;
            connectPort ();
        }
        else {
            connectPort ();
            port.postMessage (message);
        }
    } // end postMessageW

    trackEventListener (window, "beforeunload", () => {
        removeAllEventListeners ();
        postMessageW ({ action: "release-tabID" });
    }, {});

    function parseBody () {
        postMessageW ({ action: "translateSiteReady" });
    } // end parseBody

    // Run initialization based on document state
    if (document.readyState != 'complete') {
        trackEventListener (document, "DOMContentLoaded", parseBody, {});
    } else {
        // If DOM is already loaded
        parseBody();
    } // end if (document.readyState === 'loading')

} catch (e) {
    //console.info (`An error occured ${JSON.stringify(e,' ',2)}`);
}