import { setupPageLinks, injectYearLinks, setupYearLinks, injectSheetLink } from './navigationUtils.js';

export function loadNavigation() {
    fetch('nav.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navigation').innerHTML = data;
            setupPageLinks();
            injectYearLinks();
            injectSheetLink();
        });
}