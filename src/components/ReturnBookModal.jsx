import { useState } from 'react';
import { XMarkIcon, ReturnIcon, ExclamationIcon } from './Icons';

export default function ReturnBookModal({ transactions, getBook, calcFinePreview, onReturn, onClose, getSimulatedNow }) {
  const [selectedTxId, setSelectedTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const active = transactions.filter(t => t.status === 'active' || t.status === 'overdue');

  const selected = active.find(t => t.id === selectedTxId);
  const book = selected ? getBook(selected.bookId) : null;
  const preview = selected ? calcFinePreview(selected.id) : null;

  const isOverdue = preview && preview.overdueDays > 0;

  const handleReturn = () => {
    if (!selectedTxId) return;
    setLoading(true);
    setTimeout(() => {
      const r = onReturn(selectedTxId);
      setResult(r);
      setLoading(false);
    }, 400);
  };

  if (result) {
    return (
      <div className="modal-backdrop" role="dialog" aria-modal="true">
        <div className="modal-panel w-full max-w-sm text-center bg-white border border-academic-border shadow-lg rounded">
          <div className={`w-14 h-14 rounded flex items-center justify-center mx-auto mb-4 border border-academic-gold/30 ${result.fine > 0 ? 'bg-academic-burgundy' : 'bg-academic-forest'}`}>
            <ReturnIcon className="w-7 h-7 text-academic-cream" />
          </div>
          <h3 className="text-xl font-serif font-bold text-academic-charcoal mb-1">Book Returned!</h3>
          {result.fine > 0 ? (
            <>
              <p className="text-academic-gray text-sm mb-1">{result.overdueDays} day{result.overdueDays !== 1 ? 's' : ''} overdue</p>
              <p className="text-3xl font-serif font-bold text-academic-burgundy mt-3">${result.fine.toFixed(2)} Fine</p>
              <p className="text-academic-gray text-xs mt-1">Collect fine from borrower</p>
            </>
          ) : (
            <p className="text-academic-forest font-semibold text-sm mt-2">Returned on time — no fine!</p>
          )}
          <button onClick={onClose} className="btn-primary mt-6 justify-center w-full">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="return-modal-title">
      <div className="modal-panel w-full max-w-md bg-white border border-academic-border shadow-lg rounded" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-academic-border pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-academic-burgundy border border-academic-gold/30 flex items-center justify-center">
              <ReturnIcon className="w-5 h-5 text-academic-cream" />
            </div>
            <h2 id="return-modal-title" className="text-lg font-serif font-bold text-academic-charcoal">Return Book</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-academic-hover text-academic-gray hover:text-academic-charcoal transition-colors cursor-pointer" aria-label="Close">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {active.length === 0 ? (
          <div className="text-center py-8 text-academic-gray">
            <ReturnIcon className="w-10 h-10 mx-auto mb-3 opacity-30 text-academic-gray" />
            <p className="font-semibold text-academic-charcoal">No active loans</p>
            <p className="text-sm mt-1 opacity-60">All books have been returned</p>
            <button onClick={onClose} className="btn-ghost mt-4">Close</button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="select-tx" className="block text-xs font-semibold text-academic-charcoal uppercase tracking-wider mb-1.5">
                Select Transaction
              </label>
              <select
                id="select-tx"
                value={selectedTxId}
                onChange={e => { setSelectedTxId(e.target.value); }}
                className="glass-input w-full text-sm bg-white border border-academic-border cursor-pointer focus:outline-none"
              >
                <option value="">— Choose a loan —</option>
                {active.map(tx => {
                  const b = getBook(tx.bookId);
                  const isOD = getSimulatedNow() > new Date(tx.dueDate);
                  return (
                    <option key={tx.id} value={tx.id}>
                      {b?.title ?? 'Unknown'} → {tx.borrowerName}{isOD ? ' ⚠ OVERDUE' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {selected && book && preview && (
              <div className={`p-4 rounded border mb-5 ${isOverdue ? 'bg-academic-lightRed border-academic-burgundy/25' : 'bg-academic-hover border-academic-border'}`}>
                <p className="font-serif font-bold text-academic-charcoal text-sm">{book.title}</p>
                <p className="text-academic-gray text-xs mt-1">{book.author}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-academic-gray">Borrower</span>
                    <p className="text-academic-charcoal font-semibold">{selected.borrowerName}</p>
                  </div>
                  <div>
                    <span className="text-academic-gray">Due Date</span>
                    <p className={`font-semibold ${isOverdue ? 'text-academic-burgundy' : 'text-academic-charcoal'}`}>
                      {new Date(selected.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {isOverdue && (
                  <div className="mt-3 flex items-center gap-2 text-academic-burgundy text-xs font-semibold">
                    <ExclamationIcon className="w-4 h-4 flex-shrink-0 text-academic-burgundy" />
                    <span>
                      <strong>{preview.overdueDays} day{preview.overdueDays !== 1 ? 's' : ''} overdue</strong> — Fine: <strong>${preview.fine.toFixed(2)}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                id="confirm-return-btn"
                disabled={!selectedTxId || loading}
                onClick={handleReturn}
                className="btn-primary flex-1 justify-center"
              >
                {loading ? 'Processing…' : 'Confirm Return'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded text-sm font-medium text-academic-charcoal border border-academic-border bg-white hover:bg-academic-hover transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
