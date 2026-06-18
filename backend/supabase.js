// ============================================================
// SHAADI BAZAAR — Supabase Client (Shared)
// Used by all controllers for DB access
// ============================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Regular client (respects RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client (bypasses RLS — use only in admin/auth controllers)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase, supabaseAdmin };
