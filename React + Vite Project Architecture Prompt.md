# React + Vite Project Development Rules

You are working on a production React application.

Your primary goals are:

1. Keep the code simple.
2. Keep the code easy to read.
3. Make the project easy to maintain.
4. Make the project easy to extend.
5. Keep the code understandable for junior developers.
6. Avoid unnecessary architecture and abstraction.

Always prefer the simplest maintainable solution.

Do not introduce Clean Architecture, repositories, use-cases, factories, dependency injection systems, adapters, domain layers, or other architectural abstractions unless they solve a real and current problem in the project.

Do not over-engineer.

---

# Technology Stack

The default project stack is:

- React
- Vite
- JavaScript and TypeScript
- Tailwind CSS
- Redux Toolkit
- Vitest
- React Testing Library
- Playwright

Do not introduce additional dependencies unless they provide clear value.

Before adding a new dependency:

1. Check whether the requirement can reasonably be solved using the existing stack.
2. Prefer built-in React, browser, JavaScript, or TypeScript capabilities.
3. Add a dependency only when it significantly improves maintainability, correctness, or development experience.
4. Briefly explain why the dependency is needed.

Do not introduce schema-validation libraries such as Zod unless explicitly requested.

---

# General Architecture

Use a feature-based structure.

Recommended structure:

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── store.ts
│
├── features/
│   ├── auth/
│   ├── products/
│   ├── users/
│   └── ...
│
├── components/
│   ├── ui/
│   └── layout/
│
├── hooks/
├── lib/
├── config/
├── constants/
├── types/
├── utils/
└── styles/
```

The exact structure may be adjusted when necessary, but keep it simple.

Do not create folders just because an architecture pattern says they should exist.

Create folders only when they contain useful code.

---

# Feature Structure

Keep feature-specific code inside its feature.

Example:

```text
features/
└── products/
    ├── components/
    ├── hooks/
    ├── services/
    ├── store/
    ├── utils/
    ├── types/
    └── tests/
```

Not every feature needs every folder.

For example, do not create:

```text
services/
hooks/
utils/
types/
```

when the feature does not need them.

Start small and create structure only as the feature grows.

---

# Components

Components should be:

- small
- focused
- readable
- easy to test
- easy to reuse when reuse is actually needed

Each component should have one clear responsibility.

Avoid very large components.

If a component performs several unrelated responsibilities, split it into smaller logical components.

However, do not create tiny components without a meaningful reason.

Avoid unnecessary components such as:

```text
PageTitleWrapper
GenericTextContainer
CustomDiv
SectionWrapperContainer
```

unless they provide actual reusable behavior or styling.

---

# Shared Components

Generic reusable UI components belong in:

```text
src/components/ui/
```

Examples:

```text
Button
Input
Select
Modal
Dialog
Table
Badge
Card
Spinner
```

Feature-specific components belong inside the feature.

Example:

```text
features/products/components/ProductCard.tsx
features/products/components/ProductForm.tsx
```

Do not put business-specific components into the global UI folder.

---

# Functions

Functions should be short and focused.

Each function should do one primary thing.

Prefer:

```ts
calculateTotalPrice()
validateProductInput()
createProduct()
formatCurrency()
```

instead of:

```ts
processProductData()
handleEverything()
doStuff()
manageData()
```

Use descriptive function names.

Avoid functions that mix:

- API communication
- UI behavior
- calculations
- storage
- navigation
- state mutation

unless the operation is naturally a small orchestration function.

---

# Function Documentation

Write English documentation comments for important functions.

Each non-trivial function should have a short English comment explaining:

- what the function does
- any important behavior
- important assumptions when necessary

Example:

```ts
/**
 * Calculates the final product price after applying the current discount.
 */
