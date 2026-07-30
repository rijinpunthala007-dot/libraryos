import { useState, useRef, useEffect } from 'react';
import { LibraryIcon, ReturnIcon, BookOpenIcon, ClockIcon, ChartBarIcon, AcademicCapIcon, FolderIcon } from './Icons';
import NotificationCenter from './NotificationCenter';

function GearIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export default function Navbar({
  activePage,
  onNavigate,
  onIssueClick,
  onReturnClick,
  transactions,
  getBook,
  calcFinePreview,
  simulatedDaysOffset,
  setSimulatedDaysOffset,
  getSimulatedNow,
  onResetData,
}) {
  const [devOpen, setDevOpen] = useState(false);
  const panelRef = useRef(null);

  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpenIcon },
    { id: 'inventory', label: 'Books', icon: FolderIcon },
    { id: 'borrowers', label: 'Borrowers', icon: AcademicCapIcon },
    { id: 'transactions', label: 'Transactions', icon: ClockIcon },
    { id: 'reports', label: 'Reports', icon: ChartBarIcon },
  ];

  const isSimulating = simulatedDaysOffset > 0;

  const simulatedDate = getSimulatedNow
    ? getSimulatedNow().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  // Close the panel on click outside
  useEffect(() => {
    if (!devOpen) return;
    function handleOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setDevOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [devOpen]);

  return (
    <div className="sticky top-0 z-40" ref={panelRef}>
      {/* ── Main navbar bar ── */}
      <nav className="bg-[#FAF9F6] border-b-[3px] border-[#8B0000] font-sans">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="p-1.5 rounded bg-[#8B0000] flex items-center justify-center">
                <LibraryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#FAF9F6]" />
              </div>
              <span className="font-serif font-bold text-[#2C3E50] text-base sm:text-lg tracking-tight select-none">
                LibraryOS
              </span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1.5">
              {links.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onNavigate(id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-sm font-medium transition-all duration-200 cursor-pointer ${
                    activePage === id
                      ? 'bg-[#8B0000]/10 text-[#8B0000] font-semibold'
                      : 'text-[#2C3E50]/80 hover:bg-[#8B0000]/5 hover:text-[#8B0000]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Right-side actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <NotificationCenter
                transactions={transactions}
                getBook={getBook}
                calcFinePreview={calcFinePreview}
              />

              <button
                id="nav-issue-btn"
                onClick={onIssueClick}
                className="bg-[#8B0000] hover:bg-[#6B0000] text-[#FAF9F6] font-medium px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded text-xs border border-[#8B0000] hover:border-[#6B0000] transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer whitespace-nowrap"
              >
                Issue<span className="hidden sm:inline"> Book</span>
              </button>

              <button
                id="nav-return-btn"
                onClick={onReturnClick}
                className="bg-[#8B0000] hover:bg-[#6B0000] text-[#FAF9F6] font-medium px-2 sm:px-3.5 py-1.5 sm:py-2 rounded text-xs border border-[#8B0000] hover:border-[#6B0000] transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
              >
                <ReturnIcon className="w-3.5 h-3.5 text-current" />
                <span className="hidden sm:inline">Return</span>
              </button>

              {/* ── Gear / Dev-tools toggle ── */}
              <div className="relative">
                <button
                  id="dev-tools-toggle"
                  onClick={() => setDevOpen(o => !o)}
                  title="Developer tools"
                  className={`relative p-1.5 rounded transition-all duration-200 cursor-pointer border ${
                    devOpen
                      ? 'bg-[#8B0000]/10 border-[#8B0000]/30 text-[#8B0000]'
                      : 'border-transparent text-[#2C3E50]/60 hover:text-[#2C3E50] hover:bg-[#8B0000]/5 hover:border-[#8B0000]/20'
                  }`}
                  aria-expanded={devOpen}
                  aria-label="Toggle developer tools"
                >
                  <GearIcon className={`w-4 h-4 transition-transform duration-300 ${devOpen ? 'rotate-90' : ''}`} />
                  {/* Dot indicator — shown when time is being simulated */}
                  {isSimulating && (
                    <span className="absolute top-0.5 right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B0000] opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B0000]" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile nav links - Single horizontal scrollable bar */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 border-t border-[#8B0000]/10 -mx-4 px-4">
            {links.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activePage === id
                    ? 'bg-[#8B0000] text-[#FAF9F6] font-semibold shadow-sm'
                    : 'bg-[#8B0000]/5 text-[#2C3E50]/80 hover:bg-[#8B0000]/10 hover:text-[#8B0000]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

        </div>
      </nav>

      {/* ── Collapsible Dev-Tools Panel ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          devOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!devOpen}
      >
        <div className="bg-[#F5F0EB] border-b border-[#D4C5B9] shadow-sm">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">

              {/* Current simulated date */}
              <div className="flex flex-wrap items-center gap-2 text-[#6B7280]">
                <span className={`inline-block w-2 h-2 rounded-full ${isSimulating ? 'bg-[#8B0000] animate-pulse' : 'bg-[#1B4332]'}`} />
                <span className="font-medium text-[#2C3E50]">Dev Tools</span>
                <span className="text-[#6B7280]">·</span>
                <span>Simulated Date:</span>
                <strong className="text-[#2C3E50] font-semibold whitespace-nowrap">{simulatedDate}</strong>
                {isSimulating && (
                  <span className="text-[#8B0000] font-medium bg-red-50 border border-[#8B0000]/20 px-1.5 py-0.5 rounded whitespace-nowrap">
                    +{simulatedDaysOffset} days simulated
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSimulatedDaysOffset(p => p + 5)}
                  className="px-2.5 py-1 rounded bg-white hover:bg-[#F5F0EB] border border-[#D4C5B9] text-[#2C3E50] transition-colors cursor-pointer whitespace-nowrap font-medium"
                >
                  +5 Days
                </button>
                <button
                  onClick={() => setSimulatedDaysOffset(p => p + 15)}
                  className="px-2.5 py-1 rounded bg-white hover:bg-[#F5F0EB] border border-[#D4C5B9] text-[#2C3E50] transition-colors cursor-pointer whitespace-nowrap font-medium"
                >
                  +15 Days
                </button>
                {isSimulating && (
                  <button
                    onClick={() => setSimulatedDaysOffset(0)}
                    className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-[#8B0000] font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Reset Time
                  </button>
                )}
                <div className="w-px h-4 bg-[#D4C5B9]" />
                <button
                  id="reset-demo-btn"
                  onClick={() => {
                    if (confirm('Reset all inventory, borrowers and transactions to defaults?')) {
                      onResetData();
                      setDevOpen(false);
                    }
                  }}
                  className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-[#8B0000] font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  Reset Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
