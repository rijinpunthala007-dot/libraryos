import { useState } from 'react';
import { XMarkIcon, BookOpenIcon } from './Icons';

const FIELDS = [
  { name: 'title', label: 'Book Title', placeholder: 'e.g. The Great Gatsby', type: 'text' },
  { name: 'author', label: 'Author', placeholder: 'e.g. F. Scott Fitzgerald', type: 'text' },
  { name: 'isbn', label: 'ISBN', placeholder: 'e.g. 978-0743273565', type: 'text' },
  { name: 'totalCopies', label: 'Total Copies', placeholder: 'e.g. 5', type: 'number' },
];

const empty = { title: '', author: '', isbn: '', totalCopies: '' };

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
      }, 1800);
    } catch (err) {
      setErrors({ isbn: err.message });
    }
  };

  return (
    <div className="glass-card p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl stat-card-indigo">
            <BookOpenIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text">Add New Book</h2>
            <p className="text-xs text-text-dim mt-0.5">Add a new title to the library collection</p>
          </div>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-white/[0.06] text-text-dim hover:text-text transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm flex items-center gap-2 animate-fade-in">
          <span>✓</span> Book added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map(f => (
            <div key={f.name} className={f.name === 'title' ? 'sm:col-span-2' : ''}>
              <label htmlFor={`field-${f.name}`} className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
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
                className={`glass-input w-full text-sm ${errors[f.name] ? 'border-red-500/50 ring-2 ring-red-500/20' : ''}`}
              />
              {errors[f.name] && (
                <p className="text-xs text-red-400 mt-1">{errors[f.name]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button id="add-book-submit" type="submit" className="btn-primary flex-1 justify-center">
            Add Book to Library
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-ghost">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
