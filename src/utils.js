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
        const cleanString = euroString.replace(/\\s/g, '').replace('€', '').replace(',', '.');
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
            .filter(ecriture => ecriture['Compte'].startsWith(racine))
            .reduce((sum, ecriture) => sum + (checkCredit ? ecriture["Crédit (€)"] : 0) - (checkDebit ? ecriture["Débit (€)"] : 0), 0);
    }