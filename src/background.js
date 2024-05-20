var tabList = [];
var adSkipCount = 0;
var tabAdSkipCounts = {};

// Function to update badge text for a specific tab
function updateBadgeText(tabId) {
    const adSkipCount = tabAdSkipCounts[tabId] || 0;
    chrome.action.setBadgeText({ tabId: tabId, text: adSkipCount.toString() });
    chrome.action.setBadgeTextColor({ tabId: tabId, color: "#FFFFFF" });
    chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: '#353935' });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "incrementAdSkipCount") {
        const tabId = sender.tab.id;
        tabAdSkipCounts[tabId] = (tabAdSkipCounts[tabId] || 0) + 1;
        updateBadgeText(tabId);
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const condition1 = true; // changeInfo.status === 'complete';
    const condition2 = tab.url.includes("https://www.youtube.com/watch");


    if (condition1 && condition2) {

        if (!tabList.includes(tabId)) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["./src/content.js"],
            }).then(() => {
                console.info(`INJECTED THE FOREGROUND SCRIPT for tab ${tabId}`);
                tabList.push(tabId);
                tabAdSkipCounts[tabId] = 0;
                updateBadgeText(tabId);
            }).catch((err) => {
                console.error(`Failed to inject script: ${err.message}`);
            });
        }

    }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (tabList.includes(tabId)) {
        tabList = tabList.filter(x => x !== tabId);
        delete tabAdSkipCounts[tabId];
        chrome.tabs.sendMessage(tabId, { action: "disconnectObserver" });
        console.info(`script removed for tab ${tabId}`);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "disconnectObserver" && sender.tab) {
        // Handle the observer disconnection
        chrome.tabs.sendMessage(sender.tab.id, { action: "disconnectObserver" });
    }
});