port.onMessage.addListener((message, sender, sendResponse) => {
    message = MSG || message; // message cached ?
    switch (message.action) {
        case 'generateEnglishPrompt':
            const inputText = document.querySelector('textarea[aria-label]');
            //document.querySelectorAll('span[jsname="jqKxS"')[0].textContent;
            //document.querySelectorAll('span[jsname="W297wb"')[0].textContent;
            //if (inputText) {
                observeDOMForNewElement ('[jsname="W297wb"]', (_) => {
                    const translatedText = Array
                        .from (document.querySelectorAll('span[jsname="txFAF"]'))
                        .map ((sentence) => sentence.textContent)
                        .join (' ');
                    if (translatedText.textContent && (translatedText.textContent != inputText.textContent)) {
                        const langElement = document
                        .querySelector('[class="VfPpkd-jY41G-V67aGc"]')
                        .textContent
                        .replace(/\s*\-\s*Detected$/,'');
                        message.prompt = `${translatedText.textContent} (Original ${langElement}: ${message.prompt})`;
                    }
                    message.prompt = message.prompt || message.videoTitle; // Non empty prompts //
                    message.action = "EnglishPromptCompleted";
                    if (port)
                        port.postMessage (message);
                    else {
                        connectPort ();
                        port.postMessage (message);
                    }
                });
                /*
            } else {
                message.prompt = message.prompt || message.videoTitle; // No empty prompts //
                message.action = "EnglishPromptCompleted";
                if (port)
                    port.postMessage (message);
                else {
                    connectPort ();
                    port.postMessage (message);
                }
            }
                */
            break;
    }
});

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

function doRemixF (msg) {
    const uuid = msg.uuid;
    const xpath = msg.xpath;
    if (uuid === _uuid_ ) {
        /*
        const remix_btn = findElements ('div', 'class', /w\-full\struncate/, /Remix/);
        if (remix_btn) {
            remix_btn.click ();
        }
        */
        //const resolution = msg.resolution;
        //const duration = msg.duration;
        //const remix = msg.remix;
        //simulateKeyPress ('r');
        //invokeCtlFromXPath (xpath); // set focus remix_window.click ()
        //setResolution (msg);
        //setTotalNewVideos(msg);
        //setRemixStrength (msg);
        // generate video ...
        // wait for video [body] to generate ...
        // navigate to new video url
        // add to Favorites
        // get video title
        // doDownload (); // d/l [video].mp4
        // doDownload (); // d/l [video].log (title + english prompt [+ prompt])
        /*
        // close window
        port.postMessage ({
            //action:"videoCompleted",
            action:"downloadCompleted",
            uuid: uuid,
            title: newVideoTitleW,
            prompt: prompt,
            resolution: resolution,
            duration: duration,
            remix: remix
        });
        */
    } // end if(uuid === _uuid_ )
} // end doRemixF

