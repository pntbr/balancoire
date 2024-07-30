import { setupPageLinks, injectYearLinks, setupYearLinks, injectSheetLink } from './navigationUtils.js';

export function loadNavigation(SHEET_ID, SHEETNAME_TO_GID, SIREN) {
    fetch('nav.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navigation').innerHTML = data;
            setupPageLinks();
            injectYearLinks(SHEETNAME_TO_GID);
            setupYearLinks(SHEET_ID, SHEETNAME_TO_GID, SIREN);
            injectSheetLink(SHEET_ID);
        });
}