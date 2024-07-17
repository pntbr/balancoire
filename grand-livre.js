export function creationGrandLivre(ecritures, currentYear) {
    const grandLivreEcritures = {};
    const comptes = [...new Set(ecritures.map(({ Compte }) => Compte))].sort();

    comptes.forEach(compte => {
        let totalDebit = 0;
        let totalCredit = 0;

        grandLivreEcritures[compte] = ecritures
            .filter(ecriture => ecriture['Compte'] === compte)
            .map(ecriture => {
                const debit = +ecriture['Débit (€)'];
                const credit = +ecriture['Crédit (€)'];
                totalDebit += debit;
                totalCredit += credit;
                return {
                    Date: ecriture.Date,
                    Libellé: ecriture.Libellé,
                    'Débit (€)': debit,
                    'Crédit (€)': credit
                };
            });

        grandLivreEcritures[compte].push({
            'Date': `31/12/${currentYear}`,
            'Libellé': 'Total',
            'Débit (€)': totalDebit,
            'Crédit (€)': totalCredit
        });

        grandLivreEcritures[compte].push({
            'Date': `31/12/${currentYear}`,
            'Libellé': 'Solde',
            'Débit (€)': totalDebit > totalCredit ? (totalDebit - totalCredit) : '',
            'Crédit (€)': totalCredit > totalDebit ? (totalCredit - totalDebit) : ''
        });
    });

    return grandLivreEcritures;
}