function downloadLog (msg) {
    const totalVideosInt64 = totalLikesInt64.length;
    const fileTitle = `${totalVideosInt64}-${message.videoTitle.replace(/[\W\s]/g, '_')}.log`;
    const fileContents = JSON.stringify (message, null, 2);
    const blob = new Blob ([fileContents], { type: 'application/json' });
    const videoUrl = URL.createObjectURL (blob);
    chrome.downloads.download ({
        url: videoUrl,
        filename: fileTitle,   // Save as this name in the user's Downloads folder
        saveAs: false           // No Save As dialog, download automatically
    }, (downloadId) => {
      if (chrome.runtime.lastError || !downloadId) {
          console.error('Download failed:', chrome.runtime.lastError);
      } else {
            // Monitor the download until it’s complete.
            chrome.downloads.onChanged.addListener(function onChanged(delta) {
                if (delta.id === downloadId && delta.state && delta.state.current === 'complete') {
                    // Download is complete&#8203;:contentReference[oaicite:15]{index=15}.
                    chrome.downloads.onChanged.removeListener(onChanged);
                    console.info (`${totalVideosInt64}. video log downloaded.`);
                    /*
                    // Get the file size from the download item
                    chrome.downloads.search({ id: downloadId }, function(results) {
                        let fileSizeBytes = results && results[0] ? results[0].fileSize : 0;
                        let fileSizeMB = fileSizeBytes ? (fileSizeBytes / (1024*1024)).toFixed(2) + ' MB' : '';
                        
                        // Find an open YouTube tab.
                        chrome.tabs.query({ url: "*://*.youtube.com/*" }, function(tabs) {
                            if (tabs.length === 0) {
                                console.warn('No open YouTube tab found. Opening a new one.');
                                openTab({ url: "https://www.youtube.com/upload" });
                            } else {
                                // Use the first YouTube tab found (could refine to specific tab if needed).
                                let ytTab = tabs[0];
                                // Navigate it to the upload page (if not already there).
                                chrome.tabs.update(ytTab.id, { url: "https://www.youtube.com/upload", active: false }, 
                                updatedTab => {
                                    ;;
                                });
                            }
                        });
                    });
                    */
                } // end if (delta.id === downloadId ... )
            }); // end chrome.downloads.onChanged.addListener
            // cleanup url //
            setTimeout (() => {URL.revokeObjectURL(videoUrl)});
        } // end if/else
    }); // end chrome.downloads.download
} // end downloadLog
/*
const port = chrome.runtime.connect ({ name: "google-translate" });
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
});
*/

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
            const inputText = document.querySelector('textarea');
            const iid = setTimeout (() => {
                clearTimeout (iid);
                const stranslatedText = document.querySelector('[jsname="W297wb"]');
                const langElement = document.querySelector('[class="VfPpkd-jY41G-V67aGc"]').textContent.replace(/\s*\-\s*Detected$/,'');
                message.prompt = `${translatedText.textContent} (Original ${langElement} Prompt: ${message.prompt})`;
            }, 800);
            /*
            observeDOMForNewElement ('[jsname="W297wb"]', (translatedText) => {
                if (translatedText.textContent != inputText.textContent) {
                    const langElement = document
                      .querySelector('[class="VfPpkd-jY41G-V67aGc"]')
                      .textContent
                      .replace(/\s*\-\s*Detected$/,'');
                    message.prompt = `${translatedText.textContent} (Original ${langElement} Prompt: ${message.prompt})`;
                }
            });
            */
            message.action = "EnglishPromptCompleted";
            port.postMessage (message);
            break;
        }
        return true;
    });
} // end connectPort

function Init () {
  document.addEventListener ('keydown', (keyCodeEvent) => {
      if (keyCodeEvent.shiftKey) { // [Shift] Youtube
          const input_field = document.querySelectorAll('div[id=textbox]');
          const msg = messageQueue[0];
          const videoTitle = msg.videoTitle;
          const prompt = input_field[1].textContent.replace (/^Prompt:(.+)\n/, `${msg.prompt}`);
          const originalDescriptor = Object.getOwnPropertyDescriptor (Node.prototype, "textContent");
          Object.defineProperty(input_field[0],"textContent", {
              set: function (u) {
                  return originalDescriptor.set.call(this, videoTitle);
              },
              get: function () {
                  return originalDescriptor.get.call(this);
              }
          });
          Object.defineProperty(input_field[1],"textContent", {
              set: function (u) {
                  return originalDescriptor.set.call(this, prompt);
              },
              get: function () {
                  return originalDescriptor.get.call(this);
              }
          });
          input_field[0].textContent = videoTitle;
          input_field[1].textContent = prompt;
      } // end if (keyCodeEvent.shiftKey)
  });
  port.postMessage ({ action: "url-youtube" });
} // end Init

