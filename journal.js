import { formatToCurrency } from './utils.js';
import { lignesEnEcritures } from './ecritures.js';

export function creationJournal(jsonData, currentYear) {
    return lignesEnEcritures(jsonData, currentYear);
}

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