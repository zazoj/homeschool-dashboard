export const Button = ({ children, className = '', ...props }) => (
  <button className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 ${className}`} {...props}>
    {children}
  </button>
)
