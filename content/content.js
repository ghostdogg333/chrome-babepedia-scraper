// This content script runs when you are on the Babepedia lists page
const extractCategories = () => {
  const categories = [];
  
  // Select all category links inside the Babepedia lists table
  const categoryElements = document.querySelectorAll(".wikitable a");
  
  categoryElements.forEach((item) => {
    const categoryName = item.textContent.trim();
    const categoryLink = `https://www.babepedia.com${item.getAttribute("href")}`;
    const categoryImg = item.parentElement.parentElement.querySelector("img")?.src || "default_thumbnail.jpg";
    
    categories.push({ name: categoryName, link: categoryLink, img: categoryImg });
  });

  // Save the categories in Chrome storage
  chrome.storage.local.set({ categories: categories }, () => {
    console.log("✅ Categories saved!");
  });
};

// Trigger the extraction when the page loads
document.addEventListener('DOMContentLoaded', extractCategories);

setTimeout(() => {
    // Inject scanner.js into the page
    const scannerScript = document.createElement('script');
    scannerScript.src = chrome.runtime.getURL('scanner.js'); // Adjust path if needed
    document.body.appendChild(scannerScript);
}, 2000);
