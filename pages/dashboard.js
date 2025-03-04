   // Retrieve stored data globally from Chrome Storage
    chrome.storage.local.get(["currentTabUrl", "targetWebsite", "websiteCategories"], (data) => {
            document.getElementById("currentTabUrl").textContent = data.currentTabUrl || "No URL found";
            document.getElementById("targetWebsite").textContent = data.targetWebsite || "No Website found";
            document.getElementById("currentTabTitle").textContent = data.currentTabTitle || "No Title found";

        const categoriesList = document.getElementById("storedCategoriesList");
        categoriesList.innerHTML = ""; // Clear old data

        if (data.websiteCategories && data.websiteCategories.length > 0) {
            data.websiteCategories.forEach((category) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `<a href="${category.url}" target="_blank">${category.name}</a>`;
                categoriesList.appendChild(listItem);
            });
        } else {
            categoriesList.innerHTML = "<li>No categories stored.</li>";
        }
    }); 

// document.addEventListener("DOMContentLoaded", () => {
//     // Get and display the website's URL from the active tab
//     chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
//         if (tabs.length > 0) {
//             const tabUrl = tabs[0].url; // Get the actual website URL
//             document.getElementById("currentTabUrl").textContent = tabUrl;
//         } else {
//             document.getElementById("currentTabUrl").textContent = "No active tab found.";
//         }
//     });

//     // Listen for messages from scanner.js with extracted performer data
//     chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//         if (message.action === "updateDashboard") {
//             updatePerformerTable(message.performers);
//         }
//     });
// });


// Function to update the table with extracted performer details
function updatePerformerTable(performers) {
    const tableBody = document.getElementById("performerTable");

    // Clear old data
    tableBody.innerHTML = "";

    performers.forEach(performer => {
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td><img src="${performer.thumbnail}" alt="${performer.name}" width="50"></td>
            <td>${performer.name}</td>
            <td><a href="${performer.url}" target="_blank">${performer.url}</a></td>
            <td id="status-${performer.name}">Pending</td>
            <td><button class="fetch-details" data-name="${performer.name}" data-url="${performer.url}">Fetch Details</button></td>
        `;

        tableBody.appendChild(newRow);
    });

    // Attach event listeners to the "Fetch Details" buttons
    document.querySelectorAll(".fetch-details").forEach(button => {
        button.addEventListener("click", function () {
            const name = this.getAttribute("data-name");
            const url = this.getAttribute("data-url");

            // Update status to "Downloading"
            document.getElementById(`status-${name}`).textContent = "Downloading...";

            // Send request to download profile
            chrome.runtime.sendMessage({ action: "downloadProfile", performer: { name, url } });
        });
    });
}
