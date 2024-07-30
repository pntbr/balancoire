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
            const { SHEET_ID, SHEETNAME_TO_GID, SIREN } = env;
            setupInfoModal();
            loadNavigation(SHEET_ID, SHEETNAME_TO_GID, SIREN);
            if (document.getElementById('downloadBtn')) {
                setupDownloadButton(SIREN);
            }
        });
}