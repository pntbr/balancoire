import { convertToNumber, trouverCompte, sommeCompteParRacine } from './utils.js';

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

function aNouveauEcriture(line, numeroCompte, currentYear) {
    const montant = convertToNumber(line['montant']);

    const ecritures = {
        '370000': [
            creationEcriture(`01/01/${currentYear}`, '370000', 'annulation du stock initial', montant, ''),
            creationEcriture(`01/01/${currentYear}`, '603700', 'annulation du stock initial', montant, ''),
            creationEcriture(`01/01/${currentYear}`, '370000', 'annulation du stock initial', '', montant)
        ],
        '129000': [
            creationEcriture(`01/01/${currentYear}`, '129000', 'reprise du résultat déficitaire N-1', montant, ''),
            creationEcriture(`01/01/${currentYear}`, '119000', 'affectation du résultat déficitaire N-1', montant, ''),
            creationEcriture(`01/01/${currentYear}`, '129000', 'affectation du résultat déficitaire N-1', '', montant)
        ],
        '120000': [
            creationEcriture(`01/01/${currentYear}`, '120000', 'reprise du résultat déficitaire N-1', '', montant),
            creationEcriture(`01/01/${currentYear}`, '120000', 'affectation du résultat déficitaire N-1', montant, ''),
            creationEcriture(`01/01/${currentYear}`, '106000', 'affectation du résultat déficitaire N-1', '', montant)
        ]
    };

    if (ecritures[numeroCompte]) {
        return ecritures[numeroCompte];
    }

    if (/^[12345]/.test(numeroCompte)) {
        const debit = montant < 0 ? Math.abs(montant) : '';
        const credit = montant > 0 ? Math.abs(montant) : '';
        return [creationEcriture(`01/01/${currentYear}`, numeroCompte, `reprise de ${line['poste']}`, debit, credit)];
    }

    displayErrorMessage(`Erreur : L'écriture d'a-nouveau ${JSON.stringify(line)} n'a pu être rendue`);
    throw error;
}

function inventaireClotureEcriture(line) {
    return [
        creationEcriture(line['date'], '370000', 'clôture inventaire', convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], '603700', 'clôture inventaire', '', convertToNumber(line['montant']))
    ];
}

function cautionEcriture(line) {
    const creditCompte = line['qui paye ?'] === 'B2T' ? (line["nature"] === 'esp' ? '530000' : '512000') : '467000';
    return [
        creationEcriture(line['date'], '275000', `
                    caution $ { line['qui reçoit'] }
                    `, convertToNumber(line['montant']), ''),
        creationEcriture(line['date'], creditCompte, `
                    caution $ { line['qui reçoit'] }
                    `, '', convertToNumber(line['montant']))
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
    const piece = line['facture correspondante'] ? ` - <a href = "${line['facture correspondante']}" > pièce </a>` : '';
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

function impotExercice(ecritures, currentYear) {
    const resultat = sommeCompteParRacine(ecritures, '7') + sommeCompteParRacine(ecritures, '6');
    const montantImpot = resultat * 0.15;
    if (resultat <= 0) return [];
    return [
        creationEcriture(`31/12/${currentYear}`, '695000', 'impôt sur les sociétés', montantImpot, ''),
        creationEcriture(`31/12/${currentYear}`, '444000', 'impôt sur les sociétés', '', montantImpot)
    ];
}

function ligneEnEcriture(line, currentYear) {
    const numeroCompte = trouverCompte({ label: line.poste }).compte;
    try {
        // Esquive les à-nouveaux
        if (line['date'].startsWith('01/01')) {
            return aNouveauEcriture(line, numeroCompte, currentYear);
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
        throw error;
    } catch (error) {
        displayErrorMessage(`Erreur : L'écriture ${JSON.stringify(line)} n'a pu être rendue`);
        throw error;
    }
}

export function lignesEnEcritures(jsonData, currentYear) {
    const ecritures = jsonData.flatMap(ligne => ligneEnEcriture(ligne, currentYear));

    return ecritures
        .concat(impotExercice(ecritures, currentYear))
        .sort((a, b) => {
            const dateA = new Date(a.Date.split('/').reverse().join('-'));
            const dateB = new Date(b.Date.split('/').reverse().join('-'));
            return dateA - dateB;
        });
}

export function arretComptesClotureEcritures(ecritures, currentYear) {
    const resultat = sommeCompteParRacine(ecritures, '7') + sommeCompteParRacine(ecritures, '6');
    const ecrituresArret = [...ecritures];
    const comptesClasses6et7 = [...new Set(ecrituresArret
        .filter(ecriture => ecriture['Compte'].startsWith('6') || ecriture['Compte'].startsWith('7'))
        .map(ecriture => ecriture['Compte'])
    )];

    comptesClasses6et7.forEach(compte => {
        const solde = sommeCompteParRacine(ecrituresArret, compte)

        if (solde !== 0) {
            if (solde < 0) {
                ecrituresArret.push(creationEcriture(`31/12/${currentYear}`, compte, 'arrêt des comptes', '', Math.abs(solde)));
            } else {
                ecrituresArret.push(creationEcriture(`31/12/${currentYear}`, compte, 'arrêt des comptes', Math.abs(solde), ''));
            }
        }
    });

    const isExcédentaire = resultat > 0;
    const compte = isExcédentaire ? '120000' : '129000';
    const label = isExcédentaire ? 'résultat excédentaire' : 'résultat déficitaire';

    ecrituresArret.push(creationEcriture(`31/12/${currentYear}`, compte, label, !isExcédentaire && Math.abs(resultat), isExcédentaire && Math.abs(resultat)));

    return ecrituresArret;
}