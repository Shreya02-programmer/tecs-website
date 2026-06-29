# 🔧 T.E.C.S Pvt Ltd — Industrial Web Platform

<p align="center">
  <img src="icons/icon-192.png" alt="T.E.C.S Logo" width="100"/>
</p>

<p align="center">
  <b>Turbine Engineering & Control Solutions</b><br/>
  Industrial B2B platform for spare parts, vibration monitoring, flow meters & field service booking.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white"/>
  <img src="https://img.shields.io/badge/Razorpay-Integrated-02042B?style=flat-square&logo=razorpay&logoColor=white"/>
  <img src="https://img.shields.io/badge/NeDB-Flat--file%20DB-blue?style=flat-square"/>
</p>

---

## 📁 Project Structure

```
tecs-website/
├── index.html          # Public marketing site & product shop
├── app.html            # Customer PWA (booking, contact, enquiry)
├── admin.html          # Admin dashboard (orders, bookings, enquiries)
├── offline.html        # PWA offline fallback
├── sw.js               # Service Worker
├── manifest.json       # PWA manifest
├── server.js           # Node.js + Express backend
├── package.json
├── db_products.json    # Products database (NeDB)
├── db_orders.json      # Orders database (NeDB)
├── db_bookings.json    # Bookings database (NeDB)
├── db_enquiries.json   # Enquiries database (NeDB)
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── favicon-32.png
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js **v18+**
- npm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/tecs-website.git
cd tecs-website

# Install dependencies
npm install

# Start the server
npm start
```

Open **http://localhost:3000** in your browser.

---

## 🌐 Pages

| Page | File | Description |
|------|------|-------------|
| Public Website | `index.html` | Hero, Services, Shop, Contact |
| Customer App | `app.html` | PWA — Book engineer, enquiry form |
| Admin Panel | `admin.html` | Manage RFQs, bookings, enquiries, products |
| Offline | `offline.html` | Shown when user has no internet |

---

## 🔌 API Reference

Base URL: `http://localhost:3000`

### Products
```
GET  /api/products              → List all products
GET  /api/products?category=vibration&search=shinkawa
```

### Orders
```
POST /api/orders                → Place an order
GET  /api/orders                → List all orders
```

### Bookings
```
POST   /api/bookings            → Book a field engineer
GET    /api/bookings            → List all bookings
DELETE /api/bookings/:id        → Delete single booking
DELETE /api/bookings            → Delete all bookings
```

### Enquiries
```
POST   /api/enquiries           → Submit enquiry
GET    /api/enquiries           → List all enquiries
DELETE /api/enquiries/:id       → Delete single enquiry
DELETE /api/enquiries           → Delete all enquiries
DELETE /api/enquiries?filter=rfq      → Delete only RFQ enquiries
DELETE /api/enquiries?filter=general  → Delete only general enquiries
```

### Payments (Razorpay)
```
POST /api/razorpay/create-order → Create payment order
POST /api/razorpay/verify       → Verify payment signature
```

### Health
```
GET /api/health                 → Server status check
```

---

## 💳 Razorpay Setup

Open `server.js` and replace the placeholder keys:

```js
const RAZORPAY_KEY_ID     = 'rzp_test_YourKeyIDHere';
const RAZORPAY_KEY_SECRET = 'YourKeySecretHere';
```

> ⚠️ Switch to `rzp_live_...` keys before going to production. Never commit real keys — use environment variables.

**Recommended for production:**
```js
const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web server & routing |
| `cors` | Cross-origin requests |
| `body-parser` | JSON request parsing |
| `@seald-io/nedb` | Embedded flat-file database |
| `nodemailer` | Email (future use) |

---

## 📱 PWA Features

- ✅ Installable on Android & iOS
- ✅ Offline support via Service Worker
- ✅ Cache-first for static assets
- ✅ Network-first for HTML pages
- ✅ API calls always hit network (never cached)
- ✅ Push notification ready (hook in `sw.js`)

---

## 🎨 Design Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#0d1b2a` | Page background |
| Steel | `#1b3a5c` | Card backgrounds |
| Sky | `#4a9bc4` | Links & accents |
| Glow | `#e07b20` | CTAs & highlights |
| Muted | `#8aa4bc` | Secondary text |

**Fonts:** Barlow Condensed (headings) · Inter (body)

---

## 🛒 Product Catalogue (Default Seed)

| Product | Brand | Price (₹) |
|---------|-------|-----------|
| Vortex Flow Meter | Forbes Marshall | 80,000 |
| Vibration Transducers | Shinkawa | 70,000 |
| Vibration Transducers (API 670) | Shinkawa | 60,000 |
| Shinkawa Vibration Monitoring System | Shinkawa | 4,50,000 |
| Digital Compact Monitors | Shinkawa | 1,75,000 |
| Steam Operated Condensate Pump | Forbes Marshall | 60,000 |
| Pressure Powered Pumping Packaged Unit | Forbes Marshall | 1,20,000 |
| Forbes Marshall Control Valves | Forbes Marshall | 50,000 |
| DG Control Panel Repairing Services | TECS | 8,500 |

> Products are auto-seeded on first server start if the database is empty.

---

## 🔒 .gitignore Recommendation

Create a `.gitignore` file in the root with:

```
node_modules/
.env
db_orders.json
db_bookings.json
db_enquiries.json
```

> ⚠️ The `db_*.json` files contain live customer data. Keep them off GitHub and only on your server.

---

## 📞 Contact

**T.E.C.S Pvt Ltd**
- 📞 +91-9817254252
- ✉️ Info@tecspl.com
