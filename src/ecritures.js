import { convertToNumber, trouverCompte, sommeCompteParRacine } from './utils.js';

/**
 * Affiche un message d'erreur dans l'élément HTML avec l'ID 'error-message'.
 *
 * @param {string} message - Le message d'erreur à afficher.
 */
function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
}

/**
 * Gère une erreur en affichant un message d'erreur et en enregistrant l'erreur dans la console.
 *
 * @param {string} message - Le message d'erreur à afficher.
 * @param {Object} line - La ligne de données associée à l'erreur.
 * @throws {Error} - Lance une nouvelle erreur avec le message fourni.
 */
function handleError(message, line) {
    displayErrorMessage(message);
    console.error(`Erreur: ${message} - Ligne: ${JSON.stringify(line)}`);
    throw new Error(message);
}

/**
 * Crée une écriture comptable.
 *
 * @param {string} date - La date de l'écriture.
 * @param {string} compte - Le numéro de compte.
 * @param {string} label - Le libellé de l'écriture.
 * @param {number|string} debit - Le montant du débit.
 * @param {number|string} credit - Le montant du crédit.
 * @returns {Object} - L'écriture comptable créée.
 */
function creationEcriture(date, compte, label, debit, credit) {
    return {
        'EcritureDate': date,
        'CompteNum': compte,
        'EcritureLib': label,
        'Débit (€)': debit || '',
        'Crédit (€)': credit || ''
    };
}

/**
 * Crée les écritures d'a-nouveau pour une ligne de données.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @param {number} currentYear - L'année courante.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
function aNouveauEcriture(line, numeroCompte, currentYear) {
    const montant = convertToNumber(line['montant']);
    const ecritures = {
        '370000': [
            creationEcriture(`01/01/${currentYear}`, '370000', 'annulation du stock initial', montant, ''),
            creationEcriture(`01/01/${currentYear}`, '603700', 'annulation du stock initial', montant, ''),
            creationEcriture(`01/01/${currentYear}`, '370000', 'annulation du stock initial', '', montant)
        ],
        '129000': [
            creationEcriture(`01/01/${currentYear}`, '129000', 'reprise du résultat déficitaire N-1', montant, ''),
            creationEcriture(`01/01/${currentYear}`, '119000', 'affectation du résultat déficitaire N-1', montant, ''),
            creationEcriture(`01/01/${currentYear}`, '129000', 'affectation du résultat déficitaire N-1', '', montant)
        ],
        '120000': [
            creationEcriture(`01/01/${currentYear}`, '120000', 'reprise du résultat déficitaire N-1', '', montant),
            creationEcriture(`01/01/${currentYear}`, '120000', 'affectation du résultat déficitaire N-1', montant, ''),
            creationEcriture(`01/01/${currentYear}`, '106000', 'affectation du résultat déficitaire N-1', '', montant)
        ]
    };

    if (ecritures[numeroCompte]) {
        return ecritures[numeroCompte];
    }

    if (/^[12345]/.test(numeroCompte)) {
        const debit = montant < 0 ? Math.abs(montant) : '';
        const credit = montant > 0 ? Math.abs(montant) : '';

        return [creationEcriture(`01/01/${currentYear}`, numeroCompte, `reprise de ${line['poste']}`, debit, credit)];
    }

    handleError(`L'écriture d'a-nouveau n'a pu être rendue`, line);
}

/**
 * Crée les écritures de clôture d'inventaire.
 *
 * @param {Object} line - La ligne de données.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
function inventaireClotureEcriture(line) {
    return [
        creationEcriture(line['date'], '370000', 'clôture inventaire', convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], '603700', 'clôture inventaire', '', convertToNumber(line['montant']))
    ];
}

/**
 * Crée les écritures de caution.
 *
 * @param {Object} line - La ligne de données.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
function cautionEcriture(line) {
    const creditCompte = (['B2T', 'Association'].includes(line['qui paye ?'])) ? (line["nature"] === 'esp' ? '530000' : '512000') : '467000';
    return [
        creationEcriture(line['date'], '275000', `caution ${line['qui reçoit']}`, convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], creditCompte, `caution ${line['qui reçoit']}`, '', convertToNumber(line['montant']))
    ];
}

/**
 * Crée les écritures de remboursement.
 *
 * @param {Object} line - La ligne de données.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
function remboursementEcriture(line) {
    const checkCash = line["nature"] === 'esp';
    return [
        creationEcriture(line['date'], '467000', 'remboursement de frais', convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], checkCash ? '530000' : '512000', 'remboursement de frais', '', convertToNumber(line['montant']))
    ];
}

/**
 * Crée les écritures de dépense.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
function depenseEcriture(line, numeroCompte) {
    const checkCash = line["nature"] === 'esp';
    const piece = line['facture correspondante'] ? ` - <a href="${line['facture correspondante']}">pièce</a>` : '';
    const label = `achat par l'association : ${line['qui reçoit']} ${piece}`;
    return [
        creationEcriture(line['date'], numeroCompte, label, convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], checkCash ? '530000' : '512000', label, '', convertToNumber(line['montant']))
    ];
}

/**
 * Crée les écritures de dépense pour une personne.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
function depensePersonneEcriture(line, numeroCompte) {
    const piece = line['facture correspondante'] ? `<a href="${line['facture correspondante']}">pièce</a>` : '';
    const label = `achat personne : ${line['qui reçoit']} - ${piece}`;
    return [
        creationEcriture(line['date'], numeroCompte, label, convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], '467000', label, '', convertToNumber(line['montant']))
    ];
}

/**
 * Crée les écritures de vente.
 *
 * @param {Object} line - La ligne de données.
 * @param {string} numeroCompte - Le numéro de compte.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
function venteEcriture(line, numeroCompte) {
    const checkCash = line["nature"] === 'esp';
    const piece = line['facture correspondante'] ? `<a href="${line['facture correspondante']}">pièce</a>` : '';
    const label = `vente : ${line['qui paye ?']} - ${piece}`;
    return [
        creationEcriture(line['date'], numeroCompte, label, '', convertToNumber(line['montant'])),
        creationEcriture(line['date'], checkCash ? '530000' : '512000', label, convertToNumber(line['montant']), '')
    ];
}

/**
 * Crée les écritures de l'impôt sur les sociétés pour l'exercice courant.
 *
 * @param {Object[]} ecritures - La liste des écritures comptables.
 * @param {number} currentYear - L'année courante.
 * @returns {Object[]} - Une liste d'écritures comptables.
 */
