import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { display_name, pin } = req.body

    if (!display_name || !pin) {
      return res.status(400).json({ error: 'display_name and pin required' })
    }

    const { data: profiles } = await supabaseAdmin
      .from('user_profiles')
      .select('id, display_name')
      .eq('display_name', display_name)
      .limit(1)

    if (!profiles || profiles.length === 0) {
      return res.status(401).json({ error: 'Invalid username or PIN' })
    }

    const child = profiles[0]

    const { data: userData } =
      await supabaseAdmin.auth.admin.getUserById(child.id)

    if (!userData) {
      return res.status(401).json({ error: 'Child user not found' })
    }

    const email = userData.email

    const formData = new URLSearchParams()
    formData.append('grant_type', 'password')
    formData.append('email', email)
    formData.append('password', String(pin))

    const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: formData
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      return res.status(401).json({
        error: tokenData.error_description || tokenData.error
      })
    }

    return res.json({ session: tokenData })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
