import { findChartOfAccounts } from './generateEntries.js';

function formatToCurrency(number) {
    return number ? number.toFixed(2).replace('.', ',') + ' €' : '';
}

export function injectJournalEntries(journalEntries) {
    const tableBody = document.getElementById('journal-entries');
    tableBody.innerHTML = journalEntries.map(entry => `
        <tr>
            <td>${entry['Date']}</td>
            <td>${entry['Compte']}</td>
            <td>${entry['Libellé']}</td>
            <td>${formatToCurrency(entry['Débit (€)'])}</td>
            <td>${formatToCurrency(entry['Crédit (€)'])}</td>
        </tr>
    `).join('');
}


export function injectBalanceEntries(balanceEntries) {
    const tableBody = document.getElementById('balance-entries');
    tableBody.innerHTML = balanceEntries.map(entry => `
        <tr>
            <td>${entry['Compte']}</td>
            <td>${entry['Libellé']}</td>
            <td>${formatToCurrency(entry['Débit (€)'])}</td>
            <td>${formatToCurrency(entry['Crédit (€)'])}</td>
            <td>${formatToCurrency(entry['Solde (€)'])}</td>
        </tr>
    `).join('');
}

export function injectLedgerEntries(ledgerEntries) {
    const ledgerContainer = document.getElementById('ledger-entries');
    ledgerContainer.innerHTML = Object.entries(ledgerEntries).map(([account, entries]) => {
                const accountLabel = findChartOfAccounts({ account }).label;
                return `
            <div class="account">
                <h2>${account} - ${accountLabel}</h2>
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
                        ${entries.map(entry => `
                            <tr class="${entry.Libellé === 'Total' ? 'total' : entry.Libellé === 'Solde' ? 'solde' : ''}">
                                <td>${entry.Date}</td>
                                <td>${entry.Libellé}</td>
                                <td>${formatToCurrency(entry['Débit (€)'])}</td>
                                <td>${formatToCurrency(entry['Crédit (€)'])}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }).join('');
}

export function injectIncomeStatementEntries(entries) {
    const tableBody = document.getElementById('income-statement-entries');
    tableBody.innerHTML = `
        <tr>
            <td class="income-statement-title">Produits d'exploitation</td>
            <td></td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Cotisations des membres</td>
            <td>${formatToCurrency(entries.cotisations)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Dons</td>
            <td>${formatToCurrency(entries.donations)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Ventes de produits</td>
            <td>${formatToCurrency(entries.produits)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Prestations de services</td>
            <td>${formatToCurrency(entries.prestations)}</td>
        </tr>
        <tr class="total">
            <td>Total des produits d'exploitation</td>
            <td>${formatToCurrency(entries.totalProduits)}</td>
        </tr>
        <tr>
            <td class="income-statement-title">Charges d'exploitation</td>
            <td></td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Achats de marchandises</td>
            <td>${formatToCurrency(entries.achatsMarchandises)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Achats d'approvisionnements</td>
            <td>${formatToCurrency(entries.achatsApprovisionnements)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Variation de stocks</td>
            <td>${formatToCurrency(entries.variationStocks)}</td>
        </tr> 
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Charges externes</td>
            <td>${formatToCurrency(entries.chargesExternes)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Impôts, taxes et versements assimilés</td>
            <td>${formatToCurrency(entries.taxes)}</td>
        </tr>
        <tr class="total">
            <td>Total des charges d'exploitation</td>
            <td>${formatToCurrency(entries.totalCharges)}</td>
        </tr>
        <tr class="total">
            <td>Résultat courant avant impôts</td>
            <td>${formatToCurrency(entries.resultatAvantImpots)}</td>
        </tr>
        <tr>
            <td>Impôt sur les bénéfices</td>
            <td>${formatToCurrency(entries.impot)}</td>
        </tr>
        <tr class="total">
            <td>Résultat net</td>
            <td>${formatToCurrency(entries.resultatNet)}</td>
        </tr>
    `;
}