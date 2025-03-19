import { sommeCompteParRacine, formatToCurrency } from './utils.js';
import { lignesEnEcritures } from './gestion-ecritures.js';

/**
 * Crée un bilan comptable à partir des données JSON et de l'année courante.
 *
 * @param {Object[]} jsonData - Les données JSON contenant les écritures comptables.
 * @param {number} currentYear - L'année courante pour filtrer les écritures.
 * @returns {Object} - Un objet représentant le bilan comptable.
 */
export function creationBilan(jsonData, currentYear) {
    const ecritures = lignesEnEcritures(jsonData, currentYear);
    const compte45 = sommeCompteParRacine(ecritures, '45');
    const compte444 = sommeCompteParRacine(ecritures, '444');

    const actifImmobilisationCorporelles = sommeCompteParRacine(ecritures, '21');
    const actifImmobilisationFinancieres = sommeCompteParRacine(ecritures, '27');
    const totalActifImmobilisation = actifImmobilisationCorporelles + actifImmobilisationFinancieres;

    const actifCirculantStocks = sommeCompteParRacine(ecritures, '37');
    const actifCirculantCreances = (compte45 < 0 ? compte45 : 0) + (compte444 > 0 ? compte444 : 0);
    const actifCirculantDisponibilites = sommeCompteParRacine(ecritures, '51') + sommeCompteParRacine(ecritures, '53');
    const totalActifCirculant = actifCirculantStocks + actifCirculantCreances + actifCirculantDisponibilites;
    const totalActif = totalActifCirculant + totalActifImmobilisation;

    const passifCapitauxReserves = sommeCompteParRacine(ecritures, '10');
    const passifCapitauxExercices = sommeCompteParRacine(ecritures, '12');
    const passifCapitauxReport = sommeCompteParRacine(ecritures, '119');
    const totalPassifCapitaux = passifCapitauxReserves + passifCapitauxExercices + passifCapitauxReport;
    const passifCirculantFournisseurs = sommeCompteParRacine(ecritures, '401');
    const passifCirculantDettesFiscales = compte444 > 0 ? compte444 : 0;
    const passifCirculantDettes = compte45 > 0 ? compte45 : 0;
    const totalPassifCirculant = passifCirculantFournisseurs + passifCirculantDettes;
    const totalPassif = totalPassifCapitaux + totalPassifCirculant;

    return {
        'actif': {
            'immobilisation': {
                'corporelles': -actifImmobilisationCorporelles,
                'financieres': -actifImmobilisationFinancieres,
                'total': -totalActifImmobilisation
            },
            'circulant': {
                'stocks': -actifCirculantStocks,
                'creances': -actifCirculantCreances,
                'disponibilites': -actifCirculantDisponibilites,
                'total': -totalActifCirculant
            },
            'total': -totalActif
        },
        'passif': {
            'capitaux': {
                'reserves': passifCapitauxReserves,
                'exercice': passifCapitauxExercices,
                'report': passifCapitauxReport,
                'total': totalPassifCapitaux
            },
            'circulant': {
                'fournisseurs': passifCirculantFournisseurs,
                'fiscales': passifCirculantDettesFiscales,
                'dettes': passifCirculantDettes,
                'total': totalPassifCirculant
            },
            'total': totalPassif
        }
    };
}

/**
 * Injecte les écritures du bilan dans le tableau HTML.
 *
 * @param {Object} soldes - Les soldes du bilan à injecter dans le tableau HTML.
 */
export function injecteBilanEcritures(soldes) {
    const tableBody = document.getElementById('bilan-ecritures');
    tableBody.innerHTML = `
        <tr>
            <td colspan="2" class="bilan-titre"><strong>ACTIF</strong></td>
        </tr>
        <tr>
            <td><strong>Actif immobilisé</strong></td>
            <td></td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Immobilisations corporelles</td>
            <td>${formatToCurrency(soldes.actif.immobilisation.corporelles)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Immobilisations financières</td>
            <td>${formatToCurrency(soldes.actif.immobilisation.financieres)}</td>
        </tr>
        <tr class="total">
            <td>Total Actif immobilisé</td>
            <td>${formatToCurrency(soldes.actif.immobilisation.total)}</td>
        </tr>
        <tr>
            <td><strong>Actif circulant</strong></td>
            <td></td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Stocks</td>
            <td>${formatToCurrency(soldes.actif.circulant.stocks)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Créances</td>
            <td>${formatToCurrency(soldes.actif.circulant.creances)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Disponibilités</td>
            <td>${formatToCurrency(soldes.actif.circulant.disponibilites)}</td>
        </tr>
        <tr class="total">
            <td>Total Actif circulant</td>
            <td>${formatToCurrency(soldes.actif.circulant.total)}</td>
        </tr>
        <tr class="total">
            <td><strong>Total Actif</strong></td>
            <td>${formatToCurrency(soldes.actif.total)}</td>
        </tr>
        <tr>
            <td colspan="2" class="bilan-titre"><strong>PASSIF</strong></td>
        </tr>
        <tr>
            <td><strong>Capitaux propres</strong></td>
            <td></td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Réserves</td>
            <td>${formatToCurrency(soldes.passif.capitaux.reserves)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Résultat de l'exercice</td>
            <td>${formatToCurrency(soldes.passif.capitaux.exercice)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Report à-nouveau</td>
            <td>${formatToCurrency(soldes.passif.capitaux.report)}</td>
        </tr>
        <tr class="total">
            <td>Total Capitaux propres</td>
            <td>${formatToCurrency(soldes.passif.capitaux.total)}</td>
        </tr>
        <tr>
            <td><strong>Passif circulant</strong></td>
            <td></td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Dettes fournisseurs</td>
            <td>${formatToCurrency(soldes.passif.circulant.fournisseurs)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Dettes fiscales</td>
            <td>${formatToCurrency(soldes.passif.circulant.fiscales)}</td>
        </tr>
        <tr>
            <td>&nbsp;&nbsp;&nbsp;Autres dettes</td>
            <td>${formatToCurrency(soldes.passif.circulant.dettes)}</td>
        </tr>
        <tr class="total">
            <td>Total Passif circulant</td>
            <td>${formatToCurrency(soldes.passif.circulant.total)}</td>
        </tr>
        <tr class="total">
            <td><strong>Total Passif</strong></td>
            <td>${formatToCurrency(soldes.passif.total)}</td>
        </tr>
    `;
}