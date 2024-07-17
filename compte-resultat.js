import { sommeCompteParRacine, formatToCurrency } from './utils.js';

export function creationCompteResultat(journalEcritures) {
    const cotisations = sommeCompteParRacine(journalEcritures, "756000");
    const donations = sommeCompteParRacine(journalEcritures, "754100");
    const prestations = sommeCompteParRacine(journalEcritures, "706000");
    const marchandises = sommeCompteParRacine(journalEcritures, "707000");

    const totalProduits = cotisations + donations + prestations + marchandises;

    const achatsMarchandises = sommeCompteParRacine(journalEcritures, "607") + sommeCompteParRacine(journalEcritures, "6097");
    const achatsApprovisionnements = sommeCompteParRacine(journalEcritures, "601") + sommeCompteParRacine(journalEcritures, "602") + sommeCompteParRacine(journalEcritures, "604") + sommeCompteParRacine(journalEcritures, "605") + +sommeCompteParRacine(journalEcritures, "606");
    const variationStocks = sommeCompteParRacine(journalEcritures, "603");
    const chargesExternes = sommeCompteParRacine(journalEcritures, "61") + sommeCompteParRacine(journalEcritures, "62");
    const taxes = sommeCompteParRacine(journalEcritures, "63");
    const autresCharges = sommeCompteParRacine(journalEcritures, "6") - achatsMarchandises - achatsApprovisionnements - variationStocks - chargesExternes - taxes;

    const totalCharges = achatsMarchandises + achatsApprovisionnements + variationStocks + chargesExternes + taxes + autresCharges;

    const resultatAvantImpots = totalProduits + totalCharges;
    const impots = resultatAvantImpots > 0 ? resultatAvantImpots * 0.15 : 0.00;
    const resultatNet = resultatAvantImpots - impots;

    return {
        'produits': {
            'cotisations': cotisations,
            'dons': donations,
            'prestations': prestations,
            'marchandises': marchandises,
            'total': totalProduits,
        },
        'charges': {
            'marchandises': achatsMarchandises,
            'approvisionnements': achatsApprovisionnements,
            'stocks': variationStocks,
            'externes': chargesExternes,
            'taxes': taxes,
            'autres': autresCharges,
            'total': totalCharges,
        },
        'resultats': {
            'avantImpots': resultatAvantImpots,
            'impots': impots,
            'net': resultatNet,
        }
    };
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