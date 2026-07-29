import { useState } from 'react';
import { XMarkIcon, BookOpenIcon, UserIcon } from './Icons';

export default function IssueBookModal({ book, loanDays, onIssue, onClose }) {
  const [form, setForm] = useState({ borrowerName: '', borrowerEmail: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!book) return null;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + loanDays);

  const validate = () => {
    const e = {};
    if (!form.borrowerName.trim()) e.borrowerName = 'Name is required';
    if (!form.borrowerEmail.trim()) e.borrowerEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.borrowerEmail)) e.borrowerEmail = 'Enter a valid email';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      onIssue(book.id, form.borrowerName, form.borrowerEmail);
      setLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="issue-modal-title">
      <div className="modal-panel w-full max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl stat-card-teal">
              <BookOpenIcon className="w-5 h-5 text-white" />
            </div>
            <h2 id="issue-modal-title" className="text-base font-semibold text-text">Issue Book</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-text-dim transition-colors" aria-label="Close">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Book Info */}
        <div className="mb-5 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <p className="font-semibold text-text text-sm leading-tight">{book.title}</p>
          <p className="text-text-dim text-xs mt-0.5">{book.author}</p>
          <div className="flex gap-4 mt-3 text-xs text-text-dim">
            <span>ISBN: <span className="font-mono text-text-muted">{book.isbn}</span></span>
            <span>Due: <span className="text-amber-400 font-medium">{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="borrower-name" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
              Borrower Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input
                id="borrower-name"
                type="text"
                placeholder="Full name"
                value={form.borrowerName}
                onChange={e => { setForm(f => ({ ...f, borrowerName: e.target.value })); setErrors(er => ({ ...er, borrowerName: undefined })); }}
                className={`glass-input w-full pl-9 text-sm ${errors.borrowerName ? 'border-red-500/50' : ''}`}
              />
            </div>
            {errors.borrowerName && <p className="text-xs text-red-400 mt-1">{errors.borrowerName}</p>}
          </div>

          <div>
            <label htmlFor="borrower-email" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
              Borrower Email
            </label>
            <input
              id="borrower-email"
              type="email"
              placeholder="email@example.com"
              value={form.borrowerEmail}
              onChange={e => { setForm(f => ({ ...f, borrowerEmail: e.target.value })); setErrors(er => ({ ...er, borrowerEmail: undefined })); }}
              className={`glass-input w-full text-sm ${errors.borrowerEmail ? 'border-red-500/50' : ''}`}
            />
            {errors.borrowerEmail && <p className="text-xs text-red-400 mt-1">{errors.borrowerEmail}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              id="confirm-issue-btn"
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 justify-center"
            >
              {loading ? 'Issuing…' : `Issue for ${loanDays} Days`}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
