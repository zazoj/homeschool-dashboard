import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminChildren(){
  const [parent, setParent] = useState(null)
  const [children, setChildren] = useState([])
  const [displayName, setDisplayName] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    supabase.auth.getSession().then(({ data: { session }})=>{
      setParent(session?.user ?? null)
      fetchChildren(session?.user?.id)
    })
  },[])

  async function fetchChildren(parentId){
    if(!parentId) return
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, display_name')
      .eq('parent_id', parentId)
    if(!error) setChildren(data || [])
  }

  async function createChild(e){
    e.preventDefault()
    if(!displayName || !pin) return alert('enter name + pin')
    setLoading(true)
    try{
      const resp = await fetch('/api/create-child', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ parent_id: parent.id, display_name: displayName, pin })
      })
      const json = await resp.json()
      if(!resp.ok) throw new Error(json.error || 'failed')
      alert(`Child created — share this email with the child: ${json.child.email}`)
      setDisplayName(''); setPin('')
      fetchChildren(parent.id)
    }catch(err){
      console.error(err)
      alert(err.message || String(err))
    }finally{ setLoading(false) }
  }

  async function loginAsChild(display_name){
    const pin = prompt(`Enter PIN for ${display_name} to login as child (parent must know PIN):`)
    if(!pin) return
    try{
      const res = await fetch('/api/child-login', {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name, pin })
      })
      const json = await res.json()
      if(!res.ok) throw new Error(json.error || 'Login failed')
      const { access_token, refresh_token } = json.session
      const { error } = await supabase.auth.setSession({ access_token, refresh_token })
      if (error) throw error
      // redirect to dashboard as child
      window.location.href = '/'
    }catch(err){
      console.error(err)
      alert(err.message || String(err))
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Manage Children</h2>
      <form onSubmit={createChild} className="mb-6">
        <input className="border p-2 mr-2" placeholder="Child display name" value={displayName} onChange={(e)=>setDisplayName(e.target.value)} />
        <input className="border p-2 mr-2 w-28" placeholder="PIN (1234)" value={pin} onChange={(e)=>setPin(e.target.value)} />
        <button className="bg-indigo-600 text-white px-3 py-2 rounded" disabled={loading}>{ loading ? 'Creating...' : 'Create child' }</button>
      </form>

      <div>
        <h3 className="font-semibold mb-2">Your children</h3>
        <ul>
          {children.map(c => (
            <li key={c.id} className="mb-2">
              {c.display_name} — id: {c.id}
              <button onClick={()=>loginAsChild(c.display_name)} className="ml-4 px-2 py-1 bg-green-600 text-white rounded">Login as child</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
