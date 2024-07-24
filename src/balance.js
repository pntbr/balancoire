import { trouverCompte, sommeCompteParRacine, formatToCurrency } from './utils.js';
import { lignesEnEcritures } from './ecritures.js';

/**
 * Crée une balance des écritures comptables à partir des données JSON et de l'année courante.
 *
 * @param {Object[]} jsonData - Les données JSON contenant les écritures comptables.
 * @param {number} currentYear - L'année courante pour filtrer les écritures.
 * @returns {Object[]} - Une liste d'objets représentant la balance des écritures comptables.
 */
export function creationBalance(jsonData, currentYear) {
    const ecritures = lignesEnEcritures(jsonData, currentYear);

    const balanceEcritures = [];
    const comptes = [...new Set(ecritures.map(({ CompteNum }) => CompteNum))].sort();
    comptes.forEach(compte => {
        const totalDebit = sommeCompteParRacine(ecritures, compte, 'D');
        const totalCredit = sommeCompteParRacine(ecritures, compte, 'C');
        balanceEcritures.push({
            'CompteNum': compte,
            'CompteLib': trouverCompte({ compte: compte }).label,
            'Débit (€)': totalDebit,
            'Crédit (€)': totalCredit,
            'Solde (€)': (totalCredit + totalDebit)
        });
    });

    return balanceEcritures;
}

/**
 * Injecte les écritures de la balance dans le tableau HTML.
 *
 * @param {Object[]} balanceEcritures - La liste des écritures de la balance à injecter dans le tableau HTML.
 */
export function injecteBalanceEcritures(balanceEcritures) {
    const tableBody = document.getElementById('balance-ecritures');
    tableBody.innerHTML = balanceEcritures.map(ecriture => `
        <tr>
            <td>${ecriture['CompteNum']}</td>
            <td>${ecriture['CompteLib']}</td>
            <td>${formatToCurrency(ecriture['Débit (€)'])}</td>
            <td>${formatToCurrency(ecriture['Crédit (€)'])}</td>
            <td>${formatToCurrency(ecriture['Solde (€)'])}</td>
        </tr>
    `).join('');
}