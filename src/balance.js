import { trouverCompte, sommeCompteParRacine, formatToCurrency } from './utils.js';
import { lignesEnEcritures } from './ecritures.js';

export function creationBalance(jsonData, currentYear) {
    const ecritures = lignesEnEcritures(jsonData, currentYear);

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
            'Solde (€)': (totalCredit + totalDebit)
        });
    });

    return balanceEcritures;
}

export function injecteBalanceEcritures(balanceEcritures) {
    const tableBody = document.getElementById('balance-ecritures');
    tableBody.innerHTML = balanceEcritures.map(ecriture => `
        <tr>
            <td>${ecriture['Compte']}</td>
            <td>${ecriture['Libellé']}</td>
            <td>${formatToCurrency(ecriture['Débit (€)'])}</td>
            <td>${formatToCurrency(ecriture['Crédit (€)'])}</td>
            <td>${formatToCurrency(ecriture['Solde (€)'])}</td>
        </tr>
    `).join('');
}