(() => {

    /**
     * =======================
     * GLOBAL VARIABLES
     * =======================
     */
    const playbackRate = 16;           // Playback speed during ads
    let currentVideoTime = 0;          // Tracks current playback time
    let obs1 = null, obs2 = null, obs3 = null, obs4 = null; // DOM observers

    // SponsorBlock variables
    let lastVideoId = null;            // Current video ID
    let sponsorSegments = [];          // SponsorBlock segments for the current video
    let skippedSegments = new Set();   // Already skipped segments (for safety)
    let nextSegmentIndex = 0;          // Index of next segment to skip

    /**
     * =======================
     * HELPER FUNCTIONS
     * =======================
     */

    // Get DOM element by XPath
    const getElementByXpath = (path) =>
        document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    // Get YouTube video ID from URL
    function getVideoId() {
        try {
            const url = new URL(window.location.href);
            return url.searchParams.get("v");
        } catch (e) {
            console.error("Could not parse videoId:", e);
            return null;
        }
    }

    // Fetch SponsorBlock segments for a given video
    async function fetchSponsorBlockSegments(videoId) {
        const endpoint = `https://sponsor.ajay.app/api/skipSegments?videoID=${videoId}`;
        try {
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const data = await res.json();
            console.log("SponsorBlock segments:", data);
            sponsorSegments = data;
            return data;
        } catch (err) {
            console.error("Failed to fetch SponsorBlock data:", err);
            sponsorSegments = [];
            return [];
        }
    }

    // Handle new video load
    async function handleVideoChange() {
        const videoId = getVideoId();
        if (!videoId || videoId === lastVideoId) return;

        lastVideoId = videoId;
        console.log("Detected new video:", videoId);

        sponsorSegments = await fetchSponsorBlockSegments(videoId);

        // Sort segments by start time and reset tracking
        sponsorSegments.sort((a, b) => a.segment[0] - b.segment[0]);
        nextSegmentIndex = 0;
        skippedSegments.clear();
    }

    /**
     * =======================
     * MAIN FEATURE FUNCTIONS
     * =======================
     */

    // Click all possible skip buttons for ads
    const skipBtnClick = () => {
        try {
            // XPath-based skip button
            const skipBtnXPath = getElementByXpath('//span[@class="ytp-ad-skip-button-container"]/button');
            if (skipBtnXPath) {
                skipBtnXPath.click();
                console.info('Skipped ad (XPath).');
            }

            // Class/ID-based skip buttons
            const targetClassNames = [
                "ytp-ad-skip-button-modern",
                "ytp-ad-skip-button",
                "ytp-ad-skip-button-modern ytp-button",
                "ytp-ad-skip-button ytp-button",
                "ytp-ad-skip-button-container",
                "ytp-skip-ad-button"
            ];
            const skipBtnList = [];
            targetClassNames.forEach(className => {
                skipBtnList.push(...document.getElementsByClassName(className));
            });
            skipBtnList.push(document.querySelector('[id^="skip-button"]'));

            skipBtnList.forEach(btn => {
                if (btn) {
                    btn.click();
                    console.info('Skipped ad (Class/ID).');
                }
            });
        } catch (err) {
            console.error(err);
        }
    }

    // Mute and speed up ad playback
    const adVideoManipulation = () => {
        setTimeout(() => {
            const videoElement = getElementByXpath('//*[@id="movie_player" and contains(@class, "ad-showing")]/div[1]/video');
            if (!videoElement) return;
            videoElement.volume = 0;
            videoElement.muted = true;
            videoElement.playbackRate = playbackRate;
        }, 500);
    }

    // Listen to actual video playback and auto-skip SponsorBlock segments
    const actualVideoListenser = () => {
        setTimeout(() => {
            const videoElement = getElementByXpath('//*[@id="movie_player" and not(contains(@class, "ad-showing"))]/div[1]/video');
            if (!videoElement) return;

            videoElement.addEventListener("timeupdate", () => {
                currentVideoTime = parseInt(videoElement.currentTime) || 0;

                // Skip the next SponsorBlock segment if reached
                if (nextSegmentIndex < sponsorSegments.length) {
                    const segment = sponsorSegments[nextSegmentIndex];
                    const [start, end] = segment.segment;

                    if (currentVideoTime >= start && currentVideoTime < end) {
                        console.info(`Skipping segment [${start}-${end}] (${segment.category})`);
                        videoElement.currentTime = end;
                        nextSegmentIndex++;
                    } else if (currentVideoTime >= end) {
                        // User skipped manually past this segment
                        nextSegmentIndex++;
                    }
                }
            });
        }, 500);
    }

    // Close enforcement messages (like "Sign in to continue" popups)
    const closeEnforcementMessage = () => {
        setTimeout(() => {
            const adElement = getElementByXpath(
                '//*[@id="container" and contains(@class, "ytd-enforcement-message-view-model")]//*[@id="header" and contains(@class, "ytd-enforcement-message-view-model")]//*[@id="dismiss-button" and contains(@class, "ytd-enforcement-message-view-model")]/button-view-model/button'
            );
            if (!adElement) return;
            adElement.click();
        }, 500);
    }

    // Refresh page on enforcement message to resume playback
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

    // Reset tracked current video time
    const resetCurrentVideoTime = () => { currentVideoTime = 0; }

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

                    // Reload on enforcement message
                    refreshOnEnforcementMessage();

                    obs4 = new MutationObserver(() => {
                        skipBtnClick();
                        adVideoManipulation();
                        actualVideoListenser();
                        closeEnforcementMessage();
                        refreshOnEnforcementMessage();
                        handleVideoChange(); // Fetch SponsorBlock segments for new video
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
     * INIT FUNCTIONS
     * =======================
     */

    window.addEventListener("load", sourceCode);
    document.addEventListener("load", sourceCode);
    window.addEventListener("locationchange", resetCurrentVideoTime);
    window.addEventListener("popstate", resetCurrentVideoTime);
    window.addEventListener("yt-navigate-finish", handleVideoChange);

})();
