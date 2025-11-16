import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminChildren(){
  const [parent, setParent] = useState(null)
  const [children, setChildren] = useState([])
  const [displayName, setDisplayName] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [authLoaded, setAuthLoaded] = useState(false)

  // Load logged-in user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setParent(session?.user ?? null)
      setAuthLoaded(true)

      if (session?.user) {
        fetchChildren(session.user.id)
      }
    })
  }, [])

  async function fetchChildren(parentId){
    if (!parentId) return
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, display_name')
      .eq('parent_id', parentId)

    if (!error) setChildren(data || [])
  }

  async function createChild(e){
    e.preventDefault()

    if (!authLoaded) {
      alert("Please wait, still loading your account...")
      return
    }

    if (!parent) {
      alert("You are not logged in.")
      return
    }

    if (!displayName || !pin) {
      alert("Enter a name and PIN")
      return
    }

    setLoading(true)
    try {
      const resp = await fetch('/api/create-child', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ parent_id: parent.id, display_name: displayName, pin })
      })

      const json = await resp.json()

      if (!resp.ok) throw new Error(json.error || 'Failed to create child')

      alert(`Child created — share this email with the child: ${json.child.email}`)

      setDisplayName('')
      setPin('')

      fetchChildren(parent.id)

    } catch (err) {
      console.error(err)
      alert(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  if (!authLoaded) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Manage Children</h2>

      <form onSubmit={createChild} className="mb-6">
        <input className="border p-2 mr-2" placeholder="Child display name"
          value={displayName} onChange={(e)=>setDisplayName(e.target.value)} />
        <input className="border p-2 mr-2 w-28" placeholder="PIN (1234)"
          value={pin} onChange={(e)=>setPin(e.target.value)} />
        <button className="bg-indigo-600 text-white px-3 py-2 rounded" disabled={loading}>
          { loading ? 'Creating...' : 'Create child' }
        </button>
      </form>

      <div>
        <h3 className="font-semibold mb-2">Your children</h3>
        <ul>
          {children.map(c => (
            <li key={c.id} className="mb-2">
              {c.display_name} — id: {c.id}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
