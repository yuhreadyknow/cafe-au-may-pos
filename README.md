# ☕ Cafe Au May — Point of Sale

A lightweight, zero-fee POS system built for home cafes. Track orders, customers, margins, and export to CSV.

**Live:** `https://yuhreadyknow.github.io/cafe-au-may-pos/`

---

## 🚀 Deploy to GitHub Pages (step-by-step)

### Prerequisites
- A [GitHub account](https://github.com) (free)
- [Node.js](https://nodejs.org) installed (v18+) — download the LTS version
- [Git](https://git-scm.com/downloads) installed

### Step 1 — Create the GitHub repo

1. Go to [github.com/new](https://github.com/new)
2. Name it **`cafe-au-may-pos`** (must match the `base` in `vite.config.js`)
3. Leave it **Public**
4. **Don't** check "Add a README" (we already have one)
5. Click **Create repository**

### Step 2 — Push this project to GitHub

Open your terminal and run these commands one at a time:

```bash
cd cafe-au-may-pos

git init
git add .
git commit -m "Initial commit — Cafe Au May POS"

git remote add origin https://github.com/yuhreadyknow/cafe-au-may-pos.git
git branch -M main
git push -u origin main
```

> ⚠️ Replace `yuhreadyknow` with your actual GitHub username.

### Step 3 — Enable GitHub Pages

1. Go to your repo on GitHub → **Settings** → **Pages** (left sidebar)
2. Under **Source**, select **GitHub Actions**
3. That's it — the workflow we included will handle the rest

### Step 4 — Wait ~2 minutes, then visit your site

Your POS is now live at:

```
https://yuhreadyknow.github.io/cafe-au-may-pos/
```

Every future `git push` to `main` will automatically redeploy.

---

## 💻 Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Changes hot-reload instantly.

---

## 📁 Project Structure

```
cafe-au-may-pos/
├── src/
│   ├── App.jsx          ← the entire POS app
│   └── main.jsx         ← React entry point
├── index.html
├── package.json
├── vite.config.js
└── .github/workflows/
    └── deploy.yml       ← auto-deploys on push
```

---

## 🔧 Customization

- **Change your cafe name:** Search for "Cafe Au May" in `src/App.jsx`
- **Edit menu items:** Update the `DEFAULT_MENU` array at the top of `src/App.jsx`
- **Change repo name:** Update `base` in `vite.config.js` to match

---

## ✨ Features

- **Register** — Tap-to-order with instant totals
- **Customer tracking** — Name autocomplete, returning customer badges, favorites
- **Menu editor** — Edit prices, costs, and margin % in real time
- **Daily P&L** — Revenue, cost, and profit dashboard
- **Customer insights** — Leaderboard with visit count, avg spend, favorite items
- **CSV export** — One-click download for orders and customer data
