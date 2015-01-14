# GAS Smart Spreadsheet
This Smart Google Spreadsheet automatically fills the `created_by` &amp; `edited_at` fields for any sheet. It is using Google Apps Script accesible through `Google Spreadsheets` --> `Tools` --> `Script Editor...`


## Assumptions:  
1. There should be 1 top row as header row with column names  
2. The column names should contain the letters `createdby` and `editedat`  
3. The required fields contain `*` in their column name  
4. The edits of all fields except `createdby` and `editedat` are considered to update these fields  
5. The date is formatted with `GMT` `dd-MMM-yyyy`  

You can customize these assumptions in your script.

## Usage:
You should use it with the account of Google Apps account admin who created the domain. He should  
1. run the script  
2. authorize the script  
3. authorize in `Google Developers Console` by going to `Resources` --> `Google Advanced Services`  
4. publish and `deploy as web app...`  

## License
GAS Smart Spreadsheet is primarily distributed under the terms of the MIT license.
