
// Content script for Microsoft Edge extension
let port = chrome.runtime.connect ({ name: "recent-videos" });
    
// Add disconnection listener
port.onDisconnect.addListener(() => {
    console.log("Port 'recent-videos' disconnected. Reconnecting...");
    // Optional: attempt to reconnect after a short delay
    setTimeout(() => { port = chrome.runtime.connect ({ name: "recent-videos" }) }, 10);
});

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
            port.postMessage({
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

// Initialize the content script
function parseBody () {
    // Query initial elements with data-index
    /* const initialElements = */ //queryHTMLElements();

    // Add a click event listener to the document
    document.addEventListener('click', dataIndexElementClicked, true);

    console.log('Data index element tracker initialized');

} // end parseBody

// Run initialization based on document state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', parseBody);
} else {
    // If DOM is already loaded
    parseBody();
} // end if (document.readyState === 'loading')
