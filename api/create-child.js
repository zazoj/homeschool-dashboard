import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { parent_id, display_name, pin } = req.body

    if (!parent_id || !display_name || !pin) {
      return res.status(400).json({
        error: 'parent_id, display_name, and pin are required'
      })
    }

    // Create child auth user
    const unique = Math.random().toString(36).substring(2, 8)
    const email = `child+${unique}@${new URL(SUPABASE_URL).hostname}`

    const { data, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: String(pin),
        email_confirm: true,
        user_metadata: { display_name }
      })

    if (createError) {
      return res.status(500).json({
        error: createError.message || 'Failed to create user'
      })
    }

    // The user object is inside data.user
    const childUser = data.user

    if (!childUser || !childUser.id) {
      return res.status(500).json({
        error: 'User was not created. No user ID returned.'
      })
    }

    const childId = childUser.id

    // Insert profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: childId,
        display_name,
        role: 'child',
        parent_id
      })

    if (profileError) {
      return res.status(500).json({
        error: profileError.message || 'Failed to create child profile'
      })
    }

    return res.json({
      child: {
        id: childId,
        email,
        display_name
      },
      message: 'Child created'
    })

  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
