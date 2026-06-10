/**
 * Chirag's Bakery — Order Form Handler
 *
 * Paste this into Google Apps Script (Extensions → Apps Script)
 * attached to your Google Sheet. See SETUP.md for full instructions.
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    const row = [
      new Date(),
      data.name || "",
      data.phone || "",
      data.itemsOrdered || "",
      data.address || "",
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
    JSON.stringify({ status: "ok", message: "Chirag's Bakery order endpoint is running." })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this once from the Apps Script editor to set up column headers.
 */
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headers = [
    "Timestamp",
    "Name",
    "Phone",
    "Items Ordered",
    "Address",
    "Payment Method",
    "Special Requirements",
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#8B2942")
    .setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}
