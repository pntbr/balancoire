import { parseCSV } from '../src/parseCSV.js';
import { arretComptesClotureEcritures } from '../src/ecritures.js';
import { creationBalance, injecteBalanceEcritures } from '../src/balance.js';
import { creationGrandLivre, injecteGrandLivreEcritures } from '../src/grand-livre.js';
import { creationCompteResultat, injecteCompteResultatEcritures } from '../src/compte-resultat.js';
import { creationBilan, injecteBilanEcritures } from '../src/bilan.js';
import { creationJournal, injecteJournalEcritures } from '../src/journal.js';
import { creationInventaire, injecteInventaireEcritures } from '../src/inventaire.js';
import { init, loadEnvConfig, fetchEnvConfig, setupInfoModal, loadNavigation, setupPageLinks, injectYearLinks, setupYearLinks, injectSheetLink, showLoader, hideLoader, hideErrorMessage, loadCSV, injectDataIntoPage } from '../src/main.js';

jest.mock('../src/main');

describe('Fonctions Principales', () => {
    describe('init', () => {
        test('doit initialiser l\'application et charger la configuration d\'environnement', async() => {
            jest.spyOn(main, 'fetchEnvConfig').mockResolvedValue({ SHEET_ID: '123', SHEETNAME_TO_GID: {} });
            document.body.innerHTML = '<div id="navigation"></div>';
            await init();
            expect(main.fetchEnvConfig).toHaveBeenCalled();
        });
    });

    describe('fetchEnvConfig', () => {
        test('doit charger la configuration d\'environnement', async() => {
            loadEnvConfig = jest.fn().mockResolvedValue({ SHEET_ID: '123', SHEETNAME_TO_GID: {} });
            const env = await fetchEnvConfig();
            expect(env).toEqual({ SHEET_ID: '123', SHEETNAME_TO_GID: {} });
        });
    });

    describe('setupInfoModal', () => {
        test('doit configurer le modal d\'information', () => {
            document.body.innerHTML = `
                <div id="infoModal" style="display:none;">
                    <span class="close">&times;</span>
                </div>
                <button id="infoBtn">Info</button>
            `;
            setupInfoModal();
            document.getElementById('infoBtn').click();
            expect(document.getElementById('infoModal').style.display).toBe('block');
            document.querySelector('.close').click();
            expect(document.getElementById('infoModal').style.display).toBe('none');
        });
    });

    describe('loadNavigation', () => {
        test('doit charger et configurer la navigation', async() => {
            fetch = jest.fn().mockResolvedValue({ text: jest.fn().mockResolvedValue('<nav></nav>') });
            document.body.innerHTML = '<div id="navigation"></div>';
            await loadNavigation('123', {});
            expect(document.getElementById('navigation').innerHTML).toBe('<nav></nav>');
        });
    });

    describe('setupPageLinks', () => {
        test('doit configurer les liens des pages', () => {
            document.body.innerHTML = `
                <nav>
                    <ul>
                        <li><a href="page1.html">Page 1</a></li>
                        <li><a href="page2.html">Page 2</a></li>
                    </ul>
                </nav>
            `;
            delete window.location;
            window.location = { pathname: '/page1.html' };
            setupPageLinks();
            expect(document.querySelector('li a[href="page1.html"]').parentElement.classList.contains('menu-selected')).toBe(true);
            expect(document.querySelector('li a[href="page2.html"]').parentElement.classList.contains('menu-selected')).toBe(false);
        });
    });

    describe('injectYearLinks', () => {
        test('doit injecter les liens des années dans la navigation', () => {
            document.body.innerHTML = '<ul id="annee-nav"></ul>';
            const SHEETNAME_TO_GID = { '2023': '123', '2024': '124' };
            injectYearLinks(SHEETNAME_TO_GID);
            expect(document.getElementById('annee-nav').children.length).toBe(2);
        });
    });

    describe('setupYearLinks', () => {
        test('doit configurer les liens des années', () => {
            document.body.innerHTML = '<ul class="annee-nav"></ul>';
            localStorage.setItem('selectedYear', '2024');
            const SHEET_ID = '123';
            const SHEETNAME_TO_GID = { '2023': '123', '2024': '124' };
            injectYearLinks(SHEETNAME_TO_GID);
            setupYearLinks(SHEET_ID, SHEETNAME_TO_GID);
            expect(document.querySelector('a[data-year="2024"]').classList.contains('menu-selected')).toBe(true);
        });
    });

    describe('injectSheetLink', () => {
        test('doit injecter le lien vers la Google Sheet', () => {
            document.body.innerHTML = '<div id="sheet-nav"></div>';
            injectSheetLink('123');
            expect(document.querySelector('#sheet-nav a').href).toBe('https://docs.google.com/spreadsheets/d/123');
        });
    });

    describe('showLoader', () => {
        test('doit afficher le loader', () => {
            document.body.innerHTML = '<div id="loader" style="display:none;"></div>';
            showLoader();
            expect(document.getElementById('loader').style.display).toBe('block');
        });
    });

    describe('hideLoader', () => {
        test('doit cacher le loader', () => {
            document.body.innerHTML = '<div id="loader" style="display:block;"></div>';
            hideLoader();
            expect(document.getElementById('loader').style.display).toBe('none');
        });
    });

    describe('hideErrorMessage', () => {
        test('doit cacher le message d\'erreur', () => {
            document.body.innerHTML = '<div id="error-message" style="display:block;"></div>';
            hideErrorMessage();
            expect(document.getElementById('error-message').style.display).toBe('none');
        });
    });

    describe('loadCSV', () => {
        test('doit charger le fichier CSV depuis la Google Sheet', async() => {
            fetch = jest.fn().mockResolvedValue({
                ok: true,
                text: jest.fn().mockResolvedValue('"numéro","description"\n"1","Produit A"\n"2","Produit B"')
            });
            document.body.innerHTML = '<div id="loader" style="display:none;"></div>';
            hideErrorMessage = jest.fn();
            showLoader = jest.fn();
            hideLoader = jest.fn();
            parseCSV = jest.fn().mockReturnValue([{ "numéro": "1", "description": "Produit A" }, { "numéro": "2", "description": "Produit B" }]);
            injectDataIntoPage = jest.fn();
            await loadCSV('123', { '2023': '123', '2024': '124' }, '2024');
            expect(fetch).toHaveBeenCalled();
            expect(parseCSV).toHaveBeenCalled();
            expect(injectDataIntoPage).toHaveBeenCalled();
            expect(showLoader).toHaveBeenCalled();
            expect(hideLoader).toHaveBeenCalled();
        });
    });

    describe('injectDataIntoPage', () => {
        test('doit injecter les données du CSV dans la page', () => {
            document.body.innerHTML = `
                <div id="journal-ecritures"></div>
                <div id="balance-ecritures"></div>
            `;
            const jsonData = [
                { "Date": "2023-01-01", "Compte": "601000", "Libellé": "Achat de marchandises", "Débit (€)": 100, "Crédit (€)": 0 }
            ];
            const currentYear = '2023';
            const mappings = [
                { id: 'journal-ecritures', create: creationJournal, inject: injecteJournalEcritures },
                { id: 'balance-ecritures', create: creationBalance, inject: injecteBalanceEcritures },
            ];
            injectDataIntoPage(jsonData, currentYear);
            mappings.forEach(({ id, create, inject }) => {
                const element = document.getElementById(id);
                if (element) {
                    expect(create).toHaveBeenCalledWith(jsonData, currentYear);
                    expect(inject).toHaveBeenCalled();
                }
            });
        });
    });
});