function Init () {
  document.addEventListener ('keydown', (keyCodeEvent) => {
      if (keyCodeEvent.shiftKey) { // [Shift] Youtube
          const input_field = document.querySelectorAll('div[id=textbox]');
          const msg = messageQueue[0];
          setInterval (() => {
              input_field[0].textContent = msg.videoTitle;
              input_field[1].textContent = input_field[1].textContent.replace (/^(Prompt:.+)\n/, `${msg.prompt}`);
          }, 1);
          /*
          let observer = new MutationObserver (() => {
              const input_field = document.querySelectorAll('div[id=textbox]');
              const msg = messageQueue[0];
              if (input_field[0].textContent !== msg.videoTitle) {
                  input_field[0].textContent = msg.videoTitle;
                  input_field[1].textContent = input_field[1].textContent.replace (/^(Prompt:.+)\n/, `${msg.prompt}`);
              }
          });
          observer.observe (document.querySelector('div[id=textbox]'),{ childList: true });
          */
          //input_field[0].textContent = "Hello";//msg.videoTitle;
          //input_field[1].textContent = "World";//input_field[1].textContent.replace (/^(Prompt:.+)\n/, `${msg.prompt}`);
          //input_field[0].dispatchEvent (new Event ('input', { bubbles: true }));
          //input_field[1].dispatchEvent (new Event ('input', { bubbles: true }));
      } // end if (keyCodeEvent.shiftKey)
  });
  /*
  const xpath = '/html/body/ytcp-uploads-dialog/tp-yt-paper-dialog/div/ytcp-uploads-file-picker/div/ytcp-button/ytcp-button-shape/button';
  const filePicker = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
  );//document.getElementsByXPath ();//document.querySelectorAll('button')[13];
  filePicker.click ();
  */
  //document.querySelectorAll('button')[13].click ();
  port.postMessage ({ action: "url-youtube" });
} // end Init

const port = chrome.runtime.connect ({ name: "video-details" });
port.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'doRemix':
        UI_BUTTON['remix'].click ();
        //message.xpath = select_remix_xpath;
        //doRemixF (message);
        /*
        const iid = setInterval (() => {
            if (document.location.href.match (/sora\.com\/t\//)) {
                clearInterval (iid);
                const urlSearch = document.location.href;
                const url = document.location.href.replace (/\/t\//, '/g/');
                port.postMessage ({ action: "url-navigate", url: url, urlSearch: urlSearch });
            } // end if (document.location.href...)
        }, 1);
        */
        document.addEventListener ('keydown', (keyCodeEvent) => {
            if (keyCodeEvent.shiftKey) { // [Shift] Youtube
                const urlSearch = "*://sora.com/*" ;// document.location.href;
                const url = "https://www.youtube.com/upload"; //document.location.href.replace (/\/t\//, '/g/');
                port.postMessage ({ action: "url-navigate", url: url, urlSearch: urlSearch });
            } // end if (document.location.href...)
        }, false);
        break;

        case 'startUpload':
        //invokeCtlFromXPath (addToFAVs_xpath);
        //const vidTitle = getElementByXPath (select_generated_video_title_xpath);
        //message.videoTitle = vidTitle.textContent;
        //simulateKeyPress ('f', 70); // add to FAVS
        //simulateKeyPress ('d', 68); // d/l video
        /*
        const iid_su = setInterval (() => {
            let clearFlag = false;
            findElements ('button', 'textContent', null, /Download/)
                .map((elem) => {
                    elem.click ();
                    clearFlag = true;
                    return elem;
                });
            if (clearFlag) {
                clearInterval (iid_su);
                message.action = 'downloadCompleted';
                port.postMessage (message);
            }
        }, 1);
        */
        break;

        case 'completeDownload':
        break;

        case 'navigateToVideoURL':
        break;

        case 'doDownload':
        break;
    }
    return true;
});

port.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
      case 'startUpload':
      const filePicker = document.querySelector('ytcp-button[id="select-files-button"]');
      filePicker.click ();        
      document.addEventListener ('keydown', (keyCodeEvent) => {
          if (keyCodeEvent.shiftKey) { // [Shift] Youtube
              const input_field = document.querySelectorAll('ytcp-social-suggestion-input[id="input"]');
              input_field[0].textContent = message.videoTitle;
              input_field[1].textContent.replace (/^Prompt:.+\n/, `${message.prompt}\n`);
          } // end if (keyCodeEvent.shiftKey)
      });
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

