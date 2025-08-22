document.addEventListener("DOMContentLoaded", () => {
    const checkboxes = document.querySelectorAll('#segment-toggles input[type="checkbox"]');

    // Load saved settings
    chrome.storage.sync.get("skipCategories", ({ skipCategories }) => {
        if (skipCategories) {
            checkboxes.forEach(cb => cb.checked = skipCategories.includes(cb.value));
        }
    });

    // Save settings when button clicked
    document.getElementById("save-settings").addEventListener("click", () => {
        const selected = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        chrome.storage.sync.set({ skipCategories: selected }, () => {
            console.log("Saved skip categories:", selected);
            showToast("Settings saved!");
            // alert("Settings saved!");
        });
    });

    document.getElementById("closeBtn").addEventListener("click", () => {
        window.close();
    });

    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.className = "toast show";

        setTimeout(() => {
            toast.className = toast.className.replace("show", "");
        }, 2500);
    }

});
