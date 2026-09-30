# Next.js Project Development Rules

You are working on a production Next.js application using the App Router.

The codebase must remain:

- simple
- readable
- maintainable
- testable
- scalable
- junior-developer friendly

Always prefer the simplest maintainable solution.

Do not introduce Clean Architecture, repositories, use-cases, factories, dependency-injection systems, adapters, presenters, interactors, or unnecessary architectural layers unless they solve a real current problem.

Avoid over-engineering.

---

# Technology Stack

Use:

- Next.js
- App Router
- React
- JavaScript and TypeScript
- Tailwind CSS
- Redux Toolkit
- Vitest
- React Testing Library
- Playwright

Do not introduce additional libraries without a clear reason.

Before adding a dependency:

1. Check whether Next.js, React, JavaScript, TypeScript, or the existing stack can solve the problem.
2. Prefer existing project dependencies.
3. Add a dependency only when it clearly improves maintainability, reliability, or developer experience.
4. Briefly explain why it is necessary.

Do not introduce Zod or another validation library unless explicitly requested.

---

# App Router Only

Use the Next.js App Router.

Do not introduce Pages Router patterns into a new App Router project.

Use:

```text
app/
layout.tsx
page.tsx
loading.tsx
error.tsx
not-found.tsx
route.ts
```

when appropriate.

Use route groups for organization where helpful.

Example:

```text
app/
├── (public)/
├── (auth)/
└── (dashboard)/
```

Remember that route groups should organize the project without changing the URL.

---

# Server Components by Default

Server Components are the default.

Do not add:

```ts
"use client";
```

unless the component actually requires client-side functionality.

Client Components are appropriate when using things such as:

- useState
- useEffect
- browser APIs
- localStorage
- event handlers
- interactive client-side libraries
- Redux hooks

Keep Client Component boundaries as small as practical.

Do not convert an entire page into a Client Component just because one small child component needs interactivity.

Prefer:

```text
Server Page
   ↓
Server Components
   ↓
Small Client Component
```

rather than:

```text
Entire Page
   ↓
"use client"
```

---

# General Project Structure

Recommended structure:

```text
src/
├── app/
├── features/
├── components/
│   ├── ui/
│   └── layout/
├── hooks/
├── lib/
├── config/
├── constants/
├── types/
├── utils/
└── styles/
```

Keep routing in `app/`.

Keep business and feature-specific code in `features/`.

Keep generic reusable UI in `components/ui/`.

Keep infrastructure and reusable technical utilities in `lib/`.

Do not force every project to have every directory.

Create directories only when useful.

---

# Keep Pages Thin

`page.tsx` should primarily:

- define the route entry
- load route-level data when appropriate
- compose feature components
- pass necessary data

Avoid putting hundreds of lines of business logic inside `page.tsx`.

Prefer:

```tsx
import { ProductList } from "@/features/products/components/ProductList";

/**
 * Displays the product-management page.
 */
export default async function ProductsPage() {
  return <ProductList />;
}
```

over a very large page containing:

- data fetching
- filtering
- business rules
- forms
- modals
- API calls
- transformations
- UI rendering

all together.

---

# Feature-Based Architecture

Organize business functionality by feature.

Example:

```text
features/
├── auth/
├── products/
├── users/
├── machines/
├── sales/
└── reports/
```

A feature may contain:

```text
features/products/
├── components/
├── hooks/
├── services/
├── store/
├── utils/
├── types/
└── tests/
```

Do not create empty folders.

Only introduce a folder when there is actual code that belongs there.

---

# Shared UI vs Feature UI

Generic reusable components belong in:

```text
components/ui/
```

Examples:

```text
Button
Input
Modal
Table
Card
Badge
Spinner
```

Feature-specific components stay inside their feature.

Examples:

```text
features/products/components/ProductCard.tsx
features/machines/components/MachineStatus.tsx
features/sales/components/SalesTable.tsx
```

Generic UI components must not contain feature-specific business logic.

---

# Components

Each component should have one clear responsibility.

Keep components small enough to understand easily.

Split a component when it:

- handles unrelated responsibilities
- contains large amounts of business logic
- contains several independent UI sections
- becomes difficult to test
- becomes difficult to read

Do not split components unnecessarily.

Avoid creating wrappers that provide no meaningful behavior.

---

# Functions

Functions should be:

- focused
- descriptive
- short enough to understand
- easy to test

Prefer meaningful names:

```ts
calculateSaleTotal()
formatMachineStatus()
canUserEditProduct()
getAvailableProducts()
```

Avoid vague names:

```ts
handleData()
processStuff()
doWork()
helper()
func1()
```

---

# Function Documentation

Write English documentation comments for important and non-trivial functions.

Explain:

- what the function does
- important assumptions
- important business behavior
- non-obvious side effects

Example:

