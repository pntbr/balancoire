import { trouverCompte, convertToNumber, formatToCurrency, sommeCompteParRacine } from '../src/utils.js';
import { PLAN_COMPTABLE } from '../src/plan-comptable.js';

describe('Fonctions Utilitaires', () => {
    describe('trouverCompte', () => {
        test('doit retourner le compte correct pour un numéro donné', () => {
            expect(trouverCompte({ compte: '106000' })).toEqual({ compte: '106000', label: 'réserves' });
        });

        test('doit retourner le compte correct pour un libellé donné', () => {
            expect(trouverCompte({ label: 'assurances' })).toEqual({ compte: '616000', label: 'primes d\'assurances' });
        });

        test('doit retourner non défini pour un compte inconnu', () => {
            expect(trouverCompte({ compte: '999999' })).toEqual({ compte: 'xxxxxx', label: 'non défini' });
        });
    });

    describe('convertToNumber', () => {
        test('doit convertir une chaîne de caractères en euros en nombre', () => {
            expect(convertToNumber('1 234,56 €')).toBe(1234.56);
        });

        test('doit retourner 0 pour une entrée invalide', () => {
            expect(convertToNumber('invalide')).toBe(0);
        });
    });

    describe('formatToCurrency', () => {
        test('doit formater un nombre en chaîne de caractères représentant un montant en euros', () => {
            expect(formatToCurrency(1234.56)).toBe('1234,56 €');
        });

        test('doit retourner une chaîne vide pour une entrée nulle ou indéfinie', () => {
            expect(formatToCurrency(null)).toBe('');
        });
    });

    describe('sommeCompteParRacine', () => {
        const ecritures = [
            { 'Compte': '601000', 'Débit (€)': 100, 'Crédit (€)': 0 },
            { 'Compte': '602000', 'Débit (€)': 200, 'Crédit (€)': 0 },
            { 'Compte': '601000', 'Débit (€)': 50, 'Crédit (€)': 0 },
            { 'Compte': '602000', 'Débit (€)': 0, 'Crédit (€)': 300 },
        ];

        test('doit calculer la somme des débits et crédits pour une racine donnée', () => {
            expect(sommeCompteParRacine(ecritures, '601')).toBe(-150);
        });

        test('doit calculer la somme des seuls crédits pour une racine donnée', () => {
            expect(sommeCompteParRacine(ecritures, '602', 'C')).toBe(300);
        });

        test('doit calculer la somme des seuls débits pour une racine donnée', () => {
            expect(sommeCompteParRacine(ecritures, '602', 'D')).toBe(200);
        });
    });
});