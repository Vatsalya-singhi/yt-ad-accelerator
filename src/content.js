(() => {
    var observer = null;
    var observer2 = null;
    var adSkipCount = 0;

    setTimeout(() => {
        try {
            // Function to check the initial state of a class on an element
            adVideoManipulation();
            skipBtnClick();
            // add enforcement listener to close the popup
            enforcementListener();
        } catch (err) { }
    }, 1000)

    setTimeout(() => {
        if (!observer) {
            main();
        }
        if (!observer2) {
            enforcementListener();
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

    function enforcementListener() {
        // const xpath = '/html/body/ytd-app/ytd-popup-container/tp-yt-paper-dialog';
        const xpath = '/html/body/ytd-app/ytd-popup-container';
        const e = getElementByXpath(xpath);
        if (!e) {
            console.info('enforcementListener failed');
            return;
        }

        try {
            // Create an observer instance
            observer2 = new MutationObserver((mutation) => {
                closeEnforcementMessage();
            })
            console.info('enforcementListener added');
            observer2.observe(e, {
                subtree: true,
                childList: true,
                attributes: true, // monitor select element attribute only 
                attributeFilter: ['class', 'style'], // specific attribute to monitor
                characterData: true // default
            })
            // Function to check the initial state of a class on an element
            closeEnforcementMessage();
        } catch (err) { }
    }

    /**
     * HELPER FUNCTIONS
    */

    const getElementByXpath = (path) => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    // click on skip btn
    function skipBtnClick() {
        try {
            const skipBtn1 = getElementByXpath('//span[@class="ytp-ad-skip-button-container"]/button');
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
            skipBtnList.forEach((btn) => {
                if (btn?.click()) {
                    console.info('skip button click by ClassName/ID successful');
                    incrementAdSkipCount();
                }
            });
        } catch (err) { }
    }

    // mute and accerate adverts
    function adVideoManipulation() {
        try {
            const adElement = getElementByXpath('//*[@id="movie_player" and contains(@class, "ad-showing")]/div[1]/video');
            if (adElement) {
                // set params
                adElement.volume = 0;
                adElement.muted = true;
                adElement.playbackRate = 16; // max video playback speed
                incrementAdSkipCount();
            }
        } catch (err) { }
    }

    // click on close enforcement button
    function closeEnforcementMessage() {
        try {
            // then check for close button and auto click
            const elementXPath = '//*[@id="container" and contains(@class, "ytd-enforcement-message-view-model")]//*[@id="header" and contains(@class, "ytd-enforcement-message-view-model")]//*[@id="dismiss-button" and contains(@class, "ytd-enforcement-message-view-model")]/button-view-model/button';
            const adElement = getElementByXpath(elementXPath);
            if (adElement) {
                adElement.click();
                console.info('enforcement button click by XPath successful');
            }
        } catch (err) { }
    }

    // disconnect observers
    function unloadAllObservers() {
        if (observer) {
            observer.disconnect();
            observer = null;
            console.info('observer disconnected');
        }
        if (observer2) {
            observer2.disconnect();
            observer2 = null;
            console.info('observer2 disconnected');
        }
    }

    // increment count
    function incrementAdSkipCount() {
        adSkipCount++;
        chrome.runtime.sendMessage({ action: "incrementAdSkipCount", count: adSkipCount });
    }

    // Disconnect the observer when the tab is unloaded
    window.addEventListener('beforeunload', () => {
        unloadAllObservers();
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "disconnectObserver") {
            unloadAllObservers();
        }
    });

})();