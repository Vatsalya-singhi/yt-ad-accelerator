
/**
 * FOR CREATIVE USE ONLY
*/


// SKIP BTN FUNCTION
function skipBtnClick() {
    try {
        const skipBtnXPath = '//*[@id="skip-button:m"]/span/button';
        const getElementByXpath = (path) => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const skipBtn1 = getElementByXpath(skipBtnXPath);
        if (skipBtn1) {
            skipBtn1.click();
            console.info('skip button click by XPath successful');
            return true;
        }

        const skipBtnClassName = "ytp-ad-skip-button-modern ytp-button";
        const skipBtnList = document.getElementsByClassName(skipBtnClassName);
        if (skipBtnList?.length > 0) {
            skipBtnList[0].click();
            console.info('skip button click by ClassName successful');
            return true;
        }
    } catch (err) {
        console.error(err);
    }
    return false;
}

// AD VIDEO MANIPULATION FUNCTION
function adVideoManipulation() {
    try {
        const getElementByXpath = (path) => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        // "ad-created ad-showing ad-interrupting"
        const elementXPath = '//*[@id="movie_player" and contains(@class, "ad-showing")]/div[1]/video';
        const adElement = getElementByXpath(elementXPath);
        // no ads found
        if (!adElement) return false;

        // set params
        adElement.volume = 0;
        adElement.muted = true;
        adElement.playbackRate = 16; // max video playback speed
        console.info("ad video manipulation successful");
        return true;
    } catch (err) {
        console.error(err);
    }
    return false;
}

// MAIN FUNCTION
function main() {
    var e = document.getElementById('movie_player');
    if (!e) return;
    try {
        var observer = new MutationObserver((mutation) => {
            let count = 0;
            if (skipBtnClick()) count++;
            if (adVideoManipulation()) count++;
        })
        observer.observe(e, {
            subtree: false, // default
            childList: false, // default
            attributes: true, // monitor select element attribute only 
            attributeFilter: ['class'], // specific attribute to monitor
            characterData: false // default
        })
    } catch (err) { }
}

// after content load
setTimeout(() => {
    main();
}, 1000);