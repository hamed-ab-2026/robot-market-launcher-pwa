# Frontend Architecture Guide

## Objective

You are working on a React frontend project. Before implementing new features or refactoring existing code, follow this document as the main architecture guideline.

The goal is to build a scalable, maintainable, production-ready frontend application suitable for a team environment.

---

# Technology Stack

The project must use:

- React
- TypeScript
- Redux Toolkit
- Axios
- Tailwind CSS
- Ant Design (UI Components)

Do not introduce alternative libraries unless explicitly requested.

---

# Architecture Pattern

Use:

## Feature-Based Architecture

Organize the project by business features instead of technical layers.

Avoid structures like:

```
src/
 ├── components/
 ├── pages/
 ├── services/
 ├── utils/
```

for the whole application because they become difficult to maintain as the project grows.

Use:

```
src/

├── app/
│   ├── router/
│   ├── store/
│   ├── providers/
│   └── config/
│
├── assets/
│
├── components/
│   ├── ui/
│   ├── common/
│   └── layouts/
│
├── features/
│   ├── auth/
│   ├── users/
│   ├── products/
│   └── ...
│
├── services/
│   ├── api/
│   └── storage/
│
├── hooks/
│
├── utils/
│
├── types/
│
├── styles/
│
├── App.tsx
└── main.tsx
```

---

# Feature Structure

Each business feature should be isolated.

Example:

```
features/auth/

├── api/
│   └── auth.api.ts
│
├── components/
│   └── LoginForm.tsx
│
├── hooks/
│   └── useLogin.ts
│
├── store/
│   └── auth.slice.ts
│
├── types.ts
│
├── validation.ts
│
└── index.ts
```

A feature should contain everything related to that domain.

Examples:

```
features/

auth
users
companies
machines
inventory
sales
payments
reports
settings
```

---

# Component Rules

## Shared Components

Reusable UI components belong here:

```
components/ui/

Button
Input
Modal
Table
Dropdown
Form
```

These components must not contain business logic.

Example:

Good:

```
components/ui/Button.tsx
```

Bad:

```
components/ui/ProductButton.tsx
```

Business-specific components belong inside their feature:

```
features/products/components/ProductCard.tsx
```

---

# API Layer

All API communication must use Axios.

Never call Axios directly inside React components.

Bad:

```tsx
function Users(){

 axios.get("/users")

}
```

Good:

```
Component
    |
Hook
    |
API Service
    |
Axios Client
```

Example:

```
services/api/

axios.ts
client.ts
interceptors.ts
```

Feature API:

```
features/users/api/user.api.ts
```

---

# Redux Toolkit Rules

Use Redux Toolkit for global application state.

Structure:

```
app/store/

store.ts
rootReducer.ts
```

Feature-specific state:

```
features/auth/store/

auth.slice.ts
auth.selector.ts
```

Do not put local component state into Redux.

Use:

- useState → local UI state
- Redux Toolkit → global application state

---

# TypeScript Rules

The project must be strongly typed.

Avoid:

```ts
any
```

Prefer:

```ts
interface
type
generics
unknown
```

Each feature should define its own types:

Example:

```
features/users/types.ts
```

---

# Tailwind CSS Rules

Use Tailwind for:

- Layout
- Spacing
- Responsive design
- Custom styling

Example:

```tsx
<div className="flex items-center gap-4">
```

Avoid creating unnecessary CSS files.

---

# Ant Design Rules

Use Ant Design for complex UI components:

Examples:

- Tables
- Forms
- Modals
- Date Pickers
- Dropdowns
- Notifications

Customize styling using Tailwind where possible.

Do not replace Ant Design components with custom components unless necessary.

---

# Data Flow Pattern

Follow this pattern:

```
Page
 |
Feature Component
 |
Custom Hook
 |
API Layer
 |
Axios
 |
Backend
```

Example:

```
UserPage.tsx

        |
        v

useUsers()

        |
        v

user.api.ts

        |
        v

axios client
```

---

# Coding Rules

## Single Responsibility

Each file should have one responsibility.

Avoid:

```
User.tsx

- UI
- API
- validation
- state
```

Prefer:

```
UserCard.tsx
user.api.ts
useUser.ts
user.validation.ts
```

---

## Dependency Rules

Features should not directly depend on each other.

Avoid:

```
features/products
        |
        v
features/auth
```

Shared logic belongs in:

```
components/
services/
utils/
```

or

```
app/
```

---

# Refactoring Instructions

When refactoring an existing project:

1. Analyze current structure.
2. Do not blindly rewrite everything.
3. Move files gradually into the Feature Architecture.
4. Keep existing functionality working.
5. Improve:
   - Type safety
   - Code separation
   - API management
   - State management
   - Component reuse

---

# Final Architecture Goal

The final project should be:

- Scalable
- Team-friendly
- Easy to test
- Easy to maintain
- Ready for future features
- Following professional React production standards

Always prioritize clean architecture over quick implementation.