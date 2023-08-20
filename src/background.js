chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    if (changeInfo.status === 'complete' && tab.url.includes("https://www.youtube.com/")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId }, // ,allFrames: true
            files: ["./src/content.js"],
        }).then(async () => {
            console.log("INJECTED THE FOREGROUND SCRIPT.");
        })
    }

});