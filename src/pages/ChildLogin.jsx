import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function ChildLogin(){
  const [displayName, setDisplayName] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleChildLogin(e){
    e.preventDefault()
    setLoading(true)
    try{
      const res = await fetch('/api/child-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName, pin })
      })
      const json = await res.json()
      if(!res.ok) throw new Error(json.error || 'Login failed')
      const { access_token, refresh_token } = json.session
      const { error } = await supabase.auth.setSession({ access_token, refresh_token })
      if (error) throw error
      navigate('/')
    }catch(err){
      console.error(err)
      alert(err.message || String(err))
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-6">
      <div className="bg-white p-6 rounded shadow max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">Child login</h2>
        <form onSubmit={handleChildLogin} className="space-y-3">
          <input value={displayName} onChange={(e)=>setDisplayName(e.target.value)} placeholder="Your name" className="w-full p-2 border rounded" />
          <input value={pin} onChange={(e)=>setPin(e.target.value)} placeholder="PIN" className="w-full p-2 border rounded" />
          <button className="bg-indigo-600 text-white px-4 py-2 rounded w-full" disabled={loading}>{ loading ? 'Signing in...' : 'Sign in' }</button>
        </form>
      </div>
    </div>
  )
}