// Listen for one-time messages from content scripts&#8203;:contentReference[oaicite:13]{index=13}.
chrome.runtime.onConnect.addListener ((port) => {
  activePorts[port.name] = port;  // Maintain a reference to keep the port open
  port.onMessage.addListener((message, sender, sendResponse) => {
      try {
          switch (message.action) {
              case 'NewDataIndexElementsFound':
                ;;
              break;

              case 'DataIndexElementClicked':
              InprocessQueue.push (message);
              break;

              case 'videoFound':
              message.prompt = stripSymbols(message.prompt);
              standardizeEnglishPrompt (message);
              message.action = 'generateEnglishPrompt';
              // cache workload //
              buffer.push (message);
              break;

              case 'translateSiteReady':
              activePorts['google-translate'].postMessage (buffer.shift());
              break;

              case 'EnglishPromptCompleted':
              const uuid = message.uuid;
              const tmpResolutionW = message.resolution;
              const tmpDurationW = message.duration;
              const videoTitleW = message.videoTitle;
              const prompt = message.prompt;
              const { status, resolution, duration, remix } = calcResolutionAndDuration (tmpResolutionW, tmpDurationW);
              const msg_body = {
                  action: "doRemix",
                  uuid: uuid,
                  title: videoTitleW,
                  prompt: prompt,
                  resolution: resolution,
                  duration: duration,
                  remix: remix
              };
              const msg_upload_body = {
                  action: "startUpload",
                  uuid: uuid,
                  title: videoTitleW,
                  prompt: prompt,
                  resolution: resolution,
                  duration: duration,
                  remix: remix
              };
              uploadQueue.push (msg_upload_body);
              if (status == 'continue') {
                  activePorts['video-details'].postMessage(msg_body);
              } // end if (status === 'continue')
              break;

              case 'url-navigate':
              //const i = Math.max (uploadQueue.length-1,0);
              //const msg = uploadQueue[i];
              const url = message.url;
              const urlSearch = message.urlSearch;
              chrome.tabs.query({ url: urlSearch }, function(tabs) {
                  if (tabs.length === 0) {
                      console.warn('No open translate tab found. Opening a new one.');
                      openTab (url); // open tab in the bg
                  } else {
                      // Use the first translate tab found
                      let translateTab = tabs[0];
                      // Navigate it to the translate page (if not already there)
                      chrome.tabs.update(
                          translateTab.id, 
                          { url: url, active: true }, 
                          function (updatedTab) {
                              console.log('Updating existing translate.google.com tab...');
                          }
                      );
                  }
              });
              //chrome.tabs.update (sender.tab.id, { url:url });
              //msg.action = "startUpload";
              //uploadQueue[i] = msg;
              // In your service worker (sw.js)
              //openTab (url);
              /*
              chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                  if (tabs && tabs.length > 0) {
                      const currentTab = tabs[0];
                      console.log("Current tab URL:", currentTab.url);
                      
                      // Update the URL of the current tab
                      chrome.tabs.update(currentTab.id, {url: url});
                  }
              });
              */
              //activePorts['youtube-upload'].postMessage (msg);
              break;

              case 'url-youtube': // site-ready //
              //const ii = Math.max (uploadQueue.length-1,0);
              const msg_2 = uploadQueue.shift ();//[ii];
              msg_2.action = "startUpload";
              activePorts['youtube-upload'].postMessage (msg_2);
              break;

              case 'downloadCompleted':
              chrome.tabs.query ({ url:message.url }, (tabs) => {
                  tabs.forEach (tab => {
                      if (tab.id) {
                          chrome.tabs.update (tab.id, { url:'https://www.youtube.com/upload' });
                      }
                  });
              });
              downloadLog(message);
              break;
          } // end switch (message.action)

          // Periodically check for new videos (small overhead)
          setInterval(preEvaluateVideo, 1);
      }
      catch (e) {
        
      } // end try/catch
      // Return true to indicate we'll send a response asynchronously (if needed).
      return true;
  }); // end port.onMessage.addListener
  port.onDisconnect.addListener (() => {
      console.info ('background.js connection to background service worker port, disconnected.')
  }); // end port.onDisconnect
}); // end chrome.runtime.onConnect

