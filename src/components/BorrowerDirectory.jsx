import { useState } from 'react';
import { SearchIcon, UserIcon, TrashIcon, XMarkIcon, PencilIcon } from './Icons';

function BorrowerDetailsModal({ borrower, transactions, getBook, calcFinePreview, onPayFine, onClose }) {
  const [payAmount, setPayAmount] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);

  const borrowerTx = transactions.filter(t => t.borrowerId === borrower.id);
  const activeTx = borrowerTx.filter(t => t.status !== 'returned');

  // Compute pending balance: live fine for active loans + stored fine for returned
  const pendingBalance = borrowerTx.reduce((sum, t) => {
    if (t.status === 'returned') {
      return sum + (t.fine || 0);
    }
    return sum + calcFinePreview(t.id).fine;
  }, 0);

  const handlePayment = (e) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) return;
    onPayFine(borrower.id, amt, calcFinePreview);
    setPaySuccess(true);
    setPayAmount('');
    setTimeout(() => setPaySuccess(false), 2000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel w-full max-w-xl bg-white border border-academic-border shadow-lg rounded" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-academic-border pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-academic-burgundy border border-academic-gold/30 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-academic-cream" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-academic-charcoal">{borrower.name}</h2>
              <p className="text-xs text-academic-gray">{borrower.studentId} • {borrower.department}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-academic-hover text-academic-gray hover:text-academic-charcoal transition-colors cursor-pointer">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {/* Quick Metrics */}
          <div className="p-3 bg-academic-hover rounded border border-academic-border text-center">
            <span className="text-xs text-academic-gray uppercase tracking-wider font-semibold">Total Loans</span>
            <p className="text-2xl font-serif font-bold text-academic-charcoal mt-1">{borrowerTx.length}</p>
          </div>
          <div className="p-3 bg-academic-hover rounded border border-academic-border text-center">
            <span className="text-xs text-academic-gray uppercase tracking-wider font-semibold">Active Loans</span>
            <p className="text-2xl font-serif font-bold text-academic-charcoal mt-1">{activeTx.length}</p>
          </div>
          <div className="p-3 bg-academic-hover rounded border border-academic-border text-center">
            <span className="text-xs text-academic-gray uppercase tracking-wider font-semibold">Outstanding Fine</span>
            <p className={`text-2xl font-serif font-bold mt-1 ${pendingBalance > 0 ? 'text-academic-burgundy' : 'text-academic-forest'}`}>
              ${pendingBalance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Fine Payment Form */}
        {pendingBalance > 0 && (
          <form onSubmit={handlePayment} className="mb-5 p-4 rounded border border-academic-burgundy/20 bg-academic-lightRed/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-academic-burgundy mb-2">Collect Fine Payment</h4>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-academic-gray">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={pendingBalance}
                  placeholder="Amount to pay"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="glass-input w-full pl-6 pr-3 py-1.5 text-xs bg-white border border-academic-border"
                  required
                />
              </div>
              <button type="submit" className="btn-primary py-1.5 px-3 text-xs">
                Pay Fine
              </button>
            </div>
            {paySuccess && (
              <p className="text-xs text-academic-forest font-semibold mt-1">✓ Payment recorded successfully!</p>
            )}
          </form>
        )}

        {/* Loan History list */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-academic-charcoal mb-2">Borrowing History</h4>
          <div className="max-h-52 overflow-y-auto border border-academic-border rounded divide-y divide-gray-200">
            {borrowerTx.length === 0 ? (
              <p className="text-center text-xs text-academic-gray py-6">No transaction records found</p>
            ) : (
              borrowerTx.map(t => {
                const book = getBook(t.bookId);
                const isOverdue = t.status !== 'returned' && new Date() > new Date(t.dueDate);
                return (
                  <div key={t.id} className="p-3 hover:bg-academic-hover/30 transition-colors flex justify-between items-center text-xs">
                    <div>
                      <p className="font-serif font-bold text-academic-charcoal">{book?.title || 'Unknown title'}</p>
                      <p className="text-[10px] text-academic-gray mt-0.5">
                        Issued: {new Date(t.issueDate).toLocaleDateString()} • Due: {new Date(t.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {t.status === 'returned' ? (
                        <span className="badge-available text-[10px]">Returned</span>
                      ) : isOverdue ? (
                        <span className="badge-out text-[10px]">⚠ Overdue</span>
                      ) : (
                        <span className="badge-overdue text-[10px] bg-amber-50">Active</span>
                      )}
                      {t.fine > 0 && (
                        <span className="ml-2 font-bold text-academic-burgundy">${t.fine.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BorrowerDirectory({ borrowers, transactions, getBook, calcFinePreview, onAdd, onUpdate, onDelete, onToggleStatus, onPayFine }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editBorrower, setEditBorrower] = useState(null);
  const [selectedBorrower, setSelectedBorrower] = useState(null);

  // Add borrower form states
  const [form, setForm] = useState({ studentId: '', name: '', email: '', department: '' });
  const [errors, setErrors] = useState({});

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.studentId.trim()) errs.studentId = 'Student ID required';
    if (!form.name.trim()) errs.name = 'Name required';
    if (!form.email.trim()) errs.email = 'Email required';
    if (!form.department.trim()) errs.department = 'Department required';

    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      onAdd(form);
      setForm({ studentId: '', name: '', email: '', department: '' });
      setShowAddForm(false);
      setErrors({});
    } catch (err) {
      setErrors({ global: err.message });
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editBorrower) return;
    try {
      onUpdate(editBorrower.id, editBorrower);
      setEditBorrower(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const getOutstandingFines = (borrowerId) => {
    return transactions
      .filter(t => t.borrowerId === borrowerId)
      .reduce((sum, t) => {
        if (t.status === 'returned') {
          // For returned loans, t.fine holds the settled (and possibly paid-down) amount
          return sum + (t.fine || 0);
        } else {
          // For active loans, compute the live accruing fine from the preview
          return sum + calcFinePreview(t.id).fine;
        }
      }, 0);
  };

  const filtered = borrowers.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = b.name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.studentId.toLowerCase().includes(q) ||
      b.department.toLowerCase().includes(q);
    const matchFilter = filter === 'all' ||
      (filter === 'active' && b.status === 'active') ||
      (filter === 'blocked' && b.status === 'blocked');
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-academic-border pb-2">
        <h2 className="text-xl font-serif font-bold text-academic-charcoal">Borrower Registry</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary text-xs"
        >
          {showAddForm ? 'View Registry' : 'Register Borrower'}
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card p-6 bg-white border border-academic-border rounded shadow-sm max-w-xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center gap-3.5 mb-6 border-b border-academic-border pb-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-2 rounded hover:bg-academic-hover text-academic-charcoal border border-academic-border bg-white cursor-pointer transition-all duration-200 flex items-center justify-center hover:-translate-x-0.5 active:translate-x-0"
              title="Back to Registry"
              aria-label="Back to Registry"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex-1">
              <h3 className="font-serif font-bold text-academic-charcoal text-lg">
                Register New Student/Member
              </h3>
            </div>
          </div>

          {errors.global && (
            <div className="mb-4 px-4 py-2.5 rounded bg-academic-lightRed border border-academic-burgundy/20 text-academic-burgundy text-xs font-semibold">
              {errors.global}
            </div>
          )}
          <form onSubmit={handleAddSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-academic-charcoal uppercase mb-1">Student ID</label>
                <input
                  type="text"
                  placeholder="e.g. STU-2026-089"
                  value={form.studentId}
                  onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                  className="glass-input w-full text-sm bg-white border border-academic-border"
                />
                {errors.studentId && <p className="text-xs text-academic-burgundy font-semibold mt-1">{errors.studentId}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-academic-charcoal uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="glass-input w-full text-sm bg-white border border-academic-border"
                />
                {errors.name && <p className="text-xs text-academic-burgundy font-semibold mt-1">{errors.name}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-academic-charcoal uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. evance@university.edu"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="glass-input w-full text-sm bg-white border border-academic-border"
                />
                {errors.email && <p className="text-xs text-academic-burgundy font-semibold mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-academic-charcoal uppercase mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Literature & History"
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="glass-input w-full text-sm bg-white border border-academic-border"
                />
                {errors.department && <p className="text-xs text-academic-burgundy font-semibold mt-1">{errors.department}</p>}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1 justify-center">Register Student</button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded text-sm font-medium text-academic-charcoal border border-academic-border bg-white hover:bg-academic-hover cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showAddForm && (
        <div className="glass-card overflow-hidden bg-white border border-academic-border shadow-sm rounded">
          {/* Table Search Header */}
          <div className="p-5 border-b border-academic-border bg-white flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-gray" />
              <input
                type="text"
                placeholder="Search by student name, ID, email, or department…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="glass-input w-full pl-9 text-sm"
              />
            </div>
            <div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="bg-white border border-academic-burgundy text-academic-burgundy px-4 py-2.5 rounded text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-academic-burgundy/20 transition-all font-medium min-w-[140px] w-full sm:w-auto"
              >
                <option value="all">All Borrowers</option>
                <option value="active">Active Status</option>
                <option value="blocked">Blocked Status</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-academic-gray bg-white">
                <UserIcon className="w-10 h-10 mb-3 opacity-30 text-academic-gray" />
                <p className="font-semibold text-academic-charcoal">No borrowers found</p>
              </div>
            ) : (
              <table className="w-full bg-white">
                <thead>
                  <tr className="border-b border-academic-border bg-academic-hover">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-academic-gray uppercase tracking-wider hidden sm:table-cell">Student ID</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-academic-gray uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-academic-gray uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-academic-gray uppercase tracking-wider hidden lg:table-cell">Department</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-academic-gray uppercase tracking-wider text-center hidden sm:table-cell">Active Loans</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-academic-gray uppercase tracking-wider text-center">Fines</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-academic-gray uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-academic-gray uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => {
                    const activeLoans = transactions.filter(t => t.borrowerId === b.id && t.status !== 'returned').length;
                    const balance = getOutstandingFines(b.id);
                    return (
                      <tr key={b.id} className="table-row-hover border-b border-gray-200 bg-white last:border-0 text-sm">
                        <td className="px-4 py-3.5 font-mono text-xs text-academic-charcoal font-semibold hidden sm:table-cell">{b.studentId}</td>
                        <td className="px-4 py-3.5 font-serif font-bold text-academic-charcoal">{b.name}</td>
                        <td className="px-4 py-3.5 text-academic-gray hidden md:table-cell">{b.email}</td>
                        <td className="px-4 py-3.5 text-academic-charcoal hidden lg:table-cell">{b.department}</td>
                        <td className="px-4 py-3.5 text-center font-bold text-academic-charcoal hidden sm:table-cell">{activeLoans}</td>
                        <td className={`px-4 py-3.5 text-center font-bold ${balance > 0 ? 'text-academic-burgundy' : 'text-academic-gray'}`}>
                          {balance > 0 ? `$${balance.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          {b.status === 'active' ? (
                            <span className="badge-available text-[10px]">Active</span>
                          ) : (
                            <span className="badge-out text-[10px]">Blocked</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedBorrower(b)}
                              className="px-2 py-1.5 text-xs font-semibold text-academic-burgundy border border-academic-burgundy/40 hover:bg-academic-burgundy/10 rounded cursor-pointer transition-colors whitespace-nowrap"
                            >
                              <span className="hidden sm:inline">Details</span>
                              <span className="sm:hidden">View</span>
                            </button>
                            <button
                              onClick={() => setEditBorrower(b)}
                              className="inline-flex items-center justify-center p-1.5 rounded text-academic-gray border border-academic-border bg-white hover:bg-academic-hover hover:text-academic-charcoal transition-all duration-200 cursor-pointer"
                              title="Edit borrower details"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onToggleStatus(b.id)}
                              className={`hidden sm:inline-flex px-2 py-1 text-xs rounded font-medium cursor-pointer transition-colors ${b.status === 'active' ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'}`}
                            >
                              {b.status === 'active' ? 'Block' : 'Unblock'}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete borrower "${b.name}"?`)) {
                                  try {
                                    onDelete(b.id);
                                  } catch (err) {
                                    alert(err.message);
                                  }
                                }
                              }}
                              className="hidden sm:inline-flex btn-danger"
                              title="Delete borrower"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editBorrower && (
        <div className="modal-backdrop">
          <div className="modal-panel w-full max-w-md bg-white border border-academic-border shadow-lg rounded" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 border-b border-academic-border pb-3">
              <h3 className="font-serif font-bold text-academic-charcoal text-lg">Edit Borrower</h3>
              <button onClick={() => setEditBorrower(null)} className="p-1 rounded hover:bg-academic-hover text-academic-gray cursor-pointer" aria-label="Close">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-academic-charcoal uppercase mb-1">Student ID</label>
                <input
                  type="text"
                  value={editBorrower.studentId}
                  onChange={e => setEditBorrower(eb => ({ ...eb, studentId: e.target.value }))}
                  className="glass-input w-full text-sm bg-white border border-academic-border"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-academic-charcoal uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={editBorrower.name}
                  onChange={e => setEditBorrower(eb => ({ ...eb, name: e.target.value }))}
                  className="glass-input w-full text-sm bg-white border border-academic-border"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-academic-charcoal uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={editBorrower.email}
                  onChange={e => setEditBorrower(eb => ({ ...eb, email: e.target.value }))}
                  className="glass-input w-full text-sm bg-white border border-academic-border"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-academic-charcoal uppercase mb-1">Department</label>
                <input
                  type="text"
                  value={editBorrower.department}
                  onChange={e => setEditBorrower(eb => ({ ...eb, department: e.target.value }))}
                  className="glass-input w-full text-sm bg-white border border-academic-border"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center">Save Changes</button>
                <button
                  type="button"
                  onClick={() => setEditBorrower(null)}
                  className="px-4 py-2.5 rounded text-sm font-medium text-academic-charcoal border border-academic-border bg-white hover:bg-academic-hover cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedBorrower && (
        <BorrowerDetailsModal
          borrower={selectedBorrower}
          transactions={transactions}
          getBook={getBook}
          calcFinePreview={calcFinePreview}
          onPayFine={onPayFine}
          onClose={() => setSelectedBorrower(null)}
        />
      )}
    </div>
  );
}
