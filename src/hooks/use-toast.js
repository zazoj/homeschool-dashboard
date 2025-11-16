import { useCallback, useState } from 'react'

export const useToast = () => {
  const [toasts, setToasts] = useState([])
  const toast = useCallback(({ title, description }) => {
    const id = Math.random().toString(36).slice(2,9)
    setToasts(t => [...t, { id, title, description }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])
  return { toasts, toast }
}
