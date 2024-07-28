import { convertToNumber, sommeCompteParRacine, convertirDate } from './utils.js';

/**
 * Crée une écriture comptable.
 *
 * @param {Object} ecritureData - Les données de l'écriture.
 * @param {string} ecritureData.JournalCode - Le code du journal.
 * @param {string} ecritureData.EcritureNum - Le numéro de l'écriture.
 * @param {string} ecritureData.EcritureDate - La date de l'écriture - YYYY-MM-DD.
 * @param {string} ecritureData.PieceRef - La référence de la pièce comptable.
 * @param {string} ecritureData.CompteNum - Le numéro de compte.
 * @param {string} ecritureData.EcritureLib - Le libellé de l'écriture.
 * @param {number|string} ecritureData.Debit - Le montant du débit.
 * @param {number|string} ecritureData.Credit - Le montant du crédit.
 * @returns {Object} - L'écriture comptable créée.
 */
export function creationEcriture({ JournalCode, EcritureNum, EcritureDate, CompteNum, PieceRef, EcritureLib, Debit, Credit }) {
    return {
        'JournalCode': JournalCode || '',
        'EcritureNum': EcritureNum || '',
        'EcritureDate': EcritureDate || '',
        'CompteNum': CompteNum || '',
        'PieceRef': PieceRef || '',
        'EcritureLib': EcritureLib || '',
        'Debit': Debit || '',
        'Credit': Credit || ''
    };
}

