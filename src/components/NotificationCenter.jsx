import { useState, useRef, useEffect } from 'react';
import { BellIcon, XMarkIcon } from './Icons';

function EmailReminderModal({ tx, book, onClose }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel w-full max-w-lg bg-white border border-academic-border shadow-lg rounded" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 border-b border-academic-border pb-2">
          <h3 className="font-serif font-bold text-academic-charcoal text-lg">Send Email Reminder</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-academic-hover text-academic-gray cursor-pointer" aria-label="Close">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-8 text-academic-forest font-semibold">
            <div className="w-12 h-12 rounded-full bg-academic-lightGreen border border-academic-forest/20 flex items-center justify-center mx-auto mb-3">✓</div>
            <p>Reminder Email Sent Successfully!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-academic-gray bg-academic-hover p-3 rounded border border-academic-border">
              <p><strong>To:</strong> {tx.borrowerName} ({tx.borrowerEmail})</p>
              <p className="mt-1"><strong>Subject:</strong> OVERDUE LIBRARY NOTICE: "{book?.title}"</p>
            </div>
            <div className="border border-academic-border p-4 rounded text-sm font-serif bg-[#FCFAF7] text-academic-charcoal whitespace-pre-line leading-relaxed">
              {`Dear ${tx.borrowerName},

This is an automated notification from the University LibraryOS administration. 

Our records indicate that the book titled "${book?.title}" (ISBN: ${book?.isbn}) which was issued to you is now overdue. It was scheduled for return on ${new Date(tx.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.

Please return this book to the main desk as soon as possible to avoid further accruals of the daily overdue fine ($0.50/day).

Current Pending Fine: $${tx.currentFine?.toFixed(2) || '0.00'}

Sincerely,
University Library Registrar
LibraryOS Portal`}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-academic-border">
              <button
                onClick={handleSend}
                disabled={sending}
                className="btn-primary"
              >
                {sending ? 'Sending…' : 'Send Reminder'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded text-sm font-medium text-academic-charcoal border border-academic-border bg-white hover:bg-academic-hover transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationCenter({ transactions, getBook, calcFinePreview }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const dropdownRef = useRef(null);

  // Filter for active transactions that are overdue
  const overdueItems = transactions
    .filter(t => t.status !== 'returned')
    .map(t => {
      const preview = calcFinePreview(t.id);
      return { ...t, overdueDays: preview.overdueDays, currentFine: preview.fine };
    })
    .filter(t => t.overdueDays > 0);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded hover:bg-academic-burgundy/10 text-academic-charcoal cursor-pointer transition-colors"
        title="Alert center"
      >
        <BellIcon className="w-5 h-5" />
        {overdueItems.length > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-academic-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-academic-gold"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 max-w-[90vw] bg-white border border-academic-border rounded shadow-lg z-50 overflow-hidden font-sans">
          <div className="bg-academic-hover border-b border-academic-border px-4 py-3 flex items-center justify-between">
            <span className="font-serif font-bold text-academic-charcoal">Overdue Alerts</span>
            <span className="badge-overdue text-xs font-bold">{overdueItems.length} items</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {overdueItems.length === 0 ? (
              <div className="text-center py-8 text-academic-gray text-sm">
                <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-25 text-academic-gray" />
                <p>No overdue items found</p>
              </div>
            ) : (
              overdueItems.map(t => {
                const book = getBook(t.bookId);
                return (
                  <div key={t.id} className="p-4 hover:bg-academic-hover/30 transition-colors text-xs">
                    <p className="font-serif font-bold text-academic-charcoal text-sm truncate">{book?.title || 'Unknown'}</p>
                    <p className="text-academic-gray mt-0.5">Issued to: <strong className="text-academic-charcoal">{t.borrowerName}</strong></p>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-academic-burgundy font-semibold">
                        ⚠ {t.overdueDays} day{t.overdueDays !== 1 ? 's' : ''} overdue (${t.currentFine.toFixed(2)})
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTx(t);
                          setIsOpen(false);
                        }}
                        className="px-2.5 py-1.5 text-[10px] font-semibold text-academic-burgundy bg-academic-burgundy/10 hover:bg-academic-burgundy/20 rounded cursor-pointer transition-colors"
                      >
                        Remind
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {selectedTx && (
        <EmailReminderModal
          tx={selectedTx}
          book={getBook(selectedTx.bookId)}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
}
