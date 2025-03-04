chrome.runtime.onInstalled.addListener(() => {
  console.log("Babepedia Performer Saver installed");
});

function openDatabase(callback) {
  const request = indexedDB.open("BabepediaDB", 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("performers")) {
      db.createObjectStore("performers", { keyPath: "name" });
    }
  };

  request.onsuccess = (event) => {
    callback(event.target.result);
  };

  request.onerror = (event) => {
    console.error("IndexedDB error:", event.target.error);
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "savePerformer") {
    openDatabase((db) => {
      const transaction = db.transaction("performers", "readwrite");
      const store = transaction.objectStore("performers");
      store.put(message.performerData);
      sendResponse({ status: "success" });
    });
  }
  return true; // Keep the connection alive for async response
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getStorageData") {
        chrome.storage.local.get(["key"], (result) => {
            sendResponse({ data: result.key });
        });
        return true; // Required for async response
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "savePerformer") {
        chrome.storage.local.set({ [message.performerData.name]: message.performerData }, () => {
            console.log("Performer saved:", message.performerData);
        });
    }

    if (message.action === "getStorageData") {
        chrome.storage.local.get(null, (data) => {
            sendResponse({ data });
        });
        return true; // Required for async response
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchProfile") {
        fetchProfileInfo(message.profileUrl);
    }
});

// Function to fetch profile details
async function fetchProfileInfo(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const profileName = doc.querySelector('.profile-name')?.textContent.trim() || 'Unknown';
        const bio = doc.querySelector('.profile-bio')?.textContent.trim() || 'No bio available';

        console.log(`✅ Profile: ${profileName}`);
        console.log(`📜 Bio: ${bio}`);
        console.log(`🔗 URL: ${url}`);
    } catch (error) {
        console.error(`❌ Error fetching ${url}:`, error);
    }
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Installed: Initializing Storage");

    // Initialize Storage on Install
    chrome.storage.local.set({
        currentTabUrl: "",
        targetWebsite: "",
        websiteCategories: []
    });
});

// Listener to ensure global storage access
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getStoredData") {
        chrome.storage.local.get(["currentTabUrl", "targetWebsite", "websiteCategories"], (data) => {
            sendResponse(data);
        });
        return true; // Required for async response
    }
}); 