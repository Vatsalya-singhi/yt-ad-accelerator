(() => {

    /**
    * GLOBAL VARIABLES
    */

    const playbackRate = 16;
    let currentVideoTime = 0;
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
                    const condition4 = getElementByXpath('//*[@id="ytd-player"]');
                    if (!condition4) return;

                    // reload on ad blocker warnings
                    refreshOnEnforcementMessage();
                    obs4 = new MutationObserver(() => {
                        skipBtnClick();
                        adVideoManipulation();
                        actualVideoListenser();
                        closeEnforcementMessage();
                        refreshOnEnforcementMessage();
                        handleVideoChange(); // <--- NEW: fetch SponsorBlock data when video changes
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

    const actualVideoListenser = () => {
        setTimeout(() => {
            const videoElement = getElementByXpath('//*[@id="movie_player" and not(contains(@class, "ad-showing"))]/div[1]/video');
            if (!videoElement) return;
            videoElement.addEventListener("timeupdate", () => {
                if (!!parseInt(videoElement.currentTime)) {
                    currentVideoTime = parseInt(videoElement.currentTime);
                }

                // Auto-skip SponsorBlock segments
                // if (sponsorSegments.length > 0) {
                //     sponsorSegments.forEach((segment) => {
                //         const [start, end] = segment.segment;
                //         const segmentId = `${start}-${end}`; // unique ID for this segment

                //         if (!skippedSegments.has(segmentId) &&
                //             currentVideoTime >= start &&
                //             currentVideoTime < end
                //         ) {
                //             console.info(`Skipping segment [${start}-${end}] (${segment.category})`);
                //             videoElement.currentTime = end;  // jump to end
                //             skippedSegments.add(segmentId);  // mark as skipped
                //         }
                //     });
                // }

                // Only check the next segment
                if (nextSegmentIndex < sponsorSegments.length) {
                    const segment = sponsorSegments[nextSegmentIndex];
                    const [start, end] = segment.segment;

                    if (currentVideoTime >= start && currentVideoTime < end) {
                        console.info(`Skipping segment [${start}-${end}] (${segment.category})`);
                        videoElement.currentTime = end;  // jump to end of segment
                        nextSegmentIndex++; // move to the next segment
                    } else if (currentVideoTime >= end) {
                        // Already passed this segment without skipping (e.g., user seeked)
                        nextSegmentIndex++;
                    }
                }
            });
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
        const timestamp = currentVideoTime ?? 0;
        if (currentURL && timestamp) {
            let url = new URL(currentURL);
            let params = new URLSearchParams(url.search);
            params.set("t", `${timestamp}s`);
            let newURL = new URL(`${url.origin}${url.pathname}?${params}`);
            window.location.href = newURL;
        } else {
            window.location.reload();
        }
    }

    const resetCurrentVideoTime = () => { if (currentVideoTime) currentVideoTime = 0; }

    // =======================
    // SPONSORBLOCK INTEGRATION
    // =======================
    let lastVideoId = null;
    let sponsorSegments = []; // store fetched segments
    let skippedSegments = new Set(); // track already skipped segments
    let nextSegmentIndex = 0; // index of the next segment to check
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
            console.log("SponsorBlock segments:", data);
            sponsorSegments = data; // save globally for later use
            return data;
        } catch (err) {
            console.error("Failed to fetch SponsorBlock data:", err);
            sponsorSegments = [];
            return [];
        }
    }

    async function handleVideoChange() {
        const videoId = getVideoId();
        if (!videoId || videoId === lastVideoId) return;

        lastVideoId = videoId;
        console.log("Detected new video:", videoId);

        sponsorSegments = await fetchSponsorBlockSegments(videoId);
        // Sort segments by start time
        sponsorSegments.sort((a, b) => a.segment[0] - b.segment[0]);
        nextSegmentIndex = 0; // reset for new video
        skippedSegments.clear(); // reset for new video
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


    window.addEventListener('locationchange', resetCurrentVideoTime);

    window.addEventListener('popstate', resetCurrentVideoTime);

    window.addEventListener("yt-navigate-finish", handleVideoChange);

})();