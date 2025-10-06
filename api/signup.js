// api/signup.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    if (req.method === "POST") {
      const { first_name, last_name, emory_email } = req.body || {};
      if (
        !first_name?.trim() ||
        !last_name?.trim() ||
        !emory_email?.toLowerCase().endsWith("@emory.edu")
      ) {
        return res.status(400).json({ error: "Invalid input" });
      }

      // Prevent duplicate email signups
      const { data: existing } = await supabase
        .from("participants")
        .select("id")
        .eq("emory_email", emory_email.toLowerCase())
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const { error } = await supabase.from("participants").insert([
        {
          first_name,
          last_name,
          emory_email: emory_email.toLowerCase(),
        },
      ]);

      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    // DELETE route (self-remove)
    if (req.method === "DELETE") {
      const { email } = req.query;
      if (!email?.endsWith("@emory.edu"))
        return res.status(400).json({ error: "Invalid email" });

      const { error } = await supabase
        .from("participants")
        .delete()
        .eq("emory_email", email.toLowerCase());

      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Signup API error:", err);
    res.status(500).json({ error: err.message });
  }
}
