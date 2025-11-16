export const Card = ({ className = '', children }) => (
  <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl ${className}`}>
    {children}
  </div>
)