```ts
/**
 * Returns true when a product is enabled and still has stock available.
 */
function canSellProduct(product: Product): boolean {
  return product.enabled && product.stock > 0;
}
```

Do not comment obvious syntax or trivial statements.

Comments should explain intent, not translate code into English.

---

# Business Logic

Keep important business rules outside JSX when practical.

Bad:

```tsx
{machine.enabled &&
 machine.status === "online" &&
 machine.products.length > 0 &&
 user.permissions.includes("manage_machine") && (
   <ManageButton />
 )}
```

Prefer:

```ts
/**
 * Determines whether the current user can manage the given machine.
 */
function canManageMachine(
  machine: Machine,
  user: User
): boolean {
  return (
    machine.enabled &&
    machine.status === "online" &&
    machine.products.length > 0 &&
    user.permissions.includes("manage_machine")
  );
}
```

Then:

```tsx
{canManageMachine(machine, user) && <ManageButton />}
```

This improves:

- readability
- testing
- reuse
- maintainability

---

# Redux Toolkit

Use Redux Toolkit as the project's global state-management solution.

Do not store every value in Redux.

Use local React state for local UI concerns.

Examples:

```text
modal open/close
dropdown state
form input
selected tab
temporary UI state
```

Use Redux for meaningful shared application state.

Examples:

```text
authentication
current user
shared settings
cross-page feature state
global workflow state
```

Keep Redux state feature-oriented.

Example:

```text
features/auth/store/authSlice.ts
features/machines/store/machineSlice.ts
```

Avoid a single giant application slice.

---

# Redux in Next.js

Redux requires Client Components.

Keep Redux Provider boundaries explicit.

Do not turn unrelated Server Components into Client Components just to access Redux.

Prefer passing server-fetched data into client boundaries when practical.

Example:

```text
Server Page
   ↓
Server data loading
   ↓
Client Feature Component
   ↓
Redux / interactive state
```

Do not unnecessarily duplicate server data into Redux.

Use Redux mainly for client-side shared state.

---

# Data Fetching

Prefer Server Components for server-side data fetching when appropriate.

Example:

```tsx
/**
 * Loads the available products and renders the product list.
 */
export default async function ProductsPage() {
  const products = await getProducts();

  return <ProductList products={products} />;
}
```

Do not automatically use `useEffect` for every API request.

Use client-side fetching only when the feature requires client-side re-fetching, polling, user-triggered requests, or interactive behavior.

---

# Service Layer

Centralize backend communication.

Example:

```text
features/products/services/productService.ts
```

Example:

```ts
/**
 * Loads all products from the backend.
 */
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error("Failed to load products.");
  }

  return response.json();
}
```

Do not scatter backend URLs throughout pages and components.

Keep HTTP concerns away from presentation components when possible.

---

# Server and Client Boundaries

Be deliberate about the boundary between server and client code.

Server-side code may handle:

- server-side data loading
- secure environment variables
- server-only APIs
- protected backend communication
- route handlers
- server actions when appropriate

Client-side code may handle:

- interaction
- browser APIs
- local UI state
- Redux
- event listeners
- client-only libraries

Never expose secrets to Client Components.

---

# Environment Variables

Do not access environment variables randomly throughout the project.

Centralize configuration when useful.

Example:

```text
config/env.ts
```

Never expose secrets using:

```text
NEXT_PUBLIC_*
```

Only values intentionally accessible in the browser should use `NEXT_PUBLIC_`.

---

# Error Handling

Use Next.js error boundaries where appropriate.

Examples:

```text
error.tsx
not-found.tsx
```

Handle expected failures explicitly.

Do not silently swallow errors.

Provide user-friendly messages for recoverable failures.

Log technical information where appropriate without exposing sensitive data to end users.

---

# Loading States

Use:

```text
loading.tsx
```

when route-level loading UI is appropriate.

For local interactive operations, use explicit loading state.

Avoid blocking unrelated parts of the UI unnecessarily.

---

# State Derived from Existing State

Do not duplicate values that can be calculated.

Bad:

```ts
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [fullName, setFullName] = useState("");
```

Prefer:

```ts
const fullName = `${firstName} ${lastName}`;
```

Keep state minimal.

---

# useEffect

Do not use `useEffect` to calculate values that can be derived during rendering.

Use `useEffect` primarily for synchronizing with external systems.

Examples:

- WebSocket
- browser APIs
- subscriptions
- external widgets
- timers
- event listeners

Always clean up resources when required.

---

# Avoid Deep Nesting

Prefer guard clauses and early returns.

Bad:

```ts
if (session) {
  if (session.user) {
    if (session.user.active) {
      // logic
    }
  }
}
```

Prefer:

```ts
if (!session?.user) return;
if (!session.user.active) return;

// Main logic
```

Keep the happy path visible.

---

# Avoid Magic Values

Bad:

```ts
if (status === 4) {
}
```

Prefer:

