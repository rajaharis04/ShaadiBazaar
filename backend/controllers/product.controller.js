// ============================================================
// PRODUCT CONTROLLER — CRUD + Search/Filter
// ============================================================

const { supabase, supabaseAdmin } = require('../supabase');

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const { category, search, min_price, max_price, sort = 'created_at', order = 'desc', featured } = req.query;

    let query = supabaseAdmin.from('products').select('*');

    if (category) query = query.eq('category', category);
    if (featured === 'true') query = query.eq('is_featured', true);
    if (min_price) query = query.gte('price', parseFloat(min_price));
    if (max_price) query = query.lte('price', parseFloat(max_price));
    if (search) query = query.ilike('name', `%${search}%`);

    // Sorting
    const sortField = sort === 'price' ? 'price' : 'created_at';
    query = query.order(sortField, { ascending: order === 'asc' });

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, count: data.length, products: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Get reviews for this product
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('*, users(name)')
      .eq('product_id', id)
      .order('created_at', { ascending: false });

    res.json({ success: true, product, reviews: reviews || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products (admin only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image_url, stock, is_featured } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([{ name, description, price, category, image_url, stock: stock || 10, is_featured: is_featured || false }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Product created', product: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id (admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Product updated', product: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id (admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products/:id/review
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert([{ user_id: userId, product_id: id, rating, comment }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, review: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, addReview };
