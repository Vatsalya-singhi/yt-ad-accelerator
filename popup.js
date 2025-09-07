document.addEventListener("DOMContentLoaded", () => {
    const checkboxes = document.querySelectorAll('#segment-toggles input[type="checkbox"]');
    const DEFAULT_CATEGORIES = [
        "sponsor", "intro", "outro", "interaction",
        "selfpromo", "music_offtopic", "preview", "filler"
    ];

    /**
     * Load saved settings
     */
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.get("skipCategories", ({ skipCategories }) => {
            const activeCategories = skipCategories || DEFAULT_CATEGORIES;
            checkboxes.forEach(cb => {
                cb.checked = activeCategories.includes(cb.value);
            });
        });
    } else {
        console.warn("chrome.storage.local not available – using defaults.");
        checkboxes.forEach(cb => {
            cb.checked = DEFAULT_CATEGORIES.includes(cb.value);
        });
    }

    /**
     * Save settings when button clicked
     */
    document.getElementById("save-settings").addEventListener("click", () => {
        const selected = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.set({ skipCategories: selected }, () => {
                console.log("Saved skip categories:", selected);
                showToast("Settings saved!");
            });
        } else {
            console.warn("chrome.storage.local not available – cannot save settings.");
            showToast("Settings could not be saved (storage unavailable).");
        }
    });

    /**
     * Close popup
     */
    document.getElementById("closeBtn").addEventListener("click", () => {
        window.close();
    });

    /**
     * Toast helper
     */
    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.className = "toast show";

        setTimeout(() => {
            toast.className = toast.className.replace("show", "");
        }, 2500);
    }
});
