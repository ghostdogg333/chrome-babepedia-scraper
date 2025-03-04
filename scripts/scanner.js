function extractPerformers() {
    const performers = document.querySelectorAll(".thumbshot");
    const performerData = [];

    performers.forEach(performer => {
        const nameElement = performer.querySelector(".thumbtext a");
        const name = nameElement ? nameElement.textContent.trim() : "Unknown";
        const url = nameElement ? new URL(nameElement.getAttribute("href"), window.location.origin).href : "";
        const imgElement = performer.querySelector(".thumbimg");
        const thumbnail = imgElement ? (imgElement.getAttribute("src") || imgElement.getAttribute("data-src")) : "";

        performerData.push({ name, url, thumbnail });
    });

    return performerData;
}

// Send performers to downloader
function sendToDownloader() {
    const performers = extractPerformers();

    if (performers.length === 0) {
        console.error("No performers found!");
        return;
    }

    performers.forEach(performer => {
        chrome.runtime.sendMessage({ action: "downloadProfile", performer });
    });

    console.log("✅ Performer data sent to downloader.js");
}

// Run when the scanner page loads
document.addEventListener('DOMContentLoaded', sendToDownloader);
