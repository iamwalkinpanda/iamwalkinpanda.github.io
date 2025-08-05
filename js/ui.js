// FILE: js/ui.js
import { fetchFileContent } from './api.js';

const navContainer = document.getElementById('file-navigation');
const contentContainer = document.getElementById('content');
const calendarContainer = document.getElementById('calendar-container');

/**
 * Toggles the dark mode class on the body.
 * @param {string} theme - The theme to apply ('dark' or 'light').
 */
export function applyTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
}

/**
 * Renders the main navigation list from the file structure.
 * @param {object} structure - The hierarchical file structure.
 */
export function buildNav(structure) {
    let navHTML = '';
    const sortedYears = Object.keys(structure).sort((a, b) => b - a);
    for (const year of sortedYears) {
        // Year header and content container
        navHTML += `<h3 class="collapsible-header">${year}</h3>`;
        navHTML += `<div class="collapsible-content">`;

        const sortedQuarters = Object.keys(structure[year]).sort();
        for (const quarter of sortedQuarters) {
            // Quarter header and content container
            navHTML += `<h4 class="collapsible-header">${quarter.replace(/-/g, ' ')}</h4>`;
            navHTML += `<ul class="collapsible-content">`;
            
            const sortedFiles = structure[year][quarter].sort().reverse();
            sortedFiles.forEach(file => {
                const filePath = `logs/${year}/${quarter}/${file}`;
                navHTML += `<li><a href="#" data-path="${filePath}">${file.replace('.md', '')}</a></li>`;
            });

            navHTML += `</ul>`; // End of quarter ul
        }
        navHTML += `</div>`; // End of year div
    }
    navContainer.innerHTML = navHTML;

    // Add event listeners for collapsing/expanding
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            header.classList.toggle('expanded');
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}

/**
 * Renders the calendar for a given month and year.
 * @param {Date} date - The date to display the calendar for.
 * @param {object} logEntries - A map of all log entry paths.
 * @returns {function} A function to re-render the calendar.
 */
export function generateCalendar(date, logEntries) {
    const render = (currentDate) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let calendarHTML = `
            <div class="calendar-header">
                <button id="prev-month">&lt;</button>
                <span class="calendar-month-year">${monthNames[month]} ${year}</span>
                <button id="next-month">&gt;</button>
            </div>
            <div class="calendar-grid">
                ${daysOfWeek.map(day => `<div class="calendar-day-name">${day}</div>`).join('')}
        `;
        for (let i = 0; i < firstDay; i++) calendarHTML += `<div></div>`;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entryPath = Object.keys(logEntries).find(path => path.includes(dateStr));
            if (entryPath) {
                calendarHTML += `<div class="calendar-day has-entry" data-path="${entryPath}">${day}</div>`;
            } else {
                calendarHTML += `<div class="calendar-day">${day}</div>`;
            }
        }
        calendarHTML += `</div>`;
        calendarContainer.innerHTML = calendarHTML;

        document.getElementById('prev-month').onclick = () => render(new Date(currentDate.setMonth(month - 1)));
        document.getElementById('next-month').onclick = () => render(new Date(currentDate.setMonth(month + 1)));
    };
    render(date);
}

/**
 * Renders markdown content into the main content area.
 * @param {string} markdown - The markdown string to render.
 */
export function renderContent(markdown) {
    contentContainer.innerHTML = `<article class="log-entry">${marked.parse(markdown)}</article>`;
}

/**
 * Displays an error message in the main content area.
 * @param {string} message - The error message to display.
 */
export function displayError(message) {
    contentContainer.innerHTML = `<article class="log-entry"><h1>Error</h1><p>${message}</p></article>`;
}

/**
 * Displays the animated terminal welcome screen.
 */
export function displayWelcomeTerminal() {
    const lines = ["Initializing learning log...", "System ready.", "Welcome, Panda.", "Please select a log from the sidebar to begin."];
    let html = '<div class="terminal-container">';
    lines.forEach((_, index) => {
        html += `<p class="terminal-line" id="line-${index}"><span class="prompt">&gt;</span><span class="typed-text"></span></p>`;
    });
    html += '</div>';
    contentContainer.innerHTML = html;

    let lineIndex = 0, charIndex = 0;
    function type() {
        if (lineIndex < lines.length) {
            const currentLineText = lines[lineIndex];
            const lineElement = document.querySelector(`#line-${lineIndex} .typed-text`);
            if (charIndex < currentLineText.length) {
                lineElement.textContent += currentLineText.charAt(charIndex++);
                setTimeout(type, 50);
            } else {
                lineIndex++; charIndex = 0;
                if (lineIndex < lines.length) {
                    setTimeout(type, 500);
                } else {
                    document.getElementById(`line-${lines.length - 1}`).innerHTML += '<span class="cursor">&nbsp;</span>';
                }
            }
        }
    }
    type();
}

/**
 * Updates the active link in the navigation and calendar.
 * @param {string} path - The path of the active file.
 */
export function updateActiveLink(path) {
    document.querySelectorAll('#file-navigation a, .calendar-day').forEach(el => el.classList.remove('active'));
    if (path) {
        document.querySelector(`[data-path="${path}"]`)?.classList.add('active');
    }
}