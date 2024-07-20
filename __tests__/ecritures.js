import { arretComptesClotureEcritures, lignesEnEcritures } from '../src/ecritures';

describe('arretComptesClotureEcritures', () => {
	test('doit retourner un tableau vide pour des données vides', () => {
		expect(arretComptesClotureEcritures([], 2023)).toEqual([]);
	});

	test('doit traiter correctement des données valides', () => {
		const ecritures = [
			{ 'Date': '31/12/2023', 'Compte': '601000', 'Libellé': 'achat marchandise', 'Débit': 1000, 'Crédit': '' },
			{ 'Date': '31/12/2023', 'Compte': '701000', 'Libellé': 'vente produit', 'Débit': '', 'Crédit': 1500 }
		];
		const result = arretComptesClotureEcritures(ecritures, 2023);
		expect(result.length).toBeGreaterThan(ecritures.length);
		expect(result).toEqual(expect.arrayContaining([
			expect.objectContaining({ 'Compte': '120000', 'Libellé': 'résultat excédentaire' }),
			expect.objectContaining({ 'Compte': '601000', 'Libellé': 'arrêt des comptes' }),
			expect.objectContaining({ 'Compte': '701000', 'Libellé': 'arrêt des comptes' })
		]));
	});

	test('doit gérer les comptes classes 6 et 7', () => {
		const ecritures = [
			{ 'Date': '31/12/2023', 'Compte': '601000', 'Libellé': 'achat marchandise', 'Débit': 500, 'Crédit': '' },
			{ 'Date': '31/12/2023', 'Compte': '701000', 'Libellé': 'vente produit', 'Débit': '', 'Crédit': 500 }
		];
		const result = arretComptesClotureEcritures(ecritures, 2023);
		expect(result).toEqual(expect.arrayContaining([
			expect.objectContaining({ 'Compte': '601000', 'Libellé': 'arrêt des comptes' }),
			expect.objectContaining({ 'Compte': '701000', 'Libellé': 'arrêt des comptes' })
		]));
	});
});

describe('lignesEnEcritures', () => {
	test('doit gérer correctement les écritures avec des montants négatifs', () => {
		const jsonData = [
			{ date: '15/06/2023', poste: 'remboursement', 'qui paye ?': 'Client', montant: '-200', 'facture correspondante': 'urlFacture', nature: 'chq' }
		];
		const result = lignesEnEcritures(jsonData, 2023);
		expect(result).toEqual(expect.arrayContaining([
			expect.objectContaining({ 'Débit': '200' }),
			expect.objectContaining({ 'Libellé': 'remboursement' })
		]));
	});

	test('doit inclure une écriture d\'impôt sur les sociétés uniquement si le total des crédits dépasse un certain seuil', () => {
		const jsonData = [
			{ date: '31/12/2023', poste: 'vente', 'qui paye ?': 'Client', montant: '50000', 'facture correspondante': '', nature: 'chq' }
		];
		const result = lignesEnEcritures(jsonData, 2023);
		const totalCredits = result.reduce((acc, ecriture) => {
			if (ecriture['Crédit']) {
				acc += parseFloat(ecriture['Crédit']);
			}
			return acc;
		}, 0);
		const seuilImpot = 40000; // Hypothétique seuil pour l'exemple
		if (totalCredits > seuilImpot) {
			expect(result).toEqual(expect.arrayContaining([
				expect.objectContaining({ 'Compte': '695000', 'Libellé': 'impôt sur les sociétés' })
			]));
		} else {
			expect(result).not.toEqual(expect.arrayContaining([
				expect.objectContaining({ 'Compte': '695000', 'Libellé': 'impôt sur les sociétés' })
			]));
		}
	});
});

