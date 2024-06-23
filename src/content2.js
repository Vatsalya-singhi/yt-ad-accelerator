(() => {
    let observer = null;
    let observer2 = null;
    const playbackRate = 16;


    const srcCode = () => {
        const xpath = '/html/body';
        const e = getElementByXpath(xpath);
        if (!e) {
            console.info('body observer failed');
            return;
        }

        try {
            const obs = new MutationObserver(() => {
                const xpath = '/html/body/ytd-app';
                const condition = getElementByXpath(xpath);
                if (condition) {
                    try {
                        adVideoManipulation();
                        skipBtnClick();
                        enforcementListener();
                    } catch (err) { console.error(err); }

                    try {
                        if (!observer) main();
                        if (!observer2) enforcementListener();
                    } catch (err) { console.error(err); }
                }
            });
            obs.observe(e, {
                childList: true,
            });
            console.log('body observer injected');
        } catch (err) { console.error(err); }
    }

    /**
     * MAIN FUNCTIONS
     */

    const main = () => {
        const e = document.getElementById('movie_player');
        if (!e) return;

        try {
            // Create an observer instance
            observer = new MutationObserver((mutations) => {
                skipBtnClick();
                adVideoManipulation();
            });
            observer.observe(e, {
                attributes: true,
                attributeFilter: ['class'],
            });

            adVideoManipulation();
            skipBtnClick();
        } catch (err) {
            console.error(err);
        }
    }

    const skipBtnClick = () => {
        try {
            const skipBtn1 = getElementByXpath('//span[@class="ytp-ad-skip-button-container"]/button');
            if (skipBtn1) {
                skipBtn1.click();
                console.info('skip button click by XPath successful');
            }
            const skipBtnList = [];
            const targetClassNames = [
                "ytp-ad-skip-button-modern",
                "ytp-ad-skip-button",
                "ytp-ad-skip-button-modern ytp-button",
                "ytp-ad-skip-button ytp-button",
                "ytp-ad-skip-button-container",
                "ytp-skip-ad-button"
            ];
            targetClassNames.forEach((className) => {
                skipBtnList.push(...document.getElementsByClassName(className));
            });
            skipBtnList.push(document.querySelector('[id^="skip-button"]'));
            skipBtnList.forEach((btn) => {
                if (btn) {
                    btn.click();
                    console.info('skip button click by ClassName/ID successful');
                }
            });
        } catch (err) {
            console.error(err);
        }
    }

    const adVideoManipulation = () => {
        try {
            const video = getElementByXpath('//*[@id="movie_player" and contains(@class, "ad-showing")]/div[1]/video');
            if (video) {
                video.volume = 0;
                video.muted = true;
                video.playbackRate = playbackRate;
            }
        } catch (err) {
            console.error(err);
        }
    }

    const enforcementListener = () => {
        const xpath = '/html/body/ytd-app';
        const e = getElementByXpath(xpath);
        if (!e) {
            console.info('enforcementListener failed');
            return;
        }

        try {
            observer2 = new MutationObserver((mutations) => {
                closeEnforcementMessage();
            });
            observer2.observe(e, {
                subtree: true,
                childList: true,
                attributes: true,
                attributeFilter: ['class', 'style'],
                characterData: true,
            });

            closeEnforcementMessage();
        } catch (err) {
            console.error(err);
        }
    }

    const closeEnforcementMessage = () => {
        try {
            const elementXPath = '//*[@id="container" and contains(@class, "ytd-enforcement-message-view-model")]//*[@id="header" and contains(@class, "ytd-enforcement-message-view-model")]//*[@id="dismiss-button" and contains(@class, "ytd-enforcement-message-view-model")]/button-view-model/button';
            const adElement = getElementByXpath(elementXPath);
            if (adElement) {
                adElement.click();
                console.info('enforcement button click by XPath successful');
            }
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * HELPER FUNCTIONS
     */

    const getElementByXpath = (path) => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    const unloadAllObservers = () => {
        try {
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
        } catch (err) { }
    }



    // Initial setup and check
    window.addEventListener("load", () => { console.log("load called"); srcCode(); })
    window.addEventListener('unload', () => { console.log("unload called"); unloadAllObservers(); });
    // console.log('TRIGGERRREEDD');
})();
