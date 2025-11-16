import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(400).send("ERROR: Must POST with JSON body")
    }

    const { display_name, pin } = req.body

    if (!display_name || !pin) {
      return res.status(400).send("ERROR: Missing name or pin")
    }

    // Find child profile
    const { data: profiles, error: profileSearchError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, display_name')
      .eq('display_name', display_name)
      .limit(1)

    if (profileSearchError) {
      return res.status(500).send("ERROR: profileSearchError: " + profileSearchError.message)
    }

    if (!profiles || profiles.length === 0) {
      return res.status(401).send("ERROR: No profile found")
    }

    const child = profiles[0]

    // Get user account
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(child.id)

    if (userError) {
      return res.status(500).send("ERROR: userError: " + userError.message)
    }

    if (!userData) {
      return res.status(401).send("ERROR: Auth user not found")
    }

    const email = userData.email

    // Try to log in with PIN
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

    const tokenData = await tokenRes.text() // <-- NOTICE: text not json

    if (!tokenRes.ok) {
      return res.status(401).send("ERROR: " + tokenData)
    }

    return res.send("SUCCESS: " + tokenData)

  } catch (err) {
    return res.status(500).send("ERROR: " + err.toString())
  }
}
