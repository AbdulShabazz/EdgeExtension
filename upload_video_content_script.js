

// youtubeContent.js (runs on YouTube upload page)
//port.onMessage.addListener(async (message, sender, sendResponse) => {
const port = chrome.runtime.connect ({ name: "youtube-upload" });
port.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'startUpload':
        break;

        case 'completeDownload':
        break;
    }
  /*
  if (message.action === 'startUpload') {
    const { videoTitle, videoSizeText, videoUrl } = message;
    console.log('Received video upload request for:', videoTitle);

    try {
      // 1. Fetch the video data as a Blob.
      const response = await fetch(videoUrl);
      const videoBlob = await response.blob();
      // Create a File object from the Blob (to mimic a file input selection)&#8203;:contentReference[oaicite:26]{index=26}.
      const fileName = videoTitle.endsWith('.mp4') ? videoTitle : (videoTitle + '.mp4');
      const videoFile = new File([videoBlob], fileName, { type: "video/mp4" });

      // 2. Find the YouTube file input element on the upload page.
      const fileInput = document.querySelector('input[type="file"]');
      if (!fileInput) {
        console.error('YouTube upload file input not found!');
        return;
      }

      // 3. Use DataTransfer to simulate selecting the file&#8203;:contentReference[oaicite:27]{index=27}.
      const dt = new DataTransfer();
      dt.items.add(videoFile);
      fileInput.files = dt.files;
      // Dispatch a change event to signal that a file was "chosen".
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));

      // 4. Set the video title and description fields.
      // (YouTube’s upload page should have title/description inputs; selectors may vary.)
      const titleField = document.querySelector('input#title') || document.querySelector('textarea#title');
      const descField = document.querySelector('textarea#description') || document.querySelector('input#description');
      if (titleField) {
        titleField.value = videoTitle;
        titleField.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (descField) {
        descField.value = "File size: " + videoSizeText;
        descField.dispatchEvent(new Event('input', { bubbles: true }));
      }

      console.log('Video file injected into YouTube upload form. Title and description set.');
      // Optionally, simulate clicks on Next/Publish if full automation of publishing is desired.
    } catch (err) {
      console.error('Upload automation failed:', err);
    }
  }
    */
   return true;
}); // end port.onMessage.addListener

function Init () {
    /*
    let isOnYT = document.location.href.match (/^*\.youtube\.com\/*$/);
    let isOnSORA = document.location.href.match (/^*\.sora\.com\/t\/*$/);
    if (isOnSORA) {
        port.postMessage
    } 
    else if (isOnYT) {

    }
    */

    // 1. We should be at (*.sora.com/t/*)
    // 2. Navigate to the newly generated video (*.sora.com/g/*)
    const urlSearch = document.location.href;
    const url = document.location.href.replace (/\/t\//, '/g/');
    port.postMessage ({ action: "url-navigate", url: url, urlSearch: urlSearch });
} // end Init

Init ();