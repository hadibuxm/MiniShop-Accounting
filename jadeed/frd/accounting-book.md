# Feature Requirements Document (FRD)
## Feature: Accounting Book
### Web App for Local Shop Owners — Pakistan

---

## Feature Requirements

### 1. Authentication

**Description:**
A single shop owner can register and log in to the app using an email and password. The session persists until the owner explicitly logs out.

**Acceptance Criteria:**
- [ ] Owner can register with: full name, shop name, email, and password.
- [ ] Password must be minimum 8 characters, containing at least one number.
- [ ] Owner can log in with email and password.
- [ ] Invalid credentials display an inline error message in both Urdu and English.
- [ ] Authenticated session persists across browser refreshes (via JWT stored in httpOnly cookie or localStorage).
- [ ] Owner can log out; session is invalidated immediately.
- [ ] All routes except `/login` and `/register` are protected and redirect unauthenticated users to `/login`.

---

### 2. Dashboard

**Description:**
Upon login, the owner sees a home dashboard summarising the shop's financial position for the current day and current month.

**Acceptance Criteria:**
- [ ] Dashboard displays the following cards:
  - Today's Total Income (PKR)
  - Today's Total Expenses (PKR)
  - Today's Net Balance (Income − Expenses)
  - Current Month's Total Income (PKR)
  - Current Month's Total Expenses (PKR)
  - Current Month's Net Balance
- [ ] All monetary values are displayed in PKR with comma-separated formatting (e.g. PKR 1,25,000).
- [ ] Dashboard displays the 5 most recent transactions in a summary list (date, type, amount, category).
- [ ] All labels and headings on the dashboard are displayed in both Urdu and English (bilingual).
- [ ] Dashboard data updates in real time upon adding a new transaction without requiring a full page reload.

---

### 3. Chart of Accounts (Categories)

**Description:**
The app ships with a pre-built set of income and expense categories. The owner can add custom categories and rename existing ones.

**Acceptance Criteria:**

**Pre-built Income Categories (seeded on registration):**
- Sales Revenue
- Other Income

**Pre-built Expense Categories (seeded on registration):**
- Rent
- Salaries & Wages
- Utilities (Bijli/Gas/Paani)
- Inventory / Stock Purchase
- Transport
- Miscellaneous

- [ ] All pre-built categories are seeded automatically when a new owner account is created.
- [ ] Owner can create a new custom category by providing a name and selecting type (Income or Expense).
- [ ] Owner can rename any category (pre-built or custom).
- [ ] Owner cannot delete a category that has transactions linked to it; an error message is shown.
- [ ] Owner can delete a category that has no linked transactions.
- [ ] Category names must be unique per owner per type (Income/Expense); duplicate names are rejected with an inline error.
- [ ] Category list is displayed in both Urdu and English labels where pre-built.

---

### 4. Transaction Management (Income & Expense Recording)

**Description:**
The core feature. The shop owner can record, edit, and delete income and expense transactions.

**Fields per Transaction:**
| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | Auto-generated |
| `date` | Date | Required; defaults to today; cannot be a future date |
| `type` | Enum | Required; values: `income` or `expense` |
| `amount` | Decimal (10,2) | Required; must be > 0; in PKR |
| `category_id` | FK → Category | Required |
| `payment_method` | Enum | Required; values: `cash`, `bank_transfer`, `jazzcash`, `easypaisa` |
| `description` | String (255) | Optional; free text notes |
| `created_at` | Timestamp | Auto-set on creation |
| `updated_at` | Timestamp | Auto-set on update |

**Acceptance Criteria:**
- [ ] Owner can open a "Add Transaction" form from the dashboard and the transactions list page.
- [ ] Form contains all fields listed above with proper input types (date picker, dropdown for type/category/payment method, numeric input for amount).
- [ ] Submitting the form with any required field empty shows an inline validation error in Urdu and English.
- [ ] Amount field only accepts positive numeric values; non-numeric input is rejected.
- [ ] On successful save, the transaction appears immediately in the transactions list.
- [ ] Owner can edit any previously saved transaction; all fields are editable.
- [ ] Owner can delete a transaction; a confirmation dialog is shown before deletion.
- [ ] Transactions list is paginated at 20 records per page, sorted by date descending by default.
- [ ] Transactions list can be filtered by: date range, type (income/expense), category, and payment method.
- [ ] Transactions list displays: date, type badge (colour-coded: green for income, red for expense), category, payment method, amount (PKR), and description snippet.