/*
function Init () {
    if ((document.readyState != 'complete') || getValueFromXPath(resolution_xpath) === '')
        return;
    clearInterval (intID);
    document.addEventListener('DOMContentLoaded', parseBody);
} // end Init
 */

/*
// Run initialization based on document state
if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', parseBody);
} else {
    // If DOM is already loaded
    parseBody();
} // end if (document.readyState === 'loading')

/*
(function() {
  // Wait for the DOM to load or video element to be ready
  window.addEventListener('DOMContentLoaded', () => {
    /*
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
    // Send message to background script to initiate download&#8203;:contentReference[oaicite:22]{index=22}.
    chrome.runtime.sendMessage({
      action: 'videoFound',
      url: videoUrl,
      title: videoTitle,
      resolution: resolutionText,
      bitrate: bitrateText
    });
    // The background script will handle the rest (download and upload).
    * /
  });
})();
*/

    /*
    function simulateKeyPress () {
        let evt = new KeyboardEvent("keydown", {
            key: "r",
            code: "KeyR",
            keyCode: 82,
            which: 82,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(evt);
    }
    let script = document.createElement('script');
    script.textContent = `(${simulateKeyPress.toString()})();`;
    document.documentElement.appendChild(script);
    script.remove ();
    */

                    /* 
                    chrome.tabs.onUpdated.addListener(function listener(id, info) {
                        if (id === updatedTab && info.status === 'complete') {
                            // Remove the listener to avoid memory leaks
                            chrome.tabs.onUpdated.removeListener(listener);
                            
                            // Now the tab is fully loaded, send your message
                            message.action = 'generateEnglishPrompt';
                            chrome.tabs.sendMessage(message);
                        }
                    });
                    */

        /*
        if (message.action === 'videoFound') {
          /*
          const videoUrl = message.url;
          let videoTitle = message.title || 'Video';
          if (!videoTitle.toLowerCase().endsWith('.mp4')) {
            videoTitle += '.mp4';  // ensure the filename has .mp4 extension
          }

          //console.log('Downloading video:', videoUrl);
          // Initiate download of the video file using the Downloads API&#8203;:contentReference[oaicite:14]{index=14}.
          /*
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
                  // Download is complete&#8203;:contentReference[oaicite:15]{index=15}.
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
        * /
        }
        */

let taskQueue = [];
let callbackID = null
let siteReadyFlag = false;

function waitForElementRefresh(selector, callback) {
    const targetNode = document.querySelector(selector);

    if (!targetNode) {
        console.error("Element not found:", selector);
        return;
    }

    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList" || mutation.type === "attributes") {
                observer.disconnect(); // Stop observing after detecting a change
                callback(targetNode);
                return;
            }
        }
    });

    observer.observe(targetNode, { childList: true, subtree: true, attributes: true });
} // end waitForElementRefresh

const keyCodeMap = {
    "a": 65, "b": 66, "c": 67, "d": 68, "e": 69, "f": 70, "g": 71,
    "h": 72, "i": 73, "j": 74, "k": 75, "l": 76, "m": 77, "n": 78,
    "o": 79, "p": 80, "q": 81, "r": 82, "s": 83, "t": 84, "u": 85,
    "v": 86, "w": 87, "x": 88, "y": 89, "z": 90,
    "0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54,
    "7": 55, "8": 56, "9": 57,
    "Enter": 13, "Escape": 27, "Space": 32, "Tab": 9,
    "ArrowUp": 38, "ArrowDown": 40, "ArrowLeft": 37, "ArrowRight": 39
};

