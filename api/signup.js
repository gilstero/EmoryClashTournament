// /api/signup.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS (optional, safe)
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create client each invocation to avoid cold-start bugs
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { first_name, last_name, emory_email } = req.body || {};

    if (!first_name || !last_name || !emory_email?.endsWith('@emory.edu')) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const { error } = await supabase
      .from('participants')
      .insert([{ first_name, last_name, emory_email }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Serverless crash:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
