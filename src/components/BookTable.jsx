import { useState } from 'react';
import { SearchIcon, FilterIcon, TrashIcon, ArrowDownIcon, PencilIcon } from './Icons';

function StatusBadge({ available, total }) {
  if (available === 0) return <span className="badge-out">● Out of Stock</span>;
  if (available < total * 0.3) return <span className="badge-overdue">● Low Stock</span>;
  return <span className="badge-available">● Available</span>;
}

export default function BookTable({ books, onIssue, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortField, setSortField] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = books
    .filter(b => {
      const q = search.toLowerCase();
      const matchSearch = b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q);
      const matchFilter =
        filter === 'all' ||
        (filter === 'available' && b.availableCopies > 0) ||
        (filter === 'out' && b.availableCopies === 0);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-text-dim opacity-40">↕</span>;
    return sortDir === 'asc'
      ? <ArrowDownIcon className="w-3 h-3 inline" />
      : <ArrowDownIcon className="w-3 h-3 inline rotate-180" />;
  };

  const thClass = "px-4 py-3 text-left text-xs font-semibold text-text-dim uppercase tracking-wider cursor-pointer select-none hover:text-text-muted transition-colors whitespace-nowrap";

  return (
    <div className="glass-card overflow-hidden">
      {/* Table Header */}
      <div className="p-5 border-b border-white/[0.06] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input
            id="book-search"
            type="text"
            placeholder="Search by title, author, or ISBN…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="glass-input w-full pl-9 text-sm"
          />
        </div>
        <div className="relative">
          <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
          <select
            id="book-filter"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="glass-input pl-9 pr-8 text-sm appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="all">All Books</option>
            <option value="available">Available</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-dim">
            <SearchIcon className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium">No books found</p>
            <p className="text-sm mt-1 opacity-60">Try adjusting your search or filter</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className={thClass} onClick={() => handleSort('title')}>
                  Title <SortIcon field="title" />
                </th>
                <th className={thClass} onClick={() => handleSort('author')}>
                  Author <SortIcon field="author" />
                </th>
                <th className={thClass}>ISBN</th>
                <th className={thClass} onClick={() => handleSort('totalCopies')}>
                  Total <SortIcon field="totalCopies" />
                </th>
                <th className={thClass} onClick={() => handleSort('availableCopies')}>
                  Available <SortIcon field="availableCopies" />
                </th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((book, idx) => (
                <tr
                  key={book.id}
                  className={`table-row-hover border-b border-white/[0.04] last:border-0 ${idx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                >
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="font-medium text-text text-sm leading-tight">{book.title}</p>
                  </td>
                  <td className="px-4 py-3.5 text-text-muted text-sm whitespace-nowrap">{book.author}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <code className="text-xs text-text-dim bg-white/[0.05] px-1.5 py-0.5 rounded font-mono">{book.isbn}</code>
                  </td>
                  <td className="px-4 py-3.5 text-text-muted text-sm text-center whitespace-nowrap">{book.totalCopies}</td>
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <span className={`text-sm font-semibold ${book.availableCopies === 0 ? 'text-red-400' : 'text-teal-400'}`}>
                      {book.availableCopies}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge available={book.availableCopies} total={book.totalCopies} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        id={`issue-btn-${book.id}`}
                        onClick={() => onIssue(book)}
                        disabled={book.availableCopies === 0}
                        className="btn-success"
                        title={book.availableCopies === 0 ? 'No copies available' : 'Issue this book'}
                      >
                        Issue
                      </button>
                      <button
                        id={`edit-btn-${book.id}`}
                        onClick={() => onEdit(book)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-text-muted border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:text-text transition-all duration-200 cursor-pointer"
                        title="Edit book details"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                      {confirmDeleteId === book.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              try {
                                onDelete(book.id);
                                setConfirmDeleteId(null);
                              } catch (err) {
                                alert(err.message);
                                setConfirmDeleteId(null);
                              }
                            }}
                            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-xs text-text-dim hover:text-text transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`delete-btn-${book.id}`}
                          onClick={() => setConfirmDeleteId(book.id)}
                          className="btn-danger"
                          title="Delete book"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-white/[0.06] text-xs text-text-dim">
          Showing <span className="text-text-muted font-medium">{filtered.length}</span> of{' '}
          <span className="text-text-muted font-medium">{books.length}</span> books
        </div>
      )}
    </div>
  );
}
