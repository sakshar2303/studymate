export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-slate-900 focus:ring-amber-500',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };
  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`glass-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 border-b border-slate-700 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

export function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <input
        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${error ? 'border-red-500' : 'border-slate-600'}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  options = [],
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <select
        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${error ? 'border-red-500' : 'border-slate-600'}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-700 text-slate-300',
    amber: 'bg-amber-500/20 text-amber-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    blue: 'bg-blue-500/20 text-blue-400',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg className={`animate-spin text-amber-500 ${sizes[size]}`} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

export function Skeleton({ className = '', ...props }) {
  return <div className={`animate-pulse bg-slate-700 rounded ${className}`} {...props} />;
}

export function ProgressBar({ value, max = 100, color = 'bg-amber-500', className = '' }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={`h-2 bg-slate-700 rounded-full overflow-hidden ${className}`}>
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-slate-500">{icon}</div>}
      <h3 className="text-lg font-medium text-slate-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
