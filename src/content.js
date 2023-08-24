
/**
 * FOR CREATIVE USE ONLY
*/

// SKIP BTN FUNCTION
function skipBtnClick() {
    try {
        const skipBtnXPath = '//span[@class="ytp-ad-skip-button-container"]/button';
        const getElementByXpath = (path) => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const skipBtn1 = getElementByXpath(skipBtnXPath);
        if (skipBtn1) {
            skipBtn1.click();
            console.info('skip button click by XPath successful');
            return true;
        }

        const skipBtnList = [];
        const targetClassNames = ["ytp-ad-skip-button-modern ytp-button", "ytp-ad-skip-button ytp-button", "ytp-ad-skip-button-container"];
        targetClassNames.forEach((classNames) => {
            skipBtnList.push(...document.getElementsByClassName(classNames));
        });
        if (skipBtnList.length !== 0) {
            skipBtnList.forEach(btn => btn?.click());
            console.info('skip button click by ClassName successful');
            return true;
        }
    } catch (err) {
        console.error("skip btn click error=>", err);
    }
    return false;
}

// AD VIDEO MANIPULATION FUNCTION
function adVideoManipulation() {
    try {
        const getElementByXpath = (path) => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
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
        console.error("ad manipulation error=>", err);
    }
    return false;
}

// MAIN FUNCTION
function main() {
    const e = document.getElementById('movie_player');
    if (!e) return;
    try {
        const observer = new MutationObserver((mutation) => {
            skipBtnClick();
            adVideoManipulation();
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
});