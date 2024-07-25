import { parseCSV } from './parseCSV.js';
import { arretComptesClotureEcritures } from './gestion-ecritures.js';
import { creationBalance, injecteBalanceEcritures } from './balance.js';
import { creationGrandLivre, injecteGrandLivreEcritures } from './grand-livre.js';
import { creationCompteResultat, injecteCompteResultatEcritures } from './compte-resultat.js';
import { creationBilan, injecteBilanEcritures } from './bilan.js';
import { creationJournal, injecteJournalEcritures } from './journal.js';
import { creationInventaire, injecteInventaireEcritures } from './inventaire.js';
import { creationFEC, injecteFECEcritures } from './fec.js';

document.addEventListener('DOMContentLoaded', init);

/**
 * Initialisation de l'application.
 * Charge la configuration d'environnement et configure les éléments de la page.
 */
function init() {
    loadEnvConfig()
        .then(env => {
            const { SHEET_ID, SHEETNAME_TO_GID, SIREN } = env;
            setupInfoModal();
            loadNavigation(SHEET_ID, SHEETNAME_TO_GID, SIREN);
        });
}

/**
 * Charge la configuration d'environnement.
 * @returns {Promise<Object>} La configuration d'environnement.
 */
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

/**
 * Configure le modal d'information.
 */
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

/**
 * Charge la navigation de l'application.
 * @param {string} SHEET_ID - L'identifiant de la Google Sheet.
 * @param {Object} SHEETNAME_TO_GID - Les identifiants des onglets de la Google Sheet.
 */
function loadNavigation(SHEET_ID, SHEETNAME_TO_GID, SIREN) {
    fetch('nav.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navigation').innerHTML = data;
            setupPageLinks();
            injectYearLinks(SHEETNAME_TO_GID);
            setupYearLinks(SHEET_ID, SHEETNAME_TO_GID, SIREN);
            injectSheetLink(SHEET_ID);
        });
}

/**
 * Configure les liens des pages.
 */
function setupPageLinks() {
    const pageLinks = document.querySelectorAll('nav ul:first-of-type li a');
    const currentPage = location.pathname.split('/').pop();
    pageLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.parentElement.classList.add('menu-selected');
        }
    });
}

/**
 * Injecte les liens des années dans la navigation.
 * @param {Object} SHEETNAME_TO_GID - Les identifiants des onglets de la Google Sheet.
 */
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

/**
 * Configure les liens des années.
 * @param {string} SHEET_ID - L'identifiant de la Google Sheet.
 * @param {Object} SHEETNAME_TO_GID - Les identifiants des onglets de la Google Sheet.
 */
function setupYearLinks(SHEET_ID, SHEETNAME_TO_GID, SIREN) {
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
            loadCSV(SHEET_ID, SHEETNAME_TO_GID, selectedYear, SIREN);
            yearLinks.forEach(l => l.classList.remove('menu-selected'));
            event.target.classList.add('menu-selected');
        });
    });

    loadCSV(SHEET_ID, SHEETNAME_TO_GID, currentYear, SIREN);
}

/**
 * Injecte le lien vers la Google Sheet.
 * @param {string} sheetId - L'identifiant de la Google Sheet.
 */
function injectSheetLink(sheetId) {
    const sheetLink = document.getElementById('sheet-nav');
    const link = document.createElement('a');
    link.href = `https://docs.google.com/spreadsheets/d/${sheetId}`;
    link.textContent = 'Voir les données (sheet)';
    link.target = '_blank';
    sheetLink.appendChild(link);
}

/**
 * Affiche le loader.
 */
function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

/**
 * Cache le loader.
 */
function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

/**
 * Cache le message d'erreur.
 */
function hideErrorMessage() {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.style.display = 'none';
}

/**
 * Charge le fichier CSV depuis la Google Sheet.
 * @param {string} sheetId - L'identifiant de la Google Sheet.
 * @param {Object} sheetNameToGid - Les identifiants des onglets de la Google Sheet.
 * @param {string} currentYear - L'année sélectionnée.
 */
function loadCSV(sheetId, sheetNameToGid, currentYear, siren) {
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
            injectDataIntoPage(jsonData, currentYear, siren);
            hideLoader();
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            hideLoader();
        });
}

/**
 * Injecte les données du CSV dans la page.
 * @param {Object[]} jsonData - Les données du CSV en format JSON.
 * @param {string} currentYear - L'année sélectionnée.
 */
function injectDataIntoPage(jsonData, currentYear, siren) {
    const mappings = [
        { id: 'journal-ecritures', create: creationJournal, inject: injecteJournalEcritures },
        { id: 'balance-ecritures', create: creationBalance, inject: injecteBalanceEcritures },
        { id: 'grand-livre-ecritures', create: creationGrandLivre, inject: injecteGrandLivreEcritures },
        { id: 'compte-resultat-ecritures', create: creationCompteResultat, inject: injecteCompteResultatEcritures },
        { id: 'bilan-ecritures', create: creationBilan, inject: injecteBilanEcritures },
        { id: 'inventaire-ecritures', create: creationInventaire, inject: injecteInventaireEcritures },
        { id: 'FEC-ecritures', create: creationFEC, inject: injecteFECEcritures },
    ];

    mappings.forEach(({ id, create, inject }) => {
        const element = document.getElementById(id);   
        if (element) {
            const ecritures = create(jsonData, currentYear, siren);
            inject(ecritures);
        }
    });
}