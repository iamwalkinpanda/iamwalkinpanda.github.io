// FILE: js/main.js
// This script handles the 404 redirect logic for single-page apps on GitHub Pages.
(function() {
    const redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    // If we have a redirect path stored and it's not the current page, update the URL.
    if (redirect && redirect !== location.href) {
        history.replaceState(null, null, redirect);
    }
})();


import { fetchLogFilePaths } from './api.js';
import { applyTheme, buildNav, generateCalendar, displayError } from './ui.js';
import { initRouter, handleInitialLoad, setupEventListeners } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // --- State ---
    let logEntries = {};
    let currentDate = new Date();

    // --- Theme Setup ---
    themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
    applyTheme(localStorage.getItem('theme') || 'light');

    // --- Main Initialization Function ---
    async function initialize() {
        try {
            const logFilePaths = await fetchLogFilePaths();

            if (logFilePaths.length === 0) {
                document.getElementById('file-navigation').innerHTML = '<p class="loading-message">No log files found.</p>';
                return;
            }

            // Create the logEntries map and fileStructure for navigation
            const fileStructure = {};
            logFilePaths.forEach(path => {
                const parts = path.split('/');
                if (parts.length < 4) return;
                const [_, year, quarter, file] = parts;
                logEntries[path] = { year, quarter, file };
                if (!fileStructure[year]) fileStructure[year] = {};
                if (!fileStructure[year][quarter]) fileStructure[year][quarter] = [];
                fileStructure[year][quarter].push(file);
            });

            // Initialize UI and Router with the fetched data
            buildNav(fileStructure);
            generateCalendar(currentDate, logEntries);
            initRouter(logEntries);
            setupEventListeners();
            handleInitialLoad();

        } catch (error) {
            console.error('Failed to initialize:', error);
            displayError('Could not load file list from GitHub.');
        }
    }

    // --- Start the application ---
    initialize();
});