import { trouverCompte } from './creationEcritures.js';

function formatToCurrency(number) {
    return number ? number.toFixed(2).replace('.', ',') + ' €' : '';
}

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

export function injecteCompteResultatEcritures(ecritures) {
    const tableBody = document.getElementById('compte-resultat-ecritures');
    tableBody.innerHTML = `
        <tr>
            <td class="compte-resultat-titre">Produits d'exploitation</td>
            <td></td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Cotisations des membres</td>
            <td>${formatToCurrency(ecritures.cotisations)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Dons</td>
            <td>${formatToCurrency(ecritures.donations)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Ventes de produits</td>
            <td>${formatToCurrency(ecritures.produits)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Prestations de services</td>
            <td>${formatToCurrency(ecritures.prestations)}</td>
        </tr>
        <tr class="total">
            <td>Total des produits d'exploitation</td>
            <td>${formatToCurrency(ecritures.totalProduits)}</td>
        </tr>
        <tr>
            <td class="compte-resultat-titre">Charges d'exploitation</td>
            <td></td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Achats de marchandises</td>
            <td>${formatToCurrency(ecritures.achatsMarchandises)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Achats d'approvisionnements</td>
            <td>${formatToCurrency(ecritures.achatsApprovisionnements)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Variation de stocks</td>
            <td>${formatToCurrency(ecritures.variationStocks)}</td>
        </tr> 
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Charges externes</td>
            <td>${formatToCurrency(ecritures.chargesExternes)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Impôts, taxes et versements assimilés</td>
            <td>${formatToCurrency(ecritures.taxes)}</td>
        </tr>
        <tr class="total">
            <td>Total des charges d'exploitation</td>
            <td>${formatToCurrency(ecritures.totalCharges)}</td>
        </tr>
        <tr class="total">
            <td>Résultat courant avant impôts</td>
            <td>${formatToCurrency(ecritures.resultatAvantImpots)}</td>
        </tr>
        <tr>
            <td>Impôt sur les bénéfices</td>
            <td>${formatToCurrency(ecritures.impots)}</td>
        </tr>
        <tr class="total">
            <td>Résultat net</td>
            <td>${formatToCurrency(ecritures.resultatNet)}</td>
        </tr>
    `;
}