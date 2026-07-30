import { useState } from 'react';
import { useLibraryData } from './hooks/useLibraryData';
import Navbar from './components/Navbar';
import StatCards from './components/StatCards';
import BookTable from './components/BookTable';
import AddBookForm from './components/AddBookForm';
import IssueBookModal from './components/IssueBookModal';
import ReturnBookModal from './components/ReturnBookModal';
import EditBookModal from './components/EditBookModal';
import BorrowerDirectory from './components/BorrowerDirectory';
import ReportsPanel from './components/ReportsPanel';
import { BookOpenIcon, PlusIcon, ClockIcon, SearchIcon } from './components/Icons';

function TransactionRow({ tx, getBook, getSimulatedNow, calcFinePreview, onReturn }) {
  const book = getBook(tx.bookId);
  const now = getSimulatedNow();
  const isOverdue = tx.status !== 'returned' && now > new Date(tx.dueDate);

  // Calculate live fine if active and overdue
  const preview = calcFinePreview(tx.id);
  const displayFine = tx.status === 'returned' ? tx.fine : preview.fine;

  return (
    <tr className="table-row-hover border-b border-gray-200 bg-white last:border-0 text-sm">
      <td className="px-4 py-3.5 text-sm font-medium text-academic-charcoal whitespace-nowrap">
        {book?.title ?? '—'}
      </td>
      <td className="px-4 py-3.5 text-sm text-academic-gray whitespace-nowrap">
        <div>{tx.borrowerName}</div>
        <div className="text-[10px] text-academic-gray/80 hidden sm:block">{tx.borrowerEmail}</div>
      </td>
      <td className="px-4 py-3.5 text-xs text-academic-gray whitespace-nowrap hidden md:table-cell">
        {new Date(tx.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      <td className={`px-3 py-3.5 text-xs font-semibold hidden sm:table-cell ${isOverdue ? 'text-academic-burgundy font-bold' : 'text-academic-gray'} whitespace-nowrap`}>
        {new Date(tx.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      <td className="px-3 py-3.5 whitespace-nowrap hidden sm:table-cell">
        {tx.status === 'returned' ? (
          <span className="badge-available">Returned</span>
        ) : isOverdue ? (
          <span className="badge-out">⚠ Overdue</span>
        ) : (
          <span className="badge-overdue text-academic-charcoal bg-amber-50">Active</span>
        )}
      </td>
      <td className="px-3 py-3.5 text-sm whitespace-nowrap hidden md:table-cell">
        {displayFine > 0 ? (
          <span className="text-academic-burgundy font-bold">${displayFine.toFixed(2)}</span>
        ) : (
          <span className="text-academic-gray">—</span>
        )}
      </td>
      <td className="px-3 py-3.5 text-xs whitespace-nowrap">
        {tx.status !== 'returned' && (
          <button
            onClick={() => onReturn(tx.id)}
            className="px-2 py-1.5 bg-academic-burgundy text-academic-cream hover:bg-red-800 rounded text-xs font-semibold transition-colors cursor-pointer"
          >
            Return
          </button>
        )}
      </td>
    </tr>
  );
}

export default function App() {
  const lib = useLibraryData();
  const [page, setPage] = useState('dashboard'); // dashboard | inventory | borrowers | transactions | reports
  const [showAddBook, setShowAddBook] = useState(false);
  const [issueBook, setIssueBook] = useState(null);   // book object to issue
  const [showReturn, setShowReturn] = useState(false);
  const [editBook, setEditBook] = useState(null);

  // Transactions search/filter states
  const [txSearch, setTxSearch] = useState('');
  const [txFilter, setTxFilter] = useState('all');

  const filteredTransactions = lib.transactions.filter(tx => {
    const book = lib.getBook(tx.bookId);
    const q = txSearch.toLowerCase();
    const matchesSearch = tx.borrowerName.toLowerCase().includes(q) ||
      tx.borrowerEmail.toLowerCase().includes(q) ||
      (book && book.title.toLowerCase().includes(q));

    const isOD = tx.status !== 'returned' && lib.getSimulatedNow() > new Date(tx.dueDate);
    const matchesFilter = txFilter === 'all' ||
      (txFilter === 'active' && tx.status === 'active' && !isOD) ||
      (txFilter === 'overdue' && isOD) ||
      (txFilter === 'returned' && tx.status === 'returned');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-academic-cream text-academic-charcoal font-sans pb-12">
      <Navbar
        activePage={page}
        onNavigate={(p) => {
          setPage(p);
          setShowAddBook(false);
        }}
        onIssueClick={() => setIssueBook('picker')}
        onReturnClick={() => setShowReturn(true)}
        transactions={lib.transactions}
        getBook={lib.getBook}
        calcFinePreview={lib.calcFinePreview}
        simulatedDaysOffset={lib.simulatedDaysOffset}
        setSimulatedDaysOffset={lib.setSimulatedDaysOffset}
        getSimulatedNow={lib.getSimulatedNow}
        onResetData={lib.resetAllData}
      />


      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
        {/* TAB 1: DASHBOARD */}
        {page === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero */}
            <div className="border-b border-academic-border pb-3">
              <h1 className="text-3xl font-serif font-bold text-academic-charcoal">Dashboard</h1>
              <p className="text-academic-gray text-sm mt-1">Welcome back — here's your library at a glance.</p>
            </div>

            {/* Stat Cards */}
            <StatCards stats={lib.stats} />

            {/* Recent Transactions Panel */}
            <section>
              <div className="flex items-center gap-2 mb-4 border-b border-academic-border pb-2">
                <ClockIcon className="w-6 h-6 text-academic-burgundy" />
                <h2 className="text-xl font-serif font-bold text-academic-charcoal">Recent Transactions</h2>
                <span className="ml-auto badge-overdue">
                  {lib.activeTransactions.length} active
                </span>
              </div>
              <div className="glass-card overflow-hidden">
                {lib.transactions.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-academic-gray bg-white">
                    <ClockIcon className="w-8 h-8 mb-2 opacity-30 text-academic-gray" />
                    <p className="text-sm">No transactions yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white">
                    <table className="w-full bg-white">
                      <thead>
                        <tr className="border-b border-academic-border bg-academic-hover text-xs">
                          <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider">Book</th>
                          <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider">Borrower</th>
                          <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider hidden md:table-cell">Issued</th>
                          <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider hidden sm:table-cell">Due Date</th>
                          <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider hidden sm:table-cell">Status</th>
                          <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider hidden md:table-cell">Fine</th>
                          <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lib.transactions.slice(0, 10).map(tx => (
                          <TransactionRow
                            key={tx.id}
                            tx={tx}
                            getBook={lib.getBook}
                            getSimulatedNow={lib.getSimulatedNow}
                            calcFinePreview={lib.calcFinePreview}
                            onReturn={lib.returnBook}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: INVENTORY (BOOKS) */}
        {page === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            {showAddBook ? (
              <div className="max-w-2xl mx-auto animate-fade-in">
                <AddBookForm
                  onAdd={(data) => {
                    lib.addBook(data);
                  }}
                  onCancel={() => setShowAddBook(false)}
                />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-academic-border pb-2">
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="w-6 h-6 text-academic-burgundy" />
                    <h2 className="text-xl font-serif font-bold text-academic-charcoal">Book Inventory</h2>
                  </div>
                  <button
                    onClick={() => setShowAddBook(true)}
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
                  onExport={lib.exportData}
                  onImport={lib.importData}
                />
              </>
            )}
          </div>
        )}

        {/* TAB 3: BORROWERS */}
        {page === 'borrowers' && (
          <div className="animate-fade-in">
            <BorrowerDirectory
              borrowers={lib.borrowers}
              transactions={lib.transactions}
              getBook={lib.getBook}
              calcFinePreview={lib.calcFinePreview}
              onAdd={lib.addBorrower}
              onUpdate={lib.updateBorrower}
              onDelete={lib.deleteBorrower}
              onToggleStatus={lib.toggleBorrowerStatus}
              onPayFine={lib.payBorrowerFine}
            />
          </div>
        )}

        {/* TAB 4: TRANSACTIONS LOG */}
        {page === 'transactions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-academic-border pb-2">
              <ClockIcon className="w-6 h-6 text-academic-burgundy" />
              <h2 className="text-xl font-serif font-bold text-academic-charcoal">Lending Logs Database</h2>
            </div>

            <div className="glass-card overflow-hidden bg-white border border-academic-border shadow-sm rounded">
              {/* Controls */}
              <div className="p-5 border-b border-academic-border bg-white flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-gray" />
                  <input
                    type="text"
                    placeholder="Search logs by borrower name, email, or book title…"
                    value={txSearch}
                    onChange={e => setTxSearch(e.target.value)}
                    className="glass-input w-full pl-9 text-sm"
                  />
                </div>
                <div>
                  <select
                    value={txFilter}
                    onChange={e => setTxFilter(e.target.value)}
                    className="bg-white border border-academic-burgundy text-academic-burgundy px-4 py-2.5 rounded text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-academic-burgundy/20 transition-all font-medium min-w-[140px] w-full lg:w-auto"
                  >
                    <option value="all">All Loans</option>
                    <option value="active">Active Only</option>
                    <option value="overdue">Overdue Only</option>
                    <option value="returned">Returned Only</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 text-academic-gray">No transactions matched your criteria.</div>
                ) : (
                  <table className="w-full bg-white">
                    <thead>
                      <tr className="border-b border-academic-border bg-academic-hover text-xs">
                        <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider">Book Title</th>
                        <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider">Borrower</th>
                        <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider hidden md:table-cell">Checkout Date</th>
                        <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider hidden sm:table-cell">Due Date</th>
                        <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider hidden sm:table-cell">Status</th>
                        <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider hidden md:table-cell">Overdue Fine</th>
                        <th className="px-3 py-3.5 text-left font-semibold text-academic-gray uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map(tx => (
                        <TransactionRow
                          key={tx.id}
                          tx={tx}
                          getBook={lib.getBook}
                          getSimulatedNow={lib.getSimulatedNow}
                          calcFinePreview={lib.calcFinePreview}
                          onReturn={lib.returnBook}
                        />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ANALYTICS REPORTS */}
        {page === 'reports' && (
          <div className="animate-fade-in">
            <ReportsPanel
              books={lib.books}
              transactions={lib.transactions}
              borrowers={lib.borrowers}
              stats={lib.stats}
            />
          </div>
        )}
      </main>

      {/* Issue Modal — book picker mode */}
      {issueBook === 'picker' && (
        <div className="modal-backdrop">
          <div className="modal-panel w-full max-w-md bg-white border border-academic-border shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-academic-border pb-2">
              <h2 className="font-serif font-bold text-academic-charcoal text-lg">Select Book to Issue</h2>
              <button onClick={() => setIssueBook(null)} className="p-1.5 rounded hover:bg-academic-hover text-academic-gray hover:text-academic-charcoal cursor-pointer">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {lib.books.filter(b => b.availableCopies > 0).length === 0 ? (
                <p className="text-center text-academic-gray py-6 text-sm">No books available for issue</p>
              ) : (
                lib.books.filter(b => b.availableCopies > 0).map(b => (
                  <button
                    key={b.id}
                    onClick={() => setIssueBook(b)}
                    className="w-full text-left p-3 rounded border border-academic-border bg-white hover:bg-academic-hover hover:border-academic-burgundy transition-all duration-150 cursor-pointer group"
                  >
                    <p className="font-serif font-semibold text-academic-charcoal text-sm group-hover:text-academic-burgundy transition-colors">{b.title}</p>
                    <div className="flex gap-3 text-xs text-academic-gray mt-1 font-medium">
                      <span>{b.author}</span>
                      <span className="text-academic-forest font-bold">{b.availableCopies} available</span>
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
          getSimulatedNow={lib.getSimulatedNow}
          borrowers={lib.borrowers}
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
          getSimulatedNow={lib.getSimulatedNow}
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
