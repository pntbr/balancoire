import { trouverCompte, convertirMontantEnFEC, ajusterDate, convertirNomDeFichierEnDate } from './utils.js';
import { lignesEnEcritures } from './gestion-ecritures.js';
import { JOURNAUX_COMPTABLE } from './journaux-comptable.js';

/**
 * Crée un Fichier Écritures Comptables à partir des données JSON et de l'année courante.
 *
 * @param {Object[]} jsonData - Les données JSON contenant les écritures comptables.
 * @param {number} currentYear - L'année courante pour filtrer les écritures.
 * @returns {Object[]} - Une liste d'objets représentant le FEC.
 */
export function creationFEC(jsonData, currentYear) {
    const FECEcritures = lignesEnEcritures(jsonData, currentYear)
        .map(ecriture => {
            return {
                'JournalCode': ecriture['JournalCode'],
                'JournalLib': JOURNAUX_COMPTABLE[ecriture['JournalCode']],
                'EcritureNum': ecriture['EcritureNum'],
                'EcritureDate': ecriture['EcritureDate'],
                'CompteNum': ecriture['CompteNum'],
                'CompAuxNum': '',
                'CompAuxLib': '',
                'CompteLib': trouverCompte({ 'compte': ecriture['CompteNum'] }).label,
                'PieceRef': ecriture['PieceRef'],
                'PieceDate': convertirNomDeFichierEnDate(ecriture['PieceRef']),
                'EcritureLib': ecriture['EcritureLib'],
                'Debit': convertirMontantEnFEC(ecriture['Debit']),
                'Credit': convertirMontantEnFEC(ecriture['Credit']),
                'EcritureLet': '',
                'DateLet': '',
                'ValidDate': ajusterDate(ecriture['EcritureDate']),
                'Montantdevise': '',
                'Idevise': ''
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
            <td>${ecriture.Debit}</td>
            <td>${ecriture.Credit}</td>
            <td>${ecriture.ValidDate}</td>
        </tr>
    `).join('');
}

/**
 * Génère un fichier FEC à partir des écritures FEC formatées.
 * @param {Object[]} ecrituresFEC - Les écritures FEC formatées.
 * @param {string} siren - Le numéro SIREN de l'entreprise.
 * @returns {string} - Le nom du fichier FEC créé.
 */
export function generationFichier(ecrituresFEC, siren) {
    const FECName = `${siren}FEC${currentYear}1231.txt`;
}