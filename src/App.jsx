import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { useToast } from './hooks/use-toast'
import { Toast } from './components/toast'

export default function App(){
  const { toasts } = useToast()
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toast toasts={toasts} />
    </BrowserRouter>
  )
}
