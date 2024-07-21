import { parseCSV } from './parseCSV.js';
import { arretComptesClotureEcritures } from './ecritures.js';
import { creationBalance, injecteBalanceEcritures } from './balance.js';
import { creationGrandLivre, injecteGrandLivreEcritures } from './grand-livre.js';
import { creationCompteResultat, injecteCompteResultatEcritures } from './compte-resultat.js';
import { creationBilan, injecteBilanEcritures } from './bilan.js';
import { creationJournal, injecteJournalEcritures } from './journal.js';
import { creationInventaire, injecteInventaireEcritures } from './inventaire.js';

document.addEventListener('DOMContentLoaded', init);

function init() {
    fetchEnvConfig()
        .then(env => {
            const { SHEET_ID, SHEETNAME_TO_GID } = env;
            setupInfoModal();
            loadNavigation(SHEET_ID, SHEETNAME_TO_GID);
        });
}

async function loadEnvConfig() {
    try {
        let response = await fetch('.env.json');
        if (!response.ok) {
            response = await fetch('env.example.json');
            if (!response.ok) {
                throw new Error('Impossible de charger la configuration');
            }
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

async function fetchEnvConfig() {
    return loadEnvConfig();
}

function setupInfoModal() {
    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');
    const closeBtn = document.querySelector('.close');

    infoBtn.addEventListener('click', () => {
        infoModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        infoModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === infoModal) {
            infoModal.style.display = 'none';
        }
    });
}

function loadNavigation(SHEET_ID, SHEETNAME_TO_GID) {
    fetch('nav.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navigation').innerHTML = data;
            setupPageLinks();
            injectYearLinks(SHEETNAME_TO_GID);
            setupYearLinks(SHEET_ID, SHEETNAME_TO_GID);
            injectSheetLink(SHEET_ID);
        });
}

function setupPageLinks() {
    const pageLinks = document.querySelectorAll('nav ul:first-of-type li a');
    const currentPage = location.pathname.split('/').pop();
    pageLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.parentElement.classList.add('menu-selected');
        }
    });
}

function injectYearLinks(SHEETNAME_TO_GID) {
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

function setupYearLinks(SHEET_ID, SHEETNAME_TO_GID) {
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

function injectSheetLink(sheetId) {
    const sheetLink = document.getElementById('sheet-nav');
    const link = document.createElement('a');
    link.href = `https://docs.google.com/spreadsheets/d/${sheetId}`;
    link.textContent = 'Voir les données (sheet)';
    link.target = '_blank';
    sheetLink.appendChild(link);
}

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function hideErrorMessage() {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.style.display = 'none';
}

function loadCSV(sheetId, sheetNameToGid, currentYear) {
    const currentPage = location.pathname.split('/').pop();
    const sheetName = currentPage && currentPage.startsWith('inventaire') ? 'inventaire' : currentYear;
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&pli=1&gid=${sheetNameToGid[sheetName]}#gid=${sheetNameToGid[sheetName]}`;

    hideErrorMessage();
    showLoader();

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(csvText => {
            const jsonData = parseCSV(csvText);
            injectDataIntoPage(jsonData, currentYear);
            hideLoader();
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            hideLoader();
        });
}

function injectDataIntoPage(jsonData, currentYear) {
    const mappings = [
        { id: 'journal-ecritures', create: creationJournal, inject: injecteJournalEcritures },
        { id: 'balance-ecritures', create: creationBalance, inject: injecteBalanceEcritures },
        { id: 'grand-livre-ecritures', create: creationGrandLivre, inject: injecteGrandLivreEcritures },
        { id: 'compte-resultat-ecritures', create: creationCompteResultat, inject: injecteCompteResultatEcritures },
        { id: 'bilan-ecritures', create: creationBilan, inject: injecteBilanEcritures },
        { id: 'inventaire-ecritures', create: creationInventaire, inject: injecteInventaireEcritures }
    ];

    mappings.forEach(({ id, create, inject }) => {
        const element = document.getElementById(id);
        if (element) {
            const ecritures = create(jsonData, currentYear);
            inject(ecritures);
        }
    });
}
