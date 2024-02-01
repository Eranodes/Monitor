// Function to load external HTML file into a specified container
const loadHTML = (filePath, containerId) => {
    const container = document.getElementById(containerId);
    if (container) {
        fetch(filePath)
            .then(response => response.text())
            .then(data => {
                container.innerHTML = data;
            })
            .catch(error => {
                console.error(`Error loading HTML: ${error}`);
            });
    }
};

// Load header and footer
document.addEventListener("DOMContentLoaded", () => {
    loadHTML("assets/common/header.html", "header-container");
    loadHTML("assets/common/footer.html", "footer-container");
});
