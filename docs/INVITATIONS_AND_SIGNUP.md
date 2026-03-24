# Invitations and employee sign-up

Corporate users can pre-approve employees by sending invitations. Only invited email addresses can complete sign-up as employees.

## Flow

1. **Corporate** goes to **Invite employees** (`/corporate/invitations`), enters an employee email, and clicks **Send invitation**. The app stores a pending invitation in Firestore.
2. **Employee** goes to **Sign up** (`/signup`), enters the same email and a password. The app checks for a pending invitation; if found, it creates the Firebase Auth user, adds a `users/{uid}` profile with `role: 'employee'`, and marks the invitation as accepted.
3. If the email has no pending invitation, sign-up shows: *"No invitation found for this email. Ask your employer to send you an invitation."*

## Firestore

### Collection: `invitations`

- **Fields:** `email` (string), `status` ('pending' | 'accepted'), `createdBy` (uid), `createdAt` (timestamp). When accepted: `acceptedAt`, `acceptedBy`.
- **Composite index:** For the corporate invitations list, create an index on collection `invitations` with:
  - `createdBy` (Ascending)
  - `createdAt` (Descending)  
  When you first load the Invitations page, Firestore may log an error with a link to create this index in the Firebase Console.

### Security rules

- **Corporate:** Only users with `role === 'corporate'` (in `users/{uid}`) should be allowed to create and read their own invitations (e.g. `where('createdBy', '==', request.auth.uid)`).
- **Sign-up:** The sign-up flow runs in the client and queries `invitations` by `email` and `status === 'pending'`. That requires read access to `invitations`. For production you may want a Cloud Function that checks the invitation and creates the user server-side, so invitation documents are never readable by unauthenticated clients.

## Links

- Corporate: **Invite employees** in the nav → `/corporate/invitations`
- Employees: Home page **Employee sign up** or direct link `/signup`

Share the sign-up URL with invited employees so they can create their account.
