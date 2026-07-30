import { ChartBarIcon } from './Icons';

export default function ReportsPanel({ books, transactions, stats }) {
  // 1. Gather Genres Data
  const genreData = books.reduce((acc, b) => {
    acc[b.genre] = (acc[b.genre] || 0) + b.totalCopies;
    return acc;
  }, {});

  const genres = Object.entries(genreData).map(([name, value]) => ({ name, value }));
  const maxGenreValue = genres.reduce((max, g) => (g.value > max ? g.value : max), 1);

  // 2. Gather Conditions Data
  const conditionData = books.reduce((acc, b) => {
    acc[b.condition] = (acc[b.condition] || 0) + b.totalCopies;
    return acc;
  }, { 'Mint': 0, 'Good': 0, 'Worn': 0, 'Damaged': 0 });

  const totalCopiesCount = Object.values(conditionData).reduce((sum, val) => sum + val, 0);

  // 3. Fines Collections Data
  const paidFines = stats.finesCollected;
  const pendingFines = stats.finesPending;
  const totalFinesAccrued = paidFines + pendingFines;

  // 4. Popular Borrowed Books
  const borrowCounts = transactions.reduce((acc, t) => {
    acc[t.bookId] = (acc[t.bookId] || 0) + 1;
    return acc;
  }, {});

  const popularBooks = Object.entries(borrowCounts)
    .map(([bookId, count]) => {
      const book = books.find(b => b.id === bookId);
      return { title: book?.title || 'Unknown title', author: book?.author || '—', count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-2 border-b border-academic-border pb-2">
        <ChartBarIcon className="w-6 h-6 text-academic-burgundy" />
        <h2 className="text-xl font-serif font-bold text-academic-charcoal">Library Analytics & Audits</h2>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <div className="glass-card bg-white p-5 border border-academic-border shadow-sm rounded">
          <span className="text-xs font-semibold text-academic-gray uppercase tracking-wider">Fines Paid & Collected</span>
          <p className="text-3xl font-serif font-bold text-academic-forest mt-1">${paidFines.toFixed(2)}</p>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-academic-forest h-full"
              style={{ width: `${totalFinesAccrued > 0 ? (paidFines / totalFinesAccrued) * 100 : 100}%` }}
            />
          </div>
          <span className="text-[10px] text-academic-gray mt-1 block">Clearance Rate: {totalFinesAccrued > 0 ? ((paidFines / totalFinesAccrued) * 100).toFixed(0) : 100}%</span>
        </div>

        <div className="glass-card bg-white p-5 border border-academic-border shadow-sm rounded">
          <span className="text-xs font-semibold text-academic-gray uppercase tracking-wider">Unpaid Fines Pending</span>
          <p className="text-3xl font-serif font-bold text-academic-burgundy mt-1">${pendingFines.toFixed(2)}</p>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-academic-burgundy h-full"
              style={{ width: `${totalFinesAccrued > 0 ? (pendingFines / totalFinesAccrued) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10px] text-academic-gray mt-1 block">Pending Action</span>
        </div>

        <div className="glass-card bg-white p-5 border border-academic-border shadow-sm rounded">
          <span className="text-xs font-semibold text-academic-gray uppercase tracking-wider">Total Library Revenue</span>
          <p className="text-3xl font-serif font-bold text-academic-charcoal mt-1">${totalFinesAccrued.toFixed(2)}</p>
          <span className="text-[10px] text-academic-gray mt-4 block">Cumulative fine ledger accruals</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Genre Distribution SVG Chart */}
        <div className="glass-card bg-white p-6 border border-academic-border rounded shadow-sm">
          <h3 className="font-serif font-bold text-academic-charcoal text-lg mb-4 border-b border-academic-border pb-2">
            Collection Volume by Genre
          </h3>
          {genres.length === 0 ? (
            <p className="text-center text-xs text-academic-gray py-12">No inventory available to plot</p>
          ) : (
            <div className="space-y-4">
              {genres.map(g => {
                const pct = (g.value / maxGenreValue) * 100;
                return (
                  <div key={g.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-academic-charcoal">{g.name}</span>
                      <span className="font-bold text-academic-charcoal">{g.value} copies</span>
                    </div>
                    <div className="w-full bg-academic-hover h-5 rounded overflow-hidden flex border border-academic-border/30">
                      <div
                        className="bg-gradient-to-r from-academic-burgundy to-academic-burgundy/80 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Condition Audit & Popularity */}
        <div className="space-y-6">
          {/* Condition audit progress bar */}
          <div className="glass-card bg-white p-6 border border-academic-border rounded shadow-sm">
            <h3 className="font-serif font-bold text-academic-charcoal text-lg mb-4 border-b border-academic-border pb-2">
              Physical Condition Audit
            </h3>
            {totalCopiesCount === 0 ? (
              <p className="text-center text-xs text-academic-gray py-12">No book inventory to audit</p>
            ) : (
              <div className="space-y-5">
                {/* Visual stacked bar segment */}
                <div className="w-full h-7 rounded overflow-hidden flex border border-academic-border/40 bg-gray-100">
                  {Object.entries(conditionData).map(([cond, val]) => {
                    if (val === 0) return null;
                    const pct = (val / totalCopiesCount) * 100;
                    const colors = {
                      'Mint': 'bg-[#1B4332]',      // forest green
                      'Good': 'bg-[#2D6A4F]',      // medium green
                      'Worn': 'bg-[#D4A574]',      // warm gold
                      'Damaged': 'bg-[#8B0000]',   // burgundy
                    };
                    return (
                      <div
                        key={cond}
                        className={`${colors[cond]} h-full transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                        title={`${cond}: ${val} copies (${pct.toFixed(0)}%)`}
                      />
                    );
                  })}
                </div>

                {/* Legends */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {Object.entries(conditionData).map(([cond, val]) => {
                    const pct = totalCopiesCount > 0 ? (val / totalCopiesCount) * 100 : 0;
                    const dotColors = {
                      'Mint': 'bg-[#1B4332]',
                      'Good': 'bg-[#2D6A4F]',
                      'Worn': 'bg-[#D4A574]',
                      'Damaged': 'bg-[#8B0000]',
                    };
                    return (
                      <div key={cond} className="p-2 border border-academic-border/30 rounded bg-academic-hover flex flex-col items-center">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${dotColors[cond]}`} />
                          <span className="font-semibold text-academic-charcoal">{cond}</span>
                        </div>
                        <p className="font-serif font-bold text-academic-charcoal mt-1 text-sm">{val} copies</p>
                        <span className="text-[10px] text-academic-gray">{pct.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Popular listings */}
          <div className="glass-card bg-white p-6 border border-academic-border rounded shadow-sm">
            <h3 className="font-serif font-bold text-academic-charcoal text-lg mb-4 border-b border-academic-border pb-2">
              Most Borrowed Titles
            </h3>
            {popularBooks.length === 0 ? (
              <p className="text-center text-xs text-academic-gray py-6">No lending transactions recorded yet</p>
            ) : (
              <div className="divide-y divide-gray-200">
                {popularBooks.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-serif font-bold text-academic-charcoal">{idx + 1}. {item.title}</p>
                      <p className="text-academic-gray text-[10px] mt-0.5">by {item.author}</p>
                    </div>
                    <span className="badge-available bg-academic-lightGreen border border-academic-forest/20 text-academic-forest font-bold">
                      {item.count} checkouts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
