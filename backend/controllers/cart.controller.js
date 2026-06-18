// ============================================================
// CART CONTROLLER
// ============================================================

const { supabaseAdmin } = require('../supabase');

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true, cart: data || [] });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve cart' });
  }
};

// POST /api/cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    // Check if item already exists in cart
    const { data: existing, error: getError } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (getError) throw getError;

    if (existing) {
      const { data, error: updateError } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single();
      if (updateError) throw updateError;
      
      res.json({ success: true, message: 'Cart item updated', item: data });
    } else {
      const { data, error: insertError } = await supabaseAdmin
        .from('cart_items')
        .insert([{ user_id: userId, product_id: productId, quantity }])
        .select()
        .single();
      if (insertError) throw insertError;

      res.status(201).json({ success: true, message: 'Item added to cart', item: data });
    }
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
};

// PUT /api/cart/:id
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      // If quantity is less than 1, delete it
      const { error: deleteError } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (deleteError) throw deleteError;
      return res.json({ success: true, message: 'Item removed from cart' });
    }

    const { data, error: updateError } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;

    res.json({ success: true, message: 'Quantity updated', item: data });
  } catch (err) {
    console.error('Update cart item error:', err);
    res.status(500).json({ success: false, message: 'Failed to update cart item' });
  }
};

// DELETE /api/cart/:id
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error: deleteError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    console.error('Remove cart item error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove cart item' });
  }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error: deleteError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
