import { LibraryIcon, PlusIcon, ReturnIcon, BookOpenIcon } from './Icons';

export default function Navbar({ activePage, onNavigate, onIssueClick, onReturnClick }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpenIcon },
    { id: 'add-book', label: 'Add Book', icon: PlusIcon },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-white/[0.06]"
      style={{ background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg stat-card-indigo">
              <LibraryIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-text tracking-tight">
              Library<span className="text-brand-primaryLight">OS</span>
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activePage === id
                    ? 'bg-brand-primary/20 text-brand-primaryLight'
                    : 'text-text-muted hover:bg-white/[0.06] hover:text-text'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="nav-issue-btn"
              onClick={onIssueClick}
              className="btn-success text-xs"
            >
              Issue Book
            </button>
            <button
              id="nav-return-btn"
              onClick={onReturnClick}
              className="btn-ghost text-xs"
            >
              <ReturnIcon className="w-3.5 h-3.5" />
              Return
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex gap-1 pb-2">
          {links.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activePage === id
                  ? 'bg-brand-primary/20 text-brand-primaryLight'
                  : 'text-text-muted hover:bg-white/[0.06] hover:text-text'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
