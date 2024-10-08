(() => {

    /**
    * GLOBAL VARIABLES
    */

    const playbackRate = 16;
    let obs1 = null;
    let obs2 = null;
    let obs3 = null;
    let obs4 = null;

    /**
    * MAIN FUNCTIONS
    */

    const sourceCode = () => {
        // check if exist
        if (obs1) return;
        // check for element
        const condition1 = getElementByXpath('/html/body/ytd-app');
        if (!condition1) return;

        obs1 = new MutationObserver(() => {
            // check if exist
            if (obs2) return;
            // check for element
            // const condition2 = getElementByXpath('/html/body/ytd-app/div[1]/ytd-page-manager');
            const condition2 = getElementByXpath('//*[@id="page-manager"]');
            if (!condition2) return;

            obs2 = new MutationObserver(() => {
                // check if exist
                if (obs3) return;
                // check for element
                const condition3 = getElementByXpath('//*[@id="page-manager"]/ytd-watch-flexy');
                if (!condition3) return;

                obs3 = new MutationObserver(() => {
                    // check if exist
                    if (obs4) return;
                    // check for element
                    // const condition4 = getElementByXpath('/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[1]/div[2]/div/div/ytd-player');
                    const condition4 = getElementByXpath('//*[@id="ytd-player"]');
                    if (!condition4) return;

                    // reload on ad blocker warnings
                    refreshOnEnforcementMessage();
                    obs4 = new MutationObserver(() => {
                        skipBtnClick();
                        adVideoManipulation();
                        closeEnforcementMessage();
                        refreshOnEnforcementMessage();
                    })
                    obs4.observe(condition4, {
                        childList: true,
                        subtree: true,
                    });
                });
                obs3.observe(condition3, {
                    childList: true,
                    subtree: true,
                });
            })
            obs2.observe(condition2, {
                childList: true,
                subtree: true,
            });
        })
        obs1.observe(condition1, {
            childList: true,
            subtree: true,
        });
    }

    /**
    * HELPER FUNCTIONS
    */


    const getElementByXpath = (path) => {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
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
        setTimeout(() => {
            const videoElement = getElementByXpath('//*[@id="movie_player" and contains(@class, "ad-showing")]/div[1]/video');
            if (!videoElement) return;
            videoElement.volume = 0;
            videoElement.muted = true;
            videoElement.playbackRate = playbackRate;
        }, 500);
    }

    const closeEnforcementMessage = () => {
        setTimeout(() => {
            const adElement = getElementByXpath('//*[@id="container" and contains(@class, "ytd-enforcement-message-view-model")]//*[@id="header" and contains(@class, "ytd-enforcement-message-view-model")]//*[@id="dismiss-button" and contains(@class, "ytd-enforcement-message-view-model")]/button-view-model/button');
            if (!adElement) return;
            adElement.click();
        }, 500);
    }

    const refreshOnEnforcementMessage = () => {
        const adElement = getElementByXpath('//*[@id="container" and contains(@class, "ytd-enforcement-message-view-model")]');
        if (!adElement) return;

        const currentURL = window.location.href ?? document.URL;
        const timestamp = 100; // have to find this

        if (currentURL && timestamp) {
            newURL = currentURL + `&t=${timestamp}s`;
            window.location.href = newURL;
        } else {
            window.location.reload();
        }
    }

    /**
    * INIT FUNCTIONS
    */

    // Initial setup and check
    window.addEventListener("load", () => {
        sourceCode();
    })

    document.addEventListener("load", () => {
        sourceCode();
    })

})();
