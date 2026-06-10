# Chirag's Bakery — Setup Guide

Follow these steps to connect your order form to Google Sheets and publish the website.

---

## 1. Set up Google Sheets

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet.
2. Name it something like **Chirag's Bakery Orders**.
3. Click **Extensions → Apps Script**.
4. Delete any default code and paste the contents of [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
5. Click **Save** (disk icon) and name the project **Bakery Order Handler**.
6. In the function dropdown at the top, select **`setupSheet`** and click **Run**.
   - Grant permissions when prompted (review permissions → choose your account → Advanced → Go to Bakery Order Handler → Allow).
   - This creates the column headers in your sheet.
7. Switch the function dropdown to **`doPost`** (no need to run it — just select it).

---

## 2. Deploy as a Web App

1. In Apps Script, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Description:** Bakery order form
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**.
5. Copy the **Web app URL** (it looks like `https://script.google.com/macros/s/...../exec`).

---

## 3. Connect the website

1. Open [`js/config.js`](js/config.js).
2. Paste your Web app URL into `googleScriptUrl`:

```js
googleScriptUrl: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
```

3. Edit products, prices, and payment methods in the same file as needed.

---

## 4. Preview locally

Open `index.html` in your browser, or run a simple local server:

```powershell
# Windows (use py if python fails)
py -m http.server 8080
```

Then visit `http://localhost:8080`.

> **Note:** The form will only submit successfully once `googleScriptUrl` is set and the Apps Script is deployed.

---

## 5. Publish with GitHub + Netlify (auto-deploy)

This project is set up to deploy automatically when you push to GitHub.

**Repository:** [github.com/donhirye/chirag-bakery](https://github.com/donhirye/chirag-bakery) (private)

### One-time Netlify setup

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
2. Choose **GitHub** → authorize Netlify → select **donhirye/chirag-bakery**.
3. Deploy settings:
   - **Branch:** `main`
   - **Build command:** *(leave empty)*
   - **Publish directory:** `.`
4. Click **Deploy site**.
5. Optional: rename the site under **Domain management** (e.g. `chirag-bakery-fathers-day`).

Netlify reads [`netlify.toml`](netlify.toml) in the repo — no build step needed.

### Updating the live site

After you edit files locally:

```powershell
cd "C:\Users\mihir\Projects\Chirag Website for fathers day"
git add .
git commit -m "Describe your change"
git push
```

Netlify redeploys automatically in ~30 seconds. Check **Netlify → Deploys** to confirm.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Form says "Google Sheets is not configured" | Add your Web app URL to `js/config.js` |
| Order not appearing in sheet | Re-deploy the Apps Script (Deploy → Manage deployments → Edit → New version → Deploy) |
| CORS or network error | Make sure Web app access is set to **Anyone**, not "Anyone with Google account" |
| Changed the script code | You must create a **new deployment version** each time you edit `Code.gs` |

---

## Sheet columns

Each order creates a new row with:

| Column | Content |
|--------|---------|
| Timestamp | When the order was submitted |
| Name | Customer name |
| Phone | Customer phone |
| Items Ordered | Selected menu items + custom requests |
| Address | Delivery address |
| Payment Method | How they'll pay |
| Special Requirements | Allergies, delivery notes, gift messages, etc. |
