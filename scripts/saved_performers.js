// saved_performers.js
document.addEventListener("DOMContentLoaded", () => {
    const request = indexedDB.open("BabepediaDB", 1);
    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("performers", "readonly");
        const store = transaction.objectStore("performers");
        const getAll = store.getAll();

        getAll.onsuccess = () => {
            const performers = getAll.result;
            const tableBody = document.getElementById("performers-list");
            tableBody.innerHTML = "";
            
            performers.forEach(performer => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${performer.name}</td>
                    <td>${performer.birthdate}</td>
                    <td>${performer.nationality}</td>
                    <td>${performer.city}</td>
                    <td>${performer.hairColor}</td>
                    <td>${performer.eyeColor}</td>
                    <td>${performer.profession}</td>
                    <td>${performer.biography}</td>
                    <td><img src="${performer.imageUrl}" width="50" height="50"></td>
                `;
                tableBody.appendChild(row);
            });
        };
    };
});