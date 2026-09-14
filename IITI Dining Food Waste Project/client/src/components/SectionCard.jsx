export default function SectionCard({ title, subtitle, icon, children, className = '' }) {
  return (
    <div className={`bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-lg border border-slate-100 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        {icon ? (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-white">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-800 truncate">{title}</h2>
          {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </div>
  )
}

