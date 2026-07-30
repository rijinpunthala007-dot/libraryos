import { useState, useEffect, useCallback } from 'react';

const BOOKS_KEY = 'libraryos_books';
const TRANSACTIONS_KEY = 'libraryos_transactions';
const BORROWERS_KEY = 'libraryos_borrowers';

const FINE_RATE = 0.5; // $ per day overdue
const LOAN_DAYS = 14;  // default loan period

function getStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Seed data shown on first load
const SEED_BOOKS = [
  { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', totalCopies: 5, availableCopies: 3, genre: 'Literature', condition: 'Mint', spineColor: '#8B0000' },
  { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061935466', totalCopies: 4, availableCopies: 4, genre: 'Literature', condition: 'Good', spineColor: '#1B4332' },
  { id: '3', title: '1984', author: 'George Orwell', isbn: '978-0451524935', totalCopies: 6, availableCopies: 2, genre: 'Social Sciences', condition: 'Worn', spineColor: '#1E3A8A' },
  { id: '4', title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '978-0141439518', totalCopies: 3, availableCopies: 0, genre: 'Literature', condition: 'Good', spineColor: '#D4A574' },
  { id: '5', title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '978-0316769174', totalCopies: 4, availableCopies: 1, genre: 'Literature', condition: 'Worn', spineColor: '#4B5563' },
];

const SEED_BORROWERS = [
  { id: 'b1', studentId: 'STU-2026-001', name: 'Alice Smith', email: 'alice.smith@university.edu', department: 'Computer Science', status: 'active' },
  { id: 'b2', studentId: 'STU-2026-002', name: 'Bob Johnson', email: 'bob.johnson@university.edu', department: 'Mechanical Engineering', status: 'active' },
  { id: 'b3', studentId: 'STU-2026-003', name: 'Carol Williams', email: 'carol.williams@university.edu', department: 'Literature & Arts', status: 'active' },
  { id: 'b4', studentId: 'STU-2026-004', name: 'David Brown', email: 'david.brown@university.edu', department: 'History & Philosophy', status: 'blocked' },
];

export function useLibraryData() {
  const [books, setBooks] = useState(() => {
    const stored = getStorage(BOOKS_KEY, null);
    if (stored) return stored;
    setStorage(BOOKS_KEY, SEED_BOOKS);
    return SEED_BOOKS;
  });

  const [transactions, setTransactions] = useState(() =>
    getStorage(TRANSACTIONS_KEY, [])
  );

  const [borrowers, setBorrowers] = useState(() => {
    const stored = getStorage(BORROWERS_KEY, null);
    if (stored) return stored;
    setStorage(BORROWERS_KEY, SEED_BORROWERS);
    return SEED_BORROWERS;
  });

  const [simulatedDaysOffset, setSimulatedDaysOffset] = useState(0);

  // Persist to localStorage on change
  useEffect(() => { setStorage(BOOKS_KEY, books); }, [books]);
  useEffect(() => { setStorage(TRANSACTIONS_KEY, transactions); }, [transactions]);
  useEffect(() => { setStorage(BORROWERS_KEY, borrowers); }, [borrowers]);

  // Helper to get simulated "now"
  const getSimulatedNow = useCallback(() => {
    const now = new Date();
    now.setDate(now.getDate() + simulatedDaysOffset);
    return now;
  }, [simulatedDaysOffset]);

  // --- Stats ---
  const stats = {
    totalBooks: books.reduce((s, b) => s + b.totalCopies, 0),
    availableBooks: books.reduce((s, b) => s + b.availableCopies, 0),
    issuedBooks: books.reduce((s, b) => s + (b.totalCopies - b.availableCopies), 0),
    totalTitles: books.length,
    borrowersCount: borrowers.length,
    activeLoansCount: transactions.filter(t => t.status !== 'returned').length,
    finesCollected: transactions.filter(t => t.status === 'returned').reduce((s, t) => s + (t.fine || 0), 0),
    finesPending: transactions.filter(t => t.status !== 'returned').reduce((s, t) => {
      const today = getSimulatedNow();
      const due = new Date(t.dueDate);
      if (today > due) {
        const overdueDays = Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));
        return s + parseFloat((overdueDays * FINE_RATE).toFixed(2));
      }
      return s;
    }, 0)
  };

  // --- Book CRUD ---
  const addBook = useCallback((data) => {
    const isDuplicate = books.some(b => b.isbn.trim() === data.isbn.trim());
    if (isDuplicate) {
      throw new Error("ISBN already exists in the inventory");
    }

    const book = {
      id: crypto.randomUUID(),
      title: data.title.trim(),
      author: data.author.trim(),
      isbn: data.isbn.trim(),
      totalCopies: parseInt(data.totalCopies, 10),
      availableCopies: parseInt(data.totalCopies, 10),
      genre: data.genre || 'Literature',
      condition: data.condition || 'Good',
      spineColor: data.spineColor || '#8B0000',
    };
    setBooks(prev => [book, ...prev]);
    return book;
  }, [books]);

  const deleteBook = useCallback((bookId) => {
    const book = books.find(b => b.id === bookId);
    if (book && book.totalCopies !== book.availableCopies) {
      throw new Error(`Cannot delete "${book.title}" because it is currently issued to a borrower.`);
    }
    setBooks(prev => prev.filter(b => b.id !== bookId));
    setTransactions(prev =>
      prev.filter(t => t.bookId !== bookId)
    );
  }, [books]);

  const updateBook = useCallback((bookId, updatedData) => {
    const isDuplicate = books.some(other => other.id !== bookId && other.isbn.trim() === updatedData.isbn.trim());
    if (isDuplicate) {
      throw new Error("ISBN already exists in the inventory");
    }

    setBooks(prev =>
      prev.map(b => {
        if (b.id !== bookId) return b;

        const newTotal = parseInt(updatedData.totalCopies, 10);
        const issued = b.totalCopies - b.availableCopies;

        if (newTotal < issued) {
          throw new Error(`Total copies cannot be less than currently issued copies (${issued})`);
        }

        const difference = newTotal - b.totalCopies;
        const newAvailable = Math.max(0, b.availableCopies + difference);

        return {
          ...b,
          title: updatedData.title.trim(),
          author: updatedData.author.trim(),
          isbn: updatedData.isbn.trim(),
          totalCopies: newTotal,
          availableCopies: newAvailable,
          genre: updatedData.genre || 'Literature',
          condition: updatedData.condition || 'Good',
          spineColor: updatedData.spineColor || '#8B0000',
        };
      })
    );
  }, [books]);

  // --- Borrowers CRUD ---
  const addBorrower = useCallback((data) => {
    const isDuplicate = borrowers.some(b => b.studentId.trim().toLowerCase() === data.studentId.trim().toLowerCase());
    if (isDuplicate) {
      throw new Error("Student ID already exists");
    }
    const borrower = {
      id: crypto.randomUUID(),
      studentId: data.studentId.trim(),
      name: data.name.trim(),
      email: data.email.trim(),
      department: data.department.trim(),
      status: 'active',
    };
    setBorrowers(prev => [borrower, ...prev]);
    return borrower;
  }, [borrowers]);

  const updateBorrower = useCallback((borrowerId, data) => {
    const isDuplicate = borrowers.some(b => b.id !== borrowerId && b.studentId.trim().toLowerCase() === data.studentId.trim().toLowerCase());
    if (isDuplicate) {
      throw new Error("Student ID already exists");
    }
    setBorrowers(prev =>
      prev.map(b =>
        b.id === borrowerId
          ? { ...b, studentId: data.studentId.trim(), name: data.name.trim(), email: data.email.trim(), department: data.department.trim() }
          : b
      )
    );
  }, [borrowers]);

  const deleteBorrower = useCallback((borrowerId) => {
    const activeLoans = transactions.filter(t => t.borrowerId === borrowerId && t.status !== 'returned');
    if (activeLoans.length > 0) {
      throw new Error("Cannot delete borrower with active book loans");
    }
    setBorrowers(prev => prev.filter(b => b.id !== borrowerId));
    setTransactions(prev => prev.filter(t => t.borrowerId !== borrowerId));
  }, [transactions]);

  const toggleBorrowerStatus = useCallback((borrowerId) => {
    setBorrowers(prev =>
      prev.map(b =>
        b.id === borrowerId
          ? { ...b, status: b.status === 'active' ? 'blocked' : 'active' }
          : b
      )
    );
  }, []);

  const payBorrowerFine = useCallback((borrowerId, amount, fineSnapshotFn) => {
    let remaining = parseFloat(amount);
    setTransactions(prev =>
      prev.map(t => {
        if (t.borrowerId !== borrowerId) return t;
        // Determine the current outstanding fine on this transaction:
        // - For returned loans, t.fine is the stored settled fine.
        // - For active loans, the fine is computed live; we write it back here first.
        const currentFine = t.status === 'returned'
          ? (t.fine || 0)
          : (fineSnapshotFn ? fineSnapshotFn(t.id).fine : (t.fine || 0));
        if (currentFine <= 0) return t;
        const pay = Math.min(currentFine, remaining);
        remaining = parseFloat((remaining - pay).toFixed(2));
        return { ...t, fine: parseFloat((currentFine - pay).toFixed(2)) };
      })
    );
  }, []);

  const resetAllData = useCallback(() => {
    setBooks(SEED_BOOKS);
    setTransactions([]);
    setBorrowers(SEED_BORROWERS);
    setSimulatedDaysOffset(0);
    setStorage(BOOKS_KEY, SEED_BOOKS);
    setStorage(TRANSACTIONS_KEY, []);
    setStorage(BORROWERS_KEY, SEED_BORROWERS);
  }, []);

  // --- Issue Book ---
  const issueBook = useCallback((bookId, borrowerName, borrowerEmail, customDueDate = null, borrowerId = null) => {
    const today = getSimulatedNow();
    const dueDate = customDueDate ? new Date(customDueDate) : (() => {
      const d = new Date(today);
      d.setDate(today.getDate() + LOAN_DAYS);
      return d;
    })();

    let finalBorrowerId = borrowerId;
    let finalName = borrowerName;
    let finalEmail = borrowerEmail;

    if (borrowerId) {
      // Selecting an existing borrower from the directory
      const b = borrowers.find(x => x.id === borrowerId);
      if (!b) throw new Error('Selected borrower not found in the registry.');
      // Fix #2: Check blocked status BEFORE any state mutations
      if (b.status === 'blocked') {
        throw new Error(`Cannot issue book: Borrower "${b.name}" is currently BLOCKED from borrowing.`);
      }
      finalName = b.name;
      finalEmail = b.email;
    } else {
      const existing = borrowers.find(x => x.email.trim().toLowerCase() === borrowerEmail.trim().toLowerCase());
      if (existing) {
        // Fix #2: Check blocked status on matched existing borrower before mutation
        if (existing.status === 'blocked') {
          throw new Error(`Cannot issue book: Borrower "${existing.name}" is currently BLOCKED from borrowing.`);
        }
        finalBorrowerId = existing.id;
        finalName = existing.name;
      } else {
        // Brand-new borrower — create and add
        const newId = crypto.randomUUID();
        const studentId = `STU-GEN-${Math.floor(1000 + Math.random() * 9000)}`;
        const newB = {
          id: newId,
          studentId,
          name: borrowerName.trim(),
          email: borrowerEmail.trim(),
          department: 'General Library User',
          status: 'active',
        };
        setBorrowers(prev => [newB, ...prev]);
        finalBorrowerId = newId;
        // New borrowers are always active — no blocked check needed
      }
    }

    const tx = {
      id: crypto.randomUUID(),
      bookId,
      borrowerId: finalBorrowerId,
      borrowerName: finalName.trim(),
      borrowerEmail: finalEmail.trim(),
      issueDate: today.toISOString(),
      dueDate: dueDate.toISOString(),
      returnDate: null,
      fine: 0,
      status: 'active',
    };

    setBooks(prev =>
      prev.map(b =>
        b.id === bookId
          ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) }
          : b
      )
    );
    setTransactions(prev => [tx, ...prev]);
    return tx;
  }, [getSimulatedNow, borrowers]);

  // --- Return Book ---
  const returnBook = useCallback((txId) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    const today = getSimulatedNow();
    const due = new Date(tx.dueDate);
    const overdueDays = Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));
    const fine = parseFloat((overdueDays * FINE_RATE).toFixed(2));

    setTransactions(prev =>
      prev.map(t =>
        t.id === txId
          ? { ...t, returnDate: today.toISOString(), fine, status: 'returned' }
          : t
      )
    );
    setBooks(prev =>
      prev.map(b =>
        b.id === tx.bookId
          ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) }
          : b
      )
    );

    return { fine, overdueDays };
  }, [transactions, getSimulatedNow]);

  // --- Calculate fine preview for a transaction ---
  const calcFinePreview = useCallback((txId) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.status === 'returned') return { fine: tx?.fine ?? 0, overdueDays: 0 };
    const today = getSimulatedNow();
    const due = new Date(tx.dueDate);
    const overdueDays = Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));
    return { fine: parseFloat((overdueDays * FINE_RATE).toFixed(2)), overdueDays };
  }, [transactions, getSimulatedNow]);

  // --- Import / Export Data ---
  const exportData = useCallback(() => {
    const payload = { books, transactions, borrowers };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `libraryos_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [books, transactions, borrowers]);

  const importData = useCallback((jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (parsed.books && Array.isArray(parsed.books)) {
        setBooks(parsed.books);
      }
      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
      }
      if (parsed.borrowers && Array.isArray(parsed.borrowers)) {
        setBorrowers(parsed.borrowers);
      }
    } catch (err) {
      throw new Error("Failed to parse library backup: " + err.message);
    }
  }, []);

  // --- Active transactions (not returned) ---
  const activeTransactions = transactions.filter(t => t.status !== 'returned');

  // --- Get book by id ---
  const getBook = useCallback((id) => books.find(b => b.id === id), [books]);

  return {
    books,
    transactions,
    borrowers,
    activeTransactions,
    stats,
    addBook,
    deleteBook,
    updateBook,
    addBorrower,
    updateBorrower,
    deleteBorrower,
    toggleBorrowerStatus,
    payBorrowerFine,
    issueBook,
    returnBook,
    calcFinePreview,
    getBook,
    resetAllData,
    exportData,
    importData,
    simulatedDaysOffset,
    setSimulatedDaysOffset,
    getSimulatedNow,
    FINE_RATE,
    LOAN_DAYS,
  };
}
