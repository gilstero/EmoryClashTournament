// api/signup.js
import { createClient } from "@supabase/supabase-js";

/**
 * Vercel serverless function: handle POST requests for player signups.
 * Expects: { first_name, last_name, emory_email }
 */
export default async function handler(req, res) {
  try {
    // --- Check HTTP method
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // --- Read environment variables
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({
        error: "Missing Supabase credentials on the server",
      });
    }

    // --- Initialize Supabase client (server-side service role)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // --- Parse JSON body safely
    let body = {};
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }

    const { first_name, last_name, emory_email } = body || {};

    // --- Basic validation
    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !emory_email?.toLowerCase().endsWith("@emory.edu")
    ) {
      return res.status(400).json({
        error: "Invalid input — must include first, last, and @emory.edu email",
      });
    }

    // --- Insert participant into Supabase table
    const { error } = await supabase
      .from("participants")
      .insert([{ first_name, last_name, emory_email }]);

    if (error) {
      console.error("Supabase insert error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    // --- Success response
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Unexpected server error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal Server Error" });
  }
}
