function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
}

export function trouverCompte({ compte, label }) {
    const comptes = {
        "106000": ["réserves"],
        "119000": ["report à nouveau (solde débiteur)"],
        "120000": ["résultat de l'exercice (excédent)", "excédent"],
        "129000": ["résultat de l'exercice (déficit)", "déficit"],
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

    for (const [key, value] of Object.entries(comptes)) {
        if (compte === key || value.includes(label)) {
            return { compte: key, label: value[0] };
        }
    }

    return { compte: 'xxxxxx', label: 'non défini' };
}


function convertToNumber(euroString) {
    const cleanString = euroString.replace(/\s/g, '').replace('€', '').replace(',', '.');
    return parseFloat(cleanString || 0);
}

function sommeCompteParRacine(entries, root) {
    return entries
        .filter(ecriture => ecriture.Compte.startsWith(root))
        .reduce((sum, ecriture) => sum + (ecriture["Crédit (€)"] - ecriture["Débit (€)"]), 0);
}

function creationEcriture(date, compte, label, debit, credit) {
    return {
        'Date': date,
        'Compte': compte,
        'Libellé': label,
        'Débit (€)': debit || '',
        'Crédit (€)': credit || ''
    };
}

function aNouveauEcriture(line, numeroCompte) {
    let debitCompte = '';
    let creditCompte = '';
    let label = '';
    if (numeroCompte === '370000') {
        debitCompte = '603000';
        creditCompte = '370000';
        label = 'annulation du stock initial';
    } else if (numeroCompte === '129000') {
        debitCompte = '119000';
        creditCompte = '129000';
        label = 'déficit de l’exercice précédent';
    } else if (numeroCompte === '120000') {
        debitCompte = '106000';
        creditCompte = '120000';
        label = 'excédent de l’exercice précédent';
    } else {
        debitCompte = '890000';
        creditCompte = numeroCompte;
        label = `report à-nouveaux ${line['poste']}`;
    }
    return [
        creationEcriture(line['date'], debitCompte, label, convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], creditCompte, label, '', convertToNumber(line['montant']))
    ];
}

function inventaireClotureEcriture(line, numeroCompte) {
    return [
        creationEcriture(line['date'], '370000', 'clôture inventaire', convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], '603000', 'clôture inventaire', '', convertToNumber(line['montant']))
    ];
}

function deficitClotureEcriture(line, numeroCompte) {
    return [
        creationEcriture(line['date'], '129000', 'déficit sur l\'exercice', convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], '119000', 'déficit sur l\'exercice', '', convertToNumber(line['montant']))
    ];
}

function excedentClotureEcriture(line, numeroCompte) {
    return [
        creationEcriture(line['date'], '120000', 'excédent sur l\'exercice', convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], '106000', 'excédent sur l\'exercice', '', convertToNumber(line['montant']))
    ];
}

function cautionEcriture(line) {
    const creditCompte = line['qui paye ?'] === 'B2T' ? (line["nature"] === 'esp' ? '530000' : '512000') : '467000';
    return [
        creationEcriture(line['date'], '275000', `caution ${line['qui reçoit']}`, convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], creditCompte, `caution ${line['qui reçoit']}`, '', convertToNumber(line['montant']))
    ];
}

function remboursementEcriture(line) {
    const checkCash = line["nature"] === 'esp';
    return [
        creationEcriture(line['date'], '467000', 'remboursement de frais', convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], checkCash ? '530000' : '512000', 'remboursement de frais', '', convertToNumber(line['montant']))
    ];
}

function depenseEcriture(line, numeroCompte) {
    const checkCash = line["nature"] === 'esp';
    const piece = line['facture correspondante'] ? `- <a href="${line['facture correspondante']}">pièce</a>` : '';
    const label = `achat B2T : ${line['qui reçoit']} ${piece}`;
    return [
        creationEcriture(line['date'], numeroCompte, label, convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], checkCash ? '530000' : '512000', label, '', convertToNumber(line['montant']))
    ];
}

function depensePersonneEcriture(line, numeroCompte) {
    const piece = line['facture correspondante'] ? `<a href="${line['facture correspondante']}">pièce</a>` : '';
    const label = `achat personne : ${line['qui reçoit']} - ${piece}`;
    return [
        creationEcriture(line['date'], numeroCompte, label, convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], '467000', label, '', convertToNumber(line['montant']))
    ];
}

function venteEcriture(line, numeroCompte) {
    const checkCash = line["nature"] === 'esp';
    const piece = line['facture correspondante'] ? `<a href="${line['facture correspondante']}">pièce</a>` : '';
    const label = `vente : ${line['qui paye ?']} - ${piece}`;
    return [
        creationEcriture(line['date'], numeroCompte, label, '', convertToNumber(line['montant'])),
        creationEcriture(line['date'], checkCash ? '530000' : '512000', label, convertToNumber(line['montant']), '')
    ];
}

