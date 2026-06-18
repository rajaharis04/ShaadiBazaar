// ============================================================
// AUTH MIDDLEWARE — Verify Supabase JWT OR Admin base64 token
// ============================================================

const { supabaseAdmin } = require('../supabase');

const ADMIN_EMAIL = 'admin@shaadibazaar.pk';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // ── Check if this is an admin base64 token ──────────────
    // Admin tokens are base64-encoded JSON (not Supabase JWTs)
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      if (decoded && decoded.role === 'admin' && decoded.email === ADMIN_EMAIL) {
        req.user  = { id: 'admin-001', email: ADMIN_EMAIL, name: 'Admin', role: 'admin' };
        req.token = token;
        return next();
      }
    } catch (_) {
      // Not a base64 admin token — fall through to Supabase verification
    }

    // ── Verify as Supabase JWT ──────────────────────────────
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Fetch user profile from public.users
    let { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Self-healing: if the auth user exists but the public profile row is missing
    if (!profile) {
      const name = user.user_metadata?.name || user.email.split('@')[0];
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('users')
        .insert([{
          id: user.id,
          name: name,
          email: user.email,
          role: 'customer'
        }])
        .select()
        .single();
      
      if (!insertError) {
        profile = newProfile;
        console.log(`[Auto-heal] Created missing public profile for user: ${user.email}`);
      }
    }

    req.user  = profile || { id: user.id, email: user.email, role: 'customer' };
    req.token = token;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

module.exports = authMiddleware;
