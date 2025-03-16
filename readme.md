EdgeExtension is a Microsoft Edge extension that runs in the background, automatically detecting and downloading .MP4 videos from `video-gens.com`, extracting encoding settings from the webpage, switching to a YouTube upload tab, and setting the video name as the title and its size as the description.

I will provide you with the manifest file, background script, and content script necessary to achieve this functionality. I'll let you know when the extension is ready for your review.

# Microsoft Edge Extension: Automated Video Download & YouTube Upload

**Overview:**  
This extension runs in the background to **automatically download videos from** `video-gens.com` **and upload them to YouTube**. It detects video content on the specified site, saves the video as an MP4, gathers encoding info (resolution, bitrate), then switches to an open YouTube tab to perform an upload. The video’s name is used as the YouTube title and its file size as the description. No user interaction or additional authentication is required (the user is assumed to be already logged into YouTube). 

Below are the key components and their implementation details:

## Manifest File (`manifest.json`)

The manifest defines the extension’s metadata, background scripts, content scripts, permissions, and any Edge-specific settings. For Microsoft Edge (Chromium-based) extensions, the format and APIs are identical to Chrome’s ([Why use the Edge extension on Edge instead of Chrome's? : r/Bitwarden](https://www.reddit.com/r/Bitwarden/comments/16a18e5/why_use_the_edge_extension_on_edge_instead_of/#:~:text=%E2%80%A2)), and Manifest V3 is used (since Manifest V2 is deprecated ([Manifest file format for extensions - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/manifest-format#:~:text=))). Key points in this manifest: 

- **Content Scripts:** Injected into pages on `video-gens.com` (to detect videos and metadata) and on YouTube’s upload page (to handle the automated upload).
- **Background Service Worker:** Runs continuously to handle downloads and coordinate between content scripts (Edge’s `"background"` permission can keep the service alive even when no browser window is open ([Declare API permissions in the manifest - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/declare-permissions#:~:text=,permission%20with%20%206%20background))).
- **Permissions:** Includes *download management* and *tab access*. We request the `downloads` permission to save files ([Declare API permissions in the manifest - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/declare-permissions#:~:text=,your%20extension%20access%20to%20the)) and `tabs` permission to find and control the YouTube tab ([Declare API permissions in the manifest - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/declare-permissions#:~:text=,make%20use%20of%20these%20APIs)). Host permissions for `video-gens.com` and `youtube.com` are declared so the extension can interact with those pages.

```json
{
  "manifest_version": 3,
  "name": "VideoGen YouTube AutoUploader",
  "version": "1.0",
  "description": "Auto-download videos from video-gens.com and upload to YouTube.",
  "permissions": [
    "downloads",       /* Allows use of chrome.downloads API ([Declare API permissions in the manifest - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/declare-permissions#:~:text=,your%20extension%20access%20to%20the)) */
    "tabs",            /* Allows tab querying & updating ([Declare API permissions in the manifest - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/declare-permissions#:~:text=,make%20use%20of%20these%20APIs)) */
    "*://video-gens.com/*",   /* Access video site pages/content */
    "*://*.youtube.com/*"     /* Access YouTube pages (e.g., upload) */
  ],
  "host_permissions": [
    "*://video-gens.com/*",
    "*://*.youtube.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["*://video-gens.com/*"],
      "js": ["query_likes_content_script.js"]
    },
    {
      "matches": ["*://www.youtube.com/upload*"],
      "js": ["youtubeContent.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_icon": "icon.png",
    "default_title": "VideoGen Uploader"
  }
}
```

**Manifest Highlights:**

- The extension runs a background service worker (`background.js`) to handle long-lived tasks (downloads, tab management). Edge/Chrome automatically launches this background script when needed (and with `"background"` permission, Edge can keep it alive longer ([Declare API permissions in the manifest - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/declare-permissions#:~:text=,permission%20with%20%206%20background))).
- `content_scripts`: 
  - `query_likes_content_script.js` runs on all pages of **video-gens.com** to detect videos and extract metadata.
  - `youtubeContent.js` runs on the **YouTube upload page** to automate the file upload and form filling.
- **Permissions:** We include `"downloads"` (to manage file downloads) and `"tabs"` (to locate and manipulate the YouTube tab). According to the documentation, the `downloads` permission **grants access to the chrome.downloads API** ([Declare API permissions in the manifest - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/declare-permissions#:~:text=,your%20extension%20access%20to%20the)), and `tabs` allows access to privileged tab info and tab operations ([Declare API permissions in the manifest - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/declare-permissions#:~:text=,make%20use%20of%20these%20APIs)). Host permissions for the specific domains allow the content scripts and cross-domain requests to those pages.

## Background Script (`background.js`)

The background script is the “brain” of the extension ([Adding a Background Script to your Edge Extension | Microsoft Learn](https://learn.microsoft.com/en-us/shows/one-dev-minute/adding-background-script-to-you-edge-extension#:~:text=Learn%20how%20to%20make%20a,ms%2FEdgeExtensionsDocs)). It listens for messages from content scripts and performs the download/upload coordination. Since it runs in the background (as a service worker in Manifest V3), it does not have a UI and operates silently.

**Key responsibilities:**

- **Receive video info from `video-gens.com`:** When a content script detects a video, it sends a message with the video URL and metadata. The background script listens for this message and starts the download.
- **Download the video (MP4):** Uses the Chrome/Edge Downloads API to fetch the video and save it as an `.mp4` file. The API is invoked programmatically with no user prompts ([javascript - Use chrome.downloads API in manifest v3 Chrome extension - Stack Overflow](https://stackoverflow.com/questions/75326332/use-chrome-downloads-api-in-manifest-v3-chrome-extension#:~:text=chrome.downloads.download%28,)), saving the file (e.g., to the default Downloads folder).
- **On Download Complete:** Detects when the download finishes (via `chrome.downloads.onChanged` event) ([javascript - Use chrome.downloads API in manifest v3 Chrome extension - Stack Overflow](https://stackoverflow.com/questions/75326332/use-chrome-downloads-api-in-manifest-v3-chrome-extension#:~:text=chrome.downloads.onChanged.addListener%28%28dd%29%20%3D,)). At that point, it finds an open YouTube tab, navigates it to the YouTube upload page (if not already there), and triggers the upload process.
- **Communicate with YouTube content script:** After ensuring the YouTube upload page is ready, the background script sends a message to the `youtubeContent.js` script with details like the video’s source URL, the name (for title), and file size (for description). This message prompts the content script to perform the file selection and form-filling on YouTube.

Below is the `background.js` with inline comments explaining each step:

```js
// background.js (runs as a service worker in Edge/Chrome extension)

// Listen for one-time messages from content scripts ([Message passing  |  Chrome Extensions  |  Chrome for Developers](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#:~:text=One)).
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'videoFound') {
    const videoUrl = message.url;
    let videoTitle = message.title || 'Video';
    if (!videoTitle.toLowerCase().endsWith('.mp4')) {
      videoTitle += '.mp4';  // ensure the filename has .mp4 extension
    }

    console.log('Downloading video:', videoUrl);
    // Initiate download of the video file using the Downloads API ([javascript - Use chrome.downloads API in manifest v3 Chrome extension - Stack Overflow](https://stackoverflow.com/questions/75326332/use-chrome-downloads-api-in-manifest-v3-chrome-extension#:~:text=chrome.downloads.download%28,)).
    chrome.downloads.download({
      url: videoUrl,
      filename: videoTitle,   // Save as this name in the user's Downloads folder
      saveAs: false           // No Save As dialog, download automatically
    }, downloadId => {
      if (chrome.runtime.lastError || !downloadId) {
        console.error('Download failed:', chrome.runtime.lastError);
      } else {
        // Monitor the download until it’s complete.
        chrome.downloads.onChanged.addListener(function onChanged(delta) {
          if (delta.id === downloadId && delta.state && delta.state.current === 'complete') {
            // Download is complete ([javascript - Use chrome.downloads API in manifest v3 Chrome extension - Stack Overflow](https://stackoverflow.com/questions/75326332/use-chrome-downloads-api-in-manifest-v3-chrome-extension#:~:text=chrome.downloads.onChanged.addListener%28%28dd%29%20%3D,)).
            chrome.downloads.onChanged.removeListener(onChanged);
            console.log('Video downloaded. Preparing to upload to YouTube.');

            // Get the file size from the download item
            chrome.downloads.search({ id: downloadId }, function(results) {
              let fileSizeBytes = results && results[0] ? results[0].fileSize : 0;
              let fileSizeMB = fileSizeBytes ? (fileSizeBytes / (1024*1024)).toFixed(2) + ' MB' : '';
              
              // Find an open YouTube tab.
              chrome.tabs.query({ url: "*://*.youtube.com/*" }, function(tabs) {
                if (tabs.length === 0) {
                  console.warn('No open YouTube tab found. Opening a new one.');
                  chrome.tabs.create({ url: "https://www.youtube.com/upload", active: true }, tab => {
                    sendUploadMessageWhenReady(tab.id, videoTitle, fileSizeMB, videoUrl);
                  });
                } else {
                  // Use the first YouTube tab found (could refine to specific tab if needed).
                  let ytTab = tabs[0];
                  // Navigate it to the upload page (if not already there).
                  chrome.tabs.update(ytTab.id, { url: "https://www.youtube.com/upload", active: true }, updatedTab => {
                    sendUploadMessageWhenReady(updatedTab.id, videoTitle, fileSizeMB, videoUrl);
                  });
                }
              });
            });
          }
        });
      }
    });
  }
  // Return true to indicate we'll send a response asynchronously (if needed).
  return true;
});

// Helper function to message the YouTube content script once the upload page is loaded.
function sendUploadMessageWhenReady(tabId, title, sizeText, videoUrl) {
  // Use tabs.onUpdated to wait for the YouTube upload page to finish loading.
  chrome.tabs.onUpdated.addListener(function listener(updatedTabId, info, tab) {
    if (updatedTabId === tabId && info.status === 'complete') {
      chrome.tabs.onUpdated.removeListener(listener);
      // Send a message to the YouTube content script with video details.
      chrome.tabs.sendMessage(tabId, {
        action: 'startUpload',
        videoTitle: title,
        videoSizeText: sizeText,
        videoUrl: videoUrl
      });
    }
  });
}
```

I'll help clarify this description for your Microsoft Edge extension that connects Sora (AI video generation) with YouTube uploads. Here's a clearer explanation:

# How the Sora/YouTube Extension Works

1. **Video Discovery**: When browsing eg., Sora.com, the `query_likes_content_script.js` automatically detects videos and provides an option to open them in a new tab.

2. **Video Editing**: In this new tab, you can:
   - Remix or recut the video
   - Create storyboards
   - Make other edits as needed
   - Etc.

3. **Download Process**: After finishing any edits, download the final generated video to your computer.

4. **YouTube Upload**: 
   - Hold the SHIFT key to navigate to YouTube's upload page
   - Select your newly downloaded video
   - Apply any pre-designed templates if desired

5. **Auto-Population Feature**:
   - When you reach the video description page, hold the SHIFT key
   - The extension will automatically populate the title field with the Sora video title
   - The description field will be filled with the Sora video generation prompt
   - Important: These auto-populated changes are temporary until confirmed

6. **Confirming Changes**:
   - Click at the end of each auto-populated field
   - Press SPACEBAR to confirm the changes (this registers the automated changes as a user interaction)

7. **Complete Upload**:
   - Fill in remaining details (category, visibility, etc.)
   - Add captions and timestamps as needed
   - Complete the upload process as normal

> **Edge Note:** The use of `chrome.tabs.query` and `chrome.tabs.update` requires the `"tabs"` permission. In Edge/Chrome, this permission grants access to manipulate tabs and read certain tab properties ([Declare API permissions in the manifest - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/declare-permissions#:~:text=,make%20use%20of%20these%20APIs)). The `"downloads"` permission is needed to manage downloads ([Declare API permissions in the manifest - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/declare-permissions#:~:text=,your%20extension%20access%20to%20the)). Both are declared in the manifest as shown earlier. Since the extension is running in the background, no user interface is needed; however, the extension must be loaded/installed in Edge and enabled. Edge will treat this extension like a Chrome extension, so no code changes are needed for Edge specifically ([Why use the Edge extension on Edge instead of Chrome's? : r/Bitwarden](https://www.reddit.com/r/Bitwarden/comments/16a18e5/why_use_the_edge_extension_on_edge_instead_of/#:~:text=%E2%80%A2)).

## Content Script for Video Detection (`query_likes_content_script.js`)

The content script runs on `video-gens.com` pages to **detect video content and gather metadata**. It operates in the context of the webpage (but in an isolated environment) and can access the DOM to find video elements or related info ([Message passing  |  Chrome Extensions  |  Chrome for Developers](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#:~:text=Because%20content%20scripts%20run%20in,action%20icon%20for%20that%20page)). Once it identifies a video, it collects details and notifies the background script via message passing ([Message passing  |  Chrome Extensions  |  Chrome for Developers](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#:~:text=This%20communication%20uses%20message%20passing%2C,extension%20messages%20section)).

**Key responsibilities:**

- **Detect video element or link:** The script looks for a HTML5 `<video>` tag or a direct video link on the page. This might involve checking `<video>` or `<source>` tags, or known page structure where the video URL is present.
- **Extract metadata:** It gathers video encoding details like resolution and bitrate from the page. For example, it can read the video’s dimensions via the video element properties or parse any textual metadata on the page (e.g., if the site displays “1080p” or bitrate info).
- **Send message to background:** Using `chrome.runtime.sendMessage`, it sends an object with the video URL, title, resolution, bitrate, etc., to trigger the download in the background script.

Below is the `query_likes_content_script.js` code:

```js
// query_likes_content_script.js (runs on video-gens.com pages)
(function() {
  // Wait for the DOM to load or video element to be ready
  window.addEventListener('DOMContentLoaded', () => {
    const videoElem = document.querySelector('video');
    if (!videoElem) return;  // No video element found

    // Get video source URL
    let videoUrl = videoElem.currentSrc || videoElem.src;
    if (!videoUrl) {
      // If video source not directly in <video>, check for <source> tag
      const source = videoElem.querySelector('source');
      if (source) videoUrl = source.src;
    }
    if (!videoUrl) {
      console.warn('No video URL found on video-gens page.');
      return;
    }

    // Extract video title/name. Use page title or filename as a fallback.
    let videoTitle = document.title || 'video';
    // Optional: sanitize title to use as filename (remove illegal characters)
    videoTitle = videoTitle.replace(/[^A-Za-z0-9 _.-]/g, '_');

    // Extract encoding metadata if available
    let resolutionText = '';
    if (videoElem.videoWidth && videoElem.videoHeight) {
      resolutionText = `${videoElem.videoWidth}x${videoElem.videoHeight}`;  // e.g. "1920x1080"
    }
    // Suppose the page has bitrate info in an element with id "bitrate"
    let bitrateText = '';
    const bitrateElem = document.querySelector('#bitrate');
    if (bitrateElem) {
      bitrateText = bitrateElem.innerText.trim();  // e.g. "Bitrate: 5000 kbps"
    }

    console.log(`Detected video: ${videoUrl}, resolution: ${resolutionText}, bitrate: ${bitrateText}`);
    // Send message to background script to initiate download ([Message passing  |  Chrome Extensions  |  Chrome for Developers](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#:~:text=This%20communication%20uses%20message%20passing%2C,extension%20messages%20section)).
    chrome.runtime.sendMessage({
      action: 'videoFound',
      url: videoUrl,
      title: videoTitle,
      resolution: resolutionText,
      bitrate: bitrateText
    });
    // The background script will handle the rest (download and upload).
  });
})();
```

**How this works:** Once a `video-gens.com` page is loaded, the content script grabs the first `<video>` element. It retrieves the video’s source URL (`currentSrc` covers cases where the video is currently playing/selected). It then determines a title for the video – here using `document.title` (which often contains the video’s name) and sanitizing it for use as a filename. Next, it collects the **resolution** (using the video element’s `videoWidth` and `videoHeight` properties if available) and tries to get the **bitrate** (in this example, looking for an element with id `bitrate` on the page). These encoding settings are just logged or can be used for additional info. Finally, it **sends a message** to the extension’s background script with all this data. 

The message dispatch uses `chrome.runtime.sendMessage` to send a one-time JSON message to the background ([Message passing  |  Chrome Extensions  |  Chrome for Developers](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#:~:text=One)). The background script’s listener (shown earlier) receives this message and proceeds with downloading the video.

> **Note:** The content script runs **without user interaction** – as soon as the page loads and the video is detected, it triggers the process. The user doesn’t need to click anything. We restrict this script to `video-gens.com` via the manifest’s `"matches"`, so it will **not run** on other websites. The extraction of resolution/bitrate may need to be adjusted based on the actual page structure of video-gens.com, but the above approach demonstrates how to gather such info from the DOM.

## YouTube Upload Automation (`youtubeContent.js`)

This script runs on YouTube’s upload page to **automate the video upload and form filling**. When the background script sends the `startUpload` message (after the video is downloaded and the YouTube tab is ready), this content script will:

- **Fetch the downloaded video file:** It uses the provided video URL to fetch the video data as a Blob. (Since the user is already on YouTube, we cannot directly access the file from disk without user input; instead, we re-fetch it in the script. Alternatively, the extension could pass the file data via message if it was stored, but fetching by URL is simpler here, assuming the URL is accessible and the extension has host permission for it.)
- **Create a File object:** Using the Blob and the original filename, it constructs a `File` object in memory. Modern web APIs allow creating File objects from Blobs (with a name and type) ([javascript - Load image from URL into file input field - Stack Overflow](https://stackoverflow.com/questions/48817750/load-image-from-url-into-file-input-field#:~:text=let%20response%20%3D%20await%20fetch,logo.png%22%2C%20metadata%29%3B)).
- **Simulate file selection on YouTube’s form:** It finds the file input element on the YouTube upload page and programmatically sets its files to our new File. This is done by creating a `DataTransfer` object, adding our File to it, and then assigning it to the input’s `.files` property, then dispatching a `"change"` event ([javascript - Load image from URL into file input field - Stack Overflow](https://stackoverflow.com/questions/48817750/load-image-from-url-into-file-input-field#:~:text=const%20designFile%20%3D%20await%20createFile,input.dispatchEvent%28event%29%3B)). This tricks the page into thinking the user selected the video file, triggering YouTube’s upload process.
- **Fill in title and description:** Once the file is "selected", YouTube will begin uploading. We then locate the title and description input fields on the page and set their values — the title field gets the video’s name, and the description field gets the video’s size (as provided by the background script). 
- *(Optional)* **Trigger the upload (publish):** Typically, YouTube might not automatically publish the video until the user clicks “Next/Publish”. If needed, the script could also click the publish button. However, since the prompt doesn’t explicitly ask to finalize the publish, we focus on the upload initiation and field population. (The video will upload in the background; the user can review details and publish manually if desired.)

Below is `youtubeContent.js` implementing the above logic:

```js
// youtubeContent.js (runs on YouTube upload page)
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'startUpload') {
    const { videoTitle, videoSizeText, videoUrl } = message;
    console.log('Received video upload request for:', videoTitle);

    try {
      // 1. Fetch the video data as a Blob.
      const response = await fetch(videoUrl);
      const videoBlob = await response.blob();
      // Create a File object from the Blob (to mimic a file input selection) ([javascript - Load image from URL into file input field - Stack Overflow](https://stackoverflow.com/questions/48817750/load-image-from-url-into-file-input-field#:~:text=let%20response%20%3D%20await%20fetch,logo.png%22%2C%20metadata%29%3B)).
      const fileName = videoTitle.endsWith('.mp4') ? videoTitle : (videoTitle + '.mp4');
      const videoFile = new File([videoBlob], fileName, { type: "video/mp4" });

      // 2. Find the YouTube file input element on the upload page.
      const fileInput = document.querySelector('input[type="file"]');
      if (!fileInput) {
        console.error('YouTube upload file input not found!');
        return;
      }

      // 3. Use DataTransfer to simulate selecting the file ([javascript - Load image from URL into file input field - Stack Overflow](https://stackoverflow.com/questions/48817750/load-image-from-url-into-file-input-field#:~:text=const%20designFile%20%3D%20await%20createFile,input.dispatchEvent%28event%29%3B)).
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
});
```

**Explanation:** When the `startUpload` message is received, we perform an async function to fetch the video. We then convert the fetched data into a `File` object named with the video title (ensuring a `.mp4` extension and correct MIME type). Using the **DataTransfer hack** ([javascript - Load image from URL into file input field - Stack Overflow](https://stackoverflow.com/questions/48817750/load-image-from-url-into-file-input-field#:~:text=const%20designFile%20%3D%20await%20createFile,input.dispatchEvent%28event%29%3B)), we add this File to the file input element’s files list and dispatch a `change` event. This triggers YouTube’s normal upload handler as if the user manually selected the file. The code then finds the **title and description fields** on the page (YouTube’s upload interface) and sets them: the title gets the video’s name, and the description is set to “File size: X MB” (with the size provided by the background script after download). We dispatch `input` events to ensure the changes are registered by any frameworks on the page. 

At this point, YouTube will be uploading the file in the background. The extension has filled in the required fields. If desired, further automation (navigating the upload dialogs and clicking “Publish”) could be implemented in a similar manner (finding the buttons and dispatching click events), but **caution** is advised as YouTube’s UI can change and might have dynamic elements or require waiting for upload completion. 

Because **no additional authentication is done by the extension**, it relies on the fact that the user’s YouTube tab is already logged in. The extension doesn’t use YouTube’s API or OAuth; it simply automates the web UI. This keeps things simple (no API keys or tokens needed), but means the YouTube tab must be active and authenticated.

## Permissions & Edge-Specific Considerations

- **Downloads Permission:** The extension uses the Chrome/Edge Downloads API to save videos. We declare `"downloads"` in the manifest which **allows managing and initiating downloads via `chrome.downloads`** ([Declare API permissions in the manifest - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/declare-permissions#:~:text=,your%20extension%20access%20to%20the)). This lets the extension download the video file without user intervention.
- **Tabs Permission:** We include `"tabs"` in the manifest, granting the extension the ability to query and update browser tabs ([Declare API permissions in the manifest - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/declare-permissions#:~:text=,make%20use%20of%20these%20APIs)). This is necessary to locate the open YouTube tab and navigate it to the upload page, as well as to inject the upload script.
- **Host Permissions:** We specify host patterns for `video-gens.com` and `youtube.com` in `host_permissions` (for Manifest V3) or under `"permissions"` in Manifest V2 format. This ensures the content scripts can run on those domains and perform cross-origin requests if needed. For example, fetching the video from `video-gens.com` in the YouTube content script is permitted because the extension has been granted access to that host.
- **Background Operation:** The extension runs in the background without user interaction. In Edge (Chromium), if the `"background"` permission is listed, the browser may keep the extension alive even when no browser window is open, and even launch at system startup ([Declare API permissions in the manifest - Microsoft Edge Developer documentation | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/developer-guide/declare-permissions#:~:text=,permission%20with%20%206%20background)). This is useful for truly continuous operation. However, even without that special permission, the background service worker will wake when the content script sends a message or when a download event occurs, which is sufficient for this use-case.
- **Edge Compatibility:** Microsoft Edge (Chromium-based) is fully compatible with Chrome extension APIs ([Why use the Edge extension on Edge instead of Chrome's? : r/Bitwarden](https://www.reddit.com/r/Bitwarden/comments/16a18e5/why_use_the_edge_extension_on_edge_instead_of/#:~:text=%E2%80%A2)). The code and manifest provided will work on Edge just as on Chrome. One just needs to load the extension via the Edge Extensions menu (in developer mode or via the store). If publishing to the Microsoft Edge Add-ons store, you can use the same manifest; Edge-specific keys (like `"browser_specific_settings"`) are typically not required unless you need to specify an Edge store listing ID or target a minimum Edge version. In summary, **no Edge-specific code changes** are needed, but testing on Edge is recommended.
- **No User Authentication Required:** The extension itself does not handle login credentials or YouTube OAuth. We assume the user is already logged into YouTube in their browser. By switching to an existing YouTube tab (or opening one), the upload occurs in the context of that logged-in session. This keeps the extension simple – there’s no need to manage tokens or API calls. (If the user isn’t logged in, the upload page would prompt for login, in which case the automation would pause until login is completed.)

**Security/Privacy Considerations:** Because the extension operates automatically, it’s restricted to a specific domain (`video-gens.com`). It will only download videos from that domain, ignoring other sites. This prevents unwanted downloads. Also, the use of `tabs` permission means the extension can see tab URLs and modify tabs; we limit its action to finding YouTube and navigating to the known upload URL. No data is sent outside the user’s browser; the video file is downloaded and then uploaded to YouTube directly by the user’s browser. The extension does not store data long-term (beyond perhaps the downloaded file in the Downloads folder).

**Edge-specific UI:** Since this extension has no popup or browser action interface (it runs entirely in the background), the user will mainly observe its effects through downloads happening automatically and the YouTube tab reacting (navigating and populating fields). In Edge, the extension icon will appear in the toolbar (as specified by the `"action"` in the manifest with a default icon/title), but the user isn’t required to click it. You might consider adding an optional notification or badge when an upload starts or completes, but that wasn’t requested here.

---

By combining a content script to detect videos and collect metadata, a background script to handle the logic and downloads ([Message passing  |  Chrome Extensions  |  Chrome for Developers](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#:~:text=Because%20content%20scripts%20run%20in,action%20icon%20for%20that%20page)), and another content script to automate YouTube’s upload form, this Edge extension achieves the goal of end-to-end video transfer with no manual steps. The structure and APIs used are supported in Microsoft Edge (Chromium) just as in Google Chrome, ensuring compatibility and a seamless background operation.

# Debugging

Debugging a Microsoft Edge extension follows a process similar to debugging a Chrome extension, as Edge is based on Chromium. Here’s a step-by-step guide:

---

### **1. Load the Extension in Edge**
1. Open Microsoft Edge.
2. Navigate to `edge://extensions/`.
3. Enable **Developer mode** (toggle in the bottom-left corner).
4. Click **"Load unpacked"** and select your extension’s directory.

---

### **2. Open the DevTools for the Extension**
To debug different parts of the extension, you need to access different DevTools windows.

#### **Debugging the Background Script**
1. Go to `edge://extensions/`.
2. Find your extension and click **"Background page"** (if using `background.js` or `background.ts`).
3. The DevTools window opens, allowing you to inspect logs, set breakpoints, and debug errors.

#### **Debugging the Popup (Action Popup)**
1. Click on your extension icon in the Edge toolbar.
2. Right-click inside the popup and select **"Inspect"**.
3. A DevTools window opens, where you can debug popup scripts and elements.

#### **Debugging Content Scripts**
1. Open a webpage where your content script runs.
2. Press `F12` to open DevTools.
3. Navigate to **Sources > Page** and locate your script under the `Extensions` folder.
4. Set breakpoints, inspect variables, or use `console.log()` for debugging.

---

### **3. Debugging Manifest and Permission Errors**
- If your extension is not loading properly:
  - Go to `edge://extensions/` and look for error messages.
  - Check **Console logs** in the **Background page DevTools**.
  - Ensure your `manifest.json` is correctly formatted.

---

### **4. Live Reloading & Hot Updates**
- Use the **"Reload"** button in `edge://extensions/` to apply changes without restarting Edge.
- Some advanced workflows include using tools like `webpack` with a hot-reloading setup.

---

### **5. Debugging Network Requests**
If your extension makes network requests:
1. Open the DevTools window for the background page or popup.
2. Navigate to the **Network** tab.
3. Filter by `XHR` or `Fetch` to inspect API calls.

---

### **6. Handling Permissions & CSP Issues**
- Check `edge://extensions/` for permission errors.
- If your extension is blocked by **Content Security Policy (CSP)**:
  - Ensure scripts are properly loaded (e.g., no inline JavaScript in HTML).
  - Use `manifest.json` to define content security policies.

---

### **7. Debugging Storage & Messaging Issues**
- Use `chrome.storage.local.get(null, console.log)` in the **DevTools Console** to check stored data.
- Debug `chrome.runtime.sendMessage` and `chrome.runtime.onMessage` by logging messages in background and popup scripts.

---

### **8. Edge-Specific Debugging**
- Some APIs may behave slightly differently in Edge. Check for **Edge-specific compatibility issues** in:
  - `edge://compat/`
  - `edge://extensions-internals/`
  - Microsoft’s Edge extension documentation: [https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/)

---

### **9. Use the Edge DevTools Extension for Advanced Debugging**
- Microsoft provides an Edge DevTools extension to debug web content and extensions.
- Install from: [https://www.microsoft.com/en-us/edge/tools/web-developer/](https://www.microsoft.com/en-us/edge/tools/web-developer/)

---

This process should help you effectively debug your Edge extension. Let me know if you need help with a specific issue!

# Details

## 1 **content scripts can act as extremities**, while the **background script behaves as the brain**, delegating operations based on messages received from content scripts. This architecture is common in browser extensions and follows a **modular communication pattern**, where the background script centralizes decision-making while content scripts handle **per-tab interactions**.

---

### **How This Works:**
| **Component**     | **Role** |
|------------------|---------|
| **Content Scripts (Extremities)** | - Operate **inside specific web pages**, interact with the DOM.<br>- Extract **data** (e.g., video URLs, form values).<br>- Detect **user actions** (e.g., button clicks, page changes).<br>- Send messages to the background script when an event occurs.<br>- Receive messages from the background script (for DOM updates, UI changes). |
| **Background Script (Brain)** | - Runs **independently of any tab** (extension’s core logic).<br>- Acts as a **message router and command processor**.<br>- **Delegates tasks**: handles file downloads, tab switching, API calls, storage.<br>- Maintains **global state** (track tabs, manage extension-wide data).<br>- Uses `chrome.runtime.onMessage.addListener` to receive requests from content scripts and respond accordingly. |

---

### **Example Architecture for Video Download & Upload Extension**
#### **1. Content Script on `video-gens.com` (Detects and Sends Video URL)**
- Listens for when a user interacts with a video.
- Extracts the video URL, title, and metadata.
- Sends the details to the **background script**.

```js
// query_likes_content_script.js (Runs in `video-gens.com`)
document.addEventListener("DOMContentLoaded", () => {
    let video = document.querySelector("video");
    if (!video) return;

    let videoUrl = video.currentSrc || video.src;
    let videoTitle = document.title;

    console.log("Detected video:", videoUrl);

    // Send video details to the background script
    chrome.runtime.sendMessage({
        action: "videoFound",
        url: videoUrl,
        title: videoTitle
    });
});
```

---

#### **2. Background Script (Delegates Download & Tab Switching)**
- Receives the video URL from the content script.
- Initiates a **download**.
- Detects when the download is **complete**.
- Locates an open **YouTube upload tab**, or opens one.
- Sends video details to the **YouTube upload content script**.

```js
// background.js (Runs persistently, handling logic)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "videoFound") {
        let videoUrl = message.url;
        let videoTitle = message.title.endsWith(".mp4") ? message.title : message.title + ".mp4";

        console.log("Downloading video:", videoUrl);
        chrome.downloads.download({
            url: videoUrl,
            filename: videoTitle,
            saveAs: false
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error("Download failed:", chrome.runtime.lastError);
                return;
            }
            
            // Wait for download completion
            chrome.downloads.onChanged.addListener(function onChanged(delta) {
                if (delta.id === downloadId && delta.state && delta.state.current === "complete") {
                    chrome.downloads.onChanged.removeListener(onChanged);

                    console.log("Download complete. Finding YouTube tab...");

                    // Locate YouTube upload tab
                    chrome.tabs.query({ url: "*://www.youtube.com/upload*" }, (tabs) => {
                        if (tabs.length === 0) {
                            console.warn("No open YouTube tab found. Opening one...");
                            chrome.tabs.create({ url: "https://www.youtube.com/upload", active: true }, (tab) => {
                                sendUploadDetails(tab.id, videoTitle);
                            });
                        } else {
                            let ytTab = tabs[0];
                            sendUploadDetails(ytTab.id, videoTitle);
                        }
                    });
                }
            });
        });
    }
});

function sendUploadDetails(tabId, videoTitle) {
    chrome.tabs.onUpdated.addListener(function listener(updatedTabId, info) {
        if (updatedTabId === tabId && info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);
            chrome.tabs.sendMessage(tabId, {
                action: "startUpload",
                videoTitle: videoTitle
            });
        }
    });
}
```

---

#### **3. Content Script on YouTube Upload Page (Handles Form Automation)**
- Receives video details from the **background script**.
- Uses JavaScript to **simulate selecting a file**.
- Fills in the **title** and **description** fields.

```js
// youtubeContent.js (Runs on YouTube Upload Page)
chrome.runtime.onMessage.addListener(async (message) => {
    if (message.action === "startUpload") {
        console.log("Preparing to upload:", message.videoTitle);
        
        // Locate file input field
        let fileInput = document.querySelector('input[type="file"]');
        if (!fileInput) {
            console.error("YouTube upload file input not found!");
            return;
        }

        // Simulate selecting the file
        let dt = new DataTransfer();
        let videoFile = new File([""], message.videoTitle, { type: "video/mp4" });
        dt.items.add(videoFile);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));

        // Set title and description fields
        let titleField = document.querySelector('input#title');
        let descField = document.querySelector('textarea#description');
        if (titleField) {
            titleField.value = message.videoTitle;
            titleField.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (descField) {
            descField.value = "Automated upload from VideoGen Extension";
            descField.dispatchEvent(new Event('input', { bubbles: true }));
        }

        console.log("Video details set in YouTube form.");
    }
});
```

---

### **Trade-Offs of This Architecture**
| **Pros** | **Cons** |
|----------|----------|
| - [x] Keeps content scripts lightweight and focused on specific tasks (DOM interaction, event detection). | - [ ] Requires message passing (slightly more complexity). |
| - [x] Background script is **single source of truth**, manages downloads, tab switching, and global state. | - [ ] More communication overhead (but minimal for most extensions). |
| - [x] Allows scaling (multiple content scripts running in different tabs can report to a **single** background script). | - [ ] If background script is killed in Manifest V3 (service worker), it must be reloaded when a message is sent. |
| - [x] Secure – content scripts **cannot** access privileged APIs like `downloads` or `tabs`, reducing risk of malicious use. | - [ ] Content scripts **cannot see each other**, only background script manages cross-tab coordination. |

---

### **Should You Have One Content Script Per Tab?**
- **Yes**, because each webpage (e.g., `video-gens.com`, YouTube) runs in its own sandboxed environment.
- Each content script only **modifies or extracts data from its own tab**.
- The background script acts as the **global coordinator** (brain), managing all tabs.
- This avoids redundancy: **one background script handles all tabs**, rather than running duplicate logic in every tab.

---

### **Final Thoughts**
- **Content scripts = "sensors and hands" (interact with specific pages).**
- **Background script = "brain" (centralized logic, coordinating tasks).**
- **Use `chrome.runtime.sendMessage()` and `chrome.runtime.onMessage.addListener()` for efficient communication.**
- This pattern **scales well**, allowing multiple content scripts across multiple tabs to work together with a **single** background script managing logic.

By following this model, your extension remains **modular, efficient, and easy to maintain** while leveraging the **separation of concerns** principle.