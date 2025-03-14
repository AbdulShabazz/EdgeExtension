
const select_text_translate_xpath = "//*[@id=\"yDmH0d\"]/c-wiz/div/div[2]/c-wiz/div[1]/nav/div[1]/div/button";
const select_auto_detect_input_xpath = "//*[@id=\"yDmH0d\"]/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]/div[1]/c-wiz/div[2]/c-wiz/div[1]/div/div[3]/div/div[1]/span/div[1]/div[2]";
const select_english_output_xpath = "//*[@id=\"i15\"]";
const textarea_input_xpath = "//*[@id=\"yDmH0d\"]/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]/div[2]/div[2]/div/c-wiz/span/span/div/textarea";
const textarea_translation_xpath = "//*[@id=\"yDmH0d\"]/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]/div[2]/div[2]/c-wiz/div/div[6]/div/div[1]/span[1]/span/span";
const detected_language_xpath = "//*[@id=\"c58\"]/span[1]";

let callbackID = null
let siteReadyFlag = false;
let taskQueue = [];

const port = chrome.runtime.connect ();
port.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'generateEnglishPrompt':
        let ret = message.prompt;
        message.action = "EnglishPromptCompleted";
        message.xpath = select_remix_xpath;
        invokeCtlFromXPath (select_text_translate_xpath);
        invokeCtlFromXPath (select_auto_detect_input_xpath);
        invokeCtlFromXPath (select_english_output_xpath);
        const inputText = getElementByXPath (textarea_input_xpath);
        inputText.textContent = message.prompt;
        let event = new Event ({ type:'input'});
        inputText.dispatchEvent(event);
        const translatedText = getElementByXPath (textarea_translation_xpath);
        if (translatedText.textContent != inputText.textContent) {
            const lang = getValueFromXPath (detected_language_xpath);
            message.prompt = `${message.prompt} (Original ${lang}: ${translatedText.textContent})`;
        }
        port.postMessage (message);
        break;
    }
});

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

function getValueFromXPath(xpath) {
    let ret = '';
    const result = getElementByXPath(xpath);
    if (result) {
        ret = result.textContent.trim();
    }
    return ret;
} // end getValueFromXPath

function parseBody () {
  // Send message to background script to initiate video remix.
  const textTranslatOption = getValueFromXPath(select_text_translate_xpath);
  if (textTranslatOption === '')
      return;
  clearInterval (intID);
  invokeCtlFromXPath (select_text_translate_xpath);
  invokeCtlFromXPath (select_auto_detect_input_xpath);
  invokeCtlFromXPath (select_english_output_xpath);
  // Init bg listener
  siteReadyFlag = true;
} // end parseBody

let intID = setInterval(parseBody, false);