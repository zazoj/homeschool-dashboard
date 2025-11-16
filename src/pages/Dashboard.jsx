import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import * as Icons from 'lucide-react'

// Helper to sum points
const sumPoints = (arr) => arr.reduce((a,b) => a + (b.amount || 0), 0)

export default function Dashboard(){
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const [chores, setChores] = useState([])
  const [books, setBooks] = useState([])
  const [goals, setGoals] = useState([])
  const [allowance, setAllowance] = useState(null)
  const [points, setPoints] = useState([])
  const [streaks, setStreaks] = useState([])

  const navigate = useNavigate()

  // Listen to auth
  useEffect(()=>{
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return ()=> data.subscription.unsubscribe()
  },[])

  // Redirect
  useEffect(()=>{
    if (!loading && !user) navigate('/auth')
  },[user,loading,navigate])

  // Fetch data
  useEffect(()=>{
    if (!user) return
    fetchData()
  },[user])

  const fetchData = async () => {
    const uid = user.id

    const [cRes, bRes, gRes, aRes, pRes, sRes] = await Promise.all([
      supabase.from('chores').select('*').eq('user_id', uid),
      supabase.from('books').select('*').eq('user_id', uid),
      supabase.from('goals').select('*').eq('user_id', uid),
      supabase.from('allowance').select('*').eq('user_id', uid).order('created_at',{ascending:false}).limit(1),
      supabase.from('points').select('*').eq('user_id', uid),
      supabase.from('streaks').select('*').eq('user_id', uid)
    ])

    setChores(cRes.data || [])
    setBooks(bRes.data || [])
    setGoals(gRes.data || [])
    setAllowance(aRes.data?.[0] || null)
    setPoints(pRes.data || [])
    setStreaks(sRes.data || [])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return null

  // Calculate stats
  const choresCompleted = chores.filter(c=>c.status==='completed').length
  const choresTotal = chores.length
  const monthlyStreak = streaks.find(s=>s.type==='reading')?.streak_count || 0
  const totalPoints = sumPoints(points)
  const allowanceUsed = allowance?.amount_used || 0
  const allowanceTotal = allowance?.total_amount || 100
  const overallGoalsProgress = goals.length ? Math.round(goals.reduce((a,g)=>a+g.progress,0)/goals.length) : 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="bg-white border-b p-4 rounded-2xl mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Homeschool Life Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back, {user.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Icons.Star className="w-5 h-5" />
              <span className="text-2xl font-bold">{totalPoints}</span>
            </div>
            <p className="text-sm text-gray-500">Total Points</p>
          </div>
          <Button onClick={handleLogout}><Icons.LogOut className="w-4 h-4" /> Sign Out</Button>
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Chores */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl"><Icons.CheckCircle2 className="w-6 h-6 text-indigo-600" /></div>
              <Badge>{choresCompleted}/{choresTotal}</Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2">Chores</h3>
            <Progress value={choresTotal? (choresCompleted/choresTotal)*100 : 0} className="mb-2" />
            <p className="text-sm text-gray-500">This week's progress</p>
          </Card>

          {/* Reading */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-pink-50 rounded-xl"><Icons.BookOpen className="w-6 h-6 text-pink-600" /></div>
