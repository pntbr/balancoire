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
            const { SHEET_ID, SHEETNAME_TO_GID, SIREN, ASSOCIATION } = env;
            setupInfoModal();
            localStorage.setItem('ASSOCIATION', ASSOCIATION);
            localStorage.setItem('SIREN', SIREN);
            loadNavigation(SHEET_ID, SHEETNAME_TO_GID);
            if (document.getElementById('downloadBtn')) {
                setupDownloadButton();
            }
        });
}