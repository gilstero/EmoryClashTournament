// api/signup.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  console.log("🟢 Function reached:", req.method, req.url);

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    console.log("🟣 ENV CHECK:", {
      SUPABASE_URL: url || "❌ MISSING",
      SUPABASE_SERVICE_KEY: key ? "✅ PRESENT" : "❌ MISSING",
    });

    if (!url || !key) {
      return res
        .status(500)
        .json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY" });
    }

    const supabase = createClient(url, key);

    if (req.method !== "POST") {
      console.log("🟠 Method not allowed");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { first_name, last_name, emory_email } = req.body || {};
    console.log("🧩 Incoming data:", { first_name, last_name, emory_email });

    if (!first_name || !last_name || !emory_email?.endsWith("@emory.edu")) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { error } = await supabase
      .from("participants")
      .insert([{ first_name, last_name, emory_email }]);

    if (error) {
      console.error("🔴 Supabase insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("✅ Insert success!");
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("💥 Crash in signup handler:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal Server Error" });
  }
}
