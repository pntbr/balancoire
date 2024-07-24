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
            { 'EcritureDate': '2023-01-01', 'CompteNum': '601000', 'EcritureLib': 'Achat de marchandises', 'Debit': 100, 'Credit': 0 },
            { 'EcritureDate': '2023-01-02', 'CompteNum': '601000', 'EcritureLib': 'Achat de fournitures', 'Debit': 50, 'Credit': 0 },
            { 'EcritureDate': '2023-01-01', 'CompteNum': '602000', 'EcritureLib': 'Vente de marchandises', 'Debit': 0, 'Credit': 200 },
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
                    { 'EcritureDate': '2023-01-01', 'EcritureLib': 'Achat de marchandises', 'Debit': 100, 'Credit': 0 },
                    { 'EcritureDate': '2023-01-02', 'EcritureLib': 'Achat de fournitures', 'Debit': 50, 'Credit': 0 },
                    { 'EcritureDate': '31/12/2023', 'EcritureLib': 'Total', 'Debit': 150, 'Credit': 0 },
                    { 'EcritureDate': '31/12/2023', 'EcritureLib': 'Solde', 'Debit': 150, 'Credit': 0 }
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