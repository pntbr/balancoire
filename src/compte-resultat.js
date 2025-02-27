import { sommeCompteParRacine, formatToCurrency } from './utils.js';
import { lignesEnEcritures } from './gestion-ecritures.js';

/**
 * Crée un compte de résultat à partir des données JSON et de l'année courante.
 *
 * @param {Object[]} jsonData - Les données JSON contenant les écritures comptables.
 * @param {number} currentYear - L'année courante pour filtrer les écritures.
 * @returns {Object} - Un objet représentant le compte de résultat.
 */
export function creationCompteResultat(jsonData, currentYear) {
    const ecritures = lignesEnEcritures(jsonData, currentYear);

    const ecrituresSansCloture = ecritures.filter(ecriture => ecriture.EcritureLib !== "clôture du compte");

    const cotisations = sommeCompteParRacine(ecrituresSansCloture, "756000");
    const donations = sommeCompteParRacine(ecrituresSansCloture, "754100");
    const prestations = sommeCompteParRacine(ecrituresSansCloture, "706000");
    const marchandises = sommeCompteParRacine(ecrituresSansCloture, "707000");
    const autresProduits = sommeCompteParRacine(ecrituresSansCloture, "7") - cotisations - donations - prestations - marchandises;

    const totalProduits = cotisations + donations + prestations + marchandises + autresProduits;

    const achatsMarchandises = sommeCompteParRacine(ecrituresSansCloture, "607") + sommeCompteParRacine(ecrituresSansCloture, "6097");
    const achatsApprovisionnements = sommeCompteParRacine(ecrituresSansCloture, "601") + sommeCompteParRacine(ecrituresSansCloture, "602") + sommeCompteParRacine(ecrituresSansCloture, "604") + sommeCompteParRacine(ecrituresSansCloture, "605") + sommeCompteParRacine(ecrituresSansCloture, "606");
    const variationStocks = sommeCompteParRacine(ecrituresSansCloture, "603");
    const chargesExternes = sommeCompteParRacine(ecrituresSansCloture, "61") + sommeCompteParRacine(ecrituresSansCloture, "62");
    const taxes = sommeCompteParRacine(ecrituresSansCloture, "63");
    const autresCharges = sommeCompteParRacine(ecrituresSansCloture, "6") - achatsMarchandises - achatsApprovisionnements - variationStocks - chargesExternes - taxes - sommeCompteParRacine(ecrituresSansCloture, "695");

    const totalCharges = achatsMarchandises + achatsApprovisionnements + variationStocks + chargesExternes + taxes + autresCharges;

    const resultatAvantImpots = totalProduits + totalCharges;
    const impots = sommeCompteParRacine(ecrituresSansCloture, "695");
    const resultatNet = resultatAvantImpots + impots;

    return {
        'produits': {
            'cotisations': cotisations,
            'dons': donations,
            'prestations': prestations,
            'marchandises': marchandises,
            'autres': autresProduits,
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

/**
 * Injecte les écritures du compte de résultat dans le tableau HTML.
 *
 * @param {Object} soldes - Les soldes du compte de résultat à injecter dans le tableau HTML.
 */
export function injecteCompteResultatEcritures(soldes) {
    const tableBody = document.getElementById('compte-resultat-ecritures');
    tableBody.innerHTML = `
        <tr>
            <td class="compte-resultat-titre">Produits de l'activité</td>
            <td></td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Cotisations des membres</td>
            <td>${formatToCurrency(soldes.produits.cotisations)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Dons</td>
            <td>${formatToCurrency(soldes.produits.dons)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Prestations de services</td>
            <td>${formatToCurrency(soldes.produits.prestations)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Ventes de produits</td>
            <td>${formatToCurrency(soldes.produits.marchandises)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Autres produits</td>
            <td> ${formatToCurrency(soldes.produits.autres)}</td>
        </tr>
        <tr class="total">
            <td>Total des produits de l'activité</td>
            <td>${formatToCurrency(soldes.produits.total)}</td>
        </tr>
        <tr>
            <td class="compte-resultat-titre">Charges de l'activité</td>
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
            <td>Total des charges de l'activité</td>
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