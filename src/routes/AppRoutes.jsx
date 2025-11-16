import { Routes, Route } from 'react-router-dom'
import Auth from '../pages/Auth'
import Dashboard from '../pages/Dashboard'
import AdminChildren from '../pages/AdminChildren'
import ChildLogin from '../pages/ChildLogin'

export default function AppRoutes(){
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/child-login" element={<ChildLogin />} />
      <Route path="/admin/children" element={<AdminChildren />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  )
}
