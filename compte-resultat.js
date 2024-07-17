import { sommeCompteParRacine } from './utils.js';

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