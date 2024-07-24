import { convertToNumber, formatToCurrency } from './utils.js';

/**
 * Crée un inventaire à partir des données JSON et de l'année courante.
 *
 * @param {Object[]} jsonData - Les données JSON contenant les informations de l'inventaire.
 * @param {number} currentYear - L'année courante pour filtrer les écritures.
 * @returns {Object} - Un objet contenant les écritures de l'inventaire et la valeur totale du stock.
 */
export function creationInventaire(jsonData, currentYear) {
    const inventaireEcritures = jsonData
        .filter(ligne => ligne['année'] === currentYear)
        .sort((a, b) => convertToNumber(a['numéro']) - convertToNumber(b['numéro']));
    const totalValeurTotale = inventaireEcritures.reduce((acc, ecriture) => acc + convertToNumber(ecriture['valeur totale']), 0);

    return { inventaireEcritures, totalValeurTotale };
}

/**
 * Injecte les écritures de l'inventaire dans le tableau HTML.
 *
 * @param {Object} inventaire - Un objet contenant les écritures de l'inventaire et la valeur totale du stock.
 * @param {Object[]} inventaire.inventaireEcritures - Les écritures de l'inventaire à injecter dans le tableau HTML.
 * @param {number} inventaire.totalValeurTotale - La valeur totale du stock.
 */
export function injecteInventaireEcritures({ inventaireEcritures, totalValeurTotale }) {
    const tableBody = document.getElementById('inventaire-ecritures');

    tableBody.innerHTML = inventaireEcritures.map(ecriture => `
        <tr>
            <td>${ecriture['description']}</td>
            <td>${ecriture['numéro']}</td>
            <td>${ecriture['quantité']}</td>
            <td>${formatToCurrency(convertToNumber(ecriture['valeur unique']))}</td>
            <td>${formatToCurrency(convertToNumber(ecriture['valeur totale']))}</td>
        </tr>
    `).join('') + `
        <tr class="total">
            <td colspan="4">Valeur du stock</td>
            <td>${formatToCurrency(totalValeurTotale)}</td>
        </tr>
    `;
}