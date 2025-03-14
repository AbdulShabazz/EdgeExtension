
// Content script for Microsoft Edge extension
const port = chrome.runtime.connect ();

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
                url: url //,
                /* 
                element: dataIndexElement
                dataIndex: dataIndexValue,
                elementText: dataIndexElement.textContent.substring(0, 100), // Limit text length
                tagName: dataIndexElement.tagName,
                url: window.location.href,
                timestamp: new Date().toISOString()
                */
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

/*

  /*
  document.readyState = 'complete'; // 'loading', 'interactive'

  const elemsWithID = document.querySelectorAll("[data-index]");

  elemsWithID.forEach(eem => {});

  data-index="7"
  /html/body/main/div/div[1]/div/div/div[2]/div/div/div[2]/div/div[1]/div[8]/div/div/div/div/div[2]/div[3]
  /html/body/main/div/div[1]/div/div/div[2]/div/div/div[2]/div/div[1]/div[9]/div/div/div/div/div[2]/div[3]

  * /
  <div class="h-full w-full"><div class="group relative h-full w-full animate-pulse bg-gray-200"><a href="/g/gen_01jp7p21vmfqtt5sc8z1afwr9r"><div class="relative h-full w-full"><div class="relative h-full w-full" style="aspect-ratio: 1.77917 / 1;"><div class="absolute left-0 top-0 h-full w-full"><div class="relative h-full w-full"><div class="absolute left-0 top-0 h-full w-full"><div class="relative h-full w-full animate-pulse bg-secondary/20"><img src="https://videos.openai.com/vg-assets/assets%2Ftask_01jp7p0cvcecj9v89t11zsc5rh%2Ftask_01jp7p0cvcecj9v89t11zsc5rh_genid_d2d870bf-ed2a-4104-88c8-bfecfdc148a9_25_03_13_12_00_122245%2Fvideos%2F00000_129642815%2Fthumb.webp?st=2025-03-13T10%3A51%3A50Z&amp;se=2025-03-19T11%3A51%3A50Z&amp;sks=b&amp;skt=2025-03-13T10%3A51%3A50Z&amp;ske=2025-03-19T11%3A51%3A50Z&amp;sktid=a48cca56-e6da-484e-a814-9c849652bcb3&amp;skoid=8ebb0df1-a278-4e2e-9c20-f2d373479b3a&amp;skv=2019-02-02&amp;sv=2018-11-09&amp;sr=b&amp;sp=r&amp;spr=https%2Chttp&amp;sig=IN2Jd19Mgx3rHcsWhhVK4kogV79%2BukctQkQjg1oWUJk%3D&amp;az=oaivgprodscus" class="h-full w-full object-cover" alt="Generation placeholder" style="display: none;"></div></div><div class="absolute left-0 top-0 h-full w-full"></div><div class="absolute left-0 top-0 h-full w-full transition-opacity opacity-100"></div></div></div></div></div></a></div></div>
  */