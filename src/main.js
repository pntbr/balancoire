import { loadEnvConfig } from './loadEnvConfig.js';
import { setupInfoModal } from './setupInfoModal.js';
import { loadNavigation } from './loadNavigation.js';
import { setupDownloadButton } from './fec.js';
import { storePlanComptable, storeParams } from './utils.js';
import { loadAndInjectData } from './injectData.js';
import { hideLoader } from './loader.js';

document.addEventListener('DOMContentLoaded', init);

/**
 * Initialisation de l'application.
 * Charge la configuration d'environnement et configure les éléments de la page.
 */
function init() {
    loadEnvConfig()
        .then(env => {
            const { SIREN, ASSOCIATION } = env;
            const storedCurrentYear = localStorage.getItem('compta_selectedYear') || '2025';
            localStorage.setItem('compta_params', '');
            localStorage.setItem('compta_planComptable', '');
            setupInfoModal();
            if (!localStorage.getItem('compta_sheetId')) {
                localStorage.setItem('compta_sheetId', '1bmzkejvxIFkOqsKe0zUWeWvHnTSBJMK1yKe81quIJQs');
            }
            localStorage.setItem('ASSOCIATION', ASSOCIATION);
            localStorage.setItem('SIREN', SIREN);
            storeParams().then(() => {

                storePlanComptable().then(() => {
                    loadNavigation();
                    loadAndInjectData(storedCurrentYear);
                    hideLoader();
                });
            });
            if (document.getElementById('downloadBtn')) {
                setupDownloadButton();
            }
    });
}