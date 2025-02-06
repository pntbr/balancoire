import { trouverCompte, convertirMontantEnFEC, ajusterDate, convertirNomDeFichierEnDate } from './utils.js';
import { lignesEnEcritures } from './gestion-ecritures.js';
import { JOURNAUX_COMPTABLE } from './journaux-comptable.js';

/**
 * Configure le bouton de téléchargement du fichier FEC.
 */
export function setupDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.addEventListener('click', () => {
        const fileContent = downloadBtn.getAttribute('data-fec');
        if (fileContent) {
            const blob = new Blob([fileContent], { type: 'text/plain;charset=ascii' });
            const currentYear = localStorage.getItem('compta_selectedYear') || new Date().getFullYear();
            const FECName = `votre-siretFEC${currentYear}1231.txt`;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = FECName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    });
}

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
 * @param {Object[]} ecrituresFEC - La liste des écritures du FEC à injecter dans le tableau HTML.
 */
export function injecteFECEcritures(ecrituresFEC) {
    const tableBody = document.getElementById('FEC-ecritures');
    tableBody.innerHTML = ecrituresFEC.map(ecriture => `
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

    insertFECContentIntoButton(ecrituresFEC);
}

/**
 * Génère le contenu du fichier FEC et l'insère dans un attribut data-fec du bouton.
 * @param {Object[]} ecrituresFEC - La liste des écritures du FEC à injecter dans le tableau HTML.
 */
export function insertFECContentIntoButton(ecrituresFEC) {
    const header = Object.keys(ecrituresFEC[0]).join('|');

    const lines = ecrituresFEC.map(ecriture =>
        Object.keys(ecriture).map(key => ecriture[key] ? ecriture[key].toString() : '').join('|')
    );

    const fileContent = [header, ...lines].join('\n');

    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.setAttribute('data-fec', fileContent);
    }
}