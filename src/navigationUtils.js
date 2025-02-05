import { loadCSV } from './loadCSV.js';
import { injectDataIntoPage } from './injectData.js';
import { showLoader, hideLoader } from './loader.js';

export function setupPageLinks() {
    const pageLinks = document.querySelectorAll('nav ul:first-of-type li a');
    const currentPage = location.pathname.split('/').pop();
    pageLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.parentElement.classList.add('menu-selected');
        }
    });
}

export function injectYearLinks() {
    const yearNav = document.getElementById('annee-nav');
    const sheetTabsToGID = JSON.parse(localStorage.getItem('compta_params'))

    Object.keys(sheetTabsToGID).forEach(year => {
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
    setupYearLinks(sheetTabsToGID);
}

export function setupYearLinks(sheetTabsToGID) {
    const yearLinks = document.querySelectorAll('.annee-nav a');
    const storedCurrentYear = localStorage.getItem('compta_selectedYear') || '2025';
    yearLinks.forEach(link => {
        if (link.getAttribute('data-year') === storedCurrentYear) {
            link.classList.add('menu-selected');
        }
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const selectedYear = event.target.getAttribute('data-year');
            localStorage.setItem('compta_selectedYear', selectedYear);
            loadCSV(sheetTabsToGID[selectedYear]).then(parseCSV => {
                injectDataIntoPage(parseCSV, selectedYear);
            });
            yearLinks.forEach(l => l.classList.remove('menu-selected'));
            event.target.classList.add('menu-selected');
        });
    });

    showLoader();
    loadCSV(sheetTabsToGID[storedCurrentYear]).then(parseCSV => {
        hideLoader();
        injectDataIntoPage(parseCSV, storedCurrentYear);
    });
}

export function injectSheetLink() {
    const sheetLink = document.getElementById('sheet-nav');
    const input = document.getElementById('sheetIdInput');
    const storedId = localStorage.getItem('compta_sheetId');
    
    input.value = storedId;
    
    input.addEventListener('input', (e) => {
        localStorage.setItem('compta_sheetId', e.target.value);
        updateSheetLink();
    });

    function updateSheetLink() {
        sheetLink.innerHTML = '';
        
        const link = document.createElement('a');
        link.href = `https://docs.google.com/spreadsheets/d/${input.value}`;
        link.textContent = 'Voir les données (sheet)';
        link.target = '_blank';
        sheetLink.appendChild(link);
    }

    updateSheetLink();
}