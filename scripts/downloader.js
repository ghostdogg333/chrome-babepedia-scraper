chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "downloadProfile") {
        fetchProfileInfo(message.performer);
    }
});

async function fetchProfileInfo(performer) {
    console.log(`🔍 Fetching profile: ${performer.url}`);

    try {
        const response = await fetch(performer.url);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Extract profile details (Modify selectors as needed)
        const details = {
            name: performer.name,
            birthdate: doc.querySelector(".birthdate-selector")?.textContent.trim() || "Unknown",
            nationality: doc.querySelector(".nationality-selector")?.textContent.trim() || "Unknown",
            city: doc.querySelector(".city-selector")?.textContent.trim() || "Unknown",
            hairColor: doc.querySelector(".hair-selector")?.textContent.trim() || "Unknown",
            eyeColor: doc.querySelector(".eye-selector")?.textContent.trim() || "Unknown",
            profession: doc.querySelector(".profession-selector")?.textContent.trim() || "Unknown",
            biography: doc.querySelector(".bio-selector")?.textContent.trim() || "No bio available",
            imageUrl: performer.thumbnail,
            profileUrl: performer.url
        };

        console.log("✅ Extracted Profile Data:", details);
        chrome.runtime.sendMessage({ action: "savePerformer", details });

    } catch (error) {
        console.error(`❌ Error fetching ${performer.url}:`, error);
    }
}
