/**
 * Chirag's Bakery — Order Form Handler
 *
 * Paste this into Google Apps Script (Extensions → Apps Script)
 * attached to your Google Sheet. See SETUP.md for full instructions.
 */

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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = parseOrderPayload(e);

    Logger.log("Order payload: " + JSON.stringify(data));

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

/**
 * Run this once from the Apps Script editor to verify rows can be written.
 * Select testOrderWrite from the dropdown, then click Run.
 */
function testOrderWrite() {
  doPost({
    parameter: {
      name: "Sheet Test",
      phone: "5551234567",
      itemsOrdered: "Test cake x1 ($35)",
      address: "123 Test Street",
      paymentMethod: "Venmo",
      specialRequirements: "If you see this row, the sheet connection works.",
    },
  });
}
