import { creationBilan, injecteBilanEcritures } from '../src/bilan.js';
import { sommeCompteParRacine, formatToCurrency } from '../src/utils.js';

jest.mock('../src/utils', () => ({
    sommeCompteParRacine: jest.fn(),
    formatToCurrency: jest.fn()
}));

describe('Bilan', () => {
    describe('creationBilan', () => {
        const jsonData = [
            // Ajouter des données fictives ici
        ];
        const currentYear = 2023;

        test('doit créer un bilan comptable', () => {
            sommeCompteParRacine.mockImplementation((ecritures, compte) => {
                const values = {
                    '21': 1000,
                    '27': 2000,
                    '37': 500,
                    '46': -300,
                    '444': 700,
                    '51': 1200,
                    '53': 800,
                    '10': 1500,
                    '12': 600,
                    '119': 400,
                };
                return values[compte] || 0;
            });

            const bilan = creationBilan(jsonData, currentYear);
            expect(bilan).toEqual({
                'actif': {
                    'immobilisation': {
                        'corporelles': 1000,
                        'financieres': 2000,
                        'total': 3000
                    },
                    'circulant': {
                        'stocks': 500,
                        'creances': 400,
                        'disponibilites': 2000,
                        'total': 2900
                    },
                    'total': 5900
                },
                'passif': {
                    'capitaux': {
                        'reserves': 1500,
                        'exercice': 600,
                        'report': 400,
                        'total': 2500
                    },
                    'circulant': {
                        'fournisseurs': 0,
                        'fiscales': 700,
                        'dettes': 0,
                        'total': 0
                    },
                    'total': 2500
                }
            });
        });
    });

    describe('injecteBilanEcritures', () => {
        test('doit injecter les écritures du bilan dans le tableau HTML', () => {
            document.body.innerHTML = '<tbody id="bilan-ecritures"></tbody>';
            const soldes = {
                'actif': {
                    'immobilisation': {
                        'corporelles': 1000,
                        'financieres': 2000,
                        'total': 3000
                    },
                    'circulant': {
                        'stocks': 500,
                        'creances': 400,
                        'disponibilites': 2000,
                        'total': 2900
                    },
                    'total': 5900
                },
                'passif': {
                    'capitaux': {
                        'reserves': 1500,
                        'exercice': 600,
                        'report': 400,
                        'total': 2500
                    },
                    'circulant': {
                        'fournisseurs': 0,
                        'fiscales': 700,
                        'dettes': 0,
                        'total': 700
                    },
                    'total': 3200
                }
            };
            formatToCurrency.mockImplementation(value => `${value} €`);
            injecteBilanEcritures(soldes);

            const rows = document.querySelectorAll('#bilan-ecritures tr');
            expect(rows.length).toBeGreaterThan(0);
            expect(rows[0].innerHTML).toContain('ACTIF');
            expect(rows[rows.length - 1].innerHTML).toContain('3200 €');
        });
    });
});