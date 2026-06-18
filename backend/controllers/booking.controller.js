// ============================================================
// BOOKING CONTROLLER — Book Services, View Bookings
// ============================================================

const { supabaseAdmin } = require('../supabase');
const { sendAdminBookingEmail } = require('../services/email.service');

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { service_id, event_date, time_slot, total_price, notes } = req.body;
    const userId = req.user.id;

    if (!service_id || !event_date || !time_slot || !total_price) {
      return res.status(400).json({ success: false, message: 'Required booking fields missing' });
    }

    // Check for slot conflict
    const { data: conflict, error: conflictError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('service_id', service_id)
      .eq('event_date', event_date)
      .eq('time_slot', time_slot)
      .eq('status', 'confirmed')
      .maybeSingle();

    if (conflictError) throw conflictError;

    if (conflict) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert([{ user_id: userId, service_id, event_date, time_slot, total_price, notes, status: 'pending' }])
      .select('*, services(title, provider_name, category, city)')
      .single();

    if (error) throw error;

    // Send async email notification to admin (don't block the response)
    sendAdminBookingEmail(data, req.user).catch(err => {
      console.error('SMTP email error:', err);
    });

    res.status(201).json({ success: true, message: 'Booking created!', booking: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/my-bookings
const getMyBookings = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*, services(title, provider_name, category, city, image_url)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, bookings: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/bookings/:id — Cancel booking
const updateBooking = async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ status })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select().single();

    if (error) throw error;
    res.json({ success: true, booking: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createBooking, getMyBookings, updateBooking };