export function ligneEnEcriture(line) {
    const numeroCompte = trouverCompte({ label: line.poste }).compte;
    try {
        // Gère les à-nouveaux
        if (line['date'].startsWith('01/01')) {
            return aNouveauEcriture(line, numeroCompte);
        }
        // Gère la clôture
        if (line['date'].startsWith('31/12')) {
            if (numeroCompte === '370000') {
                return inventaireClotureEcriture(line, numeroCompte);
            } else if (numeroCompte === '129000') {
                return deficitClotureEcriture(line, numeroCompte);
            } else if (numeroCompte === '120000') {
                return excedentClotureEcriture(line, numeroCompte);
            }
        }

        // Gère les écritures courantes
        if (numeroCompte === '275000') return cautionEcriture(line);
        if (numeroCompte.startsWith('4')) return remboursementEcriture(line);
        if (numeroCompte.startsWith('6')) return line['qui paye ?'] === 'B2T' ? depenseEcriture(line, numeroCompte) : depensePersonneEcriture(line, numeroCompte);
        if (numeroCompte.startsWith('7')) return venteEcriture(line, numeroCompte);

        displayErrorMessage(`Erreur : L'écriture ${JSON.stringify(line)} ne comporte pas un compte connu`);
        return;
    } catch (error) {
        displayErrorMessage(`Erreur : L'écriture ${JSON.stringify(line)} n'a pu être rendue`);
        throw error;
    }
}

export function creationBalance(journalEcritures) {
    const balanceEcritures = [];
    const comptes = [...new Set(journalEcritures.map(({ Compte }) => Compte))].sort();

    comptes.forEach(compte => {
        let totalDebit = 0;
        let totalCredit = 0;

        journalEcritures
            .filter(ecriture => ecriture['Compte'] === compte)
            .map(ecriture => {
                const debit = +ecriture['Débit (€)'] || 0;
                const credit = +ecriture['Crédit (€)'] || 0;
                totalDebit += debit;
                totalCredit += credit;
            });

        balanceEcritures.push({
            'Compte': compte,
            'Libellé': trouverCompte({ compte: compte }).label,
            'Débit (€)': totalDebit,
            'Crédit (€)': totalCredit,
            'Solde (€)': totalCredit - totalDebit
        });
    });

    return balanceEcritures;
}

export function creationGrandLivre(journalEcritures) {
    const grandLivreEcritures = {};
    const comptes = [...new Set(journalEcritures.map(({ Compte }) => Compte))].sort();

    comptes.forEach(compte => {
        let totalDebit = 0;
        let totalCredit = 0;

        grandLivreEcritures[compte] = journalEcritures
            .filter(ecriture => ecriture['Compte'] === compte)
            .map(ecriture => {
                const debit = +ecriture['Débit (€)'] || 0;
                const credit = +ecriture['Crédit (€)'] || 0;
                totalDebit += debit;
                totalCredit += credit;
                return {
                    Date: ecriture.Date,
                    Libellé: ecriture.Libellé,
                    'Débit (€)': debit,
                    'Crédit (€)': credit,
                };
            });

        grandLivreEcritures[compte].push({
            'Date': '31/12/2021',
            'Libellé': 'Total',
            'Débit (€)': totalDebit,
            'Crédit (€)': totalCredit
        });

        grandLivreEcritures[compte].push({
            'Date': '31/12/2021',
            'Libellé': 'Solde',
            'Débit (€)': totalDebit > totalCredit ? totalDebit - totalCredit : '',
            'Crédit (€)': totalCredit > totalDebit ? totalCredit - totalDebit : ''
        });
    });

    return grandLivreEcritures;
}

export function creationCompteResultat(journalEcritures) {
    const cotisations = sommeCompteParRacine(journalEcritures, "756000");
    const donations = sommeCompteParRacine(journalEcritures, "754100");
    const produits = sommeCompteParRacine(journalEcritures, "707000");
    const prestations = sommeCompteParRacine(journalEcritures, "706000");

    const achatsMarchandises = sommeCompteParRacine(journalEcritures, "607") + sommeCompteParRacine(journalEcritures, "6097");
    const achatsApprovisionnements = sommeCompteParRacine(journalEcritures, "601") + sommeCompteParRacine(journalEcritures, "602") + sommeCompteParRacine(journalEcritures, "604") + sommeCompteParRacine(journalEcritures, "605") + +sommeCompteParRacine(journalEcritures, "606");
    const variationStocks = sommeCompteParRacine(journalEcritures, "603");
    const chargesExternes = sommeCompteParRacine(journalEcritures, "61") + sommeCompteParRacine(journalEcritures, "62");
    const taxes = sommeCompteParRacine(journalEcritures, "63");
    const autresCharges = sommeCompteParRacine(journalEcritures, "65");

    const totalProduits = cotisations + donations + produits + prestations;
    const totalCharges = achatsMarchandises + achatsApprovisionnements + variationStocks + chargesExternes + taxes + autresCharges;

    const resultatAvantImpots = totalProduits + totalCharges;
    const impots = resultatAvantImpots > 0 ? resultatAvantImpots * 0.15 : 0.00;
    const resultatNet = resultatAvantImpots - impots;

    return {
        cotisations,
        donations,
        produits,
        prestations,
        totalProduits,
        achatsMarchandises,
        achatsApprovisionnements,
        variationStocks,
        chargesExternes,
        taxes,
        autresCharges,
        totalCharges,
        resultatAvantImpots,
        impots,
        resultatNet
    };
}