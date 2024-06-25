(() => {
    const playbackRate = 16; // Desired playback rate for ad videos
    let bodyObserver = null;
    let playerObserver = null;
    let enforcementObserver = null;

    // XPath selectors for various elements
    const xpathSelectors = {
        body: '/html/body',
        app: '/html/body/ytd-app',
        moviePlayer: '//*[@id="movie_player" and contains(@class, "ad-showing")]/div[1]/video',
        skipButton: '//span[@class="ytp-ad-skip-button-container"]/button',
        enforcementMessage: '//*[@id="container" and contains(@class, "ytd-enforcement-message-view-model")]//*[@id="header" and contains(@class, "ytd-enforcement-message-view-model")]//*[@id="dismiss-button" and contains(@class, "ytd-enforcement-message-view-model")]/button-view-model/button'
    };

    // Class names for skip buttons
    const skipButtonClassNames = [
        "ytp-ad-skip-button-modern",
        "ytp-ad-skip-button",
        "ytp-ad-skip-button-modern ytp-button",
        "ytp-ad-skip-button ytp-button",
        "ytp-ad-skip-button-container",
        "ytp-skip-ad-button"
    ];

    // Initialize observers
    const initObservers = () => {
        observeBody();
    };

    // Observe changes in the body element
    const observeBody = () => {
        if (bodyObserver) return;

        const bodyElement = getElementByXpath(xpathSelectors.body);
        if (!bodyElement) {
            console.info('Body observer failed');
            return;
        }

        bodyObserver = new MutationObserver(() => {
            const appElement = getElementByXpath(xpathSelectors.app);
            if (appElement) {
                handleAppMutations();
                // disconnect once injected
                if (bodyObserver) {
                    bodyObserver.disconnect();
                    bodyObserver = null;
                    console.info('Body observer disconnected');
                }
            }
        });

        bodyObserver.observe(bodyElement, { childList: true });
        console.log('Body observer injected');
    };

    // Handle mutations in the app element
    const handleAppMutations = () => {
        setupPlayerObserver();
        setupEnforcementObserver();
        // first run 
        adVideoManipulation();
        skipBtnClick();
    };

    // Set up observer for the video player
    const setupPlayerObserver = () => {
        if (playerObserver) return;

        const moviePlayer = document.getElementById('movie_player');
        if (!moviePlayer) return;

        playerObserver = new MutationObserver(() => {
            skipBtnClick();
            adVideoManipulation();
        });

        playerObserver.observe(moviePlayer, { attributes: true, attributeFilter: ['class'] });
        // first run
        adVideoManipulation();
        skipBtnClick();
    };

    // Click skip buttons if available
    const skipBtnClick = () => {
        try {
            const skipBtn = getElementByXpath(xpathSelectors.skipButton);
            if (skipBtn) {
                skipBtn.click();
                console.info('Skip button clicked via XPath');
            }

            const skipBtnList = [];
            skipButtonClassNames.forEach(className => {
                skipBtnList.push(...document.getElementsByClassName(className));
            });
            skipBtnList.push(document.querySelector('[id^="skip-button"]'));

            skipBtnList.forEach(btn => {
                if (btn) {
                    btn.click();
                    console.info('Skip button clicked via ClassName/ID');
                }
            });
        } catch (err) {
            console.error('Error in skipBtnClick:', err);
        }
    };

    // Manipulate ad video properties
    const adVideoManipulation = () => {
        try {
            const video = getElementByXpath(xpathSelectors.moviePlayer);
            if (video) {
                video.volume = 0;
                video.muted = true;
                video.playbackRate = playbackRate;
            }
        } catch (err) {
            console.error('Error in adVideoManipulation:', err);
        }
    };

    // Set up observer for enforcement messages
    const setupEnforcementObserver = () => {
        if (enforcementObserver) return;

        const appElement = getElementByXpath(xpathSelectors.app);
        if (!appElement) {
            console.info('Enforcement observer failed');
            return;
        }

        enforcementObserver = new MutationObserver(() => {
            closeEnforcementMessage();
        });

        enforcementObserver.observe(appElement, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['class', 'style'],
            characterData: true,
        });

        closeEnforcementMessage();
    };

    // Close enforcement messages if present
    const closeEnforcementMessage = () => {
        try {
            const dismissBtn = getElementByXpath(xpathSelectors.enforcementMessage);
            if (dismissBtn) {
                dismissBtn.click();
                console.info('Enforcement message dismissed');
            }
        } catch (err) {
            console.error('Error in closeEnforcementMessage:', err);
        }
    };

    // Get element by XPath
    const getElementByXpath = (path) => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    // Disconnect all observers
    const disconnectAllObservers = () => {
        if (bodyObserver) {
            bodyObserver.disconnect();
            bodyObserver = null;
            console.info('Body observer disconnected');
        }
        if (playerObserver) {
            playerObserver.disconnect();
            playerObserver = null;
            console.info('Player observer disconnected');
        }
        if (enforcementObserver) {
            enforcementObserver.disconnect();
            enforcementObserver = null;
            console.info('Enforcement observer disconnected');
        }
    };

    // Initial setup and event listeners
    try {
        window.addEventListener('load', initObservers);
        window.addEventListener('unload', disconnectAllObservers);
    } catch (err) { }

})();
