import { formatToCurrency } from './utils.js';
import { lignesEnEcritures } from './ecritures.js';

/**
 * Crée un journal comptable à partir des données JSON et de l'année courante.
 *
 * @param {Object[]} jsonData - Les données JSON contenant les écritures comptables.
 * @param {number} currentYear - L'année courante pour filtrer les écritures.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function creationJournal(jsonData, currentYear) {
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
            <td>${ecriture['Date']}</td>
            <td>${ecriture['Compte']}</td>
            <td>${ecriture['Libellé']}</td>
            <td>${formatToCurrency(ecriture['Débit (€)'])}</td>
            <td>${formatToCurrency(ecriture['Crédit (€)'])}</td>
        </tr>
    `).join('');
}