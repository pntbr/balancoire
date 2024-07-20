import { convertToNumber, formatToCurrency } from './utils.js';

export function creationInventaire(jsonData, currentYear) {
    const inventaireEcritures = jsonData
        .filter(ligne => ligne['année'] === currentYear)
        .sort((a, b) => convertToNumber(a['numéro']) - convertToNumber(b['numéro']));
    const totalValeurTotale = inventaireEcritures.reduce((acc, ecriture) => acc + convertToNumber(ecriture['valeur totale']), 0);
    
    return { inventaireEcritures, totalValeurTotale };
}

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
