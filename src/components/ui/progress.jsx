export const Progress = ({ value = 0, className = '' }) => (
  <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 ${className}`}>
    <div style={{ width: `${Math.max(0, Math.min(100, value))}%` }} className="h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full" />
  </div>
)
