import { PLAN_COMPTABLE } from './plan-comptable.js';

/**
 * Trouve un compte comptable à partir de son numéro ou de son libellé.
 * @param {Object} param - Les paramètres de recherche.
 * @param {string} param.compte - Le numéro de compte.
 * @param {string} param.label - Le libellé du compte.
 * @returns {Object} Le compte trouvé ou un compte non défini.
 */
export function trouverCompte({ compte, label }) {
    for (const [key, value] of Object.entries(PLAN_COMPTABLE)) {
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
 * Formate un nombre en chaîne de caractères représentant un montant en euros.
 * @param {number} number - Le nombre à formater.
 * @returns {string} La chaîne de caractères représentant le montant en euros.
 */
export function formatToCurrency(number) {
    return number ? number.toFixed(2).replace('.', ',') + ' €' : '';
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
 * Convertit une chaîne de caractères au format 'dd/mm/yyyy' en 'YYYY-MM-DD'.
 *
 * @param {string} dateStr - La date à convertir au format 'dd/mm/yyyy'.
 * @returns {string} - La date convertie au format 'YYYY-MM-DD'.
 */
export function convertirDate(dateStr) {
    const [jour, mois, annee] = dateStr.split('/');
    const dateFormatee = `${annee}-${mois}-${jour}`;

    return dateFormatee;
}

/**
 * Convertit une chaîne de caractères de la forme 'YYYYMMDD-heroku.pdf' en 'YYYY-MM-DD'.
 *
 * @param {string} filename - Le nom de fichier à convertir.
 * @returns {string} - La date convertie au format 'YYYY-MM-DD'.
 */
function convertirNomDeFichier(filename) {
    // Extraire la date de la chaîne
    const datePart = filename.split('-')[0];

    // Séparer l'année, le mois et le jour
    const annee = datePart.substring(0, 4);
    const mois = datePart.substring(4, 6);
    const jour = datePart.substring(6, 8);

    // Construire la nouvelle date au format 'YYYY-MM-DD'
    const dateFormattee = `${annee}-${mois}-${jour}`;

    return dateFormattee;
}

/**
 * Convertit une chaîne de caractères de la forme 'YYYYMMDD-heroku.pdf' en 'YYYY-MM-DD'.
 * @param {string} filename - Le nom de fichier à convertir.
 * @returns {string} - La date convertie au format 'YYYY-MM-DD'.
 */
export function convertirNomDeFichierEnDate(filename) {
    const regex = /^\d{8}[_-].*\..+$/;
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