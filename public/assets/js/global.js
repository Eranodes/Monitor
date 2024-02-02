// Function to load external HTML file into a specified container
const loadHTML = (filePath, containerId) => {
    const container = document.getElementById(containerId);
    if (container) {
        // Display loader while loading
        container.innerHTML = '<div id="loader-container"></div>';
        const loaderContainer = document.getElementById("loader-container");
        if (loaderContainer) {
            loadLoader("assets/common/loader.html", "loader-container");
        }

        fetch(filePath)
            .then(response => response.text())
            .then(data => {
                // Remove loader once content is loaded
                container.innerHTML = data;
                stopLoader();
            })
            .catch(error => {
                console.error(`Error loading HTML: ${error}`);
                stopLoader();
            });
    }
};

// Function to load the loader
const loadLoader = (filePath, containerId) => {
    const loaderContainer = document.getElementById(containerId);
    if (loaderContainer) {
        fetch(filePath)
            .then(response => response.text())
            .then(data => {
                // Insert loader content
                loaderContainer.innerHTML = data;
            })
            .catch(error => {
                console.error(`Error loading loader HTML: ${error}`);
            });
    }
};

// Function to stop the loader animation
const stopLoader = () => {
    const loaderContainer = document.getElementById("loader-container");
    if (loaderContainer) {
        loaderContainer.innerHTML = ''; // Remove loader content
    }

    // Additional checks or actions after the loader is stopped
    console.log("Loader stopped. Perform additional checks or actions here.");
};

// Load header and footer
document.addEventListener("DOMContentLoaded", () => {
    loadHTML("assets/common/header.html", "header-container");
    loadHTML("assets/common/footer.html", "footer-container");
});
