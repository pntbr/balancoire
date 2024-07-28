import { trouverCompte, formatToCurrency, ajusterDate } from './utils.js';
import { lignesEnEcritures } from './gestion-ecritures.js';
import { JOURNAUX_COMPTABLE } from './journaux-comptable.js';

/**
 * Crée un Fichier Écritures Comptables à partir des données JSON et de l'année courante.
 *
 * @param {Object[]} jsonData - Les données JSON contenant les écritures comptables.
 * @param {number} currentYear - L'année courante pour filtrer les écritures.
 * @returns {Object[]} - Une liste d'objets représentant le FEC.
 */
export function creationFEC(jsonData, currentYear, siren) {
    const FECName = `${siren}FEC${currentYear}1231`;
    const FECEcritures = lignesEnEcritures(jsonData, currentYear)
        .map(ecriture => {
            return {
                'JournalCode': ecriture['JournalCode'],
                'JournalLib': JOURNAUX_COMPTABLE[ecriture['JournalCode']],
                'EcritureNum': ecriture['EcritureNum'],
                'EcritureDate': ecriture['EcritureDate'],
                'CompteNum': ecriture['CompteNum'],
                'CompteLib': trouverCompte({ 'compte': ecriture['CompteNum'] }).label,
                'PieceRef': ecriture['PieceRef'],
                'PieceDate': '',
                'EcritureLib': ecriture['EcritureLib'],
                'Debit': ecriture['Debit'],
                'Credit': ecriture['Credit'],
                'ValidDate': ajusterDate(ecriture['EcritureDate'])
            };
        })

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
            <td>${ecriture.JournalCode}</td>
            <td>${ecriture.JournalLib}</td>
            <td>${ecriture.EcritureNum}</td>
            <td>${ecriture.EcritureDate}</td>
            <td>${ecriture.CompteNum}</td>
            <td>${ecriture.CompteLib}</td>
            <td>${ecriture.PieceRef}</td>
            <td>${ecriture.PieceDate}</td>
            <td>${ecriture.EcritureLib}</td>
            <td>${formatToCurrency(ecriture.Debit)}</td>
            <td>${formatToCurrency(ecriture.Credit)}</td>
            <td>${ecriture.ValidDate}</td>
        </tr>
    `).join('');
}