export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-7 w-28 rounded-lg bg-gray-200" />
      <div className="h-10 w-64 rounded-lg bg-gray-200" />
      <div className="h-48 rounded-xl bg-gray-200" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  )
}
