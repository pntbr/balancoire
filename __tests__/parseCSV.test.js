import { parseCSV } from '../src/parseCSV.js';

describe('parseCSV', () => {
    const csv = `
    "numéro","description","quantité","valeur unique","valeur totale"
    "1","Produit A",10,"10,00 €","100,00 €"
    "2","Produit B",20,"20,00 €","400,00 €"
    `;

    test('doit analyser le CSV en un tableau d\'objets JSON', () => {
        const expected = [
            { "numéro": "1", "description": "Produit A", "quantité": "10", "valeur unique": "10,00 €", "valeur totale": "100,00 €" },
            { "numéro": "2", "description": "Produit B", "quantité": "20", "valeur unique": "20,00 €", "valeur totale": "400,00 €" }
        ];
        expect(parseCSV(csv)).toEqual(expected);
    });
});