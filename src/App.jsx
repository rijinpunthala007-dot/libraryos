import { useState } from 'react';
import { useLibraryData } from './hooks/useLibraryData';
import Navbar from './components/Navbar';
import StatCards from './components/StatCards';
import BookTable from './components/BookTable';
import AddBookForm from './components/AddBookForm';
import IssueBookModal from './components/IssueBookModal';
import ReturnBookModal from './components/ReturnBookModal';
import EditBookModal from './components/EditBookModal';
import { BookOpenIcon, PlusIcon, ClockIcon, ReturnIcon } from './components/Icons';

function TransactionRow({ tx, getBook, getSimulatedNow }) {
  const book = getBook(tx.bookId);
  const now = getSimulatedNow();
  const isOverdue = tx.status !== 'returned' && now > new Date(tx.dueDate);

  // Calculate live fine if active and overdue
  let displayFine = tx.fine;
  if (tx.status !== 'returned' && isOverdue) {
    const due = new Date(tx.dueDate);
    const overdueDays = Math.max(0, Math.floor((now - due) / (1000 * 60 * 60 * 24)));
    displayFine = parseFloat((overdueDays * 0.5).toFixed(2));
  }

  return (
    <tr className="table-row-hover border-b border-white/[0.04] last:border-0">
      <td className="px-4 py-3.5 text-sm font-medium text-text whitespace-nowrap">{book?.title ?? '—'}</td>
      <td className="px-4 py-3.5 text-sm text-text-muted whitespace-nowrap">{tx.borrowerName}</td>
      <td className="px-4 py-3.5 text-xs text-text-dim whitespace-nowrap">
        {new Date(tx.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </td>
      <td className={`px-4 py-3.5 text-xs font-medium ${isOverdue ? 'text-amber-400' : 'text-text-dim'} whitespace-nowrap`}>
        {new Date(tx.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        {tx.status === 'returned'
          ? <span className="badge-available">Returned</span>
          : isOverdue
            ? <span className="badge-overdue">⚠ Overdue</span>
            : <span className="badge-available">Active</span>
        }
      </td>
      <td className="px-4 py-3.5 text-sm whitespace-nowrap">
        {displayFine > 0 ? (
          <span className="text-brand-amber font-semibold">${displayFine.toFixed(2)}</span>
        ) : (
          <span className="text-text-dim">—</span>
        )}
      </td>
    </tr>
  );
}

export default function App() {
  const lib = useLibraryData();
  const [page, setPage] = useState('dashboard');
  const [issueBook, setIssueBook] = useState(null);   // book object to issue
  const [showReturn, setShowReturn] = useState(false);
  const [editBook, setEditBook] = useState(null);

  return (
    <div className="min-h-screen" style={{
      background: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.08) 0%, transparent 50%), #111827'
    }}>
      <Navbar
        activePage={page}
        onNavigate={setPage}
        onIssueClick={() => setIssueBook('picker')}
        onReturnClick={() => setShowReturn(true)}
      />

      {/* Presentation Demo Toolbar */}
      <div className="bg-surface border-b border-white/[0.04] py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-text-muted">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
            <span>Simulated System Time:</span>
            <strong className="text-text font-semibold whitespace-nowrap">
              {lib.getSimulatedNow().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </strong>
            {lib.simulatedDaysOffset > 0 && (
              <span className="text-brand-amber font-medium bg-brand-amber/10 border border-brand-amber/20 px-1.5 py-0.5 rounded whitespace-nowrap">
                +{lib.simulatedDaysOffset} days simulated
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => lib.setSimulatedDaysOffset(prev => prev + 5)}
              className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-text-muted hover:text-text transition-colors cursor-pointer whitespace-nowrap"
            >
              +5 Days
            </button>
            <button
              onClick={() => lib.setSimulatedDaysOffset(prev => prev + 15)}
              className="px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-text-muted hover:text-text transition-colors cursor-pointer whitespace-nowrap"
            >
              +15 Days
            </button>
            {lib.simulatedDaysOffset > 0 && (
              <button
                onClick={() => lib.setSimulatedDaysOffset(0)}
                className="px-2 py-1 rounded bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/30 text-brand-primaryLight transition-colors cursor-pointer whitespace-nowrap"
              >
                Reset Time
              </button>
            )}
            <div className="w-[1px] h-4 bg-white/[0.1] mx-0.5" />
            <button
              id="reset-demo-btn"
              onClick={() => {
                if (confirm("Reset inventory and clear all transactions?")) {
                  lib.resetAllData();
                }
              }}
              className="px-2 py-1 rounded bg-brand-error/10 hover:bg-brand-error/20 border border-brand-error/20 text-brand-errorLight transition-colors cursor-pointer whitespace-nowrap"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {page === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero */}
            <div>
              <h1 className="text-2xl font-bold text-text">Dashboard</h1>
              <p className="text-text-dim text-sm mt-1">Welcome back — here's your library at a glance.</p>
            </div>

            {/* Stat Cards */}
            <StatCards stats={lib.stats} />

            {/* Book Inventory */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5 text-brand-primaryLight" />
                  <h2 className="text-base font-semibold text-text">Book Inventory</h2>
                </div>
                <button
                  id="add-book-nav-btn"
                  onClick={() => setPage('add-book')}
                  className="btn-primary text-xs"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Book
                </button>
              </div>
              <BookTable
                books={lib.books}
                onIssue={(book) => setIssueBook(book)}
                onEdit={(book) => setEditBook(book)}
                onDelete={lib.deleteBook}
              />
            </section>

            {/* Transactions Panel */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-semibold text-text">Recent Transactions</h2>
                <span className="ml-auto badge-overdue">
                  {lib.activeTransactions.length} active
                </span>
              </div>
              <div className="glass-card overflow-hidden">
                {lib.transactions.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-text-dim">
                    <ClockIcon className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">No transactions yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          {['Book', 'Borrower', 'Issued', 'Due Date', 'Status', 'Fine'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-dim uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lib.transactions.slice(0, 10).map(tx => (
                          <TransactionRow key={tx.id} tx={tx} getBook={lib.getBook} getSimulatedNow={lib.getSimulatedNow} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {page === 'add-book' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text">Add New Book</h1>
              <p className="text-text-dim text-sm mt-1">Expand the library collection</p>
            </div>
            <AddBookForm
              onAdd={(data) => {
                lib.addBook(data);
              }}
              onCancel={() => setPage('dashboard')}
            />
          </div>
        )}
      </main>

      {/* Issue Modal — book picker mode */}
      {issueBook === 'picker' && (
        <div className="modal-backdrop">
          <div className="modal-panel w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text">Select Book to Issue</h2>
              <button onClick={() => setIssueBook(null)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-text-dim">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {lib.books.filter(b => b.availableCopies > 0).length === 0 ? (
                <p className="text-center text-text-dim py-6 text-sm">No books available for issue</p>
              ) : (
                lib.books.filter(b => b.availableCopies > 0).map(b => (
                  <button
                    key={b.id}
                    onClick={() => setIssueBook(b)}
                    className="w-full text-left p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-brand-primary/30 transition-all duration-200 group"
                  >
                    <p className="font-medium text-text text-sm group-hover:text-brand-primaryLight transition-colors">{b.title}</p>
                    <div className="flex gap-3 text-xs text-text-dim mt-0.5">
                      <span>{b.author}</span>
                      <span className="text-teal-400">{b.availableCopies} available</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Issue Modal — with book selected */}
      {issueBook && issueBook !== 'picker' && (
        <IssueBookModal
          book={issueBook}
          loanDays={lib.LOAN_DAYS}
          onIssue={lib.issueBook}
          onClose={() => setIssueBook(null)}
        />
      )}

      {/* Return Modal */}
      {showReturn && (
        <ReturnBookModal
          transactions={lib.transactions}
          getBook={lib.getBook}
          calcFinePreview={lib.calcFinePreview}
          onReturn={lib.returnBook}
          onClose={() => setShowReturn(false)}
        />
      )}

      {/* Edit Book Modal */}
      {editBook && (
        <EditBookModal
          book={editBook}
          onUpdate={lib.updateBook}
          onClose={() => setEditBook(null)}
        />
      )}
    </div>
  );
}
