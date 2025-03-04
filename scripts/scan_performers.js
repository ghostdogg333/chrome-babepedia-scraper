document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 scan_performers.js Loaded!");

    chrome.storage.local.get(["currentTabUrl"], (data) => {
        const storedUrl = data.currentTabUrl || "";
        document.getElementById("currentTabUrl").textContent = storedUrl;

        if (!storedUrl) {
            console.error("❌ No stored URL found!");
            alert("No stored page URL found. Open a website first.");
            return;
        }

        const scanButton = document.getElementById("scanPage");
        if (scanButton) {
            scanButton.addEventListener("click", () => {
                console.log(`🔍 Fetching HTML from ${storedUrl}...`);
                fetchPageHtml(storedUrl);
            });
        } else {
            console.error("❌ scanPage button not found!");
        }
    });
});

// Function to fetch HTML from a stored URL
function fetchPageHtml(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`❌ Failed to fetch page. Status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            console.log("✅ Page HTML successfully fetched!");
            extractPerformersFromHtml(html, url);
        })
        .catch(error => {
            console.error("❌ Error fetching page:", error);
            alert("Failed to download the page. Check the URL.");
        });
}

// Function to extract performer details
function extractPerformersFromHtml(html, pageUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const baseUrl = new URL(pageUrl).origin;
    console.log(`🌍 Using base URL: ${baseUrl}`);

    const performers = [];
    const performerElements = doc.querySelectorAll(".thumbshot");

    if (performerElements.length === 0) {
        console.error("❌ No performers found! Verify the selector `.thumbshot`.");
        alert("No performers found on the page.");
    } else {
        console.log(`✅ Found ${performerElements.length} performer elements.`);
    }

    performerElements.forEach(performer => {
        const nameElement = performer.querySelector(".thumbtext a");
        const name = nameElement ? nameElement.textContent.trim() : "Unknown";

        let url = nameElement ? nameElement.getAttribute("href") : "";
        if (url && !url.startsWith("http")) {
            url = new URL(url, baseUrl).href;
        }

        const imgElement = performer.querySelector(".thumbimg");
        let thumbnail = imgElement ? (imgElement.getAttribute("src") || imgElement.getAttribute("data-src")) : "";
        if (thumbnail && !thumbnail.startsWith("http")) {
            thumbnail = new URL(thumbnail, baseUrl).href;
        }

        console.log(`🎯 Extracted Performer: Name: ${name}, URL: ${url}, Thumbnail: ${thumbnail}`);

        performers.push({ name, url, thumbnail });
    });

    displayExtractedPerformers(performers);

    chrome.storage.local.set({ scannedPerformers: performers }, () => {
        console.log("✅ Performers saved in Chrome Storage.");
    });
}

// Function to update the table and add a "Download Profile" button
function displayExtractedPerformers(performers) {
    const tableBody = document.getElementById("performerTable");

    if (!tableBody) {
        console.error("❌ performerTable not found!");
        return;
    }

    tableBody.innerHTML = "";

    if (performers.length === 0) {
        console.error("❌ No performers found.");
        return;
    }

    performers.forEach(performer => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><img src="${performer.thumbnail}" alt="${performer.name}" width="50"></td>
            <td>${performer.name}</td>
            <td><a href="${performer.url}" target="_blank">${performer.url}</a></td>
            <td><button class="downloadProfile" data-url="${performer.url}" data-name="${performer.name}">Download Profile</button></td>
        `;

        tableBody.appendChild(newRow);
    });

    document.querySelectorAll(".downloadProfile").forEach(button => {
        button.addEventListener("click", (event) => {
            const url = event.target.getAttribute("data-url");
            const name = event.target.getAttribute("data-name");
            downloadProfileData(url, name);
        });
    });

    console.log("✅ Performer list updated in the table.");
}

// Function to fetch and save detailed performer profile data
function downloadProfileData(url, name) {
    console.log(`🔍 Fetching profile data for ${name} from ${url}...`);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`❌ Failed to fetch profile. Status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            console.log(`✅ Profile data fetched for ${name}`);
            extractProfileDetails(html, url, name);
        })
        .catch(error => {
            console.error(`❌ Error fetching profile for ${name}:`, error);
            alert(`Failed to download ${name}'s profile.`);
        });
}

// Function to extract bio details from the profile page
function extractBioDetails(doc) {
    const bioList = doc.querySelector("#biolist");

    if (!bioList) {
        console.error("❌ Bio list (#biolist) not found!");
        return {};
    }

    const bioData = {};

    bioList.querySelectorAll("li").forEach(li => {
        const labelElement = li.querySelector(".label");
        if (!labelElement) return;

        const label = labelElement.textContent.replace(":", "").trim(); // Get label text
        let value = li.cloneNode(true); // Clone the <li> to safely extract text
        value.querySelector(".label")?.remove(); // Remove the label from extracted text

        // Get the cleaned-up value text
        let extractedText = value.innerText.trim();

        // Handle cases where the value contains links
        const links = value.querySelectorAll("a");
        if (links.length > 0) {
            extractedText = Array.from(links).map(link => link.textContent.trim()).join(", ");
        }

        bioData[label] = extractedText;
    });

    console.log("✅ Extracted Bio Data:", bioData);
    return bioData;
}

// Function to extract full profile details from HTML
function extractProfileDetails(html, url, name) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const bioData = extractBioDetails(doc); // Extract bio details

    const performerDetails = {
        name: name,
        url: url,
        ...bioData, // Merge bio data
        imageUrl: doc.querySelector(".profile-image-selector")?.src || ""
    };

    console.log(`✅ Extracted details for ${name}:`, performerDetails);

    chrome.storage.local.get("detailedPerformers", (data) => {
        let savedProfiles = data.detailedPerformers || [];
        savedProfiles.push(performerDetails);

        chrome.storage.local.set({ detailedPerformers: savedProfiles }, () => {
            console.log(`✅ Profile saved for ${name}`);
            saveProfileToJson(savedProfiles);
        });
    });
}

// Function to save profile details as a JSON file
function saveProfileToJson(profiles) {
    const jsonData = JSON.stringify(profiles, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "../storage/performer_profiles.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log("✅ JSON file saved: performer_profiles.json");
}
