// Shown instantly while a page's data loads, so taps on the phone feel
// immediate. Pure CSS - no client JS.
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="space-y-2">
        <div className="skeleton h-7 w-40" />
        <div className="skeleton h-4 w-64 max-w-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
            <div className="skeleton h-10 w-10 flex-shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
