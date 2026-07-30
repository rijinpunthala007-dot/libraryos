import { useState } from 'react';

const FIELDS = [
  { name: 'title', label: 'Book Title', placeholder: 'e.g. The Great Gatsby', type: 'text' },
  { name: 'author', label: 'Author', placeholder: 'e.g. F. Scott Fitzgerald', type: 'text' },
  { name: 'isbn', label: 'ISBN', placeholder: 'e.g. 978-0743273565', type: 'text' },
  { name: 'totalCopies', label: 'Total Copies', placeholder: 'e.g. 5', type: 'number' },
];

const GENRES = ['Literature', 'Science', 'History', 'Social Sciences', 'Philosophy', 'General'];
const CONDITIONS = ['Mint', 'Good', 'Worn', 'Damaged'];
const COLORS = [
  { hex: '#8B0000', label: 'Crimson Burgundy' },
  { hex: '#1B4332', label: 'Forest Green' },
  { hex: '#1E3A8A', label: 'Oxford Blue' },
  { hex: '#D4A574', label: 'Warm Gold' },
  { hex: '#4B5563', label: 'Slate Gray' },
];

const empty = { title: '', author: '', isbn: '', totalCopies: '', genre: 'Literature', condition: 'Good', spineColor: '#8B0000' };

export default function AddBookForm({ onAdd, onCancel }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.author.trim()) e.author = 'Author is required';
    if (!form.isbn.trim()) e.isbn = 'ISBN is required';
    if (!form.totalCopies || Number(form.totalCopies) < 1) e.totalCopies = 'Enter at least 1 copy';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      onAdd(form);
      setSuccess(true);
      setTimeout(() => {
        setForm(empty);
        setErrors({});
        setSuccess(false);
        // Auto-navigate back to catalog after successful add
        if (onCancel) onCancel();
      }, 1600);
    } catch (err) {
      setErrors({ isbn: err.message });
    }
  };

  return (
    <div className="glass-card p-6 bg-white border border-academic-border rounded shadow-sm">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3.5 mb-6 border-b border-academic-border pb-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded hover:bg-academic-hover text-academic-charcoal border border-academic-border bg-white cursor-pointer transition-all duration-200 flex items-center justify-center hover:-translate-x-0.5 active:translate-x-0"
            title="Back to Catalog"
            aria-label="Back to Catalog"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}
        <div className="flex-1">
          <h2 className="text-lg font-serif font-bold text-academic-charcoal">Add New Book</h2>
          <p className="text-xs text-academic-gray mt-0.5">Add a new title to the library collection</p>
        </div>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 rounded bg-academic-lightGreen border border-academic-forest/20 text-academic-forest text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <span>✓</span> Book added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map(f => (
            <div key={f.name} className={f.name === 'title' ? 'sm:col-span-2' : ''}>
              <label htmlFor={`field-${f.name}`} className="block text-xs font-semibold text-academic-charcoal uppercase tracking-wider mb-1.5">
                {f.label}
              </label>
              <input
                id={`field-${f.name}`}
                name={f.name}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
                min={f.type === 'number' ? 1 : undefined}
                className={`glass-input w-full text-sm bg-white border border-academic-border ${errors[f.name] ? 'border-academic-burgundy ring-2 ring-academic-burgundy/15' : ''}`}
              />
              {errors[f.name] && (
                <p className="text-xs text-academic-burgundy font-semibold mt-1">{errors[f.name]}</p>
              )}
            </div>
          ))}

          {/* Genre field */}
          <div>
            <label htmlFor="field-genre" className="block text-xs font-semibold text-academic-charcoal uppercase mb-1.5">
              Subject Genre
            </label>
            <select
              id="field-genre"
              name="genre"
              value={form.genre}
              onChange={handleChange}
              className="glass-input w-full text-sm bg-white border border-academic-border focus:outline-none"
            >
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Condition field */}
          <div>
            <label htmlFor="field-condition" className="block text-xs font-semibold text-academic-charcoal uppercase mb-1.5">
              Book Condition
            </label>
            <select
              id="field-condition"
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="glass-input w-full text-sm bg-white border border-academic-border focus:outline-none"
            >
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Spine color field */}
          <div className="sm:col-span-2">
            <label htmlFor="field-spineColor" className="block text-xs font-semibold text-academic-charcoal uppercase mb-1.5">
              Book Spine Binding Color
            </label>
            <div className="flex gap-3 items-center">
              <select
                id="field-spineColor"
                name="spineColor"
                value={form.spineColor}
                onChange={handleChange}
                className="glass-input flex-1 text-sm bg-white border border-academic-border focus:outline-none"
              >
                {COLORS.map(c => <option key={c.hex} value={c.hex}>{c.label}</option>)}
              </select>
              <div
                className="w-10 h-10 border border-academic-border rounded shadow-sm transition-all duration-300"
                style={{ backgroundColor: form.spineColor }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button id="add-book-submit" type="submit" className="btn-primary flex-1 justify-center">
            Add Book to Library
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded text-sm font-medium text-academic-charcoal border border-academic-border bg-white hover:bg-academic-hover transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
