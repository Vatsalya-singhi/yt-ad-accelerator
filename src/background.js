chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    const condition1 = changeInfo.status === 'complete';
    const condition2 = tab.url.includes("https://www.youtube.com/watch");
    if (condition1 && condition2) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["./src/content.js"],
        }).then(async () => {
            console.info("INJECTED THE FOREGROUND SCRIPT.");
        })
    }

});