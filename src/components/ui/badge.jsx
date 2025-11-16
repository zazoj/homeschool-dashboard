export const Badge = ({ children, className = '' }) => (
  <span className={`px-2 py-0.5 rounded-full text-sm inline-block bg-gray-100 dark:bg-gray-700 ${className}`}>{children}</span>
)
