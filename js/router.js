// FILE: js/router.js
import { fetchFileContent } from './api.js';
import { renderContent, displayError, displayWelcomeTerminal, updateActiveLink } from './ui.js';

let logEntries = {};

/**
 * Initializes the router with the log entries map.
 * @param {object} entries - The map of log entries.
 */
export function initRouter(entries) {
    logEntries = entries;
}

/**
 * Navigates to a specific log entry, updating the URL and content.
 * @param {string|null} path - The path to the log file, or null for the home screen.
 */
export async function navigate(path) {
    if (!path) {
        displayWelcomeTerminal();
        updateActiveLink(null);
        history.pushState({ path: null }, '', '/');
        return;
    }
    
    const entry = logEntries[path];
    if (!entry) {
        displayError("Log entry not found.");
        return;
    }

    try {
        const markdown = await fetchFileContent(path);
        renderContent(markdown);
        
        const { year, quarter, file } = entry;
        // This creates the new URL format: /logs/2025/cycle-1/2025-07-08
        const cleanUrl = `/logs/${year}/${quarter}/${file.replace('.md', '')}`;
        history.pushState({ path }, '', cleanUrl);
        updateActiveLink(path);

    } catch (error) {
        console.error('Navigation error:', error);
        displayError("Could not load the log file.");
    }
}

/**
 * Handles the initial page load, reading the URL to show the correct content.
 */
export function handleInitialLoad() {
    const urlPath = window.location.pathname.replace(/\/$/, "");
    const parts = urlPath.split('/').filter(p => p);
    
    // Check for the new URL format: /logs/year/quarter/filename
    if (parts.length === 4 && parts[0] === 'logs') {
        const [_, year, quarter, filename] = parts;
        const entryPath = `logs/${year}/${quarter}/${filename}.md`;
        
        // Check if the constructed path exists in our fetched entries
        if (logEntries[entryPath]) {
            navigate(entryPath);
            return;
        }
    }
    // If URL doesn't match, show the welcome screen
    displayWelcomeTerminal();
}

/**
 * Sets up all necessary event listeners for navigation.
 */
export function setupEventListeners() {
    const navContainer = document.getElementById('file-navigation');
    const calendarContainer = document.getElementById('calendar-container');
    const homeLink = document.getElementById('home-link');

    navContainer.addEventListener('click', e => {
        if (e.target.matches('a')) {
            e.preventDefault();
            navigate(e.target.dataset.path);
        }
    });

    calendarContainer.addEventListener('click', e => {
        if (e.target.matches('.has-entry')) {
            e.preventDefault();
            navigate(e.target.dataset.path);
        }
    });

    homeLink.addEventListener('click', e => {
        e.preventDefault();
        navigate(null); // Navigate to home
    });

    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.path) {
            navigate(e.state.path);
        } else {
            navigate(null);
        }
    });
}