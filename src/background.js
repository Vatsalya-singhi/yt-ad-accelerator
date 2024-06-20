var tabList = [];
var tabAdSkipCounts = {};

// Function to update badge text for a specific tab
function updateBadgeText(tabId) {
    const adSkipCount = tabAdSkipCounts[tabId] || 0;
    chrome.action.setBadgeText({ tabId: tabId, text: adSkipCount.toString() });
    chrome.action.setBadgeTextColor({ tabId: tabId, color: "#FFFFFF" });
    chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: '#353935' });
}

// Consolidated message listener to handle all actions in one place
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "incrementAdSkipCount") {
        const tabId = sender.tab.id;
        tabAdSkipCounts[tabId] = (tabAdSkipCounts[tabId] || 0) + 1;
        updateBadgeText(tabId);
    } else if (request.action === "disconnectObserver" && sender.tab) {
        // Handle the observer disconnection
        chrome.tabs.sendMessage(sender.tab.id, { action: "disconnectObserver" });
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const condition1 = changeInfo.status === 'complete';  // Check for 'complete' status
    // const condition1 = true;
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
        tabList = tabList.filter(x => x !== tabId);  // Remove tab from tabList
        delete tabAdSkipCounts[tabId];  // Clean up ad skip count
        console.info(`Tab ${tabId} removed and cleaned up`);
    }
});
