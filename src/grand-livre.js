import { trouverCompte, formatToCurrency } from './utils.js';
import { lignesEnEcritures } from './ecritures.js';

/**
 * Crée un grand livre comptable à partir des données JSON et de l'année courante.
 *
 * @param {Object[]} jsonData - Les données JSON contenant les écritures comptables.
 * @param {number} currentYear - L'année courante pour filtrer les écritures.
 * @returns {Object} - Un objet représentant le grand livre comptable, avec les comptes comme clés et les écritures comme valeurs.
 */
export function creationGrandLivre(jsonData, currentYear) {
    const ecritures = lignesEnEcritures(jsonData, currentYear);

    const grandLivreEcritures = {};
    const comptes = [...new Set(ecritures.map(({ Compte }) => Compte))].sort();

    comptes.forEach(compte => {
        let totalDebit = 0;
        let totalCredit = 0;

        grandLivreEcritures[compte] = ecritures
            .filter(ecriture => ecriture['Compte'] === compte)
            .map(ecriture => {
                const debit = +ecriture['Débit (€)'];
                const credit = +ecriture['Crédit (€)'];
                totalDebit += debit;
                totalCredit += credit;
                return {
                    Date: ecriture.Date,
                    Libellé: ecriture.Libellé,
                    'Débit (€)': debit,
                    'Crédit (€)': credit
                };
            });

        grandLivreEcritures[compte].push({
            'Date': `31/12/${currentYear}`,
            'Libellé': 'Total',
            'Débit (€)': totalDebit,
            'Crédit (€)': totalCredit
        });

        grandLivreEcritures[compte].push({
            'Date': `31/12/${currentYear}`,
            'Libellé': 'Solde',
            'Débit (€)': totalDebit > totalCredit ? (totalDebit - totalCredit) : '',
            'Crédit (€)': totalCredit > totalDebit ? (totalCredit - totalDebit) : ''
        });
    });

    return grandLivreEcritures;
}

/**
 * Injecte les écritures du grand livre dans le conteneur HTML.
 *
 * @param {Object} grandLivreEcritures - Les écritures du grand livre à injecter dans le conteneur HTML.
 */
export function injecteGrandLivreEcritures(grandLivreEcritures) {
    const grandLivreContainer = document.getElementById('grand-livre-ecritures');
    grandLivreContainer.innerHTML = Object.entries(grandLivreEcritures).map(([compte, ecritures]) => {
                const compteLabel = trouverCompte({ compte }).label;
                return `
            <div class="compte">
                <h2>${compte} - ${compteLabel}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Libellé</th>
                            <th>Débit (€)</th>
                            <th>Crédit (€)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ecritures.map(ecriture => `
                            <tr class="${ecriture.Libellé === 'Total' ? 'total' : ecriture.Libellé === 'Solde' ? 'solde' : ''}">
                                <td>${ecriture.Date}</td>
                                <td>${ecriture.Libellé}</td>
                                <td>${formatToCurrency(ecriture['Débit (€)'])}</td>
                                <td>${formatToCurrency(ecriture['Crédit (€)'])}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }).join('');
}