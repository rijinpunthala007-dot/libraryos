import { useState } from 'react';
import { XMarkIcon, ReturnIcon, ExclamationIcon } from './Icons';

export default function ReturnBookModal({ transactions, getBook, calcFinePreview, onReturn, onClose }) {
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
        <div className="modal-panel w-full max-w-sm text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${result.fine > 0 ? 'stat-card-amber' : 'stat-card-teal'}`}>
            <ReturnIcon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-text mb-1">Book Returned!</h3>
          {result.fine > 0 ? (
            <>
              <p className="text-text-dim text-sm mb-1">{result.overdueDays} day{result.overdueDays !== 1 ? 's' : ''} overdue</p>
              <p className="text-2xl font-bold text-amber-400 mt-3">${result.fine.toFixed(2)} Fine</p>
              <p className="text-text-dim text-xs mt-1">Collect fine from borrower</p>
            </>
          ) : (
            <p className="text-teal-400 text-sm mt-2">Returned on time — no fine!</p>
          )}
          <button onClick={onClose} className="btn-primary mt-6 justify-center w-full">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="return-modal-title">
      <div className="modal-panel w-full max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl stat-card-indigo">
              <ReturnIcon className="w-5 h-5 text-white" />
            </div>
            <h2 id="return-modal-title" className="text-base font-semibold text-text">Return Book</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-text-dim transition-colors" aria-label="Close">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {active.length === 0 ? (
          <div className="text-center py-8 text-text-dim">
            <ReturnIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No active loans</p>
            <p className="text-sm mt-1 opacity-60">All books have been returned</p>
            <button onClick={onClose} className="btn-ghost mt-4">Close</button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="select-tx" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                Select Transaction
              </label>
              <select
                id="select-tx"
                value={selectedTxId}
                onChange={e => { setSelectedTxId(e.target.value); }}
                className="glass-input w-full text-sm"
              >
                <option value="">— Choose a loan —</option>
                {active.map(tx => {
                  const b = getBook(tx.bookId);
                  const isOD = new Date() > new Date(tx.dueDate);
                  return (
                    <option key={tx.id} value={tx.id}>
                      {b?.title ?? 'Unknown'} → {tx.borrowerName}{isOD ? ' ⚠ OVERDUE' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {selected && book && preview && (
              <div className={`p-4 rounded-xl border mb-5 ${isOverdue ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/[0.04] border-white/[0.06]'}`}>
                <p className="font-semibold text-text text-sm">{book.title}</p>
                <p className="text-text-dim text-xs mt-0.5">{book.author}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-text-dim">Borrower</span>
                    <p className="text-text-muted font-medium">{selected.borrowerName}</p>
                  </div>
                  <div>
                    <span className="text-text-dim">Due Date</span>
                    <p className={`font-medium ${isOverdue ? 'text-amber-400' : 'text-text-muted'}`}>
                      {new Date(selected.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {isOverdue && (
                  <div className="mt-3 flex items-center gap-2 text-amber-300 text-xs">
                    <ExclamationIcon className="w-4 h-4 flex-shrink-0" />
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
              <button onClick={onClose} className="btn-ghost">Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
