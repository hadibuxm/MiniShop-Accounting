# Feature Requirements Document
## Mini Shop Accounting
### Feature ID: b5d0360d-6efb-4a25-921d-7e35ca0a9897

---

## Feature Requirements

### 1. Authentication

**Description:**
A single shop owner can register and log in to the web app using an email and password. The session is maintained via an `httpOnly` cookie containing a signed JWT and persists until the owner explicitly logs out.

**1.1 Registration**

- The registration form collects: `full_name`, `shop_name`, `email`, and `password`.
- On successful registration:
  - The password is hashed with bcrypt (minimum cost factor 12) before storage.
  - All pre-built categories (see Section 3) are seeded for the new user within the same database transaction.
  - The server sets an `httpOnly`, `Secure`, `SameSite=Strict` cookie named `auth_token` containing a signed JWT.
  - The owner is redirected to `/dashboard`.
- Acceptance Criteria:
  - [ ] `POST /api/auth/register` accepts `{ full_name, shop_name, email, password }` and returns `201` on success.
  - [ ] Password shorter than 8 characters is rejected with `400` and inline error: `"Password must be at least 8 characters and contain at least one number" / "پاس ورڈ کم از کم 8 حروف پر مشتمل ہو اور کم از کم ایک نمبر ہو"`.
  - [ ] Password without at least one numeric character is rejected with the same error.
  - [ ] Duplicate email is rejected with `409` and inline error in both languages.
  - [ ] On success, `auth_token` cookie is set; response body includes `{ user: { id, full_name, shop_name, email } }`.
  - [ ] All 8 pre-built categories are present in the `categories` table for the new `user_id` after registration.

**1.2 Login**

- The login form collects: `email` and `password`.
- On successful login the server sets the `auth_token` cookie (same flags as above).
- Acceptance Criteria:
  - [ ] `POST /api/auth/login` accepts `{ email, password }` and returns `200` on success with same user payload as registration.
  - [ ] Invalid email or password returns `401` with inline error: `"Invalid email or password / ای میل یا پاس ورڈ غلط ہے"`.
  - [ ] Inline error is displayed beneath the form, not via alert/toast.
  - [ ] On success the `auth_token` cookie is set and the owner is redirected to `/dashboard`.

**1.3 Session Persistence & Logout**

- All API routes except `POST /api/auth/register` and `POST /api/auth/login` require a valid `auth_token` cookie. Missing or invalid token returns `401`.
- All frontend routes except `/login` and `/register` check for an authenticated session on load. Unauthenticated users are redirected to `/login`.
- Acceptance Criteria:
  - [ ] Reloading any authenticated page does not log the user out.
  - [ ] `POST /api/auth/logout` clears the `auth_token` cookie and returns `200`.
  - [ ] After logout, navigating to `/dashboard` or any protected route redirects to `/login`.
  - [ ] Expired JWT (default expiry: 7 days) redirects the user to `/login` on next authenticated request.

---

### 2. Dashboard

**Description:**
Upon login, the owner sees a home screen summarising the shop's financial position for the current day and current month. Data reflects changes immediately after a transaction is added or modified without a full page reload.

**2.1 Summary Cards**

Six cards are displayed in the following order:

| Card | Value |
|---|---|
| Today's Total Income | Sum of `amount` where `type = 'income'` and `date = today` |
| Today's Total Expenses | Sum of `amount` where `type = 'expense'` and `date = today` |
| Today's Net Balance | Today's Income − Today's Expenses |
| Current Month's Total Income | Sum of `amount` where `type = 'income'` and `date` within current calendar month |
| Current Month's Total Expenses | Sum of `amount` where `type = 'expense'` and `date` within current calendar month |
| Current Month's Net Balance | Month Income − Month Expenses |

- Acceptance Criteria:
  - [ ] All six cards are rendered on `/dashboard`.
  - [ ] All monetary values are formatted as `PKR X,XX,XXX` using Pakistani lakh-crore comma formatting (e.g. `PKR 1,25,000`).
  - [ ] Net Balance cards show a negative value prefixed with `−` when expenses exceed income; no colour requirement beyond the label.
  - [ ] Card headings are displayed bilingually (Urdu + English) as specified in Section 6.
  - [ ] `GET /api/dashboard/summary` returns `{ today: { income, expenses, net }, month: { income, expenses, net } }`.

