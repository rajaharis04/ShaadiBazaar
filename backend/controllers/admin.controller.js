// ============================================================
// ADMIN CONTROLLER — Stats, All Orders/Bookings, Status Updates
// ============================================================

const { supabaseAdmin } = require('../supabase');
const { sendUserOrderStatusUpdateEmail, sendUserBookingStatusUpdateEmail } = require('../services/email.service');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalProducts },
      { count: totalServices },
      { count: totalOrders },
      { count: totalBookings },
      { data: revenue }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('services').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('total_amount').eq('status', 'confirmed')
    ]);

    const totalRevenue = revenue?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0;

    res.json({
      success: true,
      stats: { totalUsers, totalProducts, totalServices, totalOrders, totalBookings, totalRevenue }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/orders
const getAllOrders = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, users(name, email, phone), order_items(quantity, price, products(name))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, orders: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/orders/:id
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabaseAdmin
      .from('orders').update({ status }).eq('id', req.params.id).select().single();
    if (error) throw error;

    // Send status update email to user asynchronously
    if (data && data.user_id) {
      supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', data.user_id)
        .single()
        .then(({ data: userProfile }) => {
          if (userProfile) {
            return sendUserOrderStatusUpdateEmail(data, userProfile);
          }
        })
        .catch(emailErr => {
          console.error('Failed to send user order status update email:', emailErr);
        });
    }

    res.json({ success: true, order: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/bookings
const getAllBookings = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*, users(name, email, phone), services(title, category, city)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, bookings: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/bookings/:id
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabaseAdmin
      .from('bookings').update({ status }).eq('id', req.params.id).select().single();
    if (error) throw error;

    // Send status update email to user asynchronously
    if (data && data.user_id) {
      Promise.all([
        supabaseAdmin.from('users').select('*').eq('id', data.user_id).single(),
        supabaseAdmin.from('bookings').select('*, services(title, provider_name, category, city)').eq('id', data.id).single()
      ])
      .then(([{ data: userProfile }, { data: bookingWithService }]) => {
        if (userProfile && bookingWithService) {
          return sendUserBookingStatusUpdateEmail(bookingWithService, userProfile);
        }
      })
      .catch(emailErr => {
        console.error('Failed to send user booking status update email:', emailErr);
      });
    }

    res.json({ success: true, booking: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, users: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStats, getAllOrders, updateOrderStatus, getAllBookings, updateBookingStatus, getAllUsers };
