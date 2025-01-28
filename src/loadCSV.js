import { parseCSV } from './parseCSV.js';
import { injectDataIntoPage } from './injectData.js';
import { showLoader, hideLoader, hideErrorMessage } from './loader.js';

export function loadCSV(sheetNameToGid, currentYear, siren) {
    const storedId = localStorage.getItem('compta_sheetId');
    const currentPage = location.pathname.split('/').pop();
    const sheetName = currentPage && currentPage.startsWith('inventaire') ? 'inventaire' : currentYear;
    const csvUrl = `https://docs.google.com/spreadsheets/d/${storedId}/export?format=csv&pli=1&gid=${sheetNameToGid[sheetName]}#gid=${sheetNameToGid[sheetName]}`;

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
            console.error("Je n'arrive pas à charger les données :", error);
            console.error("url :", csvUrl);
            hideLoader();
        });
}
