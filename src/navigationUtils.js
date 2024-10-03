import { loadCSV } from './loadCSV.js';

export function setupPageLinks() {
    const pageLinks = document.querySelectorAll('nav ul:first-of-type li a');
    const currentPage = location.pathname.split('/').pop();
    pageLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.parentElement.classList.add('menu-selected');
        }
    });
}

export function injectYearLinks(SHEETNAME_TO_GID) {
    const yearNav = document.getElementById('annee-nav');
    Object.keys(SHEETNAME_TO_GID).forEach(year => {
        if (!isNaN(year)) {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = year;
            link.setAttribute('data-year', year);
            li.appendChild(link);
            yearNav.appendChild(li);
        }
    });
}

export function setupYearLinks(SHEET_ID, SHEETNAME_TO_GID) {
    const yearLinks = document.querySelectorAll('.annee-nav a');
    const currentYear = localStorage.getItem('selectedYear') || '2024';
    yearLinks.forEach(link => {
        if (link.getAttribute('data-year') === currentYear) {
            link.classList.add('menu-selected');
        }
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const selectedYear = event.target.getAttribute('data-year');
            localStorage.setItem('selectedYear', selectedYear);
            loadCSV(SHEET_ID, SHEETNAME_TO_GID, selectedYear);
            yearLinks.forEach(l => l.classList.remove('menu-selected'));
            event.target.classList.add('menu-selected');
        });
    });

    loadCSV(SHEET_ID, SHEETNAME_TO_GID, currentYear);
}

export function injectSheetLink(sheetId) {
    const sheetLink = document.getElementById('sheet-nav');
    const link = document.createElement('a');
    link.href = `https://docs.google.com/spreadsheets/d/${sheetId}`;
    link.textContent = 'Voir les données (sheet)';
    link.target = '_blank';
    sheetLink.appendChild(link);
}