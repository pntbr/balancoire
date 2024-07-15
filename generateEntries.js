function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
}

export function findChartOfAccounts({ account, label }) {
    const chartOfAccounts = {
        "119000": ["report à nouveau (solde débiteur)"],
        "129000": ["résultat de l'exercice (déficit)", "pertes"],
        "275000": ["dépôts et cautionnements versés", "cautions"],
        "370000": ["stocks de marchandises", "inventaire"],
        "404000": ["fournisseurs d'immobilisations"],
        "467000": ["autres comptes débiteurs ou créditeurs", "remboursements", "prêts"],
        "512000": ["banques"],
        "530000": ["Caisse"],
        "602600": ["emballages"],
        "603000": ["variations des stocks"],
        "604000": ["achats d'études et prestations de services", "achats prestations"],
        "606000": ["achats non stockés de matière et fournitures", "fournitures", "décorations", "énergies"],
        "607000": ["achats de marchandises", "marchandises"],
        "613000": ["locations"],
        "616000": ["primes d'assurances", "assurances"],
        "618300": ["documentation technique", "documentations"],
        "618500": ["frais de colloques, séminaires, conférences", "conférences"],
        "622000": ["rémunérations d'intermédiaires et honoraires", "intermédiaires"],
        "623000": ["publicité, publications, relations publiques", "communication"],
        "624100": ["transports sur achats"],
        "625000": ["déplacements, missions et réceptions", "déplacements", "restauration", "hébergements"],
        "626000": ["frais postaux et de télécommunications", "internet", "frais postaux", "télécommunications", "domiciliations"],
        "627000": ["services bancaires et assimilés", "services bancaires"],
        "706000": ["prestations de services", "formations"],
        "707000": ["ventes de marchandises", "ventes"],
        "754100": ["dons manuels", "dons"],
        "756000": ["cotisations"],
        "890000": ["Bilan d'ouverture"],
        "891000": ["Bilan de clôture"],
    };

    for (const [key, value] of Object.entries(chartOfAccounts)) {
        if (account === key || value.includes(label)) {
            return { account: key, label: value[0] };
        }
    }

    return { account: 'xxxxxx', label: 'non défini' };
}


function convertToNumber(euroString) {
    const cleanString = euroString.replace(/\s/g, '').replace('€', '').replace(',', '.');
    return parseFloat(cleanString || 0);
}

function createEntry(date, account, label, debit, credit) {
    return {
        'Date': date,
        'Compte': account,
        'Libellé': label,
        'Débit (€)': debit || '',
        'Crédit (€)': credit || ''
    };
}

function retainedEarningsEntry(line, accountNumber) {
    let debitAccount = '';
    let creditAccount = '';
    let label = '';
    if (accountNumber === '370000') {
        debitAccount = '603000';
        creditAccount = accountNumber;
        label = 'annulation du stock initial';
    } else if (accountNumber === '129000') {
        debitAccount = '119000';
        creditAccount = accountNumber;
        label = 'pertes de l’exercice précédent';
    } else {
        debitAccount = '890000';
        creditAccount = accountNumber;
        label = `report à-nouveaux ${line['poste']}`;
    }
    return [
        createEntry(line['date'], debitAccount, label, convertToNumber(line['montant']), ''),
        createEntry(line['date'], creditAccount, label, '', convertToNumber(line['montant']))
    ];
}

function ClosingEntry(line, accountNumber) {
    return [
        createEntry(line['date'], accountNumber, 'clôture inventaire', convertToNumber(line['montant']), ''),
        createEntry(line['date'], '603000', 'clôture inventaire', '', convertToNumber(line['montant']))
    ];
}

function depositEntry(line) {
    const creditAccount = line['qui paye ?'] === 'B2T' ? (line["nature"] === 'esp' ? '530000' : '512000') : '467000';
    return [
        createEntry(line['date'], '275000', `caution ${line['qui reçoit']}`, convertToNumber(line['montant']), ''),
        createEntry(line['date'], creditAccount, `caution ${line['qui reçoit']}`, '', convertToNumber(line['montant']))
    ];
}

function refundEntry(line) {
    const checkCash = line["nature"] === 'esp';
    return [
        createEntry(line['date'], '467000', 'remboursement de frais', convertToNumber(line['montant']), ''),
        createEntry(line['date'], checkCash ? '530000' : '512000', 'remboursement de frais', '', convertToNumber(line['montant']))
    ];
}

function chargeB2TEntry(line, accountNumber) {
    const checkCash = line["nature"] === 'esp';
    const piece = line['facture correspondante'] ? `- <a href="${line['facture correspondante']}">pièce</a>` : '';
    const label = `achat B2T : ${line['qui reçoit']} ${piece}`;
    return [
        createEntry(line['date'], accountNumber, label, convertToNumber(line['montant']), ''),
        createEntry(line['date'], checkCash ? '530000' : '512000', label, '', convertToNumber(line['montant']))
    ];
}

function chargePersonEntry(line, accountNumber) {
    const piece = line['facture correspondante'] ? `<a href="${line['facture correspondante']}">pièce</a>` : '';
    const label = `achat personne : ${line['qui reçoit']} - ${piece}`;
    return [
        createEntry(line['date'], accountNumber, label, convertToNumber(line['montant']), ''),
        createEntry(line['date'], '467000', label, '', convertToNumber(line['montant']))
    ];
}

