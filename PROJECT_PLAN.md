# Employee Discount Program — Project Plan

A React web app where **corporates** subscribe to a service so their **employees** can browse and redeem **exclusive deals** from **participating merchants**.

---

## 1. Product overview

| Actor | Goal |
|-------|------|
| **Corporate** | Subscribe to the program; manage which employees have access; see usage/engagement. |
| **Employee** | Log in (tied to employer), browse deals, redeem offers, see redemption history. |
| **Merchant** | Create and manage deals; see redemptions and performance. |mim
| **Platform** | Onboard corporates and merchants; host the app; (later) billing and analytics. |

---

## 2. What you already have (current state)

- **Stack:** React 19 + Vite 7 + React Router 7.
- **Auth:** `AuthContext` with `user`, `login(role, data)`, `logout`; role-based access.
- **Routing:** Home, Login, and role-specific routes:
  - **Employee:** `/employee/deals`, `/employee/redemptions`
  - **Corporate:** `/corporate/dashboard`
  - **Merchant:** `/merchant/deals`
- **Protected routes:** `ProtectedRoute` with `allowedRoles` (similar to Vue Router guards + `meta.requiresAuth`).
- **Data:** `mockDeals` in `src/data/mockDeals.js`; no backend yet.
- **UI:** Layout with nav, basic pages and CSS.

This is a solid **Phase 1**: three personas, routing, and mock data.

---

## 3. Suggested phases

### Phase 1 — Foundation (done)
- [x] Vite + React + React Router
- [x] Auth context and role-based routes
- [x] Home, Login, Employee (deals + redemptions), Corporate dashboard, Merchant deals
- [x] Mock deals and simple “redeem” state in memory

### Phase 2 — MVP (next)
- [ ] **Persist auth:** e.g. `localStorage` so refresh keeps user (and optionally “remember me”).
- [ ] **Redemption history in context:** Store redeemed deal IDs (and maybe minimal deal snapshot) in context or a small “redemptions” slice so My Redemptions page shows real data.
- [ ] **Login by role:** On Login page, choose role (employee / corporate / merchant) and optionally “company” so employee is tied to a corporate (still mock).
- [ ] **Merchant deal form:** Add/create deal from Merchant page (in-memory or later API).
- [ ] **Corporate dashboard content:** Placeholder stats (e.g. “X employees, Y redemptions this month”) using mock data.

### Phase 3 — Backend & real data
- [ ] **API:** REST or GraphQL (e.g. Node/Express, or Next.js API routes).
- [ ] **Data model:** Companies, Users (linked to company + role), Deals (merchant, terms, validity), Redemptions (user, deal, timestamp).
- [ ] **Auth:** JWT or session-based login; signup flows for corporate and merchant.
- [ ] **CRUD:** Deals create/update/delete; redemptions recorded when employee redeems.

### Phase 4 — Polish & scale
- [ ] **Search/filter deals** (by category, merchant, expiry).
- [ ] **Corporate admin:** Invite employees, view usage reports.
- [ ] **Merchant analytics:** Redemptions per deal, trends.
- [ ] **Notifications:** Email or in-app (e.g. new deals, redemption confirmation).
- [ ] **Payments:** Corporate subscription billing (Stripe etc.).

---

## 4. Data model (for when you add a backend)

Keep this in mind when you move from mock data to an API.

```
Company (corporate)
  - id, name, subscriptionPlan, createdAt

User
  - id, email, role (employee | corporate_admin | merchant), companyId?, merchantId?

Merchant
  - id, name, logo?, contactEmail

Deal
  - id, merchantId, title, description, discount, code?, validFrom, validUntil, category

Redemption
  - id, userId, dealId, redeemedAt
```

---

## 5. Folder structure (current and suggested)

```
src/
  components/     # Shared: Layout, ProtectedRoute, buttons, cards
  context/        # AuthContext (later: RedemptionsContext or global state)
  data/           # mockDeals, later replace with api/
  pages/
    HomePage.jsx
    LoginPage.jsx
    employee/     # DealsPage, MyRedemptionsPage
    corporate/    # DashboardPage
    merchant/     # MyDealsPage
  App.jsx
  main.jsx
```

When you add an API, add something like:

- `src/api/client.js` (fetch/axios base)
- `src/api/deals.js`, `auth.js`, `redemptions.js`

---

## 6. Recommended next steps (in order)

1. **Persist login:** In `AuthContext`, read/write `user` from `localStorage` so refresh doesn’t log out.
2. **Redemptions in context:** Add a `RedemptionsContext` (or extend Auth) to store `redeemedDeals` (e.g. `[{ dealId, deal, redeemedAt }]`). Have DealsPage and MyRedemptionsPage use it so “Redeem” updates a shared list.
3. **Login by role:** On Login, let user pick role (and if employee, pick a mock company). Call `login(role, { email, companyId?, ... })`.
4. **Corporate dashboard:** Show mock stats (number of employees, redemptions) and a simple table or list.
5. **Merchant:** Form to add a new deal (push to mock array or, later, POST to API).

After that, you can design the backend (Phase 3) and connect the app to it.

---

## 7. Vue → React quick reference

See **VUE_TO_REACT.md** in this repo for a side-by-side guide (components, state, lifecycle, routing, etc.) so you can map Vue concepts to what you’re building in React.

---

*You can tick off Phase 2 items in this doc as you go. When you’re ready for Phase 3, we can outline API endpoints and auth flow in more detail.*
