import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      console.error("Missing Supabase env vars:", { url, key: key ? "present" : "missing" });
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const supabase = createClient(url, key);
    const { first_name, last_name, emory_email } = req.body || {};
    if (!first_name || !last_name || !emory_email?.endsWith("@emory.edu")) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { error } = await supabase.from("participants").insert([{ first_name, last_name, emory_email }]);
    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Serverless crash:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
