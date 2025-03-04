document.addEventListener("DOMContentLoaded", async () => {
    const categoriesContainer = document.getElementById("categories-container");
    const scanButton = document.getElementById("scan-categories");
    const sourceUrl = "https://www.babepedia.com/lists";
    document.getElementById("source-url").innerHTML = `<a href='${sourceUrl}' target='_blank'>${sourceUrl}</a>`;

    scanButton.addEventListener("click", async () => {
        categoriesContainer.innerHTML = "Loading categories...";
        try {
            categories  = extractCategories('test');
    

            displayCategories(categories);
        } catch (error) {
            categoriesContainer.innerHTML = "Failed to load categories.";
            console.error("Error fetching categories:", error);
        }
    });

function extractCategories() {
    let categories = [];

    // Select all <ul class="toplists"> elements
    document.querySelectorAll("ul.toplists li a").forEach((link) => {
        const categoryName = link.textContent.trim();
        const categoryURL = link.href;

        if (categoryName && categoryURL) {
            categories.push({
                name: categoryName,
                url: categoryURL
            });
        }
    });

    console.log("Extracted Categories:", categories);

    // Store categories in Chrome storage
    chrome.storage.local.set({ categories }, () => {
        console.log("✅ Categories stored successfully!");
    });

    return categories;
}

// Call the function when content loads



    function displayCategories(categories) {
        categoriesContainer.innerHTML = "";
        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Thumbnail</th>
                    <th>Category Name</th>
                    <th>URL</th>
                </tr>
            </thead>
            <tbody>
                ${categories.map(cat => `
                    <tr>
                        <td><img src="${cat.img}" width="50" height="50"></td>
                        <td><a href="${categories.url}" target="_blank">${cat.name}</a></td>
                        <td><button class="select-category" data-url="${categories.url}">Switch</button></td>
                    </tr>
                `).join("")}
            </tbody>
        `;
        categoriesContainer.appendChild(table);

        document.querySelectorAll(".select-category").forEach(button => {
            button.addEventListener("click", (event) => {
                const selectedUrl = event.target.getAttribute("data-url");
                chrome.storage.local.set({ activeTab: selectedUrl }, () => {
                    window.location.href = "../pages/scan_performers.html";
                });
            });
        });
    }
});
