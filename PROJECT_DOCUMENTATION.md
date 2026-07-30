# 📚 LibraryOS — Technical Architecture & Project Documentation
**Client & Developer Reference Manual**  
*Version 1.0.0 | Academic ERP Frontend Solution*

---

## 📋 Table of Contents
1. [Executive Summary & Project Overview](#1-executive-summary--project-overview)
2. [Technology Stack & System Architecture](#2-technology-stack--system-architecture)
3. [Core Data Schemas & Entities](#3-core-data-schemas--entities)
4. [State Management & Hook API Reference (`useLibraryData.js`)](#4-state-management--hook-api-reference-uselibrarydatajs)
5. [Business Logic & Mathematical Models](#5-business-logic--mathematical-models)
6. [User Interface Component Architecture](#6-user-interface-component-architecture)
7. [Responsive Design & Accessibility (WCAG 2.1)](#7-responsive-design--accessibility-wcag-21)
8. [Operations, Deployment & Maintenance](#8-operations-deployment--maintenance)

---

## 1. Executive Summary & Project Overview

### 1.1 Purpose & Vision
**LibraryOS** is a zero-backend, client-side Library Management System (LMS) engineered for academic institutions, university libraries, and departmental resource centers. It delivers an enterprise-grade academic ERP interface with zero external server dependencies, operating entirely via browser storage (`localStorage`) with full data persistence, audit trailing, JSON backup/restore capabilities, and a simulated time engine for testing overdue fine scenarios.

### 1.2 Key Capabilities
- **Book Inventory Management**: Complete CRUD operations, ISBN duplicate prevention, stock availability tracking, genre tagging, book condition monitoring, and custom visual spine color bindings.
- **Borrower Registry**: Student and faculty directory management, status toggles (Active vs. Blocked), historical loan records, and outstanding balance tracking.
- **Lending & Returns Engine**: Book issuance with manual or automatic due dates (default 14 days), real-time check-in processing, and automated fine calculation.
- **Financial & Fine Tracking**: Automated accrued fine previewing ($0.50/day), fine collection, partial/full payment logging, and revenue tracking.
- **Analytics & Reporting**: Real-time KPI stat cards, financial overview, genre distribution metrics, and popular book ranking.
- **Time Simulation Engine**: Hidden Developer Tools toggle panel (`⚙`) enabling instant time advancement (+5/+15 days) to test fine accumulation and notification triggers without waiting weeks.

---

## 2. Technology Stack & System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              BROWSER DOM                               │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           React 18 App (Vite 8)                        │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Navbar & Header Navigation                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                    │                                   │
│  ┌─────────────────────────┬───────┴─────────────────┬──────────────┐  │
│  │ Dashboard / StatCards   │ Book Inventory Catalog  │ Borrower Dir │  │
│  ├─────────────────────────┼─────────────────────────┼──────────────┤  │
│  │ Lending Logs Database   │ Visual Analytics Panel  │ Alert Center │  │
│  └─────────────────────────┴─────────────────────────┴──────────────┘  │
│                                    │                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │         Custom Hook: useLibraryData() [Central Store & Engine]  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        HTML5 LocalStorage Engine                       │
│    KEYS: libraryos_books | libraryos_transactions | libraryos_borrowers│
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Technology Stack Table
| Component | Technology | Purpose |
|---|---|---|
| **Core Framework** | React 18.3.1 | Component-driven UI rendering and virtual DOM reconciliation |
| **Build Tooling** | Vite 8.1.5 | Fast HMR development server and optimized rollup production bundling |
| **Styling Engine** | Tailwind CSS 3.4.1 | Custom design system with academic color tokens (`#FAF9F6`, `#8B0000`, `#2C3E50`) |
| **Iconography** | SVG Custom Icons | Lightweight vector icon set (`Icons.jsx`) |
| **State Persistence** | HTML5 `localStorage` | Client-side database storage across browser sessions |
| **Code Quality** | Oxlint | High-performance JavaScript/React linter |

---

## 3. Core Data Schemas & Entities

The application manages three primary data models stored under designated `localStorage` keys:

### 3.1 Book Schema (`libraryos_books`)
```typescript
interface Book {
  id: string;               // UUID (crypto.randomUUID())
  title: string;            // Book title (trimmed)
  author: string;           // Author full name
  isbn: string;             // Unique ISBN identifier (e.g. "978-0743273565")
  totalCopies: number;      // Total copies owned by the library (>= 1)
  availableCopies: number;  // Currently available copies (0 <= available <= total)
  genre: string;            // 'Literature' | 'Science' | 'History' | 'Social Sciences' | 'Philosophy' | 'General'
  condition: string;        // 'Mint' | 'Good' | 'Worn' | 'Damaged'
  spineColor: string;       // Hex color code (e.g. '#8B0000', '#1B4332') for UI book spine
}
```

### 3.2 Borrower Schema (`libraryos_borrowers`)
```typescript
interface Borrower {
  id: string;               // UUID (crypto.randomUUID())
  studentId: string;        // Unique Student/Member ID (e.g. "STU-2026-001")
  name: string;             // Member full name
  email: string;            // Member institutional email address
  department: string;       // Academic department (e.g. "Computer Science")
  status: 'active' | 'blocked'; // Blocked members cannot borrow new books
}
```

### 3.3 Transaction Schema (`libraryos_transactions`)
```typescript
interface Transaction {
  id: string;               // UUID (crypto.randomUUID())
  bookId: string;           // Foreign Key -> Book.id
  borrowerId: string;       // Foreign Key -> Borrower.id
  borrowerName: string;     // Snapshot of borrower name at issue time
  borrowerEmail: string;    // Snapshot of borrower email at issue time
  issueDate: string;        // ISO 8601 Timestamp (e.g. "2026-07-30T10:00:00.000Z")
  dueDate: string;          // ISO 8601 Timestamp (e.g. "2026-08-13T23:59:59.000Z")
  returnDate: string | null;// ISO 8601 Timestamp when returned, or null if active
  fine: number;             // Settled/paid fine amount in USD (default 0.00)
  status: 'active' | 'returned'; // Loan state
}
```

---

## 4. State Management & Hook API Reference (`useLibraryData.js`)

The `useLibraryData()` custom hook encapsulates the entire business logic, state management, validation rules, data calculations, and storage persistence.

```javascript
import { useLibraryData } from './hooks/useLibraryData';

const lib = useLibraryData();
```

### 4.1 State Definitions
- `books`: Array of `Book` objects initialized from `localStorage` or `SEED_BOOKS`.
- `transactions`: Array of `Transaction` objects initialized from `localStorage`.
- `borrowers`: Array of `Borrower` objects initialized from `localStorage` or `SEED_BORROWERS`.
- `simulatedDaysOffset`: Numeric counter (default `0`) representing simulated time offset in days.

---

### 4.2 Complete Method & API Reference

#### 4.2.1 `getSimulatedNow()`
- **Signature**: `getSimulatedNow(): Date`
- **Description**: Computes the effective system time by adding `simulatedDaysOffset` to the current system clock date.
- **Returns**: A standard JavaScript `Date` object adjusted for simulated offset.

#### 4.2.2 `addBook(data)`
- **Signature**: `addBook(data: Omit<Book, 'id' | 'availableCopies'>): Book`
- **Description**: Validates that `data.isbn` is unique. Creates a new book record with `availableCopies = totalCopies` and prepends it to the `books` array.
- **Throws**: `Error("ISBN already exists in the inventory")` if ISBN matches an existing record.

#### 4.2.3 `updateBook(bookId, updatedData)`
- **Signature**: `updateBook(bookId: string, updatedData: Partial<Book>): void`
- **Description**: Updates book details while verifying ISBN uniqueness against all other books. Ensures `totalCopies` is not reduced below the number of copies currently issued.
- **Throws**: `Error("Total copies cannot be less than currently issued copies (N)")` if invalid.

#### 4.2.4 `deleteBook(bookId)`
- **Signature**: `deleteBook(bookId: string): void`
- **Description**: Removes a book from inventory only if no active loans exist for that book (`totalCopies === availableCopies`).
- **Throws**: `Error("Cannot delete '...' because it is currently issued to a borrower.")` if copies are checked out.

#### 4.2.5 `addBorrower(data)`
- **Signature**: `addBorrower(data: Omit<Borrower, 'id' | 'status'>): Borrower`
- **Description**: Registers a new borrower. Validates that `studentId` is unique (case-insensitive). Sets status to `'active'`.
- **Throws**: `Error("Student ID already exists")` if duplicate.

#### 4.2.6 `updateBorrower(borrowerId, data)`
- **Signature**: `updateBorrower(borrowerId: string, data: Partial<Borrower>): void`
- **Description**: Updates borrower profile information while validating `studentId` uniqueness against other members.

#### 4.2.7 `deleteBorrower(borrowerId)`
- **Signature**: `deleteBorrower(borrowerId: string): void`
- **Description**: Deletes a borrower profile only if they have zero active book loans (`status !== 'returned'`).
- **Throws**: `Error("Cannot delete borrower with active book loans")` if active loans exist.

#### 4.2.8 `toggleBorrowerStatus(borrowerId)`
- **Signature**: `toggleBorrowerStatus(borrowerId: string): void`
- **Description**: Toggles a borrower's account status between `'active'` and `'blocked'`.

#### 4.2.9 `payBorrowerFine(borrowerId, amount, fineSnapshotFn)`
- **Signature**: `payBorrowerFine(borrowerId: string, amount: number, fineSnapshotFn?: Function): void`
- **Description**: Applies a monetary fine payment to a borrower's outstanding balance. For active loans with accruing fines, it snapshots the live preview fine and deducts the payment. For returned loans, it reduces `t.fine`.

#### 4.2.10 `issueBook(bookId, borrowerName, borrowerEmail, customDueDate, borrowerId)`
- **Signature**: `issueBook(bookId: string, borrowerName: string, borrowerEmail: string, customDueDate?: Date, borrowerId?: string): Transaction`
- **Description**:
  1. Checks if the target borrower is blocked. **Throws an explicit Error** if blocked before making state modifications.
  2. Decrements `availableCopies` for the book by 1.
  3. Creates an active transaction record with due date set to `customDueDate` or `today + 14 days`.
  4. Automatically registers a new borrower profile if `borrowerId` is omitted and email doesn't match an existing borrower.

#### 4.2.11 `returnBook(txId)`
- **Signature**: `returnBook(txId: string): { fine: number; overdueDays: number }`
- **Description**: Processes a book check-in:
  1. Calculates overdue days against `getSimulatedNow()`.
  2. Computes final fine ($0.50/day overdue).
  3. Increments book `availableCopies` by 1.
  4. Updates transaction status to `'returned'` and stores `returnDate` and `fine`.

#### 4.2.12 `calcFinePreview(txId)`
- **Signature**: `calcFinePreview(txId: string): { fine: number; overdueDays: number }`
- **Description**: Computes the live preview fine for an active loan without mutating state.
- **Formula**: $F = \max(0, \lfloor(T_{\text{simulated}} - T_{\text{due}}) / 86400000\rfloor \times 0.50)$

#### 4.2.13 `exportData()`
- **Signature**: `exportData(): void`
- **Description**: Generates a formatted JSON file (`libraryos_backup_YYYY-MM-DD.json`) containing all `books`, `transactions`, and `borrowers` and triggers a browser download.

#### 4.2.14 `importData(jsonData)`
- **Signature**: `importData(jsonData: string | object): void`
- **Description**: Parses and validates an uploaded backup file and overwrites local storage state.

#### 4.2.15 `resetAllData()`
- **Signature**: `resetAllData(): void`
- **Description**: Resets all inventory, borrowers, and transactions back to original seed data and resets `simulatedDaysOffset` to 0.

---

## 5. Business Logic & Mathematical Models

### 5.1 Fine Calculation Formula
Fines accrue at a fixed rate of **$0.50 USD per day overdue**.
$$\text{Overdue Days} = \max\left(0, \left\lfloor \frac{T_{\text{simulated}} - T_{\text{due}}}{86400000} \right\rfloor\right)$$
$$\text{Accrued Fine (\$)} = \text{Overdue Days} \times 0.50$$

### 5.2 Blocked Borrower Safety Enforcement
Borrowers with status `'blocked'` are strictly prohibited from checking out new books. The check occurs at the store layer in `issueBook()` before any `availableCopies` reduction:
```javascript
if (borrower.status === 'blocked') {
  throw new Error(`Cannot issue book: Borrower "${borrower.name}" is currently BLOCKED.`);
}
```

---

## 6. User Interface Component Architecture

### 6.1 Navbar (`Navbar.jsx`)
- **Main Bar**: Sticky header featuring academic branding, page navigation links (Dashboard, Books, Borrowers, Transactions, Reports), alert bell, and primary Issue/Return buttons.
- **Hidden Dev Tools Toggle (`⚙`)**: Toggles a collapsible slide-down panel containing system time simulation controls. Features a pulsing red indicator dot whenever simulated time offset is active.

### 6.2 Analytics Dashboard (`StatCards.jsx`)
- Displays real-time library KPIs: Total Books, Available Copies, Active Loans, Total Titles, Registered Borrowers, and Accrued Fines.
- Uses responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).

### 6.3 Book Catalog & Forms (`BookTable.jsx`, `AddBookForm.jsx`, `EditBookModal.jsx`)
- Multi-field live text search (Title, Author, ISBN, Genre).
- Stock status filtering (All, Available, Out of Stock).
- Sorting by Title, Author, Genre, Condition, Total Copies, and Available Copies.
- Spine color preview pill rendering custom hex bindings.

### 6.4 Borrower Management (`BorrowerDirectory.jsx`)
- Member registry table with filter options for Active vs. Blocked borrowers.
- Integrated fine collection form with live balance updates.
- `BorrowerDetailsModal`: Displays member borrowing history, active loan count, and fine breakdown.

### 6.5 Alerts & Notifications (`NotificationCenter.jsx`)
- Header bell dropdown displaying overdue loan alerts.
- Live overdue counter and shortcut trigger to remind borrowers.

### 6.6 Visual Reports (`ReportsPanel.jsx`)
- Financial overview metrics (Fines Paid vs. Pending Accruals).
- Genre distribution progress indicators.
- Popular books ranking based on checkout volume.

---

## 7. Responsive Design & Accessibility (WCAG 2.1)

1. **Touch Target Standard**: All interactive buttons (`.btn-primary`, `.btn-ghost`) and form inputs (`.glass-input`) enforce a minimum tap height of **44px** (`min-height: 2.75rem`).
2. **Adaptive Breakpoints**:
   - `xs` (`< 640px`): Single-column form stacking, compact action buttons, hidden secondary table columns.
   - `sm` (`>= 640px`): 2-column form grids, expanded table headers, modal panel padding `1.5rem`.
   - `lg` (`>= 1024px`): Full multi-column viewports and horizontal control toolbars.
3. **Modal Clipping Prevention**: `modal-backdrop` uses `align-items: flex-start` with top-padding on mobile screens to ensure long forms (such as new borrower registration) remain scrollable without clipping.

---

## 8. Operations, Deployment & Maintenance

### 8.1 Local Setup Instructions
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Execute Oxlint static code analysis
npm run lint

# 4. Build optimized production bundle
npm run build
```

### 8.2 Production Build Output Structure
When `npm run build` is executed, Vite compiles static assets into the `dist/` directory:
- `dist/index.html`: Optimized HTML document entry point.
- `dist/assets/index-[hash].css`: Compiled Tailwind CSS design system bundle (~28 KB).
- `dist/assets/index-[hash].js`: Minified JavaScript React application bundle (~292 KB).

---
*Documentation compiled and verified for LibraryOS v1.0.0.*