function simulateKeyPress (key, keyCode) {
    let evt = new KeyboardEvent("keydown", {
        key: key,
        //code: "KeyR",
        keyCode: keyCodeMap[key] || keyCode,
        which: keyCodeMap[key] || keyCode,
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(evt);
} // end simulateKeyPress

function invokeCtlFromXPath (xpath) {
    let ret = false;
    const ctl = getElementByXPath(xpath);
    if (ctl) {
        try {
            ctl.click();
            ret = true;
        }
        catch (e) {
            console.warn (`Method call: push_video_details_content_script::invokeCtlFromXPath: ${JSON.stringify(e)}`);
        }
    }
    return ret;
} // end invokeCtlFromXPath

function parseBody () {
    // Allow updates when page is ready
    // Send message to background script to initiate video remix.
    const textTranslatOption = getValueFromXPath(select_text_translate_xpath);
    if (textTranslatOption === '')
        return;
    clearInterval (intID);
    /* 
    invokeCtlFromXPath (select_text_translate_xpath);
    invokeCtlFromXPath (select_auto_detect_input_xpath);
    invokeCtlFromXPath (select_english_output_xpath);
     */
    // Init bg listener
    port.postMessage ({ action: "translateSiteReady" });
} // end parseBody

const select_text_translate_xpath = "//*[@id=\"yDmH0d\"]/c-wiz/div/div[2]/c-wiz/div[1]/nav/div[1]/div/button";
const select_auto_detect_input_xpath = "//*[@id=\"yDmH0d\"]/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]/div[1]/c-wiz/div[2]/c-wiz/div[1]/div/div[3]/div/div[1]/span/div[1]/div[2]";
const select_english_output_xpath = "//*[@id=\"i15\"]";
const textarea_input_xpath = "//*[@id=\"yDmH0d\"]/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]/div[2]/div[2]/div/c-wiz/span/span/div/div[1]";
const textarea_translation_xpath = "//*[@id=\"yDmH0d\"]/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]/div[2]/div[2]/c-wiz/div/div[6]/div/div[1]/span[1]/span/span";
const detected_language_xpath = "//*[@id=\"c58\"]/span[1]";

const port = chrome.runtime.connect ();
port.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'generateEnglishPrompt':
        /* 
        let ret = message.prompt;
        message.xpath = select_remix_xpath;
        invokeCtlFromXPath (select_text_translate_xpath);
        invokeCtlFromXPath (select_auto_detect_input_xpath);
        invokeCtlFromXPath (select_english_output_xpath);
         */
        const inputText = document.querySelector('textarea[aria-label]'); //getElementByXPath (textarea_input_xpath);
        // simulate input event //
        /*
        let event = new Event ({ 
            type:'input',
            bubbles: true,
            cancelable: true,
            data: message.prompt // update input in the bg
        });
        inputText.value = message.prompt;
        inputText.textContent = message.prompt;
        inputText.dispatchEvent(event);
        * /
        inputText.focus();
        inputText.value = message.prompt;        
        // Create and dispatch an input event to trigger Google Translate
        const inputEvent = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
        });
        inputEvent.dispatchEvent(inputEvent);
        */
        // Finally dispatch the input event
        //inputText.dispatchEvent(new Event('input', { bubbles: true }));
        // todo: wait for page to render //
        observeDOMForNewElement ('[jsname="W297wb"]', (translatedText) => {
            if (translatedText.textContent != inputText.textContent) {
                const langElement = document.querySelector('.source-language div span') || document.querySelector('.sl-wrap span');
                message.prompt = `${translatedText.textContent} (Original ${ langElement.textContent.trim() }: ${message.prompt})`;
            }
            message.action = "EnglishPromptCompleted";
            port.postMessage (message);
        });
        /*
        const translatedText = document.querySelector ('[jsname="W297wb"]'); //getElementByXPath (textarea_translation_xpath);
        if (translatedText == null) {
            translatedText.addListener('')
        }
        */
        break;
    }
});