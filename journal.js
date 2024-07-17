import { convertToNumber, trouverCompte, sommeCompteParRacine, formatToCurrency } from './utils.js';

function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
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
        debitCompte = '120000';
        creditCompte = '106000';
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

function inventaireClotureEcriture(line) {
    return [
        creationEcriture(line['date'], '370000', 'clôture inventaire', convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], '603000', 'clôture inventaire', '', convertToNumber(line['montant']))
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


export function arretComptesClotureEcritures(ecritures, currentYear) {
    const ecrituresArret = [...ecritures];
    const comptesClasses6et7 = [...new Set(ecrituresArret
        .filter(ecriture => ecriture['Compte'].startsWith('6') || ecriture['Compte'].startsWith('7'))
        .map(ecriture => ecriture['Compte'])
    )];

    let totalResultat = 0;

    comptesClasses6et7.forEach(compte => {
        const solde = sommeCompteParRacine(ecrituresArret, compte)

        if (solde !== 0) {
            if (solde < 0) {
                ecrituresArret.push(creationEcriture(`31/12/${currentYear}`, compte, 'arrêt des comptes', '', Math.abs(solde)));
            } else {
                ecrituresArret.push(creationEcriture(`31/12/${currentYear}`, compte, 'arrêt des comptes', Math.abs(solde), ''));
            }
            totalResultat += solde;
        }
    });

    if (totalResultat !== 0) {
        const compteResultat = totalResultat < 0 ? '129000' : '120000';
        const label = totalResultat < 0 ? 'résultat déficitaire' : 'résultat excédentaire';
        ecrituresArret.push(creationEcriture(`31/12/${currentYear}`, compteResultat, label, totalResultat < 0 ? -totalResultat : '', totalResultat > 0 ? totalResultat : ''));
    }

    return ecrituresArret;
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