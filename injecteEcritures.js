import { trouverCompte, formatToCurrency } from './utils.js';

export function injecteJournalEcritures(journalEcritures) {
    const tableBody = document.getElementById('journal-ecritures');
    tableBody.innerHTML = journalEcritures.map(ecriture => `
        <tr>
            <td>${ecriture['Date']}</td>
            <td>${ecriture['Compte']}</td>
            <td>${ecriture['Libellé']}</td>
            <td>${formatToCurrency(ecriture['Débit (€)'])}</td>
            <td>${formatToCurrency(ecriture['Crédit (€)'])}</td>
        </tr>
    `).join('');
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

export function injecteGrandLivreEcritures(grandLivreEcritures) {
    const grandLivreContainer = document.getElementById('grand-livre-ecritures');
    grandLivreContainer.innerHTML = Object.entries(grandLivreEcritures).map(([compte, ecritures]) => {
                const compteLabel = trouverCompte({ compte }).label;
                return `
            <div class="compte">
                <h2>${compte} - ${compteLabel}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Libellé</th>
                            <th>Débit (€)</th>
                            <th>Crédit (€)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ecritures.map(ecriture => `
                            <tr class="${ecriture.Libellé === 'Total' ? 'total' : ecriture.Libellé === 'Solde' ? 'solde' : ''}">
                                <td>${ecriture.Date}</td>
                                <td>${ecriture.Libellé}</td>
                                <td>${formatToCurrency(ecriture['Débit (€)'])}</td>
                                <td>${formatToCurrency(ecriture['Crédit (€)'])}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }).join('');
}

export function injecteCompteResultatEcritures(soldes) {
    const tableBody = document.getElementById('compte-resultat-ecritures');
    tableBody.innerHTML = `
        <tr>
            <td class="compte-resultat-titre">Produits d'exploitation</td>
            <td></td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Cotisations des membres</td>
            <td>${formatToCurrency(soldes.produits.cotisations)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Dons</td>
            <td>${formatToCurrency(soldes.produits.donations)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Prestations de services</td>
            <td>${formatToCurrency(soldes.produits.prestations)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Ventes de produits</td>
            <td>${formatToCurrency(soldes.produits.marchandises)}</td>
        </tr>
        <tr class="total">
            <td>Total des produits d'exploitation</td>
            <td>${formatToCurrency(soldes.produits.total)}</td>
        </tr>
        <tr>
            <td class="compte-resultat-titre">Charges d'exploitation</td>
            <td></td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Achats de marchandises</td>
            <td>${formatToCurrency(soldes.charges.marchandises)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Achats d'approvisionnements</td>
            <td>${formatToCurrency(soldes.charges.approvisionnements)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Variation de stocks</td>
            <td>${formatToCurrency(soldes.charges.stocks)}</td>
        </tr> 
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Charges externes</td>
            <td>${formatToCurrency(soldes.charges.externes)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Impôts, taxes et versements assimilés</td>
            <td>${formatToCurrency(soldes.charges.taxes)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Autres charges</td>
            <td>${formatToCurrency(soldes.charges.autres)}</td>
        </tr>
        <tr class="total">
            <td>Total des charges d'exploitation</td>
            <td>${formatToCurrency(soldes.charges.total)}</td>
        </tr>
        <tr class="total">
            <td>Résultat courant avant impôts</td>
            <td>${formatToCurrency(soldes.resultats.avantImpots)}</td>
        </tr>
        <tr>
            <td>Impôt sur les bénéfices</td>
            <td>${formatToCurrency(soldes.resultats.impots)}</td>
        </tr>
        <tr class="total">
            <td>Résultat net</td>
            <td>${formatToCurrency(soldes.resultats.net)}</td>
        </tr>
    `;
}