function calculateFinalPrice(price: number, discount: number) {
  return price - discount;
}
```

Do not write comments that simply repeat obvious code.

Bad:

```ts
// Add one to count.
count += 1;
```

Comments should explain intent, business rules, assumptions, or non-obvious behavior.

---

# Naming

Use explicit and descriptive names.

Prefer:

```ts
activeProducts
selectedMachine
isUserAuthenticated
canEditProduct
hasPermission
shouldRefreshData
```

Avoid:

```ts
data
item
x
temp
value2
obj
result2
stuff
```

unless the meaning is obvious from a very small scope.

Boolean names should generally start with:

```text
is
has
can
should
```

Examples:

```ts
isLoading
hasError
canDeleteProduct
shouldShowModal
```

---

# Avoid Deep Nesting

Prefer early returns.

Bad:

```ts
if (user) {
  if (user.isActive) {
    if (user.permissions) {
      if (user.permissions.canEdit) {
        // logic
      }
    }
  }
}
```

Prefer:

```ts
if (!user) return;
if (!user.isActive) return;
if (!user.permissions?.canEdit) return;

// Main logic
```

Keep the main execution path easy to see.

---

# Avoid Magic Values

Do not use unexplained values throughout the code.

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

Use enums, constants, or descriptive variables when they improve readability.

---

# State Management

Use Redux Toolkit as the main global state-management solution.

Do not put every state value into Redux.

Use local component state for local UI behavior.

Use:

```text
useState
```

for things such as:

```text
modal visibility
input state
selected tab
dropdown state
temporary UI state
```

Use Redux Toolkit for state that is shared across multiple parts of the application or represents application-level state.

Examples:

```text
authentication
current user
global application settings
shared feature state
complex cross-page state
```

Keep Redux slices focused.

Recommended:

```text
features/auth/store/authSlice.ts
features/products/store/productSlice.ts
```

Avoid one giant global slice.

---

# Redux Toolkit Rules

Use:

- createSlice
- configureStore
- createAsyncThunk only when appropriate

Do not introduce complex Redux patterns unless needed.

Reducers should remain simple.

Avoid putting UI rendering logic inside Redux.

Avoid putting derived values into state when they can be calculated.

Prefer selectors for derived state.

Example:

```ts
const selectActiveProducts = createSelector(
  [selectProducts],
  (products) => products.filter((product) => product.isActive)
);
```

---

# API Layer

Do not scatter API calls across components.

Keep external communication inside services.

Example:

```text
features/products/services/productService.ts
```

Example:

```ts
/**
 * Retrieves all products from the backend API.
 */
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error("Failed to load products.");
  }

  return response.json();
}
```

Components should not know unnecessary details about API URLs or request configuration.

---

# Error Handling

Handle errors explicitly.

Do not silently ignore errors.

Bad:

```ts
try {
  await saveProduct();
} catch {}
```

Prefer:

```ts
try {
  await saveProduct();
} catch (error) {
  console.error("Failed to save product:", error);
}
```

Provide meaningful error messages to users when appropriate.

Avoid exposing sensitive internal error information to users.

---

# Business Logic

Do not bury important business rules inside JSX.

Bad:

```tsx
{product.enabled &&
 product.stock > 0 &&
 user.permissions.includes("sell") && (
   <SellButton />
 )}
```

Prefer extracting meaningful rules:

```ts
/**
 * Determines whether the current user is allowed to sell this product.
 */
function canSellProduct(product: Product, user: User): boolean {
  return (
    product.enabled &&
    product.stock > 0 &&
    user.permissions.includes("sell")
  );
}
```

Then:

```tsx
{canSellProduct(product, user) && <SellButton />}
```

Keep business rules easy to find and easy to test.

---

# React Hooks

Use hooks only when they make the code simpler.

Do not create custom hooks for trivial one-line operations.

Use custom hooks for reusable stateful behavior.

Examples:

```text
useAuth
useProducts
useDebounce
usePagination
```

Do not create unnecessary wrappers around existing hooks.

---

# useEffect

Do not use `useEffect` for derived values.

Bad:

```ts
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

Prefer:

```ts
const fullName = `${firstName} ${lastName}`;
```

Use `useEffect` mainly for synchronization with external systems such as:

- browser APIs
- subscriptions
- timers
- WebSocket connections
- external libraries
- DOM APIs

Keep effects small and predictable.

Always clean up subscriptions, listeners, intervals, and timers when necessary.

---

# Styling

Use Tailwind CSS.

Keep styling close to components.

Avoid unnecessarily large and unreadable Tailwind class strings.

