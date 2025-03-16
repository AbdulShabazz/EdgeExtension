
let messageQueue = [];

// youtubeContent.js (runs on YouTube upload page)

// Store the port reference
let port;

// Function to establish connection
function connectPort() {
    port = chrome.runtime.connect({ name: "youtube-upload" });
    
    // Add disconnection listener
    port.onDisconnect.addListener(() => {
        console.log("Port disconnected. Reconnecting...");
        // Optional: attempt to reconnect after a short delay
        setTimeout(connectPort, 250);
    });
    
    // Add message listener
    port.onMessage.addListener((msg, sender, sendResponse) => {
        switch (msg.action) {
            case 'startUpload':
                messageQueue = [msg];
                break;

            case 'completeDownload':
                break;
        } // end switch (message.action) 
        return true;
    });
} // end connectPort

// Initialize connection
connectPort();

function Init () {
    document.addEventListener ('keydown', (keyCodeEvent) => {
        if (keyCodeEvent.shiftKey) { // [Shift] Youtube
            const input_field = document.querySelectorAll('div[id=textbox]');
            const msg = messageQueue[0];
            const videoTitle = msg.videoTitle;
            const prompt = input_field[1].textContent.replace (/^Prompt:.+\n/, `Prompt: ${msg.prompt}\n`);
            const iid = setInterval(() => {
                input_field[0].textContent = videoTitle;
                input_field[1].textContent = prompt;
            }, false); // end setInterval            
        } // end if (keyCodeEvent.shiftKey)
    }); // end addEventListener
    port.postMessage ({ action: "url-youtube" });
} // end Init

// Run initialization based on document state
if (document.readyState != 'complete') {
    const iid = setInterval (() => {
        if (document.readyState != 'complete')
            return;
        clearInterval (iid);
        Init ();
    }, 1);
    //document.addEventListener('DOMContentLoaded', Init);
} else {
  // If DOM is ready
    Init ();
} // end if (document.readyState === 'loading')