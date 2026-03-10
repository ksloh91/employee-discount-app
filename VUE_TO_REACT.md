# Vue → React guide (for this project)

You're already using React in this repo. This doc maps Vue concepts to what you're doing in React so you can move quickly.

---

## 1. Components

| Vue | React (this project) |
|-----|------------------------|
| Single-file component (`.vue`) with `<template>`, `<script>`, `<style>` | One component per file: `.jsx` with JSX + optional `.css` import |
| `export default { name: 'DealsPage', ... }` | `export default function DealsPage() { ... }` |
| Composition API `<script setup>` | Function component + hooks |

**Vue:**
```vue
<template>
  <div class="deals-page">
    <h1>Deals</h1>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
```

**React (same idea):**
```jsx
import { useState } from 'react';
import './DealsPage.css';

export default function DealsPage() {
  const [count, setCount] = useState(0);
  return (
    <div className="deals-page">
      <h1>Deals</h1>
    </div>
  );
}
```

- Use **`className`** instead of `class`.  
- Use **`htmlFor`** instead of `for` on labels.

---

## 2. Local state

| Vue | React |
|-----|--------|
| `ref(0)` → `count.value` | `useState(0)` → `[count, setCount]` |
| `reactive({ list: [] })` | `useState({ list: [] })` or multiple `useState` |
| Update: `count.value++` or `obj.list.push(x)` | Update: `setCount(c => c + 1)` or `setList(l => [...l, x])` |

**Important:** In React you replace state; you don’t mutate. So instead of `redeemed.add(id)`, you do `setRedeemed(prev => new Set(prev).add(id))` (which you’re already doing in `DealsPage`).

---

## 3. Props

| Vue | React |
|-----|--------|
| `defineProps<{ title: string }>()` or `props: { title: String }` | Function argument: `function Card({ title }) { ... }` |
| In template: `{{ title }}` | In JSX: `{title}` |

**React:**
```jsx
export default function DealCard({ deal, onRedeem }) {
  return (
    <article>
      <h2>{deal.title}</h2>
      <button onClick={() => onRedeem(deal.id)}>Redeem</button>
    </article>
  );
}
```

---

## 4. Events / emit

| Vue | React |
|-----|--------|
| `emit('redeem', deal.id)` | Pass a callback prop: `onRedeem(deal.id)` |
| Parent: `@redeem="handleRedeem"` | Parent: `onRedeem={handleRedeem}` |

So: **no `emit` in React** — the parent passes a function; the child calls it.

---

## 5. Lifecycle / side effects

| Vue | React |
|-----|--------|
| `onMounted(() => { fetch... })` | `useEffect(() => { fetch... }, [])` |
| `watch(source, () => { ... })` | `useEffect(() => { ... }, [source])` |
| `onUnmounted(() => cleanup)` | `useEffect(() => { return () => cleanup; }, [])` |

**React:**
```jsx
import { useEffect, useState } from 'react';

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  useEffect(() => {
    fetch('/api/deals').then(r => r.json()).then(setDeals);
    return () => { /* optional cleanup */ };
  }, []); // empty = run once on mount
  // ...
}
```

---

## 6. Global state (Pinia / Vuex → Context)

You’re already using the React pattern: **Context + Provider**.

| Vue (Pinia) | React |
|-------------|--------|
| `const auth = useAuthStore()` | `const { user, login } = useAuth()` |
| Store defined in a store file | `AuthContext` + `AuthProvider` in `context/AuthContext.jsx` |

Same idea: wrap the app in a provider, then in any component call `useAuth()` to read and update.

---

## 7. Routing

| Vue Router | React Router (this project) |
|------------|-----------------------------|
| `<RouterView />` | `<Routes>` + `<Route>` with `element={<Page />}` |
| `<router-link to="/deals">` | `<Link to="/deals">` |
| `useRouter().push('/login')` | `const navigate = useNavigate(); navigate('/login')` |
| `useRoute().params.id` | `const { id } = useParams()` |
| Navigation guard `beforeEach` | Component: `<ProtectedRoute>` that renders `<Navigate to="/login" />` if not allowed |

Your `ProtectedRoute` is the React equivalent of a route guard that checks auth and role.

---

## 8. Conditional and list rendering

| Vue | React |
|-----|--------|
| `v-if="user"` | `{user && <div>...</div>}` or ternary |
| `v-for="deal in deals" :key="deal.id"` | `{deals.map(deal => <Card key={deal.id} deal={deal} />)}` |

**React:** You must provide a stable `key` when mapping (usually `id`).

---

## 9. Forms

| Vue | React |
|-----|--------|
| `v-model="email"` | Controlled: `value={email}` + `onChange={e => setEmail(e.target.value)}` |
| `v-model.trim` | `e.target.value.trim()` in handler |

**React controlled input:**
```jsx
const [email, setEmail] = useState('');
// ...
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

---

## 10. Where things live in this repo

- **Layout / shell:** `src/components/Layout.jsx` (like a layout view + nav).
- **Auth:** `src/context/AuthContext.jsx` — `useAuth()` for `user`, `login`, `logout`.
- **Route protection:** `src/components/ProtectedRoute.jsx` — wrap a route so it requires auth and optional roles.
- **Pages:** `src/pages/` and `src/pages/employee`, `corporate`, `merchant`.
- **Mock data:** `src/data/mockDeals.js` (later replace with API calls).

Use this file as a cheat sheet while you implement Phase 2 in **PROJECT_PLAN.md**.
