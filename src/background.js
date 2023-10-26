var tabList = [];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const condition1 = true; // changeInfo.status === 'complete';
    const condition2 = tab.url.includes("https://www.youtube.com/watch");


    if (condition1 && condition2) {

        if (tabList.includes(tabId)) {
            console.log(`script already injected for tab ${tabId}`);
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["./src/content.js"],
        }).then(() => {
            console.info(`INJECTED THE FOREGROUND SCRIPT for tab ${tabId}`);
            tabList.push(tabId);
        })
    }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (tabList.includes(tabId)) {
        tabList = tabList.filter(x => x !== tabId);
        console.info(`script removed for tab ${tabId}`);
    }
})