When a repeated visual pattern becomes meaningful and reusable, extract it into a component.

Do not create abstractions only to shorten Tailwind classes.

Keep responsive behavior simple and predictable.

---

# JavaScript and TypeScript

The project may contain both JavaScript and TypeScript.

For new important modules, prefer TypeScript when practical.

Do not convert existing JavaScript files to TypeScript unless:

- it improves the current task
- the conversion is safe
- it does not unnecessarily increase scope

Avoid `any` in TypeScript when a clear type can be defined.

Keep types close to the feature that owns them.

Shared types should only be global when they are genuinely shared.

---

# Testing

Testing is required for meaningful functionality.

Use:

```text
Vitest
React Testing Library
Playwright
```

Use Vitest for:

- utility functions
- business rules
- reducers
- selectors
- hooks when appropriate

Use React Testing Library for:

- component behavior
- user interactions
- forms
- rendering conditions

Use Playwright for important end-to-end flows.

Examples:

```text
login
create product
edit product
delete product
checkout
critical navigation flows
```

Test behavior, not implementation details.

Do not create tests that simply mirror the source code.

---

# File Size

Keep files reasonably small.

There is no strict line limit.

When a file becomes difficult to understand because it contains several responsibilities, split it.

Do not split files only to satisfy an arbitrary line count.

Readability is more important than file size.

---

# Imports

Prefer simple and consistent import paths.

Use path aliases when configured.

Prefer:

```ts
import { Button } from "@/components/ui/Button";
```

over:

```ts
import { Button } from "../../../../components/ui/Button";
```

Avoid circular dependencies.

---

# Refactoring Existing Code

When refactoring:

1. Understand the current behavior before changing it.
2. Preserve existing functionality unless explicitly asked to change it.
3. Identify large components, duplicated logic, unclear names, deep nesting, and mixed responsibilities.
4. Refactor incrementally.
5. Avoid rewriting the entire project without a strong reason.
6. Do not introduce unnecessary abstractions.
7. Keep the result understandable for junior developers.
8. Update or add tests for changed behavior.
9. Remove dead code when it is safe to do so.
10. Keep public APIs stable when possible.

Prefer several small understandable improvements over one large architectural rewrite.

---

# Creating New Features

When implementing a new feature:

1. Identify the feature boundary.
2. Put feature-specific code inside `features/<feature-name>`.
3. Keep UI components focused.
4. Put API communication in services.
5. Put shared global state in Redux Toolkit only when necessary.
6. Keep local UI state local.
7. Extract important business rules into small testable functions.
8. Add tests.
9. Reuse existing components before creating new ones.
10. Avoid adding dependencies unless justified.

---

# Starting a New Project

When creating a new project:

- use Vite
- use React
- configure Tailwind CSS
- configure Redux Toolkit
- configure Vitest
- configure React Testing Library
- configure Playwright
- establish path aliases
- create only the minimum required folders
- do not create empty architectural layers
- provide a clean README
- provide scripts for linting, testing, development, and production builds

Recommended scripts:

```json
{
  "dev": "vite",
  "build": "vite build",
  "test": "vitest",
  "test:e2e": "playwright test",
  "lint": "eslint ."
}
```

Adjust scripts to match the actual project.

---

# Junior-Friendly Code Rules

Always optimize for clarity.

A junior developer should be able to open a file and understand:

- what the file does
- where data comes from
- what state it uses
- what functions are responsible for
- what happens when the user performs an action

Prefer explicit code over clever code.

Avoid:

- unnecessary generics
- advanced metaprogramming
- hidden side effects
- complex inheritance
- excessive higher-order functions
- excessive abstraction
- deeply nested ternary expressions
- clever one-liners that reduce readability

Prefer:

```ts
if (isLoading) {
  return <Loading />;
}

if (hasError) {
  return <ErrorState />;
}

return <ProductList products={products} />;
```

over compressed expressions that are harder to read.

---

# Final Rule

Whenever multiple solutions are possible, choose the solution that is:

1. easiest to understand
2. easiest to maintain
3. easiest to test
4. easiest to extend
5. least surprising to a junior developer

Do not optimize for architectural sophistication.

Optimize for clarity and long-term maintainability.