function impotExercice(ecritures, currentYear) {
    const resultat = sommeCompteParRacine(ecritures, '7') + sommeCompteParRacine(ecritures, '6');
    const montantImpot = resultat * 0.15;
    if (resultat <= 0) return [];
    return [
        creationEcriture(`31/12/${currentYear}`, '695000', 'impôt sur les sociétés', montantImpot, ''),
        creationEcriture(`31/12/${currentYear}`, '444000', 'impôt sur les sociétés', '', montantImpot)
    ];
}

/**
 * Convertit une ligne de données en écritures comptables pour l'année courante.
 *
 * @param {Object} line - La ligne de données.
 * @param {number} currentYear - L'année courante.
 * @returns {Object[]} - Une liste d'écritures comptables.
 * @throws {Error} - Lance une erreur si l'écriture ne peut pas être rendue.
 */
function ligneEnEcriture(line, currentYear) {
    const numeroCompte = trouverCompte({ label: line.poste }).compte;
    try {
        if (line['date'].startsWith('01/01')) {
            return aNouveauEcriture(line, numeroCompte, currentYear);
        }
        // Gère la clôture
        if (line['date'].startsWith('31/12')) {
            if (numeroCompte === '370000') {
                return inventaireClotureEcriture(line, numeroCompte);
            }
        }

        // Gère les écritures courantes
        if (numeroCompte === '275000') return cautionEcriture(line);
        if (numeroCompte.startsWith('4')) return remboursementEcriture(line);
        if (numeroCompte.startsWith('6')) return (['B2T', 'Association'].includes(line['qui paye ?'])) ? depenseEcriture(line, numeroCompte) : depensePersonneEcriture(line, numeroCompte);
        if (numeroCompte.startsWith('7')) return venteEcriture(line, numeroCompte);

        handleError(`L'écriture ne comporte pas un compte connu`, line);
    } catch (error) {
        handleError(`L'écriture n'a pu être rendue`, line);
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
    const ecritures = jsonData.flatMap(ligne => ligneEnEcriture(ligne, currentYear));

    return ecritures
        .concat(impotExercice(ecritures, currentYear))
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
                ecrituresArret.push(creationEcriture(`31/12/${currentYear}`, compte, 'arrêt des comptes', '', Math.abs(solde)));
            } else {
                ecrituresArret.push(creationEcriture(`31/12/${currentYear}`, compte, 'arrêt des comptes', Math.abs(solde), ''));
            }
        }
    });

    const isExcédentaire = resultat > 0;
    const compte = isExcédentaire ? '120000' : '129000';
    const label = isExcédentaire ? 'résultat excédentaire' : 'résultat déficitaire';

    ecrituresArret.push(creationEcriture(`31/12/${currentYear}`, compte, label, !isExcédentaire && Math.abs(resultat), isExcédentaire && Math.abs(resultat)));

    return ecrituresArret;
}