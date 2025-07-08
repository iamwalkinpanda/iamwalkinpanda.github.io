// FILE: js/api.js
const GITHUB_USER = 'iamwalkinpanda';
const GITHUB_REPO = 'iamwalkinpanda.github.io';
const GITHUB_BRANCH = 'main';

/**
 * Fetches the file tree from the GitHub repository.
 * @returns {Promise<Array>} A promise that resolves to an array of file paths.
 */
export async function fetchLogFilePaths() {
    const treeUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`;
    const response = await fetch(treeUrl);
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.tree
        .map(item => item.path)
        .filter(path => path.startsWith('logs/') && path.endsWith('.md'));
}

/**
 * Fetches the content of a specific markdown file.
 * @param {string} path - The full path to the file in the repository.
 * @returns {Promise<string>} A promise that resolves to the markdown content.
 */
export async function fetchFileContent(path) {
    // Construct the direct URL to the raw file
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
    const response = await fetch(rawUrl);
    if (!response.ok) {
        throw new Error(`File not found: ${path}`);
    }
    return await response.text();
}