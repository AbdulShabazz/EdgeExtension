
// Content script for Microsoft Edge extension
let port = chrome.runtime.connect ({ name: "recent-videos" });
    
// Add disconnection listener
port.onDisconnect.addListener(() => {
    console.log("Port 'recent-videos' disconnected. Reconnecting...");
    // Optional: attempt to reconnect after a short delay
    setTimeout(() => { port = chrome.runtime.connect ({ name: "recent-videos" }) }, 1);
});

// Function to query all elements with data-index and report them
function queryHTMLElements() {
    const elementsWithDataIndexes = document.querySelectorAll('[data-index]');

    if (elementsWithDataIndexes.length < 1)
        return /* [] */;
    
    // Create an array of elements with their data-index values
    const dataIndexElements = Array.from(elementsWithDataIndexes).map(element => {
        return element; /* {
            dataIndex: element.getAttribute('data-index'),
            tagName: element.tagName,
            textContent: element.textContent.substring(0, 100) // Limit text length
        } */
    });
    try {
        // Send the list to the background script
        port.postMessage({
            action: 'NewDataIndexElementsFound',
            elements: /* elementsWithDataIndexes */ dataIndexElements,
            length: /* elementsWithDataIndexes.length */ dataIndexElements.length //,
            //url: window.location.href
        });
    }
    catch (e) {
        console.info ("warning: Extension context invalidated before a value could be returned for 'NewDataIndexElementsFound' event.")
    }
    //console.log(`Found ${dataIndexElements.length} elements with data-index`);
    
    return /* dataIndexElements */;
} // end queryHTMLElements

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
    /* const initialElements = */ queryHTMLElements();

    // Add a click event listener to the document
    document.addEventListener('click', dataIndexElementClicked, true);

    // Set up a MutationObserver to detect new elements with data-index
    const observer = new MutationObserver(mutations => {
        let shouldQuery = false;
        
        mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if ((node.hasAttribute && node.hasAttribute('data-index')) || 
                    (node.querySelector && node.querySelector('[data-index]'))) {
                shouldQuery = true;
                }
            }
            });
        }
        });
        
        if (shouldQuery) {
            queryHTMLElements();
        }
    }); // end new MutationObserver (...)

    // Start observing DOM changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    }); // end observer.observe (...)
  
    console.log('Data index element tracker initialized');

} // end parseBody

// Run initialization based on document state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', parseBody);
} else {
    // If DOM is already loaded
    parseBody();
} // end if (document.readyState === 'loading')
