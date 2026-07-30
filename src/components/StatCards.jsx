import { BookOpenIcon, CheckCircleIcon, ClockIcon } from './Icons';

function StatCard({ label, value, subtitle, variant = 'indigo', icon: Icon }) {
  const borders = {
    indigo: 'border-l-[4px] border-l-academic-burgundy border-y border-r border-academic-border',
    teal: 'border-l-[4px] border-l-academic-forest border-y border-r border-academic-border',
    amber: 'border-l-[4px] border-l-academic-gold border-y border-r border-academic-border',
  };

  return (
    <div
      className={`${borders[variant]} bg-white rounded shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 flex flex-col gap-3 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
    >
      {/* Icon Row */}
      <div className="flex items-center justify-between">
        <div className="p-2 rounded bg-academic-hover text-academic-gray flex items-center justify-center border border-academic-border/30">
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {/* Value & Label */}
      <div>
        <p className="text-4xl font-serif font-bold text-academic-charcoal tracking-tight leading-none">
          {value.toLocaleString()}
        </p>
        <p className="text-academic-charcoal font-semibold text-sm mt-2">{label}</p>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-academic-gray text-xs">{subtitle}</p>
      )}
    </div>
  );
}

export default function StatCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <StatCard
        label="Total Books"
        value={stats.totalBooks}
        subtitle={`${stats.totalTitles} unique titles`}
        variant="indigo"
        icon={BookOpenIcon}
      />
      <StatCard
        label="Available Books"
        value={stats.availableBooks}
        subtitle="Ready for checkout"
        variant="teal"
        icon={CheckCircleIcon}
      />
      <StatCard
        label="Issued Books"
        value={stats.issuedBooks}
        subtitle="Currently on loan"
        variant="amber"
        icon={ClockIcon}
      />
    </div>
  );
}
