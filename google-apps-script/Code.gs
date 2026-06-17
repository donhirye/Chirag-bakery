/**

 * Chef Chirag — Order Form Handler

 *

 * Paste this into Google Apps Script (Extensions → Apps Script)

 * attached to your Google Sheet. See SETUP.md for full instructions.

 *

 * Orders are saved in YOUR Google Drive, inside whichever spreadsheet

 * this script is bound to. The tab name is set by SHEET_NAME below.

 */



const SHEET_NAME = "Orders";



const ORDER_HEADERS = [

  "Timestamp",

  "Name",

  "Phone",

  "Items Ordered",

  "Address",

  "Fulfillment",

  "Pick Up Time",

  "Pick Up Day",

  "Payment Method",

  "Special Requirements",

];



function getOrderSheet() {

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();



  if (SHEET_NAME) {

    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {

      sheet = spreadsheet.insertSheet(SHEET_NAME);

      applyOrderHeaders(sheet);

    }

    return sheet;

  }



  return spreadsheet.getActiveSheet();

}



function parseOrderPayload(e) {

  e = e || {};



  if (e.parameter) {

    const hasOrderFields =

      e.parameter.name || e.parameter.phone || e.parameter.itemsOrdered;

    if (hasOrderFields) {

      return e.parameter;

    }

  }



  if (e.postData && e.postData.contents) {

    const contents = e.postData.contents;

    const contentType = (e.postData.type || "").toLowerCase();



    if (contentType.indexOf("application/json") !== -1 || contents.trim().charAt(0) === "{") {

      return JSON.parse(contents);

    }



    const params = {};

    contents.split("&").forEach(function (pair) {

      const parts = pair.split("=");

      const key = decodeURIComponent(parts[0] || "");

      const value = decodeURIComponent((parts[1] || "").replace(/\+/g, " "));

      if (key) params[key] = value;

    });



    if (params.name || params.phone || params.itemsOrdered) {

      return params;

    }

  }



  return {};

}



function doPost(e) {

  try {

    const sheet = getOrderSheet();

    const data = parseOrderPayload(e);



    Logger.log("Order payload: " + JSON.stringify(data));



    const row = [

      new Date(),

      data.name || "",

      data.phone || "",

      data.itemsOrdered || "",

      data.address || "",

      data.fulfillmentType || "",

      data.pickupTime || "",

      data.pickupDay || "",

      data.paymentMethod || "",

      data.specialRequirements || "",

    ];



    sheet.appendRow(row);



    return ContentService.createTextOutput(

      JSON.stringify({ success: true, message: "Order received" })

    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {

    return ContentService.createTextOutput(

      JSON.stringify({ success: false, message: error.toString() })

    ).setMimeType(ContentService.MimeType.JSON);

  }

}



function doGet() {

  return ContentService.createTextOutput(

    JSON.stringify({ status: "ok", message: "Chef Chirag order endpoint is running." })

  ).setMimeType(ContentService.MimeType.JSON);

}



function applyOrderHeaders(sheet) {

  sheet.getRange(1, 1, 1, ORDER_HEADERS.length).setValues([ORDER_HEADERS]);

  sheet.getRange(1, 1, 1, ORDER_HEADERS.length)

    .setFontWeight("bold")

    .setBackground("#8B2942")

    .setFontColor("#FFFFFF");

  sheet.setFrozenRows(1);

  sheet.autoResizeColumns(1, ORDER_HEADERS.length);

}



/**

 * Run once to add headers to the Orders tab (keeps existing order rows).

 */

function setupSheet() {

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);



  if (!sheet) {

    sheet = spreadsheet.insertSheet(SHEET_NAME);

  }



  applyOrderHeaders(sheet);

}



/**

 * Run once to create a brand-new Orders tab with headers only.

 * WARNING: Deletes the existing Orders tab if one already exists.

 */

function createFreshOrdersSheet() {

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  const existing = spreadsheet.getSheetByName(SHEET_NAME);



  if (existing) {

    spreadsheet.deleteSheet(existing);

  }



  const sheet = spreadsheet.insertSheet(SHEET_NAME);

  applyOrderHeaders(sheet);

}



/**

 * Run this once from the Apps Script editor to verify rows can be written.

 * Select testOrderWrite from the dropdown, then click Run.

 */

function testOrderWrite() {

  doPost({

    parameter: {

      name: "Sheet Test",

      phone: "5551234567",

      itemsOrdered: "Perfect Bakery Box x1 ($20)",

      address: "2427 Haider Avenue Naperville",

      fulfillmentType: "Pick up",

      pickupTime: "Saturday between 6-8 pm",

      pickupDay: "Saturday",

      paymentMethod: "Zelle",

      specialRequirements: "",

    },

  });

}


