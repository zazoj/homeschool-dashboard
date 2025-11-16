import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const signIn = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      alert('Magic link sent. Check your email.')
      setEmail('')
      navigate('/')
    } catch (err) {
      console.error(err)
      alert(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-2">Sign in</h1>
        <p className="text-sm text-gray-600 mb-4">Enter your email to receive a magic link.</p>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full mb-4 px-3 py-2 border rounded" />
        <div className="flex gap-3">
          <button onClick={signIn} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Sending...' : 'Send magic link'}</button>
        </div>
      </div>
    </div>
  )
}
