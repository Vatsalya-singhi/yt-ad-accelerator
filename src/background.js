chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    if (changeInfo.status === 'complete' && tab.url.includes("https://www.youtube.com/watch")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["./src/content.js"],
        }).then(async () => {
            console.info("INJECTED THE FOREGROUND SCRIPT.");
        })
    }

});