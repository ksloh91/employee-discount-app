# Merchant login – step-by-step setup

To log in as a **merchant** and use My Deals, Dashboard, and Add/Edit Deal, you need:

1. A **Firebase Auth** user (email + password).
2. A **Firestore** profile document that sets `role: 'merchant'` and `merchantId`.

---

## Step 1: Create the user in Firebase Authentication

1. Open the [Firebase Console](https://console.firebase.google.com/) and select your project.
2. Go to **Build** → **Authentication**.
3. If you haven’t enabled **Email/Password** sign-in, turn it on under **Sign-in method**.
4. Open the **Users** tab.
5. Click **Add user**.
6. Enter:
   - **Email:** e.g. `merchant@example.com`
   - **Password:** e.g. a strong password you’ll remember for testing (min 6 characters).
7. Click **Add user**.
8. After the user is created, **copy the User UID** (click the user row if needed to see it). You’ll use this in Step 2.

---

## Step 2: Create the user profile in Firestore

The app loads the profile from `users/{uid}` and uses it for role and merchant ID.

1. In Firebase Console go to **Build** → **Firestore Database**.
2. Open the **Data** tab.
3. If you don’t have a `users` collection yet, create it:
   - Click **Start collection**.
   - Collection ID: `users`.
   - Click **Next**.
4. Add a document for your merchant:
   - **Document ID:** paste the **User UID** from Step 1 (must match the Auth user exactly).
   - Add these fields:

   | Field         | Type   | Value              |
   |---------------|--------|--------------------|
   | `role`        | string | `merchant`         |
   | `merchantId`  | string | e.g. `merchant-1` or the same UID |
   | `displayName` | string | e.g. `Test Merchant` |

5. Click **Save**.

---

## Step 3: Log in in the app

1. Run the app (e.g. `npm run dev`).
2. Go to **Log in** (or `/login`).
3. Enter the **email** and **password** you used in Step 1.
4. Submit. You should be redirected to **Merchant** → **My Deals** (or **Dashboard**).

---

## Step 4: Optional – add a test deal

- Use **Add deal** to create a deal; it will be tied to your `merchantId`.
- **My Deals** shows only deals where `deal.merchantId === user.merchantId` (or matching `merchantName`).

---

## Quick reference – Firestore `users/{uid}` for roles

| Role        | Required fields in `users/{uid}` |
|------------|-----------------------------------|
| Employee   | `role: 'employee'`               |
| Merchant   | `role: 'merchant'`, `merchantId: '<string>'`, optional `displayName` |
| Corporate  | `role: 'corporate'`              |

The app reads these from the `users` document and merges them with the Firebase Auth user (e.g. `email`, `uid`).
