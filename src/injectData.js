import { loadCSV } from './loadCSV.js';
import { creationJournal, injecteJournalEcritures } from './journal.js';
import { creationBalance, injecteBalanceEcritures } from './balance.js';
import { creationGrandLivre, injecteGrandLivreEcritures } from './grand-livre.js';
import { creationCompteResultat, injecteCompteResultatEcritures } from './compte-resultat.js';
import { creationBilan, injecteBilanEcritures } from './bilan.js';
import { creationInventaire, injecteInventaireEcritures } from './inventaire.js';
import { creationFEC, injecteFECEcritures } from './fec.js';

export function loadAndInjectData(year) {
    const sheetTabsToGID = JSON.parse(localStorage.getItem('compta_params'))
    loadCSV(sheetTabsToGID[year]).then(parseCSV => {
        injectDataIntoPage(parseCSV, year);
    });
}

export function injectDataIntoPage(jsonData, currentYear) {
    const mappings = [
        { id: 'journal-ecritures', create: creationJournal, inject: injecteJournalEcritures },
        { id: 'balance-ecritures', create: creationBalance, inject: injecteBalanceEcritures },
        { id: 'grand-livre-ecritures', create: creationGrandLivre, inject: injecteGrandLivreEcritures },
        { id: 'compte-resultat-ecritures', create: creationCompteResultat, inject: injecteCompteResultatEcritures },
        { id: 'bilan-ecritures', create: creationBilan, inject: injecteBilanEcritures },
        { id: 'inventaire-ecritures', create: creationInventaire, inject: injecteInventaireEcritures },
        { id: 'FEC-ecritures', create: creationFEC, inject: injecteFECEcritures },
    ];

    mappings.forEach(({ id, create, inject }) => {
        const element = document.getElementById(id);
        if (element) {
            const ecritures = create(jsonData, currentYear);
            inject(ecritures);
        }
    });
}