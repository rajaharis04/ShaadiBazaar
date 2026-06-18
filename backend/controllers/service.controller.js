// ============================================================
// SERVICE CONTROLLER — CRUD + Filter
// ============================================================

const { supabaseAdmin } = require('../supabase');

// GET /api/services
const getAllServices = async (req, res) => {
  try {
    const { category, city, min_price, max_price, sort = 'rating', order = 'desc' } = req.query;

    let query = supabaseAdmin.from('services').select('*');

    if (category) query = query.eq('category', category);
    if (city) query = query.ilike('city', `%${city}%`);
    if (min_price) query = query.gte('price_per_day', parseFloat(min_price));
    if (max_price) query = query.lte('price_per_day', parseFloat(max_price));

    const sortField = sort === 'price' ? 'price_per_day' : sort === 'rating' ? 'rating' : 'created_at';
    query = query.order(sortField, { ascending: order === 'asc' });

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, count: data.length, services: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/services/:id
const getServiceById = async (req, res) => {
  try {
    const { data: service, error } = await supabaseAdmin
      .from('services').select('*').eq('id', req.params.id).single();

    if (error || !service) return res.status(404).json({ success: false, message: 'Service not found' });

    const { data: reviews } = await supabaseAdmin
      .from('reviews').select('*, users(name)').eq('service_id', req.params.id)
      .order('created_at', { ascending: false });

    res.json({ success: true, service, reviews: reviews || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/services (admin only)
const createService = async (req, res) => {
  try {
    const { title, provider_name, category, city, price_per_day, description, image_url, rating } = req.body;
    if (!title || !provider_name || !category || !city || !price_per_day) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    const { data, error } = await supabaseAdmin
      .from('services').insert([{ title, provider_name, category, city, price_per_day, description, image_url, rating: rating || 4.0 }])
      .select().single();
    if (error) throw error;
    res.status(201).json({ success: true, service: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/services/:id (admin only)
const updateService = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.id; delete updates.created_at;
    const { data, error } = await supabaseAdmin
      .from('services').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, service: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/services/:id (admin only)
const deleteService = async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('services').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllServices, getServiceById, createService, updateService, deleteService };
