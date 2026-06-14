# Custom Domain: chefchirag.com

Availability check and setup guide for connecting **chefchirag.com** to your Netlify-hosted bakery site.

---

## Availability (checked June 12, 2026)

| Check | Result |
|-------|--------|
| DNS lookup | **No records** — domain not registered |
| [Instant Domain Search](https://instantdomainsearch.com/check/chefchirag.com) | **Available** |
| RDAP / WHOIS | No active registration found |

**chefchirag.com is available to register.**

### Recommended registrars and pricing

| Registrar | 1st year | Renewal | ≈ Weekly (renewal) | Best for |
|-----------|----------|---------|-------------------|----------|
| [Cloudflare](https://www.cloudflare.com/products/registrar/) | ~$10.46 | ~$10.46 | ~$0.20/week | Lowest long-term cost |
| [Namecheap](https://www.namecheap.com) | ~$6.79–11 | ~$14.78 | ~$0.28/week | Easy UI, free WHOIS privacy |

WHOIS privacy is free at both. Budget **~$15/year (~$0.29/week)** for ongoing cost after promos expire.

### Netlify cost

**$0** — custom domains and SSL are included on the [Free plan](https://www.netlify.com/pricing/). No Netlify upgrade needed for this site.

---

## Step 1 — Buy the domain

1. Go to your chosen registrar:
   - **Namecheap:** [Search chefchirag.com](https://www.namecheap.com/domains/registration/results/?domain=chefchirag.com)
   - **Cloudflare:** [Cloudflare Registrar](https://dash.cloudflare.com/?to=/:account/domains/register) (create a free account first)
2. Add **chefchirag.com** to cart and complete checkout (~$7–11 first year).
3. Enable **WHOIS privacy** if prompted (should be free).
4. Leave DNS at the registrar for now — you will point it to Netlify in Step 3.

---

## Step 2 — Add the domain in Netlify

1. Open [app.netlify.com](https://app.netlify.com) and select your **chirag-bakery** site.
2. Go to **Site configuration → Domain management** (or **Domain settings**).
3. Click **Add a domain → Add a domain you already own**.
4. Enter `chefchirag.com` and confirm.
5. Also add `www.chefchirag.com` if you want the www version.
6. Netlify will show DNS records you need — keep this page open for Step 3.

---

## Step 3 — Point DNS to Netlify

Choose **one** method:

### Option A — External DNS (keep registrar DNS)

At your registrar’s DNS settings, add the records Netlify shows you. Typically:

| Type | Name / Host | Value |
|------|-------------|-------|
| `A` | `@` | `75.2.60.5` |
| `CNAME` | `www` | `<your-site-name>.netlify.app` |

> Netlify may show different values — always use the records from **your** site’s Domain management page.

### Option B — Netlify DNS (simpler long-term)

1. In Netlify Domain management, choose **Set up Netlify DNS**.
2. Netlify gives you nameservers (e.g. `dns1.p01.nsone.net`, …).
3. At your registrar, replace existing nameservers with Netlify’s.
4. Netlify manages all DNS records automatically.

DNS propagation usually takes **5 minutes to a few hours**.

---

## Step 4 — Verify HTTPS

Netlify provisions a free Let’s Encrypt certificate once DNS is correct.

Run the verification script from the project root:

```powershell
.\scripts\verify-domain.ps1
```

Or manually check:

1. Netlify → Domain management → **HTTPS** shows “Your site has HTTPS enabled”.
2. Visit `https://chefchirag.com` in a browser — padlock icon, no certificate warnings.
3. Optional: set **Primary domain** to `chefchirag.com` and enable **Force HTTPS** redirect.

---

## Cost summary

| Item | Weekly | Yearly |
|------|--------|--------|
| Domain (renewal) | ~$0.20–0.29 | ~$10–15 |
| Netlify Free plan | $0 | $0 |
| **Total** | **~$0.20–0.29** | **~$10–15** |

Optional: business email at `@chefchirag.com` via Google Workspace adds ~$7/month (~$1.62/week) — not required for the website.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Domain shows “Pending DNS verification” | Wait for propagation; confirm A/CNAME or nameservers match Netlify exactly |
| HTTPS not provisioning | DNS must point to Netlify first; click **Verify DNS configuration** in Netlify |
| Site loads on netlify.app but not custom domain | DNS not propagated yet, or wrong records at registrar |
| www works but apex doesn’t (or vice versa) | Add both domains in Netlify; set primary domain and configure redirect |
