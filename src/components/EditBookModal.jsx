import { useState, useEffect } from 'react';
import { XMarkIcon, BookOpenIcon } from './Icons';

const GENRES = ['Literature', 'Science', 'History', 'Social Sciences', 'Philosophy', 'General'];
const CONDITIONS = ['Mint', 'Good', 'Worn', 'Damaged'];
const COLORS = [
  { hex: '#8B0000', label: 'Crimson Burgundy' },
  { hex: '#1B4332', label: 'Forest Green' },
  { hex: '#1E3A8A', label: 'Oxford Blue' },
  { hex: '#D4A574', label: 'Warm Gold' },
  { hex: '#4B5563', label: 'Slate Gray' },
];

export default function EditBookModal({ book, onUpdate, onClose }) {
  const [form, setForm] = useState({ title: '', author: '', isbn: '', totalCopies: '', genre: 'Literature', condition: 'Good', spineColor: '#8B0000' });
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
        genre: book.genre || 'Literature',
        condition: book.condition || 'Good',
        spineColor: book.spineColor || '#8B0000',
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
      <div className="modal-panel w-full max-w-md bg-white border border-academic-border shadow-lg rounded" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-academic-border pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-academic-burgundy border border-academic-gold/30 flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5 text-academic-cream" />
            </div>
            <h2 id="edit-modal-title" className="text-lg font-serif font-bold text-academic-charcoal">Edit Book Inventory</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-academic-hover text-academic-gray hover:text-academic-charcoal transition-colors cursor-pointer" aria-label="Close">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {success && (
          <div className="mb-4 px-4 py-2.5 rounded bg-academic-lightGreen border border-academic-forest/20 text-academic-forest text-sm font-semibold flex items-center gap-2 animate-fade-in">
            <span>✓</span> Book updated successfully!
          </div>
        )}

        {errors.global && (
          <div className="mb-4 px-4 py-2.5 rounded bg-academic-lightRed border border-academic-burgundy/20 text-academic-burgundy text-sm font-semibold animate-fade-in">
            {errors.global}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="edit-title" className="block text-xs font-semibold text-academic-charcoal uppercase tracking-wider mb-1.5">
              Book Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={`glass-input w-full text-sm bg-white border border-academic-border ${errors.title ? 'border-academic-burgundy ring-2 ring-academic-burgundy/15' : ''}`}
            />
            {errors.title && <p className="text-xs text-academic-burgundy font-semibold mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="edit-author" className="block text-xs font-semibold text-academic-charcoal uppercase tracking-wider mb-1.5">
              Author
            </label>
            <input
              id="edit-author"
              type="text"
              value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              className={`glass-input w-full text-sm bg-white border border-academic-border ${errors.author ? 'border-academic-burgundy ring-2 ring-academic-burgundy/15' : ''}`}
            />
            {errors.author && <p className="text-xs text-academic-burgundy font-semibold mt-1">{errors.author}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-isbn" className="block text-xs font-semibold text-academic-charcoal uppercase tracking-wider mb-1.5">
                ISBN
              </label>
              <input
                id="edit-isbn"
                type="text"
                value={form.isbn}
                onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))}
                className={`glass-input w-full text-sm bg-white border border-academic-border ${errors.isbn ? 'border-academic-burgundy ring-2 ring-academic-burgundy/15' : ''}`}
              />
              {errors.isbn && <p className="text-xs text-academic-burgundy font-semibold mt-1">{errors.isbn}</p>}
            </div>

            <div>
              <label htmlFor="edit-copies" className="block text-xs font-semibold text-academic-charcoal uppercase tracking-wider mb-1.5">
                Total Copies
              </label>
              <input
                id="edit-copies"
                type="number"
                min="1"
                value={form.totalCopies}
                onChange={e => setForm(f => ({ ...f, totalCopies: e.target.value }))}
                className={`glass-input w-full text-sm bg-white border border-academic-border ${errors.totalCopies ? 'border-academic-burgundy ring-2 ring-academic-burgundy/15' : ''}`}
              />
              {errors.totalCopies && <p className="text-xs text-academic-burgundy font-semibold mt-1">{errors.totalCopies}</p>}
            </div>

            <div>
              <label htmlFor="edit-genre" className="block text-xs font-semibold text-academic-charcoal uppercase mb-1.5">
                Subject Genre
              </label>
              <select
                id="edit-genre"
                value={form.genre}
                onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                className="glass-input w-full text-sm bg-white border border-academic-border focus:outline-none"
              >
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="edit-condition" className="block text-xs font-semibold text-academic-charcoal uppercase mb-1.5">
                Book Condition
              </label>
              <select
                id="edit-condition"
                value={form.condition}
                onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                className="glass-input w-full text-sm bg-white border border-academic-border focus:outline-none"
              >
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label htmlFor="edit-spineColor" className="block text-xs font-semibold text-academic-charcoal uppercase mb-1.5">
                Book Spine Binding Color
              </label>
              <div className="flex gap-3 items-center">
                <select
                  id="edit-spineColor"
                  value={form.spineColor}
                  onChange={e => setForm(f => ({ ...f, spineColor: e.target.value }))}
                  className="glass-input flex-1 text-sm bg-white border border-academic-border focus:outline-none"
                >
                  {COLORS.map(c => <option key={c.hex} value={c.hex}>{c.label}</option>)}
                </select>
                <div
                  className="w-10 h-10 border border-academic-border rounded shadow-sm"
                  style={{ backgroundColor: form.spineColor }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-academic-border mt-2">
            <button
              id="confirm-edit-btn"
              type="submit"
              disabled={loading || success}
              className="btn-primary flex-1 justify-center"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded text-sm font-medium text-academic-charcoal border border-academic-border bg-white hover:bg-academic-hover transition-colors cursor-pointer"
              disabled={loading || success}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
