import { creationBalance, injecteBalanceEcritures } from '../src/balance.js';
import { sommeCompteParRacine, formatToCurrency, trouverCompte } from '../src/utils.js';

jest.mock('./utils', () => ({
    sommeCompteParRacine: jest.fn(),
    formatToCurrency: jest.fn(),
    trouverCompte: jest.fn()
}));

describe('Balance', () => {
    describe('creationBalance', () => {
        const jsonData = [
            { 'CompteNum': '601000', 'Debit': 100, 'Credit': 0 },
            { 'CompteNum': '602000', 'Debit': 200, 'Credit': 0 },
            { 'CompteNum': '601000', 'Debit': 50, 'Credit': 0 },
            { 'CompteNum': '602000', 'Debit': 0, 'Credit': 300 },
        ];
        const currentYear = 2023;

        test('doit créer une balance des écritures comptables', () => {
            sommeCompteParRacine.mockImplementation((ecritures, compte, type) => {
                if (compte === '601000' && type === 'D') return 150;
                if (compte === '602000' && type === 'C') return 300;
                return 0;
            });
            trouverCompte.mockImplementation(({ compte }) => ({ label: `Label ${compte}` }));

            const balance = creationBalance(jsonData, currentYear);
            expect(balance).toEqual([
                { 'CompteNum': '601000', 'EcritureLib': 'Label 601000', 'Debit': 150, 'Credit': 0, 'Solde (€)': 150 },
                { 'CompteNum': '602000', 'EcritureLib': 'Label 602000', 'Debit': 0, 'Credit': 300, 'Solde (€)': 300 },
            ]);
        });
    });

    describe('injecteBalanceEcritures', () => {
        test('doit injecter les écritures de la balance dans le tableau HTML', () => {
            document.body.innerHTML = '<tbody id="balance-ecritures"></tbody>';
            const balanceEcritures = [
                { 'CompteNum': '601000', 'EcritureLib': 'Label 601000', 'Debit': 150, 'Credit': 0, 'Solde (€)': 150 },
                { 'CompteNum': '602000', 'EcritureLib': 'Label 602000', 'Debit': 0, 'Credit': 300, 'Solde (€)': 300 },
            ];
            formatToCurrency.mockImplementation(value => `${value} €`);
            injecteBalanceEcritures(balanceEcritures);

            const rows = document.querySelectorAll('#balance-ecritures tr');
            expect(rows.length).toBe(2);
            expect(rows[0].innerHTML).toContain('601000');
            expect(rows[0].innerHTML).toContain('Label 601000');
            expect(rows[0].innerHTML).toContain('150 €');
            expect(rows[1].innerHTML).toContain('602000');
            expect(rows[1].innerHTML).toContain('300 €');
        });
    });
});