import { trouverCompte, sommeCompteParRacine, formatToCurrency } from './utils.js';
import { lignesEnEcritures } from './ecritures.js';

/**
 * Crée un Fichier Écritures Comptables à partir des données JSON et de l'année courante.
 *
 * @param {Object[]} jsonData - Les données JSON contenant les écritures comptables.
 * @param {number} currentYear - L'année courante pour filtrer les écritures.
 * @returns {Object[]} - Une liste d'objets représentant le FEC.
 */
export function creationFEC(jsonData, currentYear) {
    const ecritures = lignesEnEcritures(jsonData, currentYear);

    const FECEcritures = [];
    const comptes = [...new Set(ecritures.map(({ Compte }) => Compte))].sort();
    comptes.forEach(compte => {
        const totalDebit = sommeCompteParRacine(ecritures, compte, 'D');
        const totalCredit = sommeCompteParRacine(ecritures, compte, 'C');
        FECEcritures.push({
            'Compte': compte,
            'Libellé': trouverCompte({ compte: compte }).label,
            'Débit (€)': totalDebit,
            'Crédit (€)': totalCredit,
            'Solde (€)': (totalCredit + totalDebit)
        });
    });

    return FECEcritures;
}

/**
 * Injecte les écritures du FEC dans le tableau HTML.
 *
 * @param {Object[]} FECEcritures - La liste des écritures du FEC à injecter dans le tableau HTML.
 */
export function injecteFECEcritures(FECEcritures) {
    const tableBody = document.getElementById('FEC-ecritures');
    tableBody.innerHTML = FECEcritures.map(ecriture => `
        <tr>
            <td>${ecriture['Compte']}</td>
            <td>${ecriture['Libellé']}</td>
            <td>${formatToCurrency(ecriture['Débit (€)'])}</td>
            <td>${formatToCurrency(ecriture['Crédit (€)'])}</td>
            <td>${formatToCurrency(ecriture['Solde (€)'])}</td>
        </tr>
    `).join('');
}