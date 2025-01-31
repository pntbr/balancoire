import { parseCSV } from './parseCSV.js';
import { showLoader, hideLoader, hideErrorMessage } from './loader.js';
import { handleError } from './utils.js';

export function loadCSV(sheetTabId) {
    const storedId = localStorage.getItem('compta_sheetId');
    const csvUrl = `https://docs.google.com/spreadsheets/d/${storedId}/export?format=csv&gid=${sheetTabId}`;

    hideErrorMessage();
    showLoader();

    return fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error("J'ai l'impression qu'il n'y a pas de connexion");
            return response.text();
        })
        .then(csvText => {
            hideLoader();
            return parseCSV(csvText);
        })
        .catch(error => {
            handleError(`Je n'arrive pas à charger les données`)
            console.error(error);
            console.error("url :", csvUrl);
            hideLoader();
        });
}
