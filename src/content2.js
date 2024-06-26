(() => {
    let observer = null;
    let observer2 = null;
    const playbackRate = 16;

    /**
    * MAIN FUNCTIONS
    */

    const srcCode = () => {

        const condition2 = getElementByXpath('/html/body/ytd-app');
        if (!condition2) return;

        const obs2 = new MutationObserver(() => {
            const condition3 = getElementByXpath('/html/body/ytd-app/div[1]/ytd-page-manager');
            if (!condition3) return;

            const obs3 = new MutationObserver(() => {
                const condition4 = getElementByXpath('//*[@id="page-manager"]/ytd-watch-flexy');
                if (!condition4) return;

                const obs4 = new MutationObserver(() => {
                    const condition5 = getElementByXpath('/html/body/ytd-app/div[1]/ytd-page-manager/ytd-watch-flexy/div[5]/div[1]/div/div[1]/div[2]/div/div/ytd-player');
                    if (!condition5) return;

                    const obs5 = new MutationObserver(() => {
                        // obs5.disconnect();
                        // obs4.disconnect();
                        // obs3.disconnect();
                        obs2.disconnect();

                        if (!observer) {
                            skipBtnClick();
                            adVideoManipulation();
                        }
                        if (!observer2) {
                            enforcementListener();
                        }
                    })

                    obs5.observe(condition5, {
                        childList: true,
                        subtree: true,
                    });

                });

                obs4.observe(condition4, {
                    childList: true,
                    subtree: true,
                });

            })

            obs3.observe(condition3, {
                childList: true,
                // subtree: true,
            });

        })

        obs2.observe(condition2, {
            childList: true,
            // subtree: true,
        });

    }


    const enforcementListener = () => {
        const e = getElementByXpath('/html/body/ytd-app');
        if (!e) return;

        try {
            observer2 = new MutationObserver(() => {
                closeEnforcementMessage();
            });
            observer2.observe(e, {
                childList: true,
                subtree: true,
                // attributes: true,
                // attributeFilter: ['class', 'style'],
                // characterData: true,
            });
        } catch (err) {
            console.error(err);
        }
    }

    /**
    * MAIN FUNCTIONS
    */


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


    // Initial setup and check
    window.addEventListener("load", () => { srcCode(); })

})();
