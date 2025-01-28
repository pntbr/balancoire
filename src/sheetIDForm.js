document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#sheetIDForm");
    const input = document.querySelector("#sheetIDInput");
    const message = document.querySelector("#confirmationMessage");
    const resetButton = document.querySelector("#resetToDefault");

    if (!localStorage.getItem("sheetID")) {
      localStorage.setItem("sheetID", DEFAULT_SHEET_ID);
    }

    input.value = localStorage.getItem("sheetID");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const sheetID = input.value.trim();
      if (sheetID) {
        localStorage.setItem("sheetID", sheetID);
        message.textContent = "SheetID enregistré avec succès !";
      } else {
        message.textContent = "Veuillez entrer un SheetID valide.";
      }
    });

    resetButton.addEventListener("click", () => {
      localStorage.setItem("sheetID", DEFAULT_SHEET_ID);
      input.value = DEFAULT_SHEET_ID;
      message.textContent = "Revenu au SheetID par défaut.";
    });
  });