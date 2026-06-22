# Splentra — Shared Expenses, Simplified.

A full-stack expense splitting web application that allows groups of people to track shared expenses, split costs fairly, and manage debt settlements.

🔗 **Live Demo:** [splentra.netlify.app](https://splentra.netlify.app)

> **Demo Account**
> Email: `demo@splentra.com` | Password: `demo1234`

---

## Screenshots

<img width="1366" height="633" alt="screen1" src="https://github.com/user-attachments/assets/48c14844-c13e-4048-8f02-e26b96b10d57" />
<img width="1346" height="627" alt="screen2" src="https://github.com/user-attachments/assets/b84f4c60-e36c-479e-8522-1c8921391a7f" />
<img width="1348" height="626" alt="screen3" src="https://github.com/user-attachments/assets/cfebd455-4c1e-492b-9d86-d7a6816600f5" />
<img width="1366" height="623" alt="screen4" src="https://github.com/user-attachments/assets/14b6b86a-6e3b-4d12-9898-599ac8e0516c" />

---

## Features

- **Authentication** — Register, login, logout with token-based auth (Laravel Sanctum)
- **Group Management** — Create groups, add/remove members by email, transfer ownership automatically when creator deletes their account
- **Expense Tracking** — Create expenses with category, description, amount, and currency; splits are calculated and assigned automatically
- **Smart Split Logic** — Each member gets an equal share; payer's split is marked as paid immediately; recalculates fairly when members leave
- **Debt Settlement** — Members can mark their own split as paid; payers see full payment status of all splits
- **Privacy-Aware** — Non-payer members see other members' splits but not their payment status
- **Profile Management** — Edit name, email, password; delete account with full cascade handling
- **React Query Caching** — Eliminates unnecessary re-fetching when navigating between pages
- **Responsive Design** — Works on both desktop and mobile

---

## Tech Stack

**Frontend**
- React.js + Vite
- Tailwind CSS
- React Router DOM
- TanStack React Query
- Axios
- Lucide React (icons)
- Sonner (toast notifications)
- shadcn/ui (UI components)

**Backend**
- Laravel 11 (PHP)
- Laravel Sanctum (API authentication)
- MySQL
- Eloquent ORM

**Deployment**
- Frontend: Netlify
- Backend + Database: Railway

---

## Architecture Overview

```
expense-splitter/
├── expense-splitter-api/      # Laravel REST API
│   ├── app/Http/Controllers/  # AuthController, GroupController, ExpenseController
│   │                          # ExpenseSplitController, UserController
│   ├── app/Models/            # User, Group, Expense, ExpenseSplit
│   └── database/migrations/   # Full schema with cascading deletes
│
└── expense-splitter-client/   # React SPA
    ├── src/api/               # Axios instance with auth headers
    ├── src/components/
    │   ├── context/           # AuthContext (token + user state)
    │   └── pages/             # Dashboard, GroupDetail, ExpenseDetail, User
    └── src/main.jsx           # Routes with GuestRoute + ProtectedRoute guards
```

---

## Database Schema

| Table | Key Columns |
|---|---|
| `users` | id, name, email, password |
| `groups` | id, title, created_by (FK → users) |
| `group_user` | user_id (FK), group_id (FK) |
| `expenses` | id, category, description, amount, currency, payer_id (FK → users), group_id (FK → groups) |
| `expense_splits` | id, expense_id (FK), user_id (FK), share_amount, is_paid |

**Cascade rules:**
- Deleting a group → deletes all its expenses and splits
- Deleting an expense → deletes all its splits
- Deleting a user who is a payer → deletes their expenses
- Deleting a user who is a group creator → transfers ownership to the oldest remaining member

---

## API Endpoints

```
POST   /api/register
POST   /api/login
POST   /api/logout

GET    /api/groups
POST   /api/groups
GET    /api/groups/{group}
PUT    /api/groups/{group}
DELETE /api/groups/{group}
POST   /api/groups/{group}/members
DELETE /api/groups/{group}/members/{user}

GET    /api/groups/{group}/expenses
POST   /api/groups/{group}/expenses
GET    /api/expenses/{expense}
PUT    /api/expenses/{expense}
DELETE /api/expenses/{expense}

GET    /api/expenses/{expense}/splits
PUT    /api/expense_splits/{split}

GET    /api/users/search?q={email}
PUT    /api/users/{user}
DELETE /api/users/{user}
```

---

## Local Setup

### Backend

```bash
cd expense-splitter-api
composer install
cp .env.example .env
php artisan key:generate
```

Update `.env` with your local MySQL credentials, then:

```bash
php artisan migrate:fresh --seed
php artisan serve
```

### Frontend

```bash
cd expense-splitter-client
npm install
```

Create `.env`:
```
VITE_BACKEND_URL=http://localhost:8000
```

Then:
```bash
npm run dev
```

---

## What I'd Improve With More Time

- **Real-time updates** — Use Laravel Echo + Pusher so split payment status updates live without refreshing
- **Push notifications** — Notify members when a new expense is added to their group
- **Currency conversion** — Auto-convert amounts when group members use different currencies
- **Expense analytics** — Charts showing spending breakdown by category per group
- **Mobile app** — React Native client consuming the same Laravel API

---

## Author

**Ilyas** — Full-Stack Web Developer (React + Laravel)

[GitHub](https://github.com/ilyas206) · [LinkedIn](https://www.linkedin.com/in/ilyas-ait-idir-5a8536336/) · [Portfolio](https://ilyasaitidir.netlify.app/)
