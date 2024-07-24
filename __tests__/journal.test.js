import { creationJournal, injecteJournalEcritures } from '../src/journal.js';
import { lignesEnEcritures } from '../src/ecritures.js';
import { formatToCurrency } from '../src/utils.js';

jest.mock('../src/ecritures', () => ({
    lignesEnEcritures: jest.fn()
}));

jest.mock('../src/utils', () => ({
    formatToCurrency: jest.fn()
}));

describe('Journal', () => {
    describe('creationJournal', () => {
        const jsonData = [
            { 'Date': '2023-01-01', 'Compte': '601000', 'Libellé': 'Achat de marchandises', 'Débit (€)': 100, 'Crédit (€)': 0 },
        ];
        const currentYear = 2023;

        test('doit créer un journal comptable', () => {
            lignesEnEcritures.mockImplementation(() => jsonData);
            const journal = creationJournal(jsonData, currentYear);
            expect(journal).toEqual(jsonData);
        });
    });

    describe('injecteJournalEcritures', () => {
        test('doit injecter les écritures du journal dans le tableau HTML', () => {
            document.body.innerHTML = '<tbody id="journal-ecritures"></tbody>';
            const journalEcritures = [
                { 'Date': '2023-01-01', 'Compte': '601000', 'Libellé': 'Achat de marchandises', 'Débit (€)': 100, 'Crédit (€)': 0 },
            ];
            formatToCurrency.mockImplementation(value => `${value} €`);
            injecteJournalEcritures(journalEcritures);

            const rows = document.querySelectorAll('#journal-ecritures tr');
            expect(rows.length).toBe(1);
            expect(rows[0].innerHTML).toContain('601000');
            expect(rows[0].innerHTML).toContain('100 €');
        });
    });
});