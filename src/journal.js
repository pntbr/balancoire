import { formatToCurrency } from './utils.js';
import { lignesEnEcritures } from './gestion-ecritures.js';

/**
 * Crée un journal comptable à partir des données JSON et de l'année courante.
 *
 * @param {Object[]} jsonData - Les données JSON contenant les écritures comptables.
 * @param {number} currentYear - L'année courante pour filtrer les écritures.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function creationJournal(jsonData, currentYear) {
    console.log("lignesEnEcritures", lignesEnEcritures(jsonData, currentYear));
    return lignesEnEcritures(jsonData, currentYear);
}

/**
 * Injecte les écritures du journal dans le tableau HTML.
 *
 * @param {Object[]} journalEcritures - Les écritures du journal à injecter dans le tableau HTML.
 */
export function injecteJournalEcritures(journalEcritures) {
    const tableBody = document.getElementById('journal-ecritures');
    tableBody.innerHTML = journalEcritures.map(ecriture => `
        <tr>
            <td>${ecriture['EcritureDate']}</td>
            <td>${ecriture['CompteNum']}</td>
            <td>${ecriture['EcritureLib']}</td>
            <td>${formatToCurrency(ecriture['Debit'])}</td>
            <td>${formatToCurrency(ecriture['Credit'])}</td>
        </tr>
    `).join('');
}