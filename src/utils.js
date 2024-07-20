import { PLAN_COMPTABLE } from './plan-comptable.js';

export function trouverCompte({ compte, label }) {
    for (const [key, value] of Object.entries(PLAN_COMPTABLE)) {
        if (compte === key || value.includes(label)) {
            return { compte: key, label: value[0] };
        }
    }
    return { compte: 'xxxxxx', label: 'non défini' };
}

export function convertToNumber(euroString) {
    const cleanString = euroString.replace(/\s/g, '').replace('€', '').replace(',', '.');
    return parseFloat(cleanString) || 0;
}

export function formatToCurrency(number) {
    return number ? number.toFixed(2).replace('.', ',') + ' €' : '';
}

export function sommeCompteParRacine(ecritures, racine, type = 'DC') {
    const checkDebit = (type !== 'C');
    const checkCredit = (type !== 'D');
    return ecritures
        .filter(ecriture => ecriture['Compte'].startsWith(racine))
        .reduce((sum, ecriture) => sum + (checkCredit ? ecriture["Crédit (€)"] : 0) - (checkDebit ? ecriture["Débit (€)"] : 0), 0);
}