```ts
if (status === MachineStatus.Offline) {
}
```

Bad:

```ts
if (retryCount > 3) {
}
```

Prefer:

```ts
const MAX_RETRY_COUNT = 3;

if (retryCount > MAX_RETRY_COUNT) {
}
```

Use descriptive constants where they improve understanding.

---

# Naming

Names should explain intent.

Prefer:

```ts
selectedProduct
currentUser
isMachineOnline
canEditSale
hasAdminPermission
shouldReloadProducts
```

Avoid vague names such as:

```ts
data
info
item2
temp
res2
obj
value1
stuff
```

unless the surrounding context makes the meaning completely obvious.

---

# TypeScript and JavaScript

JavaScript and TypeScript may coexist.

Prefer TypeScript for new important logic where practical.

Do not perform unnecessary project-wide TypeScript migrations during unrelated work.

Avoid `any` where useful types can be defined.

Keep feature-specific types close to their feature.

Use global/shared types only when genuinely shared.

---

# Tailwind CSS

Use Tailwind CSS for styling.

Keep styles close to components.

Avoid creating excessive abstraction only to hide Tailwind classes.

If a visual pattern is reused meaningfully, extract a reusable component.

Maintain readable class structures.

Avoid unnecessarily complex conditional class expressions.

---

# Testing

Tests are required for meaningful behavior.

Use:

```text
Vitest
React Testing Library
Playwright
```

Use Vitest for:

- utilities
- business logic
- selectors
- reducers
- non-UI modules

Use React Testing Library for:

- interactive components
- forms
- user behavior
- conditional rendering

Use Playwright for critical user flows.

Examples:

```text
login
logout
create product
edit machine
view report
critical dashboard navigation
```

Test behavior rather than implementation details.

---

# Comments

All project comments must be written in English.

Use comments to explain:

- intent
- business rules
- important decisions
- limitations
- unusual behavior
- non-obvious workarounds

Do not use excessive comments for obvious code.

Important functions should have short English documentation comments.

---

# File Organization

Keep related code close together.

Avoid giant generic folders containing hundreds of unrelated files.

Bad:

```text
components/
  ProductCard
  LoginForm
  SalesChart
  MachineStatus
  UserAvatar
  ReportFilter
  ...
```

Prefer:

```text
features/products/components/
features/auth/components/
features/sales/components/
features/machines/components/
```

Use global component directories only for truly shared components.

---

# Refactoring Rules

When refactoring an existing Next.js project:

1. First understand the existing behavior.
2. Preserve functionality unless a behavior change is requested.
3. Identify duplicated logic.
4. Identify large pages and components.
5. Identify unclear naming.
6. Identify unnecessary Client Components.
7. Identify unnecessary `useEffect` usage.
8. Identify duplicated state.
9. Identify business logic buried in JSX.
10. Identify API calls scattered across UI code.
11. Refactor incrementally.
12. Add or update tests.
13. Remove dead code when safe.
14. Do not rewrite working code only to match a theoretical architecture.
15. Do not introduce unnecessary layers.
16. Keep the final result understandable to junior developers.

---

# New Features

When implementing a feature:

1. Find or create the correct feature directory.
2. Reuse existing shared components.
3. Keep the page thin.
4. Prefer Server Components by default.
5. Create Client Components only where needed.
6. Put API communication into a service when it improves separation.
7. Keep Redux only for meaningful shared client state.
8. Keep business rules testable.
9. Add appropriate tests.
10. Keep names explicit.
11. Avoid introducing abstractions before they are needed.

---

# New Projects

For a new Next.js project:

- use App Router
- use Tailwind CSS
- configure Redux Toolkit
- configure Vitest
- configure React Testing Library
- configure Playwright
- configure linting
- establish useful path aliases
- create only necessary directories
- keep Server Components as the default
- create a clear README
- avoid empty architecture folders
- avoid unnecessary dependencies

---

# Junior-Friendly Development Rules

Always ask:

"Can a junior developer understand this file without knowing hidden architectural conventions?"

Prefer explicit code.

Prefer:

```ts
const product = await getProduct(productId);

if (!product) {
  return null;
}

return product;
```

over clever compressed expressions.

Avoid:

- excessive abstractions
- unnecessary generics
- complex type tricks
- deeply nested callbacks
- deeply nested conditions
- complicated ternaries
- hidden side effects
- unnecessary factories
- unnecessary inheritance
- excessive indirection
- premature reusable frameworks

A small amount of duplication is better than a confusing abstraction.

Refactor duplication when a clear reusable concept actually emerges.

---

# Final Decision Rule

When multiple implementations are valid, prefer the one that is:

1. simplest
2. easiest to read
3. easiest to test
4. easiest to debug
5. easiest to extend
6. easiest for a junior developer to understand

Do not optimize for impressive architecture.

Optimize for clarity, predictability, and maintainability.