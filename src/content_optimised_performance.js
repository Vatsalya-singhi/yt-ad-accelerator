(() => {

    /**
     * =======================
     * GLOBAL VARIABLES
     * =======================
     */
    const playbackRate = 16;
    let currentVideoTime = 0;
    let obs1 = null, obs2 = null, obs3 = null, obs4 = null;

    // SponsorBlock variables
    let lastVideoId = null;
    let sponsorSegments = [];
    let nextSegmentIndex = 0;

    let videoElement = null;
    let lastTimeUpdate = 0;       // For throttling

    const THROTTLE_INTERVAL = 100; // Run listener every 100ms

    /**
     * =======================
     * HELPER FUNCTIONS
     * =======================
     */

    const getElementByXpath = (path) =>
        document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    function getVideoId() {
        try {
            const url = new URL(window.location.href);
            return url.searchParams.get("v");
        } catch (e) {
            console.error("Could not parse videoId:", e);
            return null;
        }
    }

    async function fetchSponsorBlockSegments(videoId) {
        const endpoint = `https://sponsor.ajay.app/api/skipSegments?videoID=${videoId}`;
        try {
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const data = await res.json();
            sponsorSegments = data;
            sponsorSegments.sort((a, b) => a.segment[0] - b.segment[0]);
            nextSegmentIndex = 0;
            return data;
        } catch (err) {
            console.error("Failed to fetch SponsorBlock data:", err);
            sponsorSegments = [];
            nextSegmentIndex = 0;
            return [];
        }
    }

    const resetCurrentVideoTime = () => { currentVideoTime = 0; }

    /**
     * =======================
     * AD & SPONSOR SKIPPING
     * =======================
     */

    const skipBtnClick = () => {
        try {
            const skipBtnXPath = getElementByXpath('//span[@class="ytp-ad-skip-button-container"]/button');
            if (skipBtnXPath) skipBtnXPath.click();

            const targetClassNames = [
                "ytp-ad-skip-button-modern",
                "ytp-ad-skip-button",
                "ytp-ad-skip-button-modern ytp-button",
                "ytp-ad-skip-button ytp-button",
                "ytp-ad-skip-button-container",
                "ytp-skip-ad-button"
            ];
            const skipBtnList = [];
            targetClassNames.forEach(className => skipBtnList.push(...document.getElementsByClassName(className)));
            skipBtnList.push(document.querySelector('[id^="skip-button"]'));
            skipBtnList.forEach(btn => btn?.click());
        } catch (err) {
            console.error(err);
        }
    }

    const adVideoManipulation = () => {
        if (!videoElement) return;
        if (videoElement.closest(".ad-showing")) {
            videoElement.volume = 0;
            videoElement.muted = true;
            videoElement.playbackRate = playbackRate;
        }
    }

    const closeEnforcementMessage = () => {
        const adElement = getElementByXpath(
            '//*[@id="container" and contains(@class, "ytd-enforcement-message-view-model")]//*[@id="dismiss-button"]/button-view-model/button'
        );
        if (adElement) adElement.click();
    }

    const refreshOnEnforcementMessage = () => {
        const adElement = getElementByXpath('//*[@id="container" and contains(@class, "ytd-enforcement-message-view-model")]');
        if (!adElement) return;

        const currentURL = window.location.href ?? document.URL;
        const timestamp = currentVideoTime ?? 0;

        if (currentURL && timestamp) {
            const url = new URL(currentURL);
            const params = new URLSearchParams(url.search);
            params.set("t", `${timestamp}s`);
            const newURL = new URL(`${url.origin}${url.pathname}?${params}`);
            window.location.href = newURL;
        } else {
            window.location.reload();
        }
    }

    /**
     * =======================
     * THROTTLED TIMEUPDATE HANDLER
     * =======================
     */

    const handleVideoTimeUpdate = () => {
        const now = Date.now();
        if (now - lastTimeUpdate < THROTTLE_INTERVAL) return;
        lastTimeUpdate = now;

        if (!videoElement) return;
        currentVideoTime = parseInt(videoElement.currentTime) || 0;

        // SponsorBlock skipping
        if (nextSegmentIndex < sponsorSegments.length) {
            const segment = sponsorSegments[nextSegmentIndex];
            const [start, end] = segment.segment;
            if (currentVideoTime >= start && currentVideoTime < end) {
                console.info(`Skipping segment [${start}-${end}] (${segment.category})`);
                videoElement.currentTime = end;
                nextSegmentIndex++;
            } else if (currentVideoTime >= end) {
                nextSegmentIndex++;
            }
        }

        // Ad skipping and manipulation
        adVideoManipulation();
        skipBtnClick();
    }

    const attachVideoListener = () => {
        if (!videoElement) {
            videoElement = getElementByXpath('//*[@id="movie_player"]/div[1]/video');
            if (!videoElement) return;
        }
        videoElement.removeEventListener("timeupdate", handleVideoTimeUpdate);
        videoElement.addEventListener("timeupdate", handleVideoTimeUpdate);
    }

    /**
     * =======================
     * OBSERVERS
     * =======================
     */

    const sourceCode = () => {
        const condition1 = getElementByXpath('/html/body/ytd-app');
        if (!condition1 || obs1) return;

        obs1 = new MutationObserver(() => {
            const condition2 = getElementByXpath('//*[@id="page-manager"]');
            if (!condition2 || obs2) return;

            obs2 = new MutationObserver(() => {
                const condition3 = getElementByXpath('//*[@id="page-manager"]/ytd-watch-flexy');
                if (!condition3 || obs3) return;

                obs3 = new MutationObserver(() => {
                    const condition4 = getElementByXpath('//*[@id="ytd-player"]');
                    if (!condition4 || obs4) return;

                    refreshOnEnforcementMessage();

                    obs4 = new MutationObserver(() => {
                        attachVideoListener();
                        closeEnforcementMessage();
                        handleVideoChange();
                    });

                    obs4.observe(condition4, { childList: true, subtree: true });
                });

                obs3.observe(condition3, { childList: true, subtree: true });
            });

            obs2.observe(condition2, { childList: true, subtree: true });
        });

        obs1.observe(condition1, { childList: true, subtree: true });
    }

    /**
     * =======================
     * VIDEO CHANGE HANDLER
     * =======================
     */

    async function handleVideoChange() {
        const videoId = getVideoId();
        if (!videoId || videoId === lastVideoId) return;

        lastVideoId = videoId;
        videoElement = getElementByXpath('//*[@id="movie_player"]/div[1]/video');
        sponsorSegments = await fetchSponsorBlockSegments(videoId);
    }

    /**
     * =======================
     * INIT
     * =======================
     */

    window.addEventListener("load", sourceCode);
    document.addEventListener("load", sourceCode);
    window.addEventListener("locationchange", resetCurrentVideoTime);
    window.addEventListener("popstate", resetCurrentVideoTime);
    window.addEventListener("yt-navigate-finish", handleVideoChange);

})();
