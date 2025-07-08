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
        history.pushState({ path: null }, '', window.location.pathname.split('index.html')[0]);
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
        const datePart = file.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (datePart) {
            const cleanUrl = `/${year}/${quarter}/${datePart[2]}-${datePart[3]}`;
            history.pushState({ path }, '', cleanUrl);
        }
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
    
    if (parts.length === 3) {
        const [year, quarter, dayMonth] = parts;
        const [month, day] = dayMonth.split('-');
        const dateStr = `${year}-${month}-${day}`;
        const entryPath = Object.keys(logEntries).find(p => p.includes(dateStr) && p.includes(quarter));
        if (entryPath) {
            navigate(entryPath);
            return;
        }
    }
    displayWelcomeTerminal();
}

/**
 * Sets up all necessary event listeners for navigation.
 */
export function setupEventListeners() {
    const navContainer = document.getElementById('file-navigation');
    const calendarContainer = document.getElementById('calendar-container');

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

    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.path) {
            navigate(e.state.path);
        } else {
            navigate(null);
        }
    });
}