import { creationCompteResultat, injecteCompteResultatEcritures } from '../src/compte-resultat.js';
import { sommeCompteParRacine, formatToCurrency } from '../src/utils.js';

jest.mock('../src/utils', () => ({
    sommeCompteParRacine: jest.fn(),
    formatToCurrency: jest.fn()
}));

describe('Compte de Résultat', () => {
    describe('creationCompteResultat', () => {
        const jsonData = [
            // Ajouter des données fictives ici
        ];
        const currentYear = 2023;

        test('doit créer un compte de résultat', () => {
            sommeCompteParRacine.mockImplementation((ecritures, compte) => {
                const values = {
                    '756000': 1000,
                    '754100': 500,
                    '706000': 2000,
                    '707000': 1500,
                    '7': 5000,
                    '607': -1000,
                    '6097': -100,
                    '601': -200,
                    '602': -300,
                    '604': -400,
                    '605': -500,
                    '606': -600,
                    '603': 50,
                    '61': -700,
                    '62': -800,
                    '63': -900,
                    '6': -5500,
                    '695': -100
                };
                return values[compte] || 0;
            });

            const resultat = creationCompteResultat(jsonData, currentYear);
            expect(resultat).toEqual({
                'produits': {
                    'cotisations': 1000,
                    'dons': 500,
                    'prestations': 2000,
                    'marchandises': 1500,
                    'autres': 0,
                    'total': 5000,
                },
                'charges': {
                    'marchandises': -1100,
                    'approvisionnements': -2000,
                    'stocks': 50,
                    'externes': -1500,
                    'taxes': -900,
                    'autres': 0,
                    'total': -5550,
                },
                'resultats': {
                    'avantImpots': -550,
                    'impots': -100,
                    'net': -650,
                }
            });
        });
    });

    describe('injecteCompteResultatEcritures', () => {
        test('doit injecter les écritures du compte de résultat dans le tableau HTML', () => {
            document.body.innerHTML = '<tbody id="compte-resultat-ecritures"></tbody>';
            const soldes = {
                'produits': {
                    'cotisations': 1000,
                    'dons': 500,
                    'prestations': 2000,
                    'marchandises': 1500,
                    'autres': 0,
                    'total': 5000,
                },
                'charges': {
                    'marchandises': -1100,
                    'approvisionnements': -2000,
                    'stocks': 50,
                    'externes': -1500,
                    'taxes': -900,
                    'autres': 0,
                    'total': -5550,
                },
                'resultats': {
                    'avantImpots': -550,
                    'impots': -100,
                    'net': -650,
                }
            };
            formatToCurrency.mockImplementation(value => `${value} €`);
            injecteCompteResultatEcritures(soldes);

            const rows = document.querySelectorAll('#compte-resultat-ecritures tr');
            expect(rows.length).toBeGreaterThan(0);
            expect(rows[0].innerHTML).toContain('Produits de l\'activité');
            expect(rows[rows.length - 1].innerHTML).toContain('-650 €');
        });
    });
});