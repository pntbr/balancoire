import { handleError, convertToNumber, sommeCompteParRacine, trouverCompte } from './utils.js';

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
        const debit = montant > 0 ? Math.abs(montant) : '';
        const credit = montant < 0 ? Math.abs(montant) : '';

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
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: '370000', EcritureLib: 'clôture inventaire', Debit: convertToNumber(line['montant']), Credit: '' }),
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: '603700', EcritureLib: 'clôture inventaire', Debit: '', Credit: convertToNumber(line['montant']) })
    ];
}

/**
 * Crée les écritures de caution.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function cautionEcriture(line, numeroCompte, lastEcritureNum) {
    const creditCompte = (['Association'].includes(line['qui paye ?'])) ? (line["nature"] === 'esp' ? '530000' : '512000') : '467000';
    return [
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, EcritureLib: `caution ${line['qui reçoit']}`, Debit: convertToNumber(line['montant']), Credit: '' }),
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: creditCompte, EcritureLib: `caution ${line['qui reçoit']}`, Debit: '', Credit: convertToNumber(line['montant']) })
    ];
}

/**
 * Crée les écritures de remboursement.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function remboursementEcriture(line, numeroCompte, lastEcritureNum) {
    const checkCash = line["nature"] === 'esp';
    if (['Association'].includes(line['qui paye ?'])) {
        return [
            creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, EcritureLib: 'remboursement de frais', Debit: convertToNumber(line['montant']), Credit: '' }),
            creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: checkCash ? '530000' : '512000', EcritureLib: 'remboursement de frais', Debit: '', Credit: convertToNumber(line['montant']) })
        ];
    } else if (['Association'].includes(line['qui reçoit'])) {
        return [
            creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: checkCash ? '530000' : '512000', EcritureLib: 'prêt à l\'association', Debit: convertToNumber(line['montant']), Credit: '' }),
            creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, EcritureLib: 'prêt à l\'association', Debit: '', Credit: convertToNumber(line['montant']) })
        ];
    } else {
        return [
            creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: '580000', EcritureLib: 'remboursement bénévoles/salarié·e·s à bénévoles', Debit: convertToNumber(line['montant']), Credit: '' }),
            creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, EcritureLib: 'remboursement bénévoles/salarié·e·s à bénévoles', Debit: '', Credit: convertToNumber(line['montant']) }),
            creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: '580000', EcritureLib: 'remboursement bénévoles/salarié·e·s à bénévoles', Debit: '', Credit: convertToNumber(line['montant']) }),
            creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, EcritureLib: 'remboursement bénévoles/salarié·e·s à bénévoles', Debit: convertToNumber(line['montant']), Credit: '' })
        ];
    }
}

/**
 * Crée les écritures de remboursement de la banque ou remise de balance.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function remboursementBanqueEcriture(line, numeroCompte, lastEcritureNum) {
    return [
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, EcritureLib: `remboursement ${line['qui paye ?']}`, Debit: '', Credit: convertToNumber(line['montant']) }),
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: '512000', EcritureLib: `remboursement ${line['qui paye ?']}`, Debit: convertToNumber(line['montant']), Credit: '' })
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
    const montant = convertToNumber(line['montant']);
    const ecritures = [
        creationEcriture({ JournalCode: 'AC', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, PieceRef: line['facture correspondante'], EcritureLib: label, Debit: montant, Credit: '' }),
        creationEcriture({ JournalCode: 'AC', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: '401000', PieceRef: line['facture correspondante'], EcritureLib: label, Debit: '', Credit: montant })
    ];
    if (line["pointage"] || checkCash) {
        return ecritures.concat([
            creationEcriture({ JournalCode: 'BQ', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: '401000', PieceRef: line['facture correspondante'], EcritureLib: label, Debit: montant, Credit: '' }),
            creationEcriture({ JournalCode: 'BQ', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: checkCash ? '530000' : '512000', PieceRef: line['facture correspondante'], EcritureLib: label, Debit: '', Credit: montant })
        ]);
    } else {
        return ecritures;
    }
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
        creationEcriture({ JournalCode: 'AC', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, PieceRef: line['facture correspondante'], EcritureLib: label, Debit: convertToNumber(line['montant']), Credit: '' }),
        creationEcriture({ JournalCode: 'AC', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: '467000', PieceRef: line['facture correspondante'], EcritureLib: label, Debit: '', Credit: convertToNumber(line['montant']) })
    ];
}

/**
 * Crée les écritures de vente et d'avoir.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function venteAvoirEcriture(line, numeroCompte, lastEcritureNum) {
    const checkCash = line["nature"] === 'esp';
    if (['Association'].includes(line['qui paye ?'])) {
        const label = `avoir : ${line['qui reçoit']}`;
        return [
            creationEcriture({ JournalCode: 'VT', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, PieceRef: line['facture correspondante'], EcritureLib: label, Debit: convertToNumber(line['montant']), Credit: '' }),
            creationEcriture({ JournalCode: 'VT', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: checkCash ? '530000' : '512000', PieceRef: line['facture correspondante'], EcritureLib: label, Debit: '', Credit: convertToNumber(line['montant']) })
        ];
    } else if (['Association'].includes(line['qui reçoit'])) {
        const label = `vente : ${line['qui paye ?']}`;
        return [
            creationEcriture({ JournalCode: 'VT', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: checkCash ? '530000' : '512000', PieceRef: line['facture correspondante'], EcritureLib: label, Debit: convertToNumber(line['montant']), Credit: '' }),
            creationEcriture({ JournalCode: 'VT', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, PieceRef: line['facture correspondante'], EcritureLib: label, Debit: '', Credit: convertToNumber(line['montant']) })
        ];
    }

    handleError(`L'écriture de vente ou d'avoir n'a pu être rendue`, line);
}

/**
 * Crée les écritures de vente stripe.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function venteStripeEcriture(line, numeroCompte, lastEcritureNum) {
    return [
        creationEcriture({ JournalCode: 'VT', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: '517000', PieceRef: line['facture correspondante'], EcritureLib: 'Caisse - Stripe', Debit: convertToNumber(line['montant']), Credit: '' }),
        creationEcriture({ JournalCode: 'VT', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, PieceRef: line['facture correspondante'], EcritureLib: `vente : ${line['qui paye ?']}`, Debit: '', Credit: convertToNumber(line['montant']) })
    ];
}

/**
 * Crée les commissions stripe.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function commissionStripeEcriture(line, numeroCompte, lastEcritureNum) {
    return [
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, PieceRef: '', EcritureLib: 'commission Stripe', Debit: convertToNumber(line['montant']), Credit: '' }),
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: '517000', PieceRef: '', EcritureLib: 'caisse - Stripe', Debit: '', Credit: convertToNumber(line['montant']) })
    ];
}

/**
 * Crée les transferts stripe vers banque.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function transfertStripeEcriture(line, numeroCompte, lastEcritureNum) {
    return [
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: '512000', PieceRef: '', EcritureLib: 'transfert de fonds Stripe  ', Debit: convertToNumber(line['montant']), Credit: '' }),
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, PieceRef: '', EcritureLib: 'caisse - Stripe', Debit: '', Credit: convertToNumber(line['montant']) })
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
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: `${currentYear}-12-31`, CompteNum: '695000', EcritureLib: 'impôt sur les sociétés', Debit: montantImpot, Credit: '' }),
        creationEcriture({ JournalCode: 'OD', EcritureNum: lastEcritureNum + 1, EcritureDate: `${currentYear}-12-31`, CompteNum: '444000', EcritureLib: 'impôt sur les sociétés', Debit: '', Credit: montantImpot })
    ];
}

/**
 * Crée les écritures de virements internes.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @param {number} lastEcritureNum - Le dernier numéro d'écriture.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
export function virementEcriture(line, numeroCompte, lastEcritureNum) {
    const compteSource = trouverCompte({ label: line['qui paye ?'] });
    const compteDestination = trouverCompte({ label: line['qui reçoit'] });
    const label = `virement interne de ${compteSource.label} vers ${compteDestination.label} `;

    return [
        creationEcriture({ JournalCode: 'BQ', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, EcritureLib: label, Debit: convertToNumber(line['montant']), Credit: '' }),
        creationEcriture({ JournalCode: 'BQ', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: compteSource.compte, EcritureLib: label, Debit: '', Credit: convertToNumber(line['montant']) }),
        creationEcriture({ JournalCode: 'BQ', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: numeroCompte, EcritureLib: label, Debit: '', Credit: convertToNumber(line['montant']) }),
        creationEcriture({ JournalCode: 'BQ', EcritureNum: lastEcritureNum + 1, EcritureDate: line['date'], CompteNum: compteDestination.compte, EcritureLib: label, Debit: convertToNumber(line['montant']), Credit: '' })
    ];
}