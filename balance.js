import { trouverCompte, sommeCompteParRacine } from './utils.js';

export function creationBalance(ecritures) {
    const balanceEcritures = [];
    const comptes = [...new Set(ecritures.map(({ Compte }) => Compte))].sort();
    comptes.forEach(compte => {
        const totalDebit = sommeCompteParRacine(ecritures, compte, 'D');
        const totalCredit = sommeCompteParRacine(ecritures, compte, 'C');
        balanceEcritures.push({
            'Compte': compte,
            'Libellé': trouverCompte({ compte: compte }).label,
            'Débit (€)': totalDebit,
            'Crédit (€)': totalCredit,
            'Solde (€)': (totalCredit - totalDebit)
        });
    });

    return balanceEcritures;
}