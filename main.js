import { parseCSV } from './parseCSV.js';
import { creationBalance, injecteBalanceEcritures } from './balance.js';
import { creationGrandLivre, injecteGrandLivreEcritures } from './grand-livre.js';
import { creationCompteResultat, injecteCompteResultatEcritures } from './compte-resultat.js';
import { ligneEnEcriture, arretComptesClotureEcritures, injecteJournalEcritures } from './journal.js';

document.addEventListener('DOMContentLoaded', () => {
    fetch('.env.json')
        .then(response => response.json())
        .then(env => {
            const SHEET_ID = env.SHEET_ID;

            const infoBtn = document.getElementById('infoBtn');
            const infoModal = document.getElementById('infoModal');
            const closeBtn = document.querySelector('.close');

            infoBtn.addEventListener('click', () => {
                infoModal.style.display = 'block';
            });

            closeBtn.addEventListener('click', () => {
                infoModal.style.display = 'none';
            });

            window.addEventListener('click', (event) => {
                if (event.target == infoModal) {
                    infoModal.style.display = 'none';
                }
            });

            fetch('nav.html')
                .then(response => response.text())
                .then(data => {
                    document.getElementById('navigation').innerHTML = data;

                    // Gestion des liens de navigation de page
                    const pageLinks = document.querySelectorAll('nav ul:first-of-type li a');
                    const currentPage = location.pathname.split('/').pop();
                    pageLinks.forEach(link => {
                        if (link.getAttribute('href') === currentPage) {
                            link.parentElement.classList.add('menu-selected');
                        }
                    });

                    // Gestion des liens de navigation d'année
                    const yearLinks = document.querySelectorAll('.year-nav a');
                    const currentYear = localStorage.getItem('selectedYear') || '2024';
                    yearLinks.forEach(link => {
                        if (link.getAttribute('data-year') === currentYear) {
                            link.classList.add('menu-selected');
                        }
                        link.addEventListener('click', (event) => {
                            event.preventDefault();
                            const selectedYear = event.target.getAttribute('data-year');
                            localStorage.setItem('selectedYear', selectedYear);
                            loadCSV(SHEET_ID, selectedYear);
                            yearLinks.forEach(l => l.classList.remove('menu-selected'));
                            event.target.classList.add('menu-selected');
                        });
                    });

                    loadCSV(SHEET_ID, currentYear);
                });
        });
});

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function hideErrorMessage() {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.style.display = 'none';
}

function loadCSV(sheetId, currentYear) {
    const yearToGid = {
        '2024': '929320585',
        '2023': '80488655',
        '2022': '581969889',
        '2021': '168710858',
        '2020': '43794826',
        '2019': '0'
    };
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&pli=1&gid=${yearToGid[currentYear]}#gid=${yearToGid[currentYear]}`;
    hideErrorMessage();
    showLoader();
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(csvText => {
            const jsonData = parseCSV(csvText);
            const ligneEnEcritures = jsonData.flatMap(ligne => ligneEnEcriture(ligne))
                .sort((a, b) => {
                    const dateA = new Date(a.Date.split('/').reverse().join('-'));
                    const dateB = new Date(b.Date.split('/').reverse().join('-'));
                    return dateA - dateB;
                });
            const arretComptesEcritures = arretComptesClotureEcritures(ligneEnEcritures, currentYear);
            if (document.getElementById('journal-ecritures')) {
                injecteJournalEcritures(arretComptesEcritures);
            }
            if (document.getElementById('balance-ecritures')) {
                const balanceEcritures = creationBalance(arretComptesEcritures);
                injecteBalanceEcritures(balanceEcritures);
            }
            if (document.getElementById('grand-livre-ecritures')) {
                const grandLivreEcritures = creationGrandLivre(arretComptesEcritures, currentYear);
                injecteGrandLivreEcritures(grandLivreEcritures);
            }
            if (document.getElementById('compte-resultat-ecritures')) {
                const compteResultatEcritures = creationCompteResultat(ligneEnEcritures);
                injecteCompteResultatEcritures(compteResultatEcritures);
            }
            hideLoader();
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            hideLoader();
        });
}