chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    if (changeInfo.status === 'complete' && tab.url.includes("https://www.youtube.com/")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
            files: ["./src/content.js"],
        }).then(() => {
            console.log("INJECTED THE FOREGROUND SCRIPT.");
        })
    }

});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log(activeInfo.tabId);
    // Read it using the storage API
    // chrome.storage.sync.get(activeInfo.tabId, (data) => {
    //     console.log(data);
    // });
});