**2.2 Recent Transactions List**

- Displays the 5 most recent transactions for the authenticated owner, sorted by `date` descending, then `created_at` descending.
- Each row shows: `date`, `type` badge, `category name`, `payment_method`, `amount (PKR)`, `description` (truncated to 40 characters).
- Acceptance Criteria:
  - [ ] Exactly 5 rows are shown; fewer if fewer than 5 transactions exist.
  - [ ] `type` badge is green for `income`, red for `expense`.
  - [ ] `GET /api/dashboard/recent` returns the 5 records with the above fields.
  - [ ] A "View All" link navigates to `/transactions`.

**2.3 Real-Time State Update**

- After a transaction is successfully created, edited, or deleted (from any page), the dashboard summary cards and recent transactions list are re-fetched and re-rendered without a full page reload.
- Acceptance Criteria:
  - [ ] Dashboard summary values update within 500 ms of a successful transaction mutation without a browser refresh.
  - [ ] Implementation uses client-side re-fetch (e.g. React Query invalidation or SWR revalidation) — no WebSocket or SSE required.

---

### 3. Chart of Accounts (Categories)

**Description:**
The app ships with a pre-built set of income and expense categories seeded on registration. The owner can add custom categories and rename any category.

**3.1 Seeded Pre-Built Categories**

Seeded with `is_default = true` for every new user at registration time:

| Name | Type |
|---|---|
| Sales Revenue | income |
| Other Income | income |
| Rent | expense |
| Salaries & Wages | expense |
| Utilities (Bijli/Gas/Paani) | expense |
| Inventory / Stock Purchase | expense |
| Transport | expense |
| Miscellaneous | expense |

- Acceptance Criteria:
  - [ ] All 8 categories above exist in `categories` for the user immediately after registration, with `is_default = true`.
  - [ ] Seeding runs inside the same DB transaction as user creation; if seeding fails, the user record is rolled back.

**3.2 Custom Category Creation**

- Form fields: `name` (text, required), `type` (dropdown: Income / Expense, required).
- Acceptance Criteria:
  - [ ] `POST /api/categories` creates a category with `is_default = false` and returns `201`.
  - [ ] Duplicate `(user_id, name, type)` is rejected with `409` and inline error: `"A category with this name already exists / اس نام کی کیٹیگری پہلے سے موجود ہے"`.
  - [ ] Empty `name` is rejected with inline validation error in both languages.

**3.3 Rename Category**

- Any category (pre-built or custom) can be renamed.
- Acceptance Criteria:
  - [ ] `PUT /api/categories/:id` accepts `{ name }` and returns `200` with updated record.
  - [ ] Rename to a name that already exists for the same user and type is rejected with `409`.
  - [ ] Empty name is rejected with inline validation error.

**3.4 Delete Category**

- Acceptance Criteria:
  - [ ] `DELETE /api/categories/:id` returns `204` if the category has zero linked transactions.
  - [ ] If the category has one or more linked transactions, `DELETE /api/categories/:id` returns `409` with error: `"Cannot delete a category with existing transactions / اس کیٹیگری میں ٹرانزیکشنز موجود ہیں، حذف نہیں کی جا سکتی"`.
  - [ ] The delete button in the UI shows a confirmation dialog before calling the API.

**3.5 Category List Display**

- The category management page (`/categories`) lists all categories grouped by type (Income, Expense).
- Pre-built category names are displayed with both their English name and a fixed Urdu translation label. Custom category names are displayed as entered (no auto-translation).
- Pre-built Urdu display labels:

| English Name | Urdu Label |
|---|---|
| Sales Revenue | فروخت آمدنی |
| Other Income | دیگر آمدنی |
| Rent | کرایہ |
| Salaries & Wages | تنخواہیں |
| Utilities (Bijli/Gas/Paani) | بجلی / گیس / پانی |
| Inventory / Stock Purchase | اسٹاک خریداری |
| Transport | ٹرانسپورٹ |
| Miscellaneous | متفرق |

