function restoreToDestination() {
  var templateSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var destinationId = "1EjBuZN2Brq9x1UoLKqCcipUxZRoG5gSFHu0eoXpy0oY";
  var destinationSpreadsheet = SpreadsheetApp.openById(destinationId);

  var templateSheets = templateSpreadsheet.getSheets();
  var destinationSheets = destinationSpreadsheet.getSheets();

  // Vider toutes les feuilles existantes dans la feuille de destination
  destinationSheets.forEach(function (sheet) {
    sheet.clear();
  });

  // Copier chaque feuille du template vers la feuille de destination
  templateSheets.forEach(function (templateSheet, index) {
    var destinationSheet = destinationSheets[index];

    // Si la feuille de destination n'existe pas, en créer une nouvelle
    if (!destinationSheet) {
      destinationSheet = destinationSpreadsheet.insertSheet(
        templateSheet.getName()
      );
    }

    // Copier les données et la mise en forme
    var range = templateSheet.getDataRange();
    destinationSheet
      .getRange(1, 1, range.getNumRows(), range.getNumColumns())
      .setValues(range.getValues());

    // Copier la mise en forme
    var templateFormats = range.getBackgrounds();
    destinationSheet
      .getRange(1, 1, range.getNumRows(), range.getNumColumns())
      .setBackgrounds(templateFormats);
  });

  // Supprimer les feuilles supplémentaires dans la feuille de destination si nécessaire
  while (destinationSpreadsheet.getSheets().length > templateSheets.length) {
    var extraSheet = destinationSpreadsheet.getSheets()[templateSheets.length];
    destinationSpreadsheet.deleteSheet(extraSheet);
  }
}