/**
 * Crée les écritures d'a-nouveau pour une ligne de données.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @param {number} currentYear - L'année courante.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function aNouveauEcriture(line, numeroCompte, currentYear) {
    const montant = convertToNumber(line['montant']);
    const ecritures = {
        '370000': [
            creationEcriture({ JournalCode: 'AN', EcritureNum: 1, EcritureDate: `${currentYear}-01-01`, CompteNum: '370000', EcritureLib: 'annulation du stock initial', Debit: montant, Credit: '' }),
            creationEcriture({ JournalCode: 'AN', EcritureNum: 1, EcritureDate: `${currentYear}-01-01`, CompteNum: '603700', EcritureLib: 'annulation du stock initial', Debit: montant, Credit: '' }),
            creationEcriture({ JournalCode: 'AN', EcritureNum: 1, EcritureDate: `${currentYear}-01-01`, CompteNum: '370000', EcritureLib: 'annulation du stock initial', Debit: '', Credit: montant })
        ],
        '129000': [
            creationEcriture({ JournalCode: 'AN', EcritureNum: 1, EcritureDate: `${currentYear}-01-01`, CompteNum: '129000', EcritureLib: 'reprise du résultat déficitaire N-1', Debit: montant, Credit: '' }),
            creationEcriture({ JournalCode: 'AN', EcritureNum: 1, EcritureDate: `${currentYear}-01-01`, CompteNum: '119000', EcritureLib: 'affectation du résultat déficitaire N-1', Debit: montant, Credit: '' }),
            creationEcriture({ JournalCode: 'AN', EcritureNum: 1, EcritureDate: `${currentYear}-01-01`, CompteNum: '129000', EcritureLib: 'affectation du résultat déficitaire N-1', Debit: '', Credit: montant })
        ],
        '120000': [
            creationEcriture({ JournalCode: 'AN', EcritureNum: 1, EcritureDate: `${currentYear}-01-01`, CompteNum: '120000', EcritureLib: 'reprise du résultat déficitaire N-1', Debit: '', Credit: montant }),
            creationEcriture({ JournalCode: 'AN', EcritureNum: 1, EcritureDate: `${currentYear}-01-01`, CompteNum: '120000', EcritureLib: 'affectation du résultat déficitaire N-1', Debit: montant, Credit: '' }),
            creationEcriture({ JournalCode: 'AN', EcritureNum: 1, EcritureDate: `${currentYear}-01-01`, CompteNum: '106000', EcritureLib: 'affectation du résultat déficitaire N-1', Debit: '', Credit: montant })
        ]
    };

    if (ecritures[numeroCompte]) {
        return ecritures[numeroCompte];
    }

    if (/^[12345]/.test(numeroCompte)) {
        const debit = montant < 0 ? Math.abs(montant) : '';
        const credit = montant > 0 ? Math.abs(montant) : '';

        return [creationEcriture({ JournalCode: 'AN', EcritureNum: 1, EcritureDate: `${currentYear}-01-01`, CompteNum: numeroCompte, EcritureLib: `reprise de ${line['poste']}`, Debit: debit, Credit: credit })];
    }

    handleError(`L'écriture d'a-nouveau n'a pu être rendue`, line);
}

/**
 * Crée les écritures de clôture d'inventaire.
 *
 * @param {Object} line - La ligne de données.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function inventaireClotureEcriture(line, lastEcritureNum) {
    return [
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: convertirDate(line['date']), CompteNum: '370000', EcritureLib: 'clôture inventaire', Debit: convertToNumber(line['montant']), Credit: '' }, lastEcritureNum),
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: convertirDate(line['date']), CompteNum: '603700', EcritureLib: 'clôture inventaire', Debit: '', Credit: convertToNumber(line['montant']) }, lastEcritureNum)
    ];
}

/**
 * Crée les écritures de caution.
 *
 * @param {Object} line - La ligne de données.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function cautionEcriture(line, lastEcritureNum) {
    const creditCompte = (['B2T', 'Association'].includes(line['qui paye ?'])) ? (line["nature"] === 'esp' ? '530000' : '512000') : '467000';
    return [
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: convertirDate(line['date']), CompteNum: '275000', EcritureLib: `caution ${line['qui reçoit']}`, Debit: convertToNumber(line['montant']), Credit: '' }, lastEcritureNum),
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: convertirDate(line['date']), CompteNum: creditCompte, EcritureLib: `caution ${line['qui reçoit']}`, Debit: '', Credit: convertToNumber(line['montant']) }, lastEcritureNum)
    ];
}

/**
 * Crée les écritures de remboursement.
 *
 * @param {Object} line - La ligne de données.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function remboursementEcriture(line, lastEcritureNum) {
    const checkCash = line["nature"] === 'esp';
    return [
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: convertirDate(line['date']), CompteNum: '467000', EcritureLib: 'remboursement de frais', Debit: convertToNumber(line['montant']), Credit: '' }, lastEcritureNum),
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: convertirDate(line['date']), CompteNum: checkCash ? '530000' : '512000', EcritureLib: 'remboursement de frais', Debit: '', Credit: convertToNumber(line['montant']) }, lastEcritureNum)
    ];
}

/**
 * Crée les écritures de dépense.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function depenseEcriture(line, numeroCompte, lastEcritureNum) {
    const checkCash = line["nature"] === 'esp';
    const label = `achat par l'association : ${line['qui reçoit']}`;
    return [
        creationEcriture({ JournalCode: 'AC', EcritureNum: lastEcritureNum + 1, EcritureDate: convertirDate(line['date']), CompteNum: numeroCompte, PieceRef: line['facture correspondante'], EcritureLib: label, Debit: convertToNumber(line['montant']), Credit: '' }, lastEcritureNum),
        creationEcriture({ JournalCode: 'AC', EcritureNum: lastEcritureNum + 1, EcritureDate: convertirDate(line['date']), CompteNum: checkCash ? '530000' : '512000', PieceRef: line['facture correspondante'], EcritureLib: label, Debit: '', Credit: convertToNumber(line['montant']) }, lastEcritureNum)
    ];
}

/**
 * Crée les écritures de dépense pour une personne.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function depensePersonneEcriture(line, numeroCompte, lastEcritureNum) {
    const label = `achat personne : ${line['qui reçoit']}`;
    return [
        creationEcriture({ JournalCode: 'AC', EcritureNum: lastEcritureNum + 1, EcritureDate: convertirDate(line['date']), CompteNum: numeroCompte, PieceRef: line['facture correspondante'], EcritureLib: label, Debit: convertToNumber(line['montant']), Credit: '' }, lastEcritureNum),
        creationEcriture({ JournalCode: 'AC', EcritureNum: lastEcritureNum + 1, EcritureDate: convertirDate(line['date']), CompteNum: '467000', PieceRef: line['facture correspondante'], EcritureLib: label, Debit: '', Credit: convertToNumber(line['montant']) }, lastEcritureNum)
    ];
}

/**
 * Crée les écritures de vente.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function venteEcriture(line, numeroCompte, lastEcritureNum) {
    const checkCash = line["nature"] === 'esp';
    const label = `vente : ${line['qui paye ?']}`;
    return [
        creationEcriture({ JournalCode: 'VT', EcritureNum: lastEcritureNum + 1, EcritureDate: convertirDate(line['date']), CompteNum: numeroCompte, PieceRef: line['facture correspondante'], EcritureLib: label, Debit: '', Credit: convertToNumber(line['montant']) }, lastEcritureNum),
        creationEcriture({ JournalCode: 'VT', EcritureNum: lastEcritureNum + 1, EcritureDate: convertirDate(line['date']), CompteNum: checkCash ? '530000' : '512000', PieceRef: line['facture correspondante'], EcritureLib: label, Debit: convertToNumber(line['montant']), Credit: '' }, lastEcritureNum)
    ];
}

/**
 * Crée les écritures de l'impôt sur les sociétés pour l'exercice courant.
 *
 * @param {Object[]} ecritures - La liste des écritures comptables.
 * @param {number} currentYear - L'année courante.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function impotExercice(ecritures, currentYear, lastEcritureNum) {
    const resultat = sommeCompteParRacine(ecritures, '7') + sommeCompteParRacine(ecritures, '6');
    const montantImpot = resultat * 0.15;
    if (resultat <= 0) return [];
    return [
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: `${currentYear}-12-31`, CompteNum: '695000', EcritureLib: 'impôt sur les sociétés', Debit: montantImpot, Credit: '' }, lastEcritureNum),
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: `${currentYear}-12-31`, CompteNum: '444000', EcritureLib: 'impôt sur les sociétés', Debit: '', Credit: montantImpot }, lastEcritureNum)
    ];
}