---

### 5. Reports

**Description:**
The owner can generate three report types to understand financial performance.

#### 5a. Daily Summary Report
- [ ] Owner selects a specific date; report shows total income, total expenses, net balance, and all transactions for that day.

#### 5b. Monthly Profit & Loss Report
- [ ] Owner selects a month and year; report shows:
  - Total Income
  - Total Expenses
  - Net Profit / Loss (Income − Expenses)
  - Category-wise income breakdown (category name, total amount)
  - Category-wise expense breakdown (category name, total amount)
- [ ] Net Profit is displayed in green; Net Loss is displayed in red.

#### 5c. Custom Date Range Report
- [ ] Owner selects a start date and end date; report shows total income, total expenses, net balance, and category-wise breakdown for the selected range.
- [ ] End date must not be before start date; validation error shown if violated.

**General Report Acceptance Criteria:**
- [ ] All reports are viewable in-browser.
- [ ] Each report can be exported as a **PDF** with shop name, date range, and all report data included.
- [ ] Report labels are bilingual (Urdu + English).
- [ ] Reports with zero transactions display an empty state message: "Is muddat mein koi record nahi mila / No records found for this period."

---

### 6. Localisation (Urdu + English)

**Description:**
The app supports bilingual display — Urdu and English — throughout all screens.

**Acceptance Criteria:**
- [ ] A language toggle (EN / اردو) is present in the top navigation bar on all authenticated pages.
- [ ] Switching language updates all UI labels, headings, button text, error messages, and placeholder text instantly without a page reload.
- [ ] Urdu text is rendered in a Nastaliq or Naskh-compatible font (e.g. Jameel Noori Nastaleeq or Noto Nastaliq Urdu).
- [ ] Urdu layout is right-to-left (RTL); English layout is left-to-right (LTR).
- [ ] The selected language preference is saved to localStorage and persists across sessions.
- [ ] Monetary values always display as PKR regardless of selected language.

---

## Data & Entities

### `users`
| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `full_name` | VARCHAR(100) | Required |
| `shop_name` | VARCHAR(150) | Required |
| `email` | VARCHAR(255) | Required, unique |
| `password_hash` | VARCHAR(255) | Required, bcrypt hashed |
| `language_preference` | ENUM('en','ur') | Default: 'en' |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### `categories`
| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `user_id` | UUID | FK → users.id, required |
| `name` | VARCHAR(100) | Required |
| `type` | ENUM('income','expense') | Required |
| `is_default` | BOOLEAN | Default: false; true for seeded categories |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

**Constraints:** `(user_id, name, type)` must be unique.

---

### `transactions`
| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `user_id` | UUID | FK → users.id, required |
| `category_id` | UUID | FK → categories.id, required |
| `type` | ENUM('income','expense') | Required |
| `amount` | DECIMAL(12,2) | Required, > 0 |
| `date` | DATE | Required, ≤ today |
| `payment_method` | ENUM('cash','bank_transfer','jazzcash','easypaisa') | Required |
| `description` | VARCHAR(255) | Nullable |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

## Dependencies

| Dependency | Purpose |
|---|---|
| **PostgreSQL** (or equivalent relational DB) | Persistent data storage for all entities |
| **bcrypt** | Password hashing for authentication |
| **JWT** | Session token generation and validation |
| **PDF generation library** (e.g. jsPDF, Puppeteer, or pdfmake) | Report export to PDF |
| **Urdu font** (Jameel Noori Nastaleeq or Noto Nastaliq Urdu) | Urdu text rendering |
| **i18n library** (e.g. i18next for React, or vue-i18n) | Bilingual UI support with RTL/LTR switching |
| **Frontend framework** (e.g. React, Vue, or Next.js) | Web app UI rendering |
| **REST API backend** (e.g. Node.js/Express or Django) | Business logic and data access layer |

---

## Out of Scope

- Multi-user or staff role management (cashier, accountant, etc.)
- Inventory or stock management
- Customer or supplier management
- Invoicing or receipt generation for customers
- Accounts payable / receivable tracking
- Double-entry bookkeeping or journal entries
- Bank account reconciliation
- Tax calculations (GST, income tax)
- Mobile native app (iOS/Android)
- SMS or email notifications
- Import/export of existing data from Excel or third-party systems
- Multi-shop or multi-branch support
- Subscription or billing management

---