import { trouverCompte, sommeCompteParRacine, handleError } from './utils.js';
import { aNouveauEcriture, inventaireClotureEcriture, cautionEcriture, remboursementPretEcriture, depenseEcriture, depensePersonneEcriture, venteEcriture, venteStripeEcriture, commissionStripeEcriture, transfertStripeEcriture, impotExercice, creationEcriture } from './creation-ecritures.js';

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
            if (numeroCompte === '370000') {
                return inventaireClotureEcriture(line, lastEcritureNum);
            }
        }

        if (line['qui paye ?'] === 'Stripe' || line['qui reçoit'] === 'Stripe') {
            if (numeroCompte.startsWith('5')) return transfertStripeEcriture(line, numeroCompte, lastEcritureNum);
            if (numeroCompte.startsWith('6')) return commissionStripeEcriture(line, numeroCompte, lastEcritureNum);
            if (numeroCompte.startsWith('7')) return venteStripeEcriture(line, numeroCompte, lastEcritureNum);
        }

        // Gère les écritures courantes
        if (numeroCompte === '275000') return cautionEcriture(line, lastEcritureNum);
        if (numeroCompte.startsWith('4')) return remboursementPretEcriture(line, lastEcritureNum);
        if (numeroCompte.startsWith('6')) return ['B2T', 'Association'].includes(line['qui paye ?']) ? depenseEcriture(line, numeroCompte, lastEcritureNum) : depensePersonneEcriture(line, numeroCompte, lastEcritureNum);
        if (numeroCompte.startsWith('7')) return venteEcriture(line, numeroCompte, lastEcritureNum);

        handleError(`L'écriture ne comporte pas un compte connu`, line);
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
        .sort((a, b) => {
            const dateA = new Date(a.EcritureDate.split('/').reverse().join('-'));
            const dateB = new Date(b.EcritureDate.split('/').reverse().join('-'));
            return dateA - dateB;
        });
}

/**
 * Arrête les comptes et crée les écritures de clôture pour l'exercice courant.
 *
 * @param {Object[]} ecritures - La liste des écritures comptables.
 * @param {number} currentYear - L'année courante.
 * @returns {Object[]} - Une liste d'écritures comptables arrêtées.
 */
export function arretComptesClotureEcritures(ecritures, currentYear) {
    const resultat = sommeCompteParRacine(ecritures, '7') + sommeCompteParRacine(ecritures, '6');
    const ecrituresArret = [...ecritures];
    const comptesClasses6et7 = [...new Set(ecrituresArret
        .filter(ecriture => ecriture['CompteNum'].startsWith('6') || ecriture['CompteNum'].startsWith('7'))
        .map(ecriture => ecriture['CompteNum'])
    )];

    comptesClasses6et7.forEach(compte => {
        const solde = sommeCompteParRacine(ecrituresArret, compte);

        if (solde !== 0) {
            if (solde < 0) {
                ecrituresArret.push(creationEcriture({ EcritureNum: `${currentYear}-12-31`, CompteNum: compte, EcritureLib: 'arrêt des comptes', Debit: '', Credit: Math.abs(solde) }));
            } else {
                ecrituresArret.push(creationEcriture({ EcritureNum: `${currentYear}-12-31`, CompteNum: compte, EcritureLib: 'arrêt des comptes', Debit: Math.abs(solde), Credit: '' }));
            }
        }
    });

    const isExcédentaire = resultat > 0;
    const compte = isExcédentaire ? '120000' : '129000';
    const label = isExcédentaire ? 'résultat excédentaire' : 'résultat déficitaire';

    ecrituresArret.push(creationEcriture({ EcritureNum: `31/12/${currentYear}`, CompteNum: compte, EcritureLib: label, Debit: !isExcédentaire && Math.abs(resultat), Credit: isExcédentaire && Math.abs(resultat) }));

    return ecrituresArret;
}