- Acceptance Criteria:
  - [ ] `/categories` page renders all categories for the authenticated user.
  - [ ] Pre-built categories show both English and Urdu labels as per the table above.
  - [ ] Each row has Rename and Delete action buttons.

---

### 4. Transaction Management

**Description:**
The owner can record, edit, and delete income and expense transactions. The transactions list is paginated, filterable, and sortable.

**4.1 Add Transaction**

- The "Add Transaction" button is accessible from both `/dashboard` and `/transactions`.
- Form fields:

| Field | Input Type | Constraints |
|---|---|---|
| `date` | Date picker | Required; defaults to today; future dates disabled |
| `type` | Dropdown | Required; values: Income / Expense |
| `amount` | Numeric input | Required; positive decimals only; step 0.01 |
| `category_id` | Dropdown | Required; filtered to selected `type` |
| `payment_method` | Dropdown | Required; values: Cash, Bank Transfer, JazzCash, EasyPaisa |
| `description` | Text area | Optional; max 255 characters |

- Acceptance Criteria:
  - [ ] `POST /api/transactions` accepts all fields and returns `201` with the created transaction record.
  - [ ] Submitting with any required field empty displays an inline validation error in both Urdu and English beneath that field.
  - [ ] Amount field rejects non-numeric input and values ≤ 0 with inline error.
  - [ ] Future date selection is disabled in the date picker and rejected server-side with `400`.
  - [ ] `category_id` dropdown updates dynamically when `type` changes, showing only categories of the matching type.
  - [ ] On successful save, the transaction list on the current page updates without a full page reload and the form closes.

**4.2 Edit Transaction**

- Acceptance Criteria:
  - [ ] Each transaction row has an Edit button that opens the same form pre-populated with the transaction's existing values.
  - [ ] `PUT /api/transactions/:id` accepts any subset of fields and returns `200` with the updated record.
  - [ ] Same validation rules as Add apply.
  - [ ] Attempting to edit a transaction belonging to a different `user_id` returns `403`.

**4.3 Delete Transaction**

- Acceptance Criteria:
  - [ ] Each transaction row has a Delete button.
  - [ ] Clicking Delete opens a confirmation dialog: `"Are you sure you want to delete this transaction? / کیا آپ واقعی اس ٹرانزیکشن کو حذف کرنا چاہتے ہیں؟"`.
  - [ ] On confirmation, `DELETE /api/transactions/:id` is called and returns `204`.
  - [ ] The deleted transaction is removed from the list without a full page reload.
  - [ ] Attempting to delete a transaction belonging to a different `user_id` returns `403`.

**4.4 Transactions List**

- Route: `/transactions`
- Default sort: `date` descending, then `created_at` descending.
- Paginated at 20 records per page.
- Each row displays: `date`, `type` badge (green = income, red = expense), `category name`, `payment_method`, `amount (PKR formatted)`, `description` (truncated to 40 characters).
- Acceptance Criteria:
  - [ ] `GET /api/transactions?page=&limit=20&sort=date_desc` returns paginated results with `{ data, total, page, totalPages }`.
  - [ ] Pagination controls (Previous / Next, page number) are rendered and functional.
  - [ ] Filter controls are present for: date range (`date_from`, `date_to`), `type`, `category_id`, `payment_method`.
  - [ ] Applying any filter calls the API with the corresponding query parameters and updates the list without a full page reload.
  - [ ] `GET /api/transactions` with filter params returns only matching records.
  - [ ] Clearing filters restores the unfiltered paginated list.
  - [ ] Empty state message when no records match: `"Koi record nahi mila / No records found"`.

---

### 5. Reports

**Description:**
The owner can generate three report types. All reports are viewable in-browser and exportable as PDF. PDF generation is handled server-side via Puppeteer to ensure correct RTL and Urdu font rendering.

**5.1 Daily Summary Report**

- Route: `/reports/daily`
- Input: single date selector.
- Report content: Total Income, Total Expenses, Net Balance, full list of transactions for that day (date, category, payment method, amount, description).
- Acceptance Criteria:
  - [ ] `GET /api/reports/daily?date=YYYY-MM-DD` returns `{ date, total_income, total_expenses, net_balance, transactions[] }`.
  - [ ] Report renders all fields listed above in the browser view.
  - [ ] Net Balance displayed in green if ≥ 0, red if < 0.

**5.2 Monthly Profit & Loss Report**

- Route: `/reports/monthly`
- Input: month selector (month + year).
- Report content: Total Income, Total Expenses, Net Profit/Loss, category-wise income breakdown (category name + total), category-wise expense breakdown (category name + total).
- Acceptance Criteria:
  - [ ] `GET /api/reports/monthly?year=YYYY&month=MM` returns `{ year, month, total_income, total_expenses, net, income_by_category[], expense_by_category[] }`.
  - [ ] `income_by_category` and `expense_by_category` each contain `{ category_name, total }`.
  - [ ] Net Profit label and value are displayed in green; Net Loss label and value are displayed in red.

**5.3 Custom Date Range Report**

- Route: `/reports/custom`
- Input: `start_date` and `end_date` date selectors.
- Report content: Total Income, Total Expenses, Net Balance, category-wise income breakdown, category-wise expense breakdown.
- Acceptance Criteria:
  - [ ] `GET /api/reports/custom?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` returns same shape as Monthly report but scoped to the date range.
  - [ ] If `end_date < start_date`, API returns `400` and the UI shows inline error: `"End date cannot be before start date / اختتامی تاریخ شروعاتی تاریخ سے پہلے نہیں ہو سکتی"`.

**5.4 General Report Rules**

- Acceptance Criteria:
  - [ ] All three report pages render in-browser without downloading.
  - [ ] Each report page has an "Export PDF" button.
  - [ ] Clicking "Export PDF" calls `POST /api/reports/pdf` with `{ report_type, params }` and receives a binary PDF response downloaded by the browser.
  - [ ] Generated PDF includes: shop name, owner name, date range, and all report data visible in the browser view.
  - [ ] PDF is rendered server-side via Puppeteer using the same HTML/CSS template as the browser view.
  - [ ] All report labels are bilingual (Urdu + English) and respect the active language direction.
  - [ ] When a report period has zero transactions, the in-browser view and PDF both display: `"Is muddat mein koi record nahi mila / No records found for this period"`.

---

### 6. Localisation (Urdu + English)

**Description:**
All authenticated screens support bilingual display. The user can toggle between English (LTR) and Urdu (RTL) at any time. Language preference is persisted in both `localStorage` and the `users` table.

**6.1 Language Toggle**

- A toggle button labelled `EN / اردو` is present in the top navigation bar on all authenticated pages.
- Acceptance Criteria:
  - [ ] Toggle is visible on every authenticated page in the top navigation bar.
  - [ ] Clicking the toggle switches the active language instantly without a page reload.
  - [ ] All UI text — labels, headings, button text, error messages, placeholder text, empty state messages — switches language on toggle.

**6.2 RTL / LTR Layout**

- Acceptance Criteria:
  - [ ] When Urdu is active, `<html dir="rtl">` is set and the layout mirrors correctly (navigation, forms, tables, cards).
  - [ ] When English is active, `<html dir="ltr">` is set.
  - [ ] No text or UI element is clipped or overlaps due to direction change.

**6.3 Urdu Font**

- Acceptance Criteria:
  - [ ] Urdu text is rendered using Jameel Noori Nastaleeq or Noto Nastaliq Urdu (loaded via self-hosted font files or Google Fonts CDN).
  - [ ] Urdu font is applied via a CSS rule scoped to `[lang="ur"]` or `[dir="rtl"]` so it does not affect English text.
  - [ ] Urdu font renders correctly in the Puppeteer-generated PDF.

**6.4 Persistence**

