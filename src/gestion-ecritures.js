import { trouverCompte, handleError } from './utils.js';
import {
    aNouveauEcriture,
    arretComptesClotureEcritures,
    cautionEcriture,
    commissionStripeEcriture,
    depenseEcriture,
    depensePersonneEcriture,
    impotExercice,
    inventaireClotureEcriture,
    transfertStripeEcriture,
    remboursementBanqueEcriture,
    remboursementEcriture,
    venteAvoirEcriture,
    venteStripeEcriture,
    virementEcriture
} from './creation-ecritures.js';

/**
 * Convertit une ligne de données en écritures comptables pour l'année courante.
 *
 * @param {Object} line - La ligne de données.
 * @param {number} currentYear - L'année courante.
 * @returns {Object[]} - Une liste d'écritures comptables.
 * @throws {Error} - Lance une erreur si l'écriture ne peut pas être rendue.
 */
function ligneEnEcriture(line, currentYear, lastEcritureNum) {
    const numeroCompte = trouverCompte({ label: line.poste }).compte;
    try {
        if (line['date'].endsWith('01-01')) {
            return aNouveauEcriture(line, numeroCompte, currentYear);
        }
        // Gère la clôture
        if (line['date'].endsWith('12-31')) {
            if (numeroCompte === '370') {
                return inventaireClotureEcriture(line, lastEcritureNum);
            }
        }

        if (line['qui paye ?'] === 'Stripe' || line['qui reçoit'] === 'Stripe') {
            if (numeroCompte.startsWith('5')) return transfertStripeEcriture(line, numeroCompte, lastEcritureNum);
            if (numeroCompte.startsWith('6')) return commissionStripeEcriture(line, numeroCompte, lastEcritureNum);
            if (numeroCompte.startsWith('7')) return venteStripeEcriture(line, numeroCompte, lastEcritureNum);
        }

        // Gère les écritures courantes
        if (numeroCompte === '275') return cautionEcriture(line, numeroCompte, lastEcritureNum);
        if (numeroCompte === '580') return virementEcriture(line, numeroCompte, lastEcritureNum);
        if (numeroCompte.startsWith('4')) return remboursementEcriture(line, numeroCompte, lastEcritureNum);
        if (numeroCompte.startsWith('6')) {
            if (['Association'].includes(line['qui paye ?'])) {
                return depenseEcriture(line, numeroCompte, lastEcritureNum)
            } else if (['Banque'].includes(line['qui paye ?'])) {
                return remboursementBanqueEcriture(line, numeroCompte, lastEcritureNum);
            } else {
                return depensePersonneEcriture(line, numeroCompte, lastEcritureNum);
            }
        }
        if (numeroCompte.startsWith('7')) return venteAvoirEcriture(line, numeroCompte, lastEcritureNum);

        handleError(`compte inconnu - (cf. date : ${line['date']})`, line);
    } catch (error) {
        handleError(`L'écriture n'a pu être rendue : ${error}`, line);
    }
}

/**
 * Convertit les lignes de données JSON en écritures comptables pour l'année courante.
 *
 * @param {Object[]} jsonData - Les données JSON contenant les écritures comptables.
 * @param {number} currentYear - L'année courante.
 * @returns {Object[]} - Une liste d'écritures comptables triées par date.
 */
export function lignesEnEcritures(jsonData, currentYear) {
    let lastEcritureNum = 0;
    const ecritures = jsonData.flatMap(ligne => {
        const ecrituresLigne = ligneEnEcriture(ligne, currentYear, lastEcritureNum);
        lastEcritureNum = ecrituresLigne[ecrituresLigne.length - 1].EcritureNum;

        return ecrituresLigne;
    });

    lastEcritureNum = ecritures[ecritures.length - 1].EcritureNum;

    return ecritures
        .concat(impotExercice(ecritures, currentYear, lastEcritureNum))
        .concat(arretComptesClotureEcritures(ecritures, currentYear, lastEcritureNum))
        .sort((a, b) => {
            const dateA = new Date(a.EcritureDate.split('/').reverse().join('-'));
            const dateB = new Date(b.EcritureDate.split('/').reverse().join('-'));
            return dateA - dateB;
        });
}
