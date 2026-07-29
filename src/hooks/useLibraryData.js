import { useState, useEffect, useCallback } from 'react';

const BOOKS_KEY = 'libraryos_books';
const TRANSACTIONS_KEY = 'libraryos_transactions';

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
  { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', totalCopies: 5, availableCopies: 3 },
  { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061935466', totalCopies: 4, availableCopies: 4 },
  { id: '3', title: '1984', author: 'George Orwell', isbn: '978-0451524935', totalCopies: 6, availableCopies: 2 },
  { id: '4', title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '978-0141439518', totalCopies: 3, availableCopies: 0 },
  { id: '5', title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '978-0316769174', totalCopies: 4, availableCopies: 1 },
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

  const [simulatedDaysOffset, setSimulatedDaysOffset] = useState(0);

  // Persist to localStorage on change
  useEffect(() => { setStorage(BOOKS_KEY, books); }, [books]);
  useEffect(() => { setStorage(TRANSACTIONS_KEY, transactions); }, [transactions]);

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
  };

  // --- Book CRUD ---
  const addBook = useCallback((data) => {
    // Check for duplicate ISBN
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
    };
    setBooks(prev => [book, ...prev]);
    return book;
  }, [books]);

  const deleteBook = useCallback((bookId) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
    setTransactions(prev =>
      prev.filter(t => t.bookId !== bookId)
    );
  }, []);

  const updateBook = useCallback((bookId, updatedData) => {
    // Check duplicate ISBN (excluding this book itself)
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
        };
      })
    );
  }, [books]);

  const resetAllData = useCallback(() => {
    setBooks(SEED_BOOKS);
    setTransactions([]);
    setSimulatedDaysOffset(0);
    setStorage(BOOKS_KEY, SEED_BOOKS);
    setStorage(TRANSACTIONS_KEY, []);
  }, []);

  // --- Issue Book ---
  const issueBook = useCallback((bookId, borrowerName, borrowerEmail) => {
    const today = getSimulatedNow();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + LOAN_DAYS);

    const tx = {
      id: crypto.randomUUID(),
      bookId,
      borrowerName: borrowerName.trim(),
      borrowerEmail: borrowerEmail.trim(),
      issueDate: today.toISOString(),
      dueDate: dueDate.toISOString(),
      returnDate: null,
      fine: 0,
      status: 'active', // active | returned | overdue
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
  }, [getSimulatedNow]);

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

  // --- Active transactions (not returned) ---
  const activeTransactions = transactions.filter(t => t.status !== 'returned');

  // --- Get book by id ---
  const getBook = useCallback((id) => books.find(b => b.id === id), [books]);

  return {
    books,
    transactions,
    activeTransactions,
    stats,
    addBook,
    deleteBook,
    updateBook,
    issueBook,
    returnBook,
    calcFinePreview,
    getBook,
    resetAllData,
    simulatedDaysOffset,
    setSimulatedDaysOffset,
    getSimulatedNow,
    FINE_RATE,
    LOAN_DAYS,
  };
}

