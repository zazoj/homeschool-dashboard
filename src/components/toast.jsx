import React from 'react'

export const Toast = ({ toasts }) => {
  return (
    <div className="fixed right-4 bottom-4 z-50 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className="p-3 bg-white dark:bg-gray-800 rounded shadow"> 
          <div className="font-semibold">{t.title}</div>
          {t.description && <div className="text-sm text-gray-500">{t.description}</div>}
        </div>
      ))}
    </div>
  )
}
