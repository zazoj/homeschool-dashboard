// child-login serverless (Node)
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  try {
    const { display_name, pin } = req.body
    if (!display_name || !pin) return res.status(400).json({ error: 'display_name and pin required' })

    const { data: profiles, error: pErr } = await supabaseAdmin
      .from('user_profiles')
      .select('id, display_name, pin_code')
      .eq('display_name', display_name)
      .limit(1)

    if (pErr || !profiles || profiles.length === 0) {
      return res.status(401).json({ error: 'Invalid username or PIN' })
    }

    const child = profiles[0]

    // Verify pin against hashed pin_code if present
    if (child.pin_code && !bcrypt.compareSync(String(pin), child.pin_code)) {
      return res.status(401).json({ error: 'Invalid username or PIN' })
    }

    const { data: userData, error: uErr } = await supabaseAdmin.auth.admin.getUserById(child.id)
    if (uErr || !userData) {
      return res.status(401).json({ error: 'Child user not found' })
    }
    const email = userData.email

    const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: new URLSearchParams({
        grant_type: 'password',
        email,
        password: String(pin)
      })
    })

    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) {
      return res.status(401).json({ error: tokenData?.error_description || tokenData?.error || 'Invalid credentials' })
    }

    return res.json({ session: tokenData })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: String(err) })
  }
}
