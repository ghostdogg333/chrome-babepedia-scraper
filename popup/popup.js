document.addEventListener("DOMContentLoaded", () => {
    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const currentTab = tabs[0];
            const currentTabUrl = currentTab.url;
 
            const targetWebsite = new URL(currentTabUrl).origin; // Extract base domain 
            // Store information in chrome.storage.local
            chrome.storage.local.set({
                currentTabUrl: currentTabUrl,
                targetWebsite: targetWebsite,
             }, () => {
                console.log("✅ Stored Tab Info: ", { currentTabUrl, targetWebsite  });

                // Redirect to the dashboard after storing data
                chrome.tabs.create({ url: chrome.runtime.getURL("../pages/dashboard.html") });

                // Close the popup
                window.close();
            });
        }
    });
});
