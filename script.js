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

    // --- Terminal Welcome Screen ---
    function displayWelcomeTerminal() {
        const lines = [
            "Initializing learning log...",
            "System ready.",
            "Welcome, Panda.",
            "Please select a log from the sidebar to begin."
        ];
        let html = '<div class="terminal-container">';
        lines.forEach((_, index) => {
            // Add an empty span for the text to be typed into
            html += `<p class="terminal-line" id="line-${index}"><span class="prompt">&gt;</span><span class="typed-text"></span></p>`;
        });
        html += '</div>';
        contentContainer.innerHTML = html;

        let lineIndex = 0;
        let charIndex = 0;

        function type() {
            if (lineIndex < lines.length) {
                const currentLineText = lines[lineIndex];
                const lineElement = document.querySelector(`#line-${lineIndex} .typed-text`);
                
                if (charIndex < currentLineText.length) {
                    lineElement.textContent += currentLineText.charAt(charIndex);
                    charIndex++;
                    setTimeout(type, 50); // Typing speed
                } else {
                    lineIndex++;
                    charIndex = 0;
                    if (lineIndex < lines.length) {
                        setTimeout(type, 500); // Delay between lines
                    } else {
                        // Add blinking cursor at the end of the last line
                        const lastLine = document.getElementById(`line-${lines.length - 1}`);
                        lastLine.innerHTML += '<span class="cursor">&nbsp;</span>';
                    }
                }
            }
        }
        type();
    }

    // --- Automatic File Discovery ---
    async function fetchAndBuildNav() {
        try {
            const treeUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`;
            const response = await fetch(treeUrl);
            if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);
            const data = await response.json();

            const logFiles = data.tree
                .map(item => item.path)
                .filter(path => path.startsWith('logs/') && path.endsWith('.md'));

            if (logFiles.length === 0) {
                navContainer.innerHTML = '<p class="loading-message">No log files found in the `logs` directory.</p>';
                return;
            }

            const fileStructure = {};
            logFiles.forEach(path => {
                const parts = path.split('/');
                if (parts.length < 4) return;
                const [_, year, quarter, file] = parts;
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

    // --- Function to build the navigation ---
    function buildNav(structure) {
        let navHTML = '';
        const sortedYears = Object.keys(structure).sort((a, b) => b - a);

        for (const year of sortedYears) {
            navHTML += `<h3>${year}</h3>`;
            const sortedQuarters = Object.keys(structure[year]).sort(); 

            for (const quarter of sortedQuarters) {
                navHTML += `<h4>${quarter.replace(/-/g, ' ')}</h4><ul>`;
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
            contentContainer.innerHTML = `<article class="log-entry">${marked.parse(markdown)}</article>`;
        } catch (error) {
            console.error('Error loading file:', error);
            contentContainer.innerHTML = `<article class="log-entry"><h1>Error</h1><p>Could not load the log file. Please check the file path.</p></article>`;
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
    displayWelcomeTerminal();
});
