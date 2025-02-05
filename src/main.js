import { loadEnvConfig } from './loadEnvConfig.js';
import { setupInfoModal } from './setupInfoModal.js';
import { loadNavigation } from './loadNavigation.js';
import { setupDownloadButton } from './fec.js';
import { storePlanComptable, storeParams } from './utils.js';

document.addEventListener('DOMContentLoaded', init);

/**
 * Initialisation de l'application.
 * Charge la configuration d'environnement et configure les éléments de la page.
 */
function init() {
    loadEnvConfig()
        .then(env => {
            const { SIREN, ASSOCIATION } = env;
            localStorage.setItem('compta_params', '');
            localStorage.setItem('compta_planComptable', '');
            setupInfoModal();
            if (!localStorage.getItem('compta_sheetId')) {
                localStorage.setItem('compta_sheetId', '1bmzkejvxIFkOqsKe0zUWeWvHnTSBJMK1yKe81quIJQs');
            }
            localStorage.setItem('ASSOCIATION', ASSOCIATION);
            localStorage.setItem('SIREN', SIREN);
            storeParams().then(params => {
                storePlanComptable(); 
                loadNavigation();
            });

            if (document.getElementById('downloadBtn')) {
                setupDownloadButton();
            }
        });
}