// create-child serverless (Node)
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  try {
    const { parent_id, display_name, pin } = req.body
    if (!parent_id || !display_name || !pin) {
      return res.status(400).json({ error: 'parent_id, display_name and pin are required' })
    }

    const unique = Math.random().toString(36).slice(2, 8)
    const email = `child+${unique}@${new URL(SUPABASE_URL).hostname}`
    const password = String(pin)

    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name }
    })

    if (createError || !user) {
      console.error('createUser error', createError)
      return res.status(500).json({ error: createError?.message || 'Failed to create user' })
    }

    const childId = user.id
    const pin_hash = bcrypt.hashSync(String(pin), 10)

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({ id: childId, display_name, role: 'child', parent_id, pin_code: pin_hash })
      .select()
      .single()

    if (profileError) {
      console.error('profile insert error', profileError)
      return res.status(500).json({ error: profileError.message || 'Failed to create profile' })
    }

    return res.json({ child: { id: childId, email, display_name }, message: 'Child created' })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: String(err) })
  }
}
