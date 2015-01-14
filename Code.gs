/**
 * Retrieves all the rows in the active spreadsheet that contain data and logs the
 * values for each row.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function readRows() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();

  for (var i = 0; i <= numRows - 1; i++) {
    var row = values[i];
    Logger.log(row);
  }
};

/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function onOpen(event) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Read Data",
    functionName : "readRows"
  }];
  spreadsheet.addMenu("Script Center Menu", entries);
};

function onEdit(event) {
  // columns and rows numbers are 1-based so 5 is column E
  var HEADER_ROW      = 1;
  var createdByColNum = 3; //column C - estimated
  var editedAtColNum  = 4; //column D - estimated
  var headerValStr    = '';
  var activeSheet     = SpreadsheetApp.getActiveSheet();
  var activeRng       = SpreadsheetApp.getActiveRange();
  var activeCell      = activeSheet.getActiveCell();
  var MAX_COLS        = activeSheet.getLastColumn();
  
  // Current sheet must contain the word *links* in it
  Logger.log("I'm in onEdit");
    
  // pick the createdBy column number
  for(var col=1; col<=MAX_COLS; col++) {
    headerValStr = activeSheet.getRange(HEADER_ROW, col).getValue().replace(/[0-9_-]/g, '').toLowerCase();
    // column containing createdby chars
    if(headerValStr.indexOf('createdby') !== -1) createdByColNum = col;
    if(headerValStr.indexOf('editedat') !== -1)  editedAtColNum  = col;
  }
    
  var cellValue = activeSheet.getRange(activeCell.getRow(), createdByColNum).getCell(1, 1).getValue();
    
  if( cellValue === '' ) {
    Logger.log("I'm calling updateCreatedByAtColumn");
    /* Created at column */
    updateCreatedByAtColumn(event, createdByColNum, editedAtColNum, HEADER_ROW);
  } else {
    Logger.log("I'm calling updateEditedByAtColumn");
    updateEditedByAtColumn(event, createdByColNum, editedAtColNum, HEADER_ROW);
  }
}

function updateCreatedByAtColumn(event, createdByColNum, editedAtColNum, HEADER_ROW) {
  var isReqFilled   = true;
  var activeSheet   = SpreadsheetApp.getActiveSheet();
  var activeRange   = SpreadsheetApp.getActiveRange();
  var activeCell    = activeSheet.getActiveCell();
  var activeRowNum  = activeCell.getRow();
  var MAX_COLS      = activeSheet.getLastColumn();
  
  Logger.log("I'm in updateCreatedByAtColumn\n");
  
  if(activeRowNum < 2)   return; //If only header row then return
  
  // check if all the required - marked with * - fields
  // are filled with data
  isReqFilled = areRequiredFieldsFilled(MAX_COLS, HEADER_ROW, activeSheet, activeRange);
 
  if(isReqFilled) {
    var createdByCell = activeSheet.getRange(activeRange.getLastRow(), createdByColNum).getCell(1, 1);
    var editedAtCell  = activeSheet.getRange(activeRange.getLastRow(), editedAtColNum).getCell(1, 1);
    var wholeName     = ContactsApp.getContact(Session.getActiveUser().getEmail()).getFullName();

    var dateNow       = Utilities.formatDate(new Date(), "GMT", "dd-MMM-yyyy");
  
    //set date in same row as edit happens, at fixed column  
    createdByCell.setValue(wholeName);
    createdByCell.setNote('Last edited by: '+wholeName);
    editedAtCell.setValue(dateNow);
    editedAtCell.setNote('Created at: '+dateNow);
  }
}

function updateEditedByAtColumn(event, createdByColNum, editedAtColNum, HEADER_ROW) {
  var activeSheet   = SpreadsheetApp.getActiveSheet();
  var activeRange   = SpreadsheetApp.getActiveRange();
  var activeCell    = activeSheet.getActiveCell();
  var activeRowNum  = activeCell.getRow();
  var activeColNum  = activeCell.getColumn();
  var MAX_COLS      = activeSheet.getLastColumn();
  var IMP_COL_NUMS  = new Array(MAX_COLS); //Columns, whose edit is considered - can be [1, 2, 3]
  var AUTO_FILL_COL = [createdByColNum, editedAtColNum];
  var isReqFilled   = true;

  Logger.log("I'm in updateEditedByAtColumn\n");

  IMP_COL_NUMS = Array.apply(null, new Array(MAX_COLS)).map(function(elem, ind) { return ind+1; });
  IMP_COL_NUMS = IMP_COL_NUMS.filter(function(x) { return AUTO_FILL_COL.indexOf(x) < 0 });
  
  //Script Last Update Timming
  var column = activeCell.getColumn();

  if(activeRowNum < 2)   return; //If only header row then return
  if(IMP_COL_NUMS.indexOf(activeColNum) == -1) return; //If column other than considered then return
  // check if all the required - marked with * - fields
  // are filled with data
  isReqFilled = areRequiredFieldsFilled(MAX_COLS, HEADER_ROW, activeSheet, activeRange);

  if(isReqFilled) {
    var createdByCell = activeSheet.getRange(activeRowNum, createdByColNum).getCell(1, 1);
    var editedAtCell  = activeSheet.getRange(activeRowNum, editedAtColNum).getCell(1, 1);
    var wholeName     = ContactsApp.getContact(Session.getActiveUser().getEmail()).getFullName();
  
    var dateNow       = Utilities.formatDate(new Date(), "GMT", "dd-MMM-yyyy");

    //set date in same row as edit happens, at fixed column  
    createdByCell.setNote('Last edited by: '+wholeName);
    editedAtCell.setValue(dateNow);
    
  }
}

// checks if all the required - marked with * - fields are filled with data
function areRequiredFieldsFilled(MAX_COLS, HEADER_ROW, activeSheet, activeRange) {
  var headerVal = '';
  var cellVal   = '';
  var isReqFieldsFilled = true;
  for(var col=1; col<=MAX_COLS; col++) {
    headerVal= activeSheet.getRange(HEADER_ROW, col).getCell(1, 1).getValue();

    // column with required field
    if(headerVal.indexOf("*") !== -1) {
      cellVal = activeSheet.getRange(activeRange.getLastRow(), col).getCell(1, 1).getValue();
      if(cellVal === '') {
        isReqFieldsFilled = false;
        break;
      }
    }
  }
  
  return isReqFieldsFilled;
}
