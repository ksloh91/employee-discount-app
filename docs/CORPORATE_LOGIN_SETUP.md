# Corporate login – step-by-step setup

To log in as a **corporate** user and use the Corporate dashboard, you need:

1. A **Firebase Auth** user (email + password).
2. A **Firestore** profile document with `role: 'corporate'`.

---

## Step 1: Create the user in Firebase Authentication

1. Open the [Firebase Console](https://console.firebase.google.com/) and select your project.
2. Go to **Build** → **Authentication**.
3. If you haven’t enabled **Email/Password** sign-in, turn it on under **Sign-in method**.
4. Open the **Users** tab.
5. Click **Add user**.
6. Enter:
   - **Email:** e.g. `corporate@example.com`
   - **Password:** e.g. a strong password you’ll remember for testing (min 6 characters).
7. Click **Add user**.
8. After the user is created, **copy the User UID** (click the user row if needed to see it). You’ll use this in Step 2.

---

## Step 2: Create the user profile in Firestore

The app loads the profile from `users/{uid}` and uses it for the role.

1. In Firebase Console go to **Build** → **Firestore Database**.
2. Open the **Data** tab.
3. If you don’t have a `users` collection yet, create it:
   - Click **Start collection**.
   - Collection ID: `users`.
   - Click **Next**.
4. Add a document for your corporate user:
   - **Document ID:** paste the **User UID** from Step 1 (must match the Auth user exactly).
   - Add these fields:

   | Field         | Type   | Value              |
   |---------------|--------|--------------------|
   | `role`        | string | `corporate`        |
   | `displayName` | string | e.g. `Corporate Admin` (optional) |

5. Click **Save**.

---

## Step 3: Log in in the app

1. Run the app (e.g. `npm run dev`).
2. Go to **Log in** (or `/login`).
3. Enter the **email** and **password** you used in Step 1.
4. Submit. You should be redirected to **Corporate** → **Dashboard** (`/corporate/dashboard`).

---

## Quick reference – Firestore `users/{uid}` for roles

| Role        | Required fields in `users/{uid}` |
|------------|-----------------------------------|
| Employee   | `role: 'employee'`               |
| Merchant   | `role: 'merchant'`, `merchantId: '<string>'`, optional `displayName` |
| Corporate  | `role: 'corporate'`, optional `displayName` |

The app reads these from the `users` document and merges them with the Firebase Auth user (e.g. `email`, `uid`).
