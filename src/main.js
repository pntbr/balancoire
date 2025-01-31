import { loadCSV } from './loadCSV.js';
import { loadEnvConfig } from './loadEnvConfig.js';
import { setupInfoModal } from './setupInfoModal.js';
import { loadNavigation } from './loadNavigation.js';
import { setupDownloadButton } from './fec.js';

document.addEventListener('DOMContentLoaded', init);

/**
 * Initialisation de l'application.
 * Charge la configuration d'environnement et configure les éléments de la page.
 */
function init() {
    loadEnvConfig()
        .then(env => {
            const { SIREN, ASSOCIATION } = env;

            setupInfoModal();
            if (!localStorage.getItem('compta_sheetId')) {
                localStorage.setItem('compta_sheetId', '1bmzkejvxIFkOqsKe0zUWeWvHnTSBJMK1yKe81quIJQs');
            }
            localStorage.setItem('ASSOCIATION', ASSOCIATION);
            localStorage.setItem('SIREN', SIREN);
            loadNavigation();
            if (document.getElementById('downloadBtn')) {
                setupDownloadButton();
            }
        });
}