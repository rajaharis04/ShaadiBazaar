// ============================================================
// AUTH CONTROLLER — Register, Login, Logout, OTP Verify, Admin
// ============================================================

const { supabase, supabaseAdmin } = require('../supabase');
const { generateOTP, saveOTP, verifyOTP, sendOTPEmail } = require('../services/otp.service');

// ============================================================
// HARDCODED ADMIN CREDENTIALS (fixed — do not change)
// ============================================================
const ADMIN_EMAIL    = 'admin@shaadibazaar.pk';
const ADMIN_PASSWORD = 'Admin@123!';

// ============================================================
// POST /api/auth/send-otp  (Step 1 of Signup)
// Validates email uniqueness, generates & emails OTP
// ============================================================
const sendOtp = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    // Check if email already exists in users table
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const otp = generateOTP();
    saveOTP(email, otp);
    await sendOTPEmail(email, otp, name);

    res.json({ success: true, message: 'OTP sent to your email address' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
};

// ============================================================
// POST /api/auth/register  (Step 2 of Signup — after OTP verified)
// Verifies OTP then creates account
// ============================================================
const register = async (req, res) => {
  try {
    const { name, email, password, phone, city, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ success: false, message: 'All fields including OTP are required' });
    }

    // Verify OTP — our custom verification (email already confirmed by us)
    const valid = verifyOTP(email, otp);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please request a new one.' });
    }

    // Use admin API to create user with email ALREADY CONFIRMED
    // (we confirmed it ourselves via OTP, no need for Supabase email link)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,          // ← marks email as verified immediately
      user_metadata: { name, role: 'customer' }
    });

    if (error) throw error;

    // ── Store full user profile in our users table ──────────────
    if (data.user) {
      const { error: dbError } = await supabaseAdmin.from('users').upsert({
        id:    data.user.id,
        name:  name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone  || null,
        city:  city   || null,
        role:  'customer',
        created_at: new Date().toISOString()
      });

      if (dbError) {
        console.error('DB upsert error:', dbError.message);
        // Don't fail the whole request — auth user was already created
      }
    }

    console.log(`✅ New user registered & verified: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Email verified.',
      user: {
        id:    data.user?.id,
        email: data.user?.email,
        name:  name.trim(),
        role:  'customer'
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    // Friendly message for duplicate email
    if (err.message?.includes('already registered') || err.code === 'email_exists') {
      return res.status(400).json({ success: false, message: 'This email is already registered. Please sign in.' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// ============================================================
// POST /api/auth/login
// ============================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // ─── Admin shortcut ────────────────────────────────────────
    if (email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() &&
        password.trim() === ADMIN_PASSWORD) {
      const adminUser = {
        id: 'admin-001',
        email: ADMIN_EMAIL,
        name: 'Admin',
        role: 'admin'
      };
      // Create a simple token for admin (JWT-like but lightweight)
      const token = Buffer.from(JSON.stringify({ ...adminUser, iat: Date.now() })).toString('base64');
      return res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: adminUser
      });
    }
    // ──────────────────────────────────────────────────────────

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;

    // Get full profile
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      success: true,
      message: 'Login successful',
      token: data.session.access_token,
      user: profile || { id: data.user.id, email: data.user.email, role: 'customer' }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
};

// ============================================================
// POST /api/auth/admin-login  (Dedicated admin endpoint)
// ============================================================
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (
      email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase() ||
      password.trim() !== ADMIN_PASSWORD
    ) {
      console.log('Admin login attempt — Email match:', email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase(), '| Pass match:', password.trim() === ADMIN_PASSWORD);
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const adminUser = {
      id: 'admin-001',
      email: ADMIN_EMAIL,
      name: 'Admin',
      role: 'admin'
    };

    const token = Buffer.from(JSON.stringify({ ...adminUser, iat: Date.now() })).toString('base64');

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: adminUser
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// POST /api/auth/logout
// ============================================================
const logout = async (req, res) => {
  try {
    await supabase.auth.signOut();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// GET /api/auth/me
// ============================================================
const getMe = async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// PUT /api/auth/profile
// ============================================================
const updateProfile = async (req, res) => {
  try {
    const { name, phone, city } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ name, phone, city })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Profile updated', user: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendOtp, register, login, adminLogin, logout, getMe, updateProfile };
