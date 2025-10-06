// /api/signup.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service role key (never exposed)
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { first_name, last_name, emory_email } = req.body

  // Simple validation
  if (!first_name || !last_name || !emory_email.endsWith('@emory.edu'))
    return res.status(400).json({ error: 'Invalid input' })

  const { error } = await supabase
    .from('participants')
    .insert({ first_name, last_name, emory_email })

  if (error) return res.status(400).json({ error: error.message })
  res.status(200).json({ ok: true })
}
