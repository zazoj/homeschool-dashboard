import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

export default async function handler(req, res) {

  // --- DEBUG MODE: allow GET so you can see errors directly ---
  if (req.method === "GET") {
    const dn = req.query.display_name
    const pin = req.query.pin

    if (!dn || !pin) {
      return res.status(400).send("DEBUG: Missing display_name or pin")
    }

    try {
      const { data: profiles } = await supabaseAdmin
        .from('user_profiles')
        .select('id, display_name')
        .eq('display_name', dn)
        .limit(1)

      if (!profiles || profiles.length === 0) {
        return res.status(404).send("DEBUG: No profile found for " + dn)
      }

      const child = profiles[0]

      const { data: userData } =
        await supabaseAdmin.auth.admin.getUserById(child.id)

      if (!userData) {
        return res.status(404).send("DEBUG: Auth user not found for ID " + child.id)
      }

      const email = userData.email

      const tokenRes = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`
          },
          body: new URLSearchParams({
            email,
            password: String(pin)
          })
        }
      )

      const text = await tokenRes.text()
      return res.send("DEBUG RESULT: " + text)

    } catch (err) {
      return res.status(500).send("DEBUG ERROR: " + err.toString())
    }
  }

  return res.status(400).send("DEBUG: Use GET with ?display_name=&pin=")
}
