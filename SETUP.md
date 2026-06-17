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
   - This creates the **Orders** tab and column headers.
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

## 6. Custom domain (chefchirag.com)

**Cost:** ~$10–15/year for the domain; **$0 on Netlify** (Free plan includes custom domains + SSL).

As of June 2026, **chefchirag.com is available** to register. Full details, registrar pricing, and DNS steps are in [`docs/CUSTOM-DOMAIN.md`](docs/CUSTOM-DOMAIN.md).

### Quick steps

1. **Buy** `chefchirag.com` at [Namecheap](https://www.namecheap.com/domains/registration/results/?domain=chefchirag.com) or [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (~$7–11 first year).
2. **Netlify:** Site → **Domain management** → **Add a domain** → enter `chefchirag.com` (and `www.chefchirag.com` if desired).
3. **DNS:** Either point A/CNAME records to Netlify (keep registrar DNS) or switch nameservers to Netlify DNS — see [`docs/CUSTOM-DOMAIN.md`](docs/CUSTOM-DOMAIN.md) for exact records.
4. **Verify:** After DNS propagates (minutes to a few hours), run:

```powershell
.\scripts\verify-domain.ps1
```

Netlify issues a free HTTPS certificate automatically once DNS is correct.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Form says "Google Sheets is not configured" | Add your Web app URL to `js/config.js` |
| Order not appearing in sheet | Re-deploy the Apps Script (Deploy → Manage deployments → Edit → New version → Deploy) |
| CORS or network error | Make sure Web app access is set to **Anyone**, not "Anyone with Google account" |
| Changed the script code | You must create a **new deployment version** each time you edit `Code.gs` |
| Orders go to **Sheet1** instead of **Orders** | Redeploy updated `Code.gs` (auto-creates **Orders** tab) or run **`setupSheet`** once |
| Custom domain not working | Run `.\scripts\verify-domain.ps1` and follow [`docs/CUSTOM-DOMAIN.md`](docs/CUSTOM-DOMAIN.md) |
| HTTPS certificate pending | Wait for DNS propagation; confirm A/CNAME records in Netlify Domain management |

### "Sorry, unable to open the file" (Extensions → Apps Script)

This Google error means the **script editor** linked to that spreadsheet cannot open. It is **not** a website bug.

Your **deployed** web app may still work (orders can keep saving) even when the editor is broken. Test the URL in `js/config.js` by opening it in a browser — you should see JSON like `{"status":"ok",...}`.

#### Step 1 — Open the correct spreadsheet

1. Go to [Google Sheets](https://sheets.google.com).
2. Sign in with the **same Google account** that created the form (check the avatar, top-right).
3. Open **Recent** and choose the file with your order rows (often **Sheet1**; file may be named **Untitled spreadsheet**).
4. Only then use **Extensions → Apps Script**.

#### Step 2 — Quick fixes (try in order)

1. Hard refresh the spreadsheet tab (Ctrl+Shift+R).
2. Sign out and back into the correct Google account.
3. Try an Incognito/InPrivate window → open the sheet → **Extensions → Apps Script**.
4. Try another browser (Chrome vs Edge).
5. Wait 10–15 minutes and retry (occasional Google outage).

#### Step 3 — Open the script from script.google.com

1. Go to [script.google.com](https://script.google.com).
2. Sign in with the **same account**.
3. Look for **Bakery Order Handler** (or similar).
4. If it opens there, you can edit code even when **Extensions → Apps Script** from the sheet fails.

#### Step 4 — Workaround: use script.google.com (if Extensions fails on every spreadsheet)

If **Extensions → Apps Script** fails even on a **brand-new** spreadsheet, skip Extensions entirely:

1. **Create a spreadsheet only** at [Google Sheets](https://sheets.google.com) (e.g. **Chef Chirag Orders**). Do not open Apps Script from the sheet.
2. Copy the **spreadsheet ID** from the browser address bar:
   - URL looks like: `https://docs.google.com/spreadsheets/d/THIS_PART_IS_THE_ID/edit`
   - Example: if the URL is `.../d/1a2b3c4d5e6f7g8h9/edit`, the ID is `1a2b3c4d5e6f7g8h9`
3. Open [script.google.com](https://script.google.com) in the same Google account.
4. Click **New project** (not from the spreadsheet menu).
5. Delete the default code and paste all of [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
6. At the top of the file, set:
   ```javascript
   const SPREADSHEET_ID = "paste-your-id-here";
   ```
7. Click **Save**, name the project **Bakery Order Handler**.
8. Select **`setupSheet`** in the function dropdown → click **Run** → grant permissions when asked.
9. **Deploy → New deployment → Web app** — Execute as **Me**, Who has access **Anyone**.
10. Copy the new `/exec` URL into `googleScriptUrl` in [`js/config.js`](js/config.js) and push to GitHub (or ask for help deploying).

**Why this works:** The script is **standalone** at script.google.com and opens your sheet by ID — it never uses **Extensions → Apps Script**.

**Common blockers for Extensions:**
- School or work Google account (admin may block Apps Script)
- Try a **personal @gmail.com** account instead
- Browser extensions — try Incognito with extensions disabled

#### Step 5 — Fresh setup via Extensions (only if Extensions works)

Use a **new spreadsheet** if the old one’s script link is corrupted:

1. Create a new spreadsheet (e.g. **Chef Chirag Orders**).
2. **Extensions → Apps Script** → paste all of [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
3. Leave `SPREADSHEET_ID` as `""` (empty).
4. Save the project as **Bakery Order Handler**.
5. **Deploy → New deployment → Web app** — Execute as **Me**, Who has access **Anyone**.
6. Copy the new `/exec` URL into `googleScriptUrl` in [`js/config.js`](js/config.js).
7. Push to GitHub so Netlify redeploys (or update live `config.js` manually).
8. Run **`setupSheet`** once in Apps Script, or submit a test order (auto-creates the **Orders** tab).

Old rows on **Sheet1** in a previous file are **not** moved automatically.

#### Step 6 — Verify

1. In Apps Script, run **`testOrderWrite`** → confirm a row on the **Orders** tab.
2. Submit a test order on the site → confirm a new row appears.
3. For pick-up orders, confirm **Pick Up Day** shows **Saturday** or **Sunday**.

---

## Sheet columns

Orders are written to the **Orders** tab (created automatically if missing). Each row has:

| Column | Content |
|--------|---------|
| Timestamp | When the order was submitted |
| Name | Customer name |
| Phone | Customer phone |
| Items Ordered | Cart items |
| Address | Delivery address or pick-up address |
| Fulfillment | Pick up / Delivery |
| Pick Up Time | e.g. Saturday between 6-8 pm |
| Pick Up Day | Saturday / Sunday (pick-up only) |
| Payment Method | Cash/Card on delivery, Venmo, Zelle |
| Special Requirements | Reserved (optional notes) |
