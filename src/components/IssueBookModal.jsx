import { useState } from 'react';
import { XMarkIcon, BookOpenIcon, UserIcon } from './Icons';

export default function IssueBookModal({ book, loanDays, onIssue, onClose, getSimulatedNow, borrowers = [] }) {
  const today = getSimulatedNow ? getSimulatedNow() : new Date();
  const defaultDueDate = new Date(today);
  defaultDueDate.setDate(defaultDueDate.getDate() + loanDays);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const minDateStr = formatDate(today);

  const [selectedBorrowerId, setSelectedBorrowerId] = useState('');
  const [form, setForm] = useState({ borrowerName: '', borrowerEmail: '' });
  const [dueDateStr, setDueDateStr] = useState(formatDate(defaultDueDate));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!book) return null;

  const validate = () => {
    const e = {};
    if (selectedBorrowerId === '') {
      if (!form.borrowerName.trim()) e.borrowerName = 'Name is required';
      if (!form.borrowerEmail.trim()) e.borrowerEmail = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.borrowerEmail)) e.borrowerEmail = 'Enter a valid email';
    }

    if (!dueDateStr) {
      e.dueDate = 'Due date is required';
    } else if (new Date(dueDateStr) < new Date(minDateStr)) {
      e.dueDate = 'Due date cannot be in the past';
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    let bName = form.borrowerName;
    let bEmail = form.borrowerEmail;

    if (selectedBorrowerId) {
      const selectedB = borrowers.find(x => x.id === selectedBorrowerId);
      if (selectedB) {
        bName = selectedB.name;
        bEmail = selectedB.email;
      }
    }

    setTimeout(() => {
      try {
        const customDue = new Date(dueDateStr + 'T23:59:59');
        onIssue(book.id, bName, bEmail, customDue, selectedBorrowerId || null);
        setLoading(false);
        onClose();
      } catch (err) {
        setErrors({ global: err.message });
        setLoading(false);
      }
    }, 400);
  };

  const getDiffDays = () => {
    if (!dueDateStr) return loanDays;
    const t = new Date(today);
    t.setHours(0, 0, 0, 0);
    const d = new Date(dueDateStr + 'T00:00:00');
    const diffTime = d - t;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="issue-modal-title">
      <div className="modal-panel w-full max-w-md bg-white border border-academic-border shadow-lg rounded" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-academic-border pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-academic-forest border border-academic-gold/30 flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5 text-academic-cream" />
            </div>
            <h2 id="issue-modal-title" className="text-lg font-serif font-bold text-academic-charcoal">Issue Book</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-academic-hover text-academic-gray hover:text-academic-charcoal transition-colors cursor-pointer" aria-label="Close">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {errors.global && (
          <div className="mb-4 px-4 py-2.5 rounded bg-academic-lightRed border border-academic-burgundy/20 text-academic-burgundy text-xs font-semibold">
            {errors.global}
          </div>
        )}

        {/* Book Info */}
        <div className="mb-5 p-4 rounded bg-academic-hover border border-academic-border">
          <p className="font-serif font-bold text-academic-charcoal text-sm leading-tight">{book.title}</p>
          <p className="text-academic-gray text-xs mt-1">{book.author}</p>
          <div className="flex gap-4 mt-3 text-xs text-academic-charcoal font-medium">
            <span>ISBN: <span className="font-mono text-academic-charcoal bg-white border border-academic-border/30 px-1 py-0.5 rounded">{book.isbn}</span></span>
            <span>Due: <span className="text-academic-burgundy font-bold">
              {dueDateStr ? new Date(dueDateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </span></span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="borrower-select" className="block text-xs font-semibold text-academic-charcoal uppercase tracking-wider mb-1.5">
              Select Registered Borrower
            </label>
            <div className="relative">
              <select
                id="borrower-select"
                value={selectedBorrowerId}
                onChange={e => {
                  setSelectedBorrowerId(e.target.value);
                  setErrors({});
                }}
                className="glass-input w-full text-sm bg-white border border-academic-border cursor-pointer focus:outline-none"
              >
                <option value="">— Register a new student borrower —</option>
                {borrowers.map(b => (
                  <option key={b.id} value={b.id} disabled={b.status === 'blocked'}>
                    {b.name} ({b.studentId}) {b.status === 'blocked' ? '🚫 BLOCKED' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedBorrowerId === '' && (
            <div className="space-y-4 pt-4 border-t border-dashed border-academic-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-academic-burgundy">New Borrower Registration</h4>
              <div>
                <label htmlFor="borrower-name" className="block text-xs font-semibold text-academic-charcoal uppercase mb-1">
                  Borrower Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-gray" />
                  <input
                    id="borrower-name"
                    type="text"
                    placeholder="Full name"
                    value={form.borrowerName}
                    onChange={e => { setForm(f => ({ ...f, borrowerName: e.target.value })); setErrors(er => ({ ...er, borrowerName: undefined })); }}
                    className={`glass-input w-full pl-9 text-sm bg-white border border-academic-border ${errors.borrowerName ? 'border-academic-burgundy ring-2 ring-academic-burgundy/15' : ''}`}
                  />
                </div>
                {errors.borrowerName && <p className="text-xs text-academic-burgundy font-semibold mt-1">{errors.borrowerName}</p>}
              </div>

              <div>
                <label htmlFor="borrower-email" className="block text-xs font-semibold text-academic-charcoal uppercase mb-1">
                  Borrower Email
                </label>
                <input
                  id="borrower-email"
                  type="email"
                  placeholder="email@example.com"
                  value={form.borrowerEmail}
                  onChange={e => { setForm(f => ({ ...f, borrowerEmail: e.target.value })); setErrors(er => ({ ...er, borrowerEmail: undefined })); }}
                  className={`glass-input w-full text-sm bg-white border border-academic-border ${errors.borrowerEmail ? 'border-academic-burgundy ring-2 ring-academic-burgundy/15' : ''}`}
                />
                {errors.borrowerEmail && <p className="text-xs text-academic-burgundy font-semibold mt-1">{errors.borrowerEmail}</p>}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="due-date" className="block text-xs font-semibold text-academic-charcoal uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <input
              id="due-date"
              type="date"
              min={minDateStr}
              value={dueDateStr}
              onChange={e => { setDueDateStr(e.target.value); setErrors(er => ({ ...er, dueDate: undefined })); }}
              className={`glass-input w-full text-sm bg-white border border-academic-border ${errors.dueDate ? 'border-academic-burgundy ring-2 ring-academic-burgundy/15' : ''}`}
            />
            {errors.dueDate && <p className="text-xs text-academic-burgundy font-semibold mt-1">{errors.dueDate}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              id="confirm-issue-btn"
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 justify-center"
            >
              {loading ? 'Issuing…' : `Issue for ${getDiffDays()} Day${getDiffDays() !== 1 ? 's' : ''}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded text-sm font-medium text-academic-charcoal border border-academic-border bg-white hover:bg-academic-hover transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
