import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import * as Icons from 'lucide-react'

const sumPoints = (arr) => arr.reduce((a,b) => a + (b.points || b.amount || 0), 0)

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [chores, setChores] = useState([])
  const [books, setBooks] = useState([])
  const [goals, setGoals] = useState([])
  const [allowance, setAllowance] = useState(null)
  const [points, setPoints] = useState([])
  const [streaks, setStreaks] = useState([])

  const navigate = useNavigate()

  // Listen to auth
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) navigate('/auth')
  }, [user, loading, navigate])

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    const uid = user.id

    const [cRes, bRes, gRes, aRes, pRes, sRes] = await Promise.all([
      supabase.from('chores').select('*').eq('user_id', uid),
      supabase.from('books').select('*').eq('user_id', uid),
      supabase.from('goals').select('*').eq('user_id', uid),
      supabase.from('allowance').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(1),
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) return null

  // ---- Stats calculations ----
  const choresCompleted = chores.filter(c => c.status === 'completed').length
  const choresTotal = chores.length
  const monthlyStreak = streaks.find(s => s.type === 'reading')?.streak_count || 0
  const totalPoints = sumPoints(points)

  const allowanceUsed = allowance?.amount_used || 0
  const allowanceTotal = allowance?.total_amount || 100

  const overallGoalsProgress = goals.length
    ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length)
    : 0

  const recentChores = chores.slice(0, 5)

  //----------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="bg-white border-b p-4 rounded-2xl mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Homeschool Life Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back, {user.email}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Icons.Star className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">{totalPoints}</span>
            </div>
            <p className="text-sm text-gray-500">Total Points</p>
          </div>

          <Button onClick={handleLogout}>
            <Icons.LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Chores */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <Icons.CheckCircle2 className="w-6 h-6 text-indigo-600" />
              </div>
              <Badge>{choresCompleted}/{choresTotal}</Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2">Chores</h3>
            <Progress value={choresTotal ? (choresCompleted / choresTotal) * 100 : 0} className="mb-2" />
            <p className="text-sm text-gray-500">This week's progress</p>
          </Card>

          {/* Reading */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-pink-50 rounded-xl">
                <Icons.BookOpen className="w-6 h-6 text-pink-600" />
              </div>
              <Badge>{monthlyStreak} days</Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2">Reading</h3>
            <div className="text-3xl font-bold mb-1">{books.length}</div>
            <p className="text-sm text-gray-500">Books this month</p>
          </Card>

          {/* Allowance */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Icons.DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <Badge>R{allowanceUsed}/R{allowanceTotal}</Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2">Allowance</h3>
            <Progress value={(allowanceUsed / allowanceTotal) * 100} className="mb-2" />
            <p className="text-sm text-gray-500">Monthly spending</p>
          </Card>

          {/* Goals */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Icons.Target className="w-6 h-6 text-emerald-600" />
              </div>
              <Badge>{overallGoalsProgress}%</Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2">Goals</h3>
            <Progress value={overallGoalsProgress} className="mb-2" />
            <p className="text-sm text-gray-500">Overall progress</p>
          </Card>
        </div>

        {/* Chores + Reading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Today's Chores */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Today's Chores</h2>
              <Icons.TrendingUp className="w-5 h-5 text-gray-500" />
            </div>

            <div className="space-y-3">
              {recentChores.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        c.status === 'completed' ? 'bg-green-500' : 'bg-yellow-400'
                      }`}
                    />
                    <span className={c.status === 'completed' ? 'line-through text-gray-400' : 'font-medium'}>
                      {c.title}
                    </span>
                  </div>

                  <Badge>+{c.points} pts</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Reading Progress */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Currently Reading</h2>
              <Icons.BookOpen className="w-5 h-5 text-gray-500" />
            </div>

            <div className="space-y-4">
              {books.map((book) => (
                <div key={book.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{book.title}</span>
                    <span className="text-sm text-gray-500">
                      {book.pages_read}/{book.total_pages} pages
                    </span>
                  </div>

                  <Progress value={(book.pages_read / book.total_pages) * 100} />
                </div>
              ))}
            </div>
          </Card>

        </div>
      </main>
    </div>
  )
}
