import { convertToNumber, formatToCurrency } from './utils.js';

export function creationInventaire(jsonData, currentYear) {
    const inventaireEcritures = jsonData.filter(ligne => ligne['année'] === currentYear);
    
    return inventaireEcritures;
}

export function injecteInventaireEcritures(inventaireEcritures) {
    const tableBody = document.getElementById('inventaire-ecritures');
    tableBody.innerHTML = inventaireEcritures.map(ecriture => `
        <tr>
            <td>${ecriture['description']}</td>
            <td>${ecriture['numéro']}</td>
            <td>${ecriture['quantité']}</td>
            <td>${formatToCurrency(convertToNumber(ecriture['valeur unique']))}</td>
            <td>${formatToCurrency(convertToNumber(ecriture['valeur totale']))}</td>
        </tr>
    `).join('');
}
