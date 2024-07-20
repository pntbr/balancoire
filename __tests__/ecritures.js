import { creationEcriture, lignesEnEcritures } from '../src/ecritures';

test('creationEcriture should create a valid accounting entry', () => {
  const entry = creationEcriture('01/01/2024', '512000', 'Test Entry', 100, 0);
  expect(entry).toEqual({
    'Date': '01/01/2024',
    'Compte': '512000',
    'Libellé': 'Test Entry',
    'Débit (€)': 100,
    'Crédit (€)': 0
  });
});

test('lignesEnEcritures should convert lines to entries', () => {
  const jsonData = [
    { 'date': '01/01/2024', 'poste': 'banques', 'montant': '1000 €' }
  ];
  const entries = lignesEnEcritures(jsonData, 2024);
  expect(entries.length).toBeGreaterThan(0);
});
