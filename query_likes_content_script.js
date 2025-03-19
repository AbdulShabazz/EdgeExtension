
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

// Content script for Microsoft Edge extension
let port; 

function connectPort () {
    port = chrome.runtime.connect ({ name: "recent-videos" });
        
    // Add disconnection listener
    port.onDisconnect.addListener(() => {
        console.log("Port 'recent-videos' disconnected. Reconnecting...");
        // Optional: attempt to reconnect after a short delay
        setTimeout(connectPort, 1);
    });
}

connectPort ();

function postMessageW (message){
    if (port)
        port.postMessage (message);
    else {
        connectPort ();
        port.postMessage (message);
    }
} // end postMessageW

trackEventListener (window, "beforeunload", () => {
    removeAllEventListeners ();
    postMessageW ({ action: "release-tabID" });
}, {});

// Function to handle clicks on elements with data-index
function dataIndexElementClicked(event) {
    // Find if the click was on an element with data-index or one of its descendants
    let targetElement = event.target;
    let dataIndexElement = null;
    
    // Traverse up the DOM tree to find an element with data-index
    while (targetElement && targetElement !== document.body) {
        if (targetElement.hasAttribute('data-index')) {
            dataIndexElement = targetElement;
            break;
        }
        targetElement = targetElement.parentElement;
    } // end while (targetElement && targetElement !== document.body)
    
    // If we found an element with data-index
    if (dataIndexElement) {
        const url = dataIndexElement.querySelectorAll('div > div > div > a')[0]?.href || '';
        const dataIndexValue = dataIndexElement.getAttribute('data-index');       
        try {
            // Send a message to the background script
            postMessageW ({
                action: 'DataIndexElementClicked',
                dataIndex: dataIndexValue,
                url: url 
            });
        }
        catch (e) {
            console.info ("warning: Extension context invalidated before a value could be returned for 'DataIndexElementClicked' event.")
        }
        //console.log(`Element with data-index="${dataIndexValue}" was clicked`);
    } // end if (dataIndexElement)
} // end dataIndexElementClicked

let lastEvent;

// Initialize the content script
function parseBody () {
    // Query initial elements with data-index
    // Add a click event listener to the document
    trackEventListener (document, "click", (event) => {
        lastEvent = event;
        // limit execution to once per animation frame
        requestAnimationFrame(() => {
            if (lastEvent) {
                dataIndexElementClicked (lastEvent);
            }
        });        
    }, { passive: true });
    console.log('Data index element tracker initialized');
} // end parseBody

// Run initialization based on document state
if (document.readyState === 'loading') {
    trackEventListener (document, "DOMContentLoaded", parseBody, {});
} else {
    // If DOM is already loaded
    parseBody();
} // end if (document.readyState === 'loading')
