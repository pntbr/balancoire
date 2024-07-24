import { lignesEnEcritures, arretComptesClotureEcritures } from '../src/ecritures.js';
import { trouverCompte, convertToNumber, sommeCompteParRacine } from '../src/utils.js';

jest.mock('./utils', () => ({
    trouverCompte: jest.fn(),
    convertToNumber: jest.fn(),
    sommeCompteParRacine: jest.fn()
}));

describe('Ecritures', () => {
    describe('lignesEnEcritures', () => {
        const jsonData = [
            { 'date': '01/01/2023', 'poste': 'achat', 'montant': '100' },
            { 'date': '31/12/2023', 'poste': 'vente', 'montant': '200' },
        ];
        const currentYear = 2023;

        test('doit convertir les lignes en écritures comptables', () => {
            trouverCompte.mockImplementation(() => ({ compte: '601000', label: 'Achat' }));
            convertToNumber.mockImplementation(value => parseFloat(value));
            const ecritures = lignesEnEcritures(jsonData, currentYear);

            expect(ecritures.length).toBeGreaterThan(0);
            expect(ecritures[0]).toHaveProperty('EcritureDate', '01/01/2023');
        });
    });

    describe('arretComptesClotureEcritures', () => {
        const ecritures = [
            { 'CompteNum': '601000', 'Débit (€)': 100, 'Crédit (€)': 0 },
            { 'CompteNum': '602000', 'Débit (€)': 0, 'Crédit (€)': 200 },
        ];
        const currentYear = 2023;

        test('doit arrêter les comptes et créer les écritures de clôture', () => {
            sommeCompteParRacine.mockImplementation((ecritures, compte) => {
                const values = {
                    '601000': 100,
                    '602000': -200,
                    '6': -100,
                    '7': 200,
                };
                return values[compte] || 0;
            });

            const arretEcritures = arretComptesClotureEcritures(ecritures, currentYear);
            expect(arretEcritures.length).toBeGreaterThan(2);
            expect(arretEcritures[arretEcritures.length - 1]).toHaveProperty('Compte', '120000');
        });
    });
});