// FILE: script.js
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('file-navigation');
    const contentContainer = document.getElementById('content');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // --- GitHub API Configuration ---
    const GITHUB_USER = 'iamwalkinpanda';
    const GITHUB_REPO = 'iamwalkinpanda.github.io';
    const GITHUB_BRANCH = 'main'; // Or 'master', depending on your repo

    // --- Theme Handling ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
    }

    themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // --- Automatic File Discovery ---
    async function fetchAndBuildNav() {
        try {
            // This API call gets the entire file tree recursively
            const treeUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`;
            const response = await fetch(treeUrl);
            if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);
            const data = await response.json();

            // Filter for markdown files inside the 'logs' directory
            const logFiles = data.tree
                .map(item => item.path)
                .filter(path => path.startsWith('logs/') && path.endsWith('.md'));

            if (logFiles.length === 0) {
                navContainer.innerHTML = '<p class="loading-message">No log files found in the `logs` directory.</p>';
                return;
            }

            // Dynamically build the file structure object from the paths
            const fileStructure = {};
            logFiles.forEach(path => {
                const parts = path.split('/'); // e.g., ['logs', '2025', 'Quarterback-1', '2025-07-09.md']
                if (parts.length < 4) return; // Ignore files not in a quarter folder

                const year = parts[1];
                const quarter = parts[2];
                const file = parts[3];

                if (!fileStructure[year]) fileStructure[year] = {};
                if (!fileStructure[year][quarter]) fileStructure[year][quarter] = [];
                fileStructure[year][quarter].push(file);
            });
            
            buildNav(fileStructure);

        } catch (error) {
            console.error('Failed to fetch file tree:', error);
            navContainer.innerHTML = '<p class="loading-message">Error loading file list from GitHub.</p>';
        }
    }

    // --- Function to build the navigation from the dynamic structure ---
    function buildNav(structure) {
        let navHTML = '';
        // Sort years in descending order
        const sortedYears = Object.keys(structure).sort((a, b) => b - a);

        for (const year of sortedYears) {
            navHTML += `<h3>${year}</h3>`;
            // Sort quarters, you can customize this logic if needed
            const sortedQuarters = Object.keys(structure[year]).sort(); 

            for (const quarter of sortedQuarters) {
                navHTML += `<h4>${quarter.replace(/-/g, ' ')}</h4><ul>`;
                // Sort files by date descending
                const sortedFiles = structure[year][quarter].sort().reverse();

                sortedFiles.forEach(file => {
                    const filePath = `logs/${year}/${quarter}/${file}`;
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
            if (!response.ok) throw new Error(`File not found: ${path}`);
            const markdown = await response.text();
            contentContainer.innerHTML = `<div class="log-entry">${marked.parse(markdown)}</div>`;
        } catch (error) {
            console.error('Error loading file:', error);
            contentContainer.innerHTML = `<div class="log-entry"><h1>Error</h1><p>Could not load the log file. Please check the file path.</p></div>`;
        }
    }

    // --- Event Delegation for Navigation Clicks ---
    navContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const filePath = e.target.dataset.path;
            
            document.querySelectorAll('#file-navigation a').forEach(link => link.classList.remove('active'));
            e.target.classList.add('active');

            loadFile(filePath);
        }
    });

    // --- Initial setup ---
    fetchAndBuildNav();
});
