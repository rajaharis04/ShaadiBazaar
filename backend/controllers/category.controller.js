// ============================================================
// CATEGORY CONTROLLER — CRUD Operations
// ============================================================

const { supabaseAdmin } = require('../supabase');

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    const { type } = req.query;

    let query = supabaseAdmin.from('categories').select('*').order('name', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, count: data.length, categories: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { key, name, type } = req.body;

    if (!key || !name || !type) {
      return res.status(400).json({ success: false, message: 'Key, name, and type are required' });
    }

    const formattedKey = key.toLowerCase().trim().replace(/\s+/g, '_');

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([{ key: formattedKey, name: name.trim(), type }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, message: 'Category created', category: data });
  } catch (err) {
    if (err.code === '23505') { // unique key violation
      return res.status(400).json({ success: false, message: 'A category with this key already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/categories/:key
const updateCategory = async (req, res) => {
  try {
    const { key } = req.params;
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Name and type are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ name: name.trim(), type })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Category updated', category: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/categories/:key
const deleteCategory = async (req, res) => {
  try {
    const { key } = req.params;

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('key', key);

    if (error) throw error;

    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