function saleEntry(line, accountNumber) {
    const checkCash = line["nature"] === 'esp';
    const piece = line['facture correspondante'] ? `<a href="${line['facture correspondante']}">pièce</a>` : '';
    const label = `vente : ${line['qui paye ?']} - ${piece}`;
    return [
        createEntry(line['date'], accountNumber, label, '', convertToNumber(line['montant'])),
        createEntry(line['date'], checkCash ? '530000' : '512000', label, convertToNumber(line['montant']), '')
    ];
}

export function lineToEntry(line) {
    const accountNumber = findChartOfAccounts({ label: line.poste }).account;
    try {
        // Gère les à-nouveaux
        if (line['date'].startsWith('01/01')) {
            return retainedEarningsEntry(line, accountNumber)
        }
        // Gère la clôture
        if (line['date'].startsWith('31/12')) {
            return ClosingEntry(line, accountNumber)
        }
        if (accountNumber === '275000') return depositEntry(line);
        if (accountNumber.startsWith('4')) return refundEntry(line);
        if (accountNumber.startsWith('6')) return line['qui paye ?'] === 'B2T' ? chargeB2TEntry(line, accountNumber) : chargePersonEntry(line, accountNumber);
        if (accountNumber.startsWith('7')) return saleEntry(line, accountNumber);

        displayErrorMessage(`Erreur : L'écriture ${JSON.stringify(line)} ne comporte pas un compte connu`);
        return;
    } catch (error) {
        displayErrorMessage(`Erreur : L'écriture ${JSON.stringify(line)} n'a pu être rendue`);
        throw error;
    }
}

export function generateBalance(journalEntries) {
    const balanceEntries = [];
    const accounts = [...new Set(journalEntries.map(({ Compte }) => Compte))].sort();

    accounts.forEach(account => {
        let totalDebit = 0;
        let totalCredit = 0;

        journalEntries
            .filter(entry => entry.Compte === account)
            .map(entry => {
                const debit = +entry['Débit (€)'] || 0;
                const credit = +entry['Crédit (€)'] || 0;
                totalDebit += debit;
                totalCredit += credit;
            });

        balanceEntries.push({
            'Compte': account,
            'Libellé': findChartOfAccounts({ account: account }).label,
            'Débit (€)': totalDebit,
            'Crédit (€)': totalCredit,
            'Solde (€)': totalCredit - totalDebit
        });
    });

    return balanceEntries;
}

export function generateLedger(journalEntries) {
    const ledgerEntries = {};
    const accounts = [...new Set(journalEntries.map(({ Compte }) => Compte))].sort();

    accounts.forEach(account => {
        let totalDebit = 0;
        let totalCredit = 0;

        ledgerEntries[account] = journalEntries
            .filter(entry => entry.Compte === account)
            .map(entry => {
                const debit = +entry['Débit (€)'] || 0;
                const credit = +entry['Crédit (€)'] || 0;
                totalDebit += debit;
                totalCredit += credit;
                return {
                    Date: entry.Date,
                    Libellé: entry.Libellé,
                    'Débit (€)': debit,
                    'Crédit (€)': credit,
                };
            });

        ledgerEntries[account].push({
            'Date': '31/12/2021',
            'Libellé': 'Total',
            'Débit (€)': totalDebit,
            'Crédit (€)': totalCredit
        });

        ledgerEntries[account].push({
            'Date': '31/12/2021',
            'Libellé': 'Solde',
            'Débit (€)': totalDebit > totalCredit ? totalDebit - totalCredit : '',
            'Crédit (€)': totalCredit > totalDebit ? totalCredit - totalDebit : ''
        });
    });

    return ledgerEntries;
}

export function generateIncomeStatement(journalEntries) {
    function sumAccountsByRoot(entries, root) {
        return entries
            .filter(entry => entry.Compte.startsWith(root))
            .reduce((sum, entry) => sum + (entry["Crédit (€)"] - entry["Débit (€)"]), 0);
    }

    const contributions = sumAccountsByRoot(journalEntries, "756000");
    const donations = sumAccountsByRoot(journalEntries, "754100");
    const productSales = sumAccountsByRoot(journalEntries, "707000");
    const serviceRevenue = sumAccountsByRoot(journalEntries, "706000");
    const materialsAndSupplies = sumAccountsByRoot(journalEntries, "60")
    const externalServices = sumAccountsByRoot(journalEntries, "61") + sumAccountsByRoot(journalEntries, "62");

    const totalOperatingIncome = contributions + donations + productSales + serviceRevenue;
    const totalOperatingExpenses = materialsAndSupplies + externalServices;

    const currentResultBeforeTax = totalOperatingIncome + totalOperatingExpenses;
    const taxOnProfits = currentResultBeforeTax > 0 ? currentResultBeforeTax * 0.15 : 0.00;
    const netResult = currentResultBeforeTax - taxOnProfits;

    return {
        contributions,
        donations,
        productSales,
        serviceRevenue,
        totalOperatingIncome,
        materialsAndSupplies,
        externalServices,
        otherExternalCharges: 0.00,
        taxes: 0.00,
        financialCharges: 0.00,
        depreciationAndProvisions: 0.00,
        totalOperatingExpenses,
        currentResultBeforeTax,
        taxOnProfits,
        netResult
    };
}