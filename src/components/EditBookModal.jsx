import { useState, useEffect } from 'react';
import { XMarkIcon, BookOpenIcon } from './Icons';

export default function EditBookModal({ book, onUpdate, onClose }) {
  const [form, setForm] = useState({ title: '', author: '', isbn: '', totalCopies: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        totalCopies: String(book.totalCopies),
      });
      setErrors({});
    }
  }, [book]);

  if (!book) return null;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.author.trim()) e.author = 'Author is required';
    if (!form.isbn.trim()) e.isbn = 'ISBN is required';
    if (!form.totalCopies || Number(form.totalCopies) < 1) e.totalCopies = 'Enter at least 1 copy';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    setErrors({});
    
    setTimeout(() => {
      try {
        onUpdate(book.id, form);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1000);
      } catch (err) {
        // Capture duplicates or issued copy limitations
        if (err.message.toLowerCase().includes('isbn')) {
          setErrors({ isbn: err.message });
        } else if (err.message.toLowerCase().includes('issued')) {
          setErrors({ totalCopies: err.message });
        } else {
          setErrors({ global: err.message });
        }
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div className="modal-panel w-full max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl stat-card-indigo">
              <BookOpenIcon className="w-5 h-5 text-white" />
            </div>
            <h2 id="edit-modal-title" className="text-base font-semibold text-text">Edit Book Inventory</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-text-dim transition-colors" aria-label="Close">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {success && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm flex items-center gap-2 animate-fade-in">
            <span>✓</span> Book updated successfully!
          </div>
        )}

        {errors.global && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
            {errors.global}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="edit-title" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
              Book Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={`glass-input w-full text-sm ${errors.title ? 'border-red-500/50' : ''}`}
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="edit-author" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
              Author
            </label>
            <input
              id="edit-author"
              type="text"
              value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              className={`glass-input w-full text-sm ${errors.author ? 'border-red-500/50' : ''}`}
            />
            {errors.author && <p className="text-xs text-red-400 mt-1">{errors.author}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-isbn" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                ISBN
              </label>
              <input
                id="edit-isbn"
                type="text"
                value={form.isbn}
                onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))}
                className={`glass-input w-full text-sm ${errors.isbn ? 'border-red-500/50' : ''}`}
              />
              {errors.isbn && <p className="text-xs text-red-400 mt-1">{errors.isbn}</p>}
            </div>

            <div>
              <label htmlFor="edit-copies" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                Total Copies
              </label>
              <input
                id="edit-copies"
                type="number"
                min="1"
                value={form.totalCopies}
                onChange={e => setForm(f => ({ ...f, totalCopies: e.target.value }))}
                className={`glass-input w-full text-sm ${errors.totalCopies ? 'border-red-500/50' : ''}`}
              />
              {errors.totalCopies && <p className="text-xs text-red-400 mt-1">{errors.totalCopies}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              id="confirm-edit-btn"
              type="submit"
              disabled={loading || success}
              className="btn-primary flex-1 justify-center"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost" disabled={loading || success}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