- Acceptance Criteria:
  - [ ] Selected language is written to `localStorage` key `lang` (`"en"` or `"ur"`) on every toggle.
  - [ ] On app load, `localStorage` is read first; if absent, `users.language_preference` from the authenticated session is used as the default.
  - [ ] On every toggle, `PATCH /api/users/language` is called with `{ language_preference: "en" | "ur" }` to sync the DB column.
  - [ ] `PATCH /api/users/language` returns `200` on success; failure is silent to the user (does not interrupt the toggle).

**6.5 Monetary Values**

- Acceptance Criteria:
  - [ ] All monetary values display the `PKR` prefix in both languages.
  - [ ] Comma formatting follows the Pakistani lakh-crore system (e.g. `PKR 12,50,000`) in both languages.

---

## Data & Entities

### `users`

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `full_name` | VARCHAR(100) | Required, not null |
| `shop_name` | VARCHAR(150) | Required, not null |
| `email` | VARCHAR(255) | Required, not null, unique |
| `password_hash` | VARCHAR(255) | Required, not null; bcrypt, cost factor 12 |
| `language_preference` | ENUM('en','ur') | Not null, default `'en'` |
| `created_at` | TIMESTAMP | Auto, default `NOW()` |
| `updated_at` | TIMESTAMP | Auto, updated on every write |

### `categories`

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `user_id` | UUID | FK → `users.id`, ON DELETE CASCADE, not null |
| `name` | VARCHAR(100) | Required, not null |
| `type` | ENUM('income','expense') | Required, not null |
| `is_default` | BOOLEAN | Not null, default `false` |
| `created_at` | TIMESTAMP | Auto, default `NOW()` |
| `updated_at` | TIMESTAMP | Auto, updated on every write |

Unique constraint: `(user_id, name, type)`.

### `transactions`

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `user_id` | UUID | FK → `users.id`, ON DELETE CASCADE, not null |
| `category_id` | UUID | FK → `categories.id`, ON DELETE RESTRICT, not null |
| `type` | ENUM('income','expense') | Required, not null |
| `amount` | DECIMAL(12,2) | Required, not null, CHECK > 0 |
| `date` | DATE | Required, not null, CHECK ≤ CURRENT_DATE |
| `payment_method` | ENUM('cash','bank_transfer','jazzcash','easypaisa') | Required, not null |
| `description` | VARCHAR(255) | Nullable |
| `created_at` | TIMESTAMP | Auto, default `NOW()` |
| `updated_at` | TIMESTAMP | Auto, updated on every write |

Index: `(user_id, date)` for dashboard and report queries.
Index: `(user_id, type)` for filter queries.

---

## Dependencies

| Dependency | Version Guidance | Purpose |
|---|---|---|
| PostgreSQL | v14+ | Primary relational database |
| Next.js | v14+ (App Router) | Frontend framework and API routes scaffold |
| Node.js / Express | v20+ / v4+ | REST API backend |
| bcrypt | v5+ | Password hashing (cost factor 12) |
| jsonwebtoken | v9+ | JWT signing and verification |
| `httpOnly` cookie middleware (e.g. `cookie-parser`) | — | Secure cookie handling in Express |
| Puppeteer | v21+ | Server-side PDF generation with RTL and Urdu font support |
| i18next + react-i18next | v23+ / v13+ | Bilingual UI, RTL/LTR switching, translation key management |
| Jameel Noori Nastaleeq or Noto Nastaliq Urdu font | — | Urdu Nastaliq text rendering in UI and PDF |
| React Query (TanStack Query) | v5+ | Client-side data fetching, cache invalidation for real-time dashboard updates |
| Zod | v3+ | Runtime request validation on API routes |
| pg / node-postgres | v8+ | PostgreSQL client for Node.js |

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
- Mobile native app (iOS / Android)
- SMS or email notifications
- Import / export of existing data from Excel or third-party systems
- Multi-shop or multi-branch support
- Subscription or billing management
- Auto-translation of custom category names to Urdu
- WebSocket or SSE-based real-time sync across multiple browser tabs
- Client-side PDF generation (all PDF export is server-side via Puppeteer)