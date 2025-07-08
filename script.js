document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('file-navigation');
    const contentContainer = document.getElementById('content');

    // --- YOUR FILE STRUCTURE GOES HERE ---
    // This is the only part you need to update when you add new files.
    const fileStructure = {
        "2025": {
            "Quarterback-1": [
                "2025-07-09.md",
                // Add new file names here as strings
            ],
            "Quarterback-2": [
                // Files for the next quarter will go here
            ]
        }
    };

    // --- Function to build the navigation ---
    function buildNav() {
        let navHTML = '';
        for (const year in fileStructure) {
            navHTML += `<h3>${year}</h3>`;
            for (const quarter in fileStructure[year]) {
                navHTML += `<h4>${quarter.replace('-', ' ')}</h4><ul>`;
                fileStructure[year][quarter].forEach(file => {
                    const filePath = `logs/${year}/${quarter}/${file}`;
                    // Extract date from filename for display
                    const displayName = file.replace('.md', ''); 
                    navHTML += `<li><a href="#" data-path="${filePath}">${displayName}</a></li>`;
                });
                navHTML += `</ul>`;
            }
        }
        navContainer.innerHTML = navHTML;
    }

    // --- Function to load and render a markdown file ---
    async function loadFile(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`File not found: ${path}`);
            }
            const markdown = await response.text();
            // Use the 'marked' library to convert markdown to HTML
            contentContainer.innerHTML = `<div class="log-entry">${marked.parse(markdown)}</div>`;
        } catch (error) {
            console.error('Error loading file:', error);
            contentContainer.innerHTML = `<div class="log-entry"><h1>Error</h1><p>Could not load the log file. Please check the file path and make sure it exists.</p></div>`;
        }
    }

    // --- Event Delegation for Navigation Clicks ---
    navContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const filePath = e.target.dataset.path;
            
            // Remove active class from all links
            document.querySelectorAll('#file-navigation a').forEach(link => link.classList.remove('active'));
            // Add active class to the clicked link
            e.target.classList.add('active');

            loadFile(filePath);
        }
    });

    // --- Initial setup ---
    buildNav();
});