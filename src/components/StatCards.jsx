import { BookOpenIcon, CheckCircleIcon, ClockIcon, SparklesIcon } from './Icons';

function StatCard({ label, value, subtitle, variant = 'indigo', icon: Icon }) {
  const variants = {
    indigo: 'stat-card-indigo',
    teal: 'stat-card-teal',
    amber: 'stat-card-amber',
  };

  return (
    <div
      className={`${variants[variant]} rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden group transition-transform duration-300 hover:-translate-y-1`}
    >
      {/* Background shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)' }}
      />

      {/* Icon */}
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
        <SparklesIcon className="w-4 h-4 text-white/40" />
      </div>

      {/* Value */}
      <div>
        <p className="text-4xl font-bold text-white tracking-tight leading-none">
          {value.toLocaleString()}
        </p>
        <p className="text-white/80 font-medium text-sm mt-1">{label}</p>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-white/60 text-xs">{subtitle}</p>
      )}
    </div>
  );
}

export default function StatCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
