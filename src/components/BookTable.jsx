import { useState } from 'react';
import { SearchIcon, FilterIcon, TrashIcon, ArrowDownIcon, PencilIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from './Icons';

function StatusBadge({ available, total }) {
  if (available === 0) return <span className="badge-out">● Out of Stock</span>;
  if (available < total * 0.3) return <span className="badge-overdue">● Low Stock</span>;
  return <span className="badge-available">● Available</span>;
}

function ConditionBadge({ condition }) {
  const styles = {
    'Mint': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Good': 'bg-green-50 text-green-700 border-green-150',
    'Worn': 'bg-amber-50 text-amber-700 border-amber-200',
    'Damaged': 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${styles[condition] || 'bg-gray-50 border-gray-200'}`}>
      {condition}
    </span>
  );
}

export default function BookTable({ books, onIssue, onEdit, onDelete, onExport, onImport }) {
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

  const handleImportChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        onImport(evt.target.result);
        alert("Backup database imported successfully!");
      } catch (err) {
        alert("Error importing backup: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const filtered = books
    .filter(b => {
      const q = search.toLowerCase();
      const matchSearch = b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        (b.genre && b.genre.toLowerCase().includes(q));
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
    if (sortField !== field) return <span className="text-academic-gray opacity-40">↕</span>;
    return sortDir === 'asc'
      ? <ArrowDownIcon className="w-3 h-3 inline text-academic-burgundy" />
      : <ArrowDownIcon className="w-3 h-3 inline rotate-180 text-academic-burgundy" />;
  };

  const thClass = "px-4 py-3.5 text-left text-xs font-semibold text-academic-gray uppercase tracking-wider cursor-pointer select-none hover:text-academic-charcoal transition-colors whitespace-nowrap";

  return (
    <div className="glass-card overflow-hidden bg-white border border-academic-border shadow-sm rounded">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-academic-border bg-white flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 w-full">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-gray" />
          <input
            id="book-search"
            type="text"
            placeholder="Search by title, author, genre, or ISBN…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="glass-input w-full pl-9 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-burgundy pointer-events-none" />
            <select
              id="book-filter"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-white border border-academic-burgundy text-academic-burgundy pl-9 pr-8 py-2.5 rounded text-sm appearance-none cursor-pointer w-full sm:min-w-[140px] focus:outline-none focus:ring-2 focus:ring-academic-burgundy/20 transition-all font-medium"
            >
              <option value="all">All Books</option>
              <option value="available">Available</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          {/* Backup Import/Export Tools */}
          <button
            onClick={onExport}
            className="px-3 py-2 bg-white border border-academic-border hover:bg-academic-hover rounded text-xs font-semibold text-academic-charcoal cursor-pointer transition-colors flex items-center gap-1.5"
            title="Download library JSON backup"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            Export
          </button>
          <label
            className="px-3 py-2 bg-white border border-academic-border hover:bg-academic-hover rounded text-xs font-semibold text-academic-charcoal cursor-pointer transition-colors flex items-center gap-1.5"
            title="Upload library JSON backup"
          >
            <ArrowUpTrayIcon className="w-3.5 h-3.5" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-academic-gray bg-white">
            <SearchIcon className="w-10 h-10 mb-3 opacity-30 text-academic-gray" />
            <p className="font-semibold text-academic-charcoal">No books found</p>
            <p className="text-sm mt-1 opacity-60">Try adjusting your search or filter</p>
          </div>
        ) : (
          <table className="w-full bg-white">
            <thead>
              <tr className="border-b border-academic-border bg-academic-hover">
                <th className={thClass} onClick={() => handleSort('title')}>
                  Title / Spine <SortIcon field="title" />
                </th>
                <th className={`${thClass} hidden sm:table-cell`} onClick={() => handleSort('author')}>
                  Author <SortIcon field="author" />
                </th>
                <th className={`${thClass} hidden md:table-cell`} onClick={() => handleSort('genre')}>
                  Genre <SortIcon field="genre" />
                </th>
                <th className={`${thClass} hidden lg:table-cell`}>ISBN</th>
                <th className={`${thClass} hidden sm:table-cell`} onClick={() => handleSort('condition')}>
                  Condition <SortIcon field="condition" />
                </th>
                <th className={`${thClass} hidden sm:table-cell`} onClick={() => handleSort('totalCopies')}>
                  Total <SortIcon field="totalCopies" />
                </th>
                <th className={thClass} onClick={() => handleSort('availableCopies')}>
                  Available <SortIcon field="availableCopies" />
                </th>
                <th className={`${thClass} hidden sm:table-cell`}>Status</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((book) => (
                <tr
                  key={book.id}
                  className="table-row-hover border-b border-gray-200 bg-white last:border-0"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {/* CSS Book Spine Art */}
                      <div
                        className="w-3.5 h-10 shadow-sm border-r-2 border-white/20 relative flex flex-col justify-between py-1 select-none items-center rounded-l"
                        style={{ backgroundColor: book.spineColor || '#8B0000', borderLeft: '1px solid rgba(0,0,0,0.1)' }}
                      >
                        <div className="w-full h-[2px] bg-academic-gold/50" />
                        <div className="w-full h-[2px] bg-academic-gold/50 mt-auto" />
                      </div>
                      <div>
                        <p className="font-serif font-bold text-academic-charcoal text-sm leading-tight">{book.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-academic-charcoal text-sm whitespace-nowrap hidden sm:table-cell">{book.author}</td>
                  <td className="px-4 py-3 text-academic-charcoal text-xs whitespace-nowrap font-medium hidden md:table-cell">{book.genre || 'Literature'}</td>
                  <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                    <code className="text-[10px] text-academic-charcoal bg-academic-hover border border-academic-border/30 px-1.5 py-0.5 rounded font-mono">{book.isbn}</code>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                    <ConditionBadge condition={book.condition || 'Good'} />
                  </td>
                  <td className="px-4 py-3 text-academic-charcoal text-sm text-center whitespace-nowrap font-medium hidden sm:table-cell">{book.totalCopies}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className={`text-sm font-bold ${book.availableCopies === 0 ? 'text-academic-burgundy' : 'text-academic-forest'}`}>
                      {book.availableCopies}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                    <StatusBadge available={book.availableCopies} total={book.totalCopies} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        id={`issue-btn-${book.id}`}
                        onClick={() => onIssue(book)}
                        disabled={book.availableCopies === 0}
                        className="btn-success px-2 py-1 text-[10px] sm:px-3 sm:py-2 sm:text-xs"
                        title={book.availableCopies === 0 ? 'No copies available' : 'Issue this book'}
                      >
                        Issue
                      </button>
                      <button
                        id={`edit-btn-${book.id}`}
                        onClick={() => onEdit(book)}
                        className="inline-flex items-center justify-center p-1.5 rounded text-academic-gray border border-academic-border bg-white hover:bg-academic-hover hover:text-academic-charcoal transition-all duration-200 cursor-pointer"
                        title="Edit book details"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                      {confirmDeleteId === book.id ? (
                        <div className="flex items-center gap-1.5">
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
                            className="px-2 py-1 text-xs bg-academic-burgundy hover:bg-red-800 text-white rounded transition-colors cursor-pointer font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-xs text-academic-gray hover:text-academic-charcoal transition-colors cursor-pointer border border-academic-border rounded bg-white hover:bg-academic-hover"
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
        <div className="px-5 py-3 border-t border-academic-border text-xs text-academic-gray bg-white font-medium">
          Showing <span className="text-academic-charcoal font-semibold">{filtered.length}</span> of{' '}
          <span className="text-academic-charcoal font-semibold">{books.length}</span> books
        </div>
      )}
    </div>
  );
}
