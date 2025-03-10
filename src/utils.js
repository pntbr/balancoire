import { loadCSV } from './loadCSV.js';

/**
 * Stocke les parammètres du sheet dans localStorage.
 *
 */
export function storeParams() {
    return loadCSV('0').then(params => {
        const sheetTabsToGID = params.reduce((acc, { Onglets, ID }) => {
            acc[Onglets] = ID;
            return acc;
        }, {});
        localStorage.setItem('compta_params', JSON.stringify(sheetTabsToGID));
    })
}

/**
 * Récupérer le plan comptable.
 *
 */
export function storePlanComptable() {
    const sheetTabsToGID = JSON.parse(localStorage.getItem('compta_params'));
    const sheetTabID = sheetTabsToGID['plan comptable'];

    return loadCSV(sheetTabID).then(parseCSV => {
        const planComptable = parseCSV.reduce((acc, compte) => {
            const numero = compte["N°"];
            const libelles = [compte["Libellé officiel"]];
  
            for (let i = 1; i <= 4; i++) {
                const key = `libellé perso${i}`;
                if (compte[key] && compte[key].trim() !== "") {
                    libelles.push(compte[key]);
                }
            }
  
            acc[numero] = libelles;
            return acc;
        }, {});

        localStorage.setItem('compta_planComptable', JSON.stringify(planComptable));
    });
}

/**
 * Affiche un message d'erreur dans l'élément HTML avec l'ID 'error-message'.
 *
 * @param {string} message - Le message d'erreur à afficher.
 */
function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
    }
}

/**
 * Gère une erreur en affichant un message d'erreur et en enregistrant l'erreur dans la console.
 *
 * @param {string} message - Le message d'erreur à afficher.
 * @param {Object} line - La ligne de données associée à l'erreur.
 * @throws {Error} - Lance une nouvelle erreur avec le message fourni.
 */
export function handleError(message, line) {
    displayErrorMessage(message);
    console.error(`Erreur: ${message} - Ligne: ${JSON.stringify(line)}`);
    throw new Error(message);
}


/**
 * Trouve un compte comptable à partir de son numéro ou de son libellé.
 * @param {Object} param - Les paramètres de recherche.
 * @param {string} param.compte - Le numéro de compte.
 * @param {string} param.label - Le libellé du compte.
 * @returns {Object} Le compte trouvé ou un compte non défini.
 */
export function trouverCompte({ compte, label }) {
    const plan_comptable = JSON.parse(localStorage.getItem('compta_planComptable'));
    for (const [key, value] of Object.entries(plan_comptable)) {
        if (compte === key || value.includes(label)) {
            return { compte: key, label: value[0] };
        }
    }
    return { compte: 'xxxxxx', label: 'non défini' };
}

/**
 * Convertit une chaîne de caractères représentant un montant en euros en nombre.
 * @param {string} euroString - La chaîne de caractères représentant le montant en euros.
 * @returns {number} Le montant converti en nombre.
 */
export function convertToNumber(euroString) {
    const cleanString = euroString.replace(/[^a-zA-Z0-9-.,]/g, '').replace(',', '.');

    return parseFloat(cleanString) || 0;
}

/**
 * Formate un nombre en chaîne de caractères représentant un montant en euros,
 * complété à droite par des espaces pour atteindre une longueur fixe.
 * @param {number} number - Le nombre à formater.
 * @returns {string} La chaîne de caractères représentant le montant en euros.
 */
export function convertirMontantEnFEC(montant) {
    let montantFEC = montant || 0.00
    let formattedNumber = montantFEC.toFixed(2).replace('.', ',');

    while (formattedNumber.length < 13) {
        formattedNumber += ' ';
    }

    return formattedNumber;
}

/**
 * Formate un nombre en chaîne de caractères représentant un montant en euros.
 * @param {number} number - Le nombre à formater.
 * @returns {string} La chaîne de caractères représentant le montant en euros.
 */
export function formatToCurrency(number) {
    return number ? number.toFixed(2).replace('.', ',') : '';
}

/**
 * Calcule la somme des montants d'un compte par racine de compte.
 * @param {Object[]} ecritures - Les écritures comptables.
 * @param {string} racine - La racine du compte.
 * @param {string} [type='DC'] - Le type de montant à considérer (D: Débit, C: Crédit, DC: Débit et Crédit).
 * @returns {number} La somme des montants.
 */
export function sommeCompteParRacine(ecritures, racine, type = 'DC') {
    const checkDebit = (type !== 'C');
    const checkCredit = (type !== 'D');
    return ecritures
        .filter(ecriture => ecriture['CompteNum'].startsWith(racine))
        .reduce((sum, ecriture) => sum + (checkCredit ? ecriture["Credit"] : 0) - (checkDebit ? ecriture["Debit"] : 0), 0);
}

/**
 * Convertit une chaîne de caractères de la forme 'YYYYMMDD-heroku.pdf' en 'YYYY-MM-DD'.
 * @param {string} filename - Le nom de fichier à convertir.
 * @returns {string} - La date convertie au format 'YYYY-MM-DD'.
 */
export function convertirNomDeFichierEnDate(filename) {
    const regex = /^\d{8}[-_].*$/;
    if (!regex.test(filename)) {
        return filename;
    }
    const datePart = filename.split('-')[0];
    const annee = datePart.substring(0, 4);
    const mois = datePart.substring(4, 6);
    const jour = datePart.substring(6, 8);
    const dateFormattee = `${annee}-${mois}-${jour}`;

    return dateFormattee;
}


/**
 * Ajuste la date donnée selon les règles spécifiées.
 * @param {string} dateStr - La date de création au format 'YYYY-MM-DD'.
 * @returns {string} - La date ajustée au format 'YYYY-MM-DD'.
 */
export function ajusterDate(dateStr) {
    const date = new Date(dateStr);
    const annee = date.getFullYear();
    const mois = date.getMonth();
    const jour = date.getDate();

    let dateAjustee;

    if (mois === 11) {
        dateAjustee = new Date(annee, mois, 31);
    } else {
        if (jour < 15) {
            dateAjustee = new Date(annee, mois, 28);
        } else {
            const moisSuivant = mois + 1;
            const anneeSuivante = moisSuivant > 11 ? annee + 1 : annee;
            const indexMoisSuivant = moisSuivant % 12;
            dateAjustee = new Date(anneeSuivante, indexMoisSuivant, 15);
        }
    }

    const jourAjuste = String(dateAjustee.getDate()).padStart(2, '0');
    const moisAjuste = String(dateAjustee.getMonth() + 1).padStart(2, '0'); // Les mois sont indexés à partir de 0
    const anneeAjustee = dateAjustee.getFullYear();

    return `${anneeAjustee}-${moisAjuste}-${jourAjuste}`;
}