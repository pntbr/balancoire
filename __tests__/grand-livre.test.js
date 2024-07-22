import { creationGrandLivre, injecteGrandLivreEcritures } from '../src/grand-livre.js';
import { lignesEnEcritures } from '../src/ecritures.js';
import { trouverCompte, formatToCurrency } from '../src/utils.js';

jest.mock('../src/ecritures', () => ({
    lignesEnEcritures: jest.fn()
}));

jest.mock('../src/utils', () => ({
    trouverCompte: jest.fn(),
    formatToCurrency: jest.fn()
}));

describe('Grand Livre', () => {
    describe('creationGrandLivre', () => {
        const jsonData = [
            { 'Date': '2023-01-01', 'Compte': '601000', 'Libellé': 'Achat de marchandises', 'Débit (€)': 100, 'Crédit (€)': 0 },
            { 'Date': '2023-01-02', 'Compte': '601000', 'Libellé': 'Achat de fournitures', 'Débit (€)': 50, 'Crédit (€)': 0 },
            { 'Date': '2023-01-01', 'Compte': '602000', 'Libellé': 'Vente de marchandises', 'Débit (€)': 0, 'Crédit (€)': 200 },
        ];
        const currentYear = 2023;

        test('doit créer un grand livre comptable', () => {
            lignesEnEcritures.mockImplementation(() => jsonData);
            const grandLivre = creationGrandLivre(jsonData, currentYear);

            expect(Object.keys(grandLivre).length).toBeGreaterThan(0);
            expect(grandLivre['601000'].length).toBeGreaterThan(0);
            expect(grandLivre['601000'][0]).toHaveProperty('Date', '2023-01-01');
        });
    });

    describe('injecteGrandLivreEcritures', () => {
        test('doit injecter les écritures du grand livre dans le conteneur HTML', () => {
            document.body.innerHTML = '<div id="grand-livre-ecritures"></div>';
            const grandLivreEcritures = {
                '601000': [
                    { 'Date': '2023-01-01', 'Libellé': 'Achat de marchandises', 'Débit (€)': 100, 'Crédit (€)': 0 },
                    { 'Date': '2023-01-02', 'Libellé': 'Achat de fournitures', 'Débit (€)': 50, 'Crédit (€)': 0 },
                    { 'Date': '31/12/2023', 'Libellé': 'Total', 'Débit (€)': 150, 'Crédit (€)': 0 },
                    { 'Date': '31/12/2023', 'Libellé': 'Solde', 'Débit (€)': 150, 'Crédit (€)': 0 }
                ]
            };
            trouverCompte.mockImplementation(({ compte }) => ({ label: `Label ${compte}` }));
            formatToCurrency.mockImplementation(value => `${value} €`);
            injecteGrandLivreEcritures(grandLivreEcritures);

            const rows = document.querySelectorAll('#grand-livre-ecritures .compte');
            expect(rows.length).toBeGreaterThan(0);
            expect(rows[0].innerHTML).toContain('601000');
            expect(rows[0].innerHTML).toContain('Label 601000');
        });
    });
});