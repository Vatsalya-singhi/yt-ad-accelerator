(() => {
    var observer = null;
    var adSkipCount = 0;

    setTimeout(() => {
        try {
            // Function to check the initial state of a class on an element
            adVideoManipulation();
            skipBtnClick();
        } catch (err) { }
    }, 1000)

    setTimeout(() => {
        if (!observer) {
            main();
        }
    })

    /**
     * MAIN FUNCTIONS
    */

    function main() {
        const e = document.getElementById('movie_player');
        if (!e) { return; }

        try {
            // Create an observer instance
            observer = new MutationObserver((mutation) => {
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

            // Function to check the initial state of a class on an element
            adVideoManipulation();
            skipBtnClick();
        } catch (err) { }
    }

    /**
     * HELPER FUNCTIONS
    */

    function skipBtnClick() {
        try {
            const skipBtnXPath = '//span[@class="ytp-ad-skip-button-container"]/button';
            const getElementByXpath = (path) => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            const skipBtn1 = getElementByXpath(skipBtnXPath);
            if (skipBtn1) {
                skipBtn1.click();
                console.info('skip button click by XPath successful');
                incrementAdSkipCount();
            }

            const skipBtnList = [];
            const targetClassNames = ["ytp-ad-skip-button-modern", "ytp-ad-skip-button", "ytp-ad-skip-button-modern ytp-button", "ytp-ad-skip-button ytp-button", "ytp-ad-skip-button-container", "ytp-skip-ad-button"];
            targetClassNames.forEach((classNames) => {
                skipBtnList.push(...document.getElementsByClassName(classNames));
            });

            skipBtnList.push(document.querySelector('[id^="skip-button"]'));

            // if (skipBtnList.length > 0) {
            skipBtnList.forEach((btn) => {
                if (btn?.click()) {
                    console.info('skip button click by ClassName/ID successful');
                    incrementAdSkipCount();
                }
            });
            // }

        } catch (err) { }
    }

    function adVideoManipulation() {
        try {
            const getElementByXpath = (path) => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            const elementXPath = '//*[@id="movie_player" and contains(@class, "ad-showing")]/div[1]/video';
            const adElement = getElementByXpath(elementXPath);

            if (adElement) {
                // set params
                adElement.volume = 0;
                adElement.muted = true;
                adElement.playbackRate = 16; // max video playback speed
                incrementAdSkipCount();
            }

        } catch (err) { }
    }


    function incrementAdSkipCount() {
        adSkipCount++;
        chrome.runtime.sendMessage({ action: "incrementAdSkipCount", count: adSkipCount });
    }


    // Disconnect the observer when the tab is unloaded
    window.addEventListener('beforeunload', () => {
        if (observer) {
            observer.disconnect();
            observer = null;
            console.info('observer disconnected');
        }
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "disconnectObserver") {
            if (observer) {
                observer.disconnect();
                observer = null;
                console.info('observer disconnected via message');
            }
        }
    });

})();