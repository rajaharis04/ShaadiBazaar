// ============================================================
// ORDER CONTROLLER — Place, View Orders
// ============================================================

const { supabaseAdmin } = require('../supabase');
const { sendAdminOrderEmail, sendUserOrderConfirmationEmail } = require('../services/email.service');

// POST /api/orders — Place new order
const placeOrder = async (req, res) => {
  try {
    const { items, total_amount, payment_method, address, city } = req.body;
    const userId = req.user.id;

    if (!items || !items.length || !total_amount || !payment_method || !address || !city) {
      return res.status(400).json({ success: false, message: 'Missing required order fields' });
    }

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{ user_id: userId, total_amount, payment_method, address, city, status: 'pending' }])
      .select().single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // Clear user's cart
    await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);

    // Reduce stock for each product directly using JS to prevent RPC missing errors
    for (const item of items) {
      try {
        const { data: prod } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .maybeSingle();
        if (prod) {
          const newStock = Math.max(0, (prod.stock || 0) - item.quantity);
          await supabaseAdmin
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id);
        }
      } catch (stockErr) {
        console.error('Failed to decrement stock for product:', item.product_id, stockErr);
      }
    }

    // Fetch product details for email
    const productIds = items.map(i => i.product_id);
    const { data: dbProducts } = await supabaseAdmin
      .from('products')
      .select('id, name')
      .in('id', productIds);
    
    // Map product names
    const enrichedItems = items.map(item => {
      const dbProd = dbProducts?.find(p => p.id === item.product_id);
      return {
        ...item,
        name: dbProd ? dbProd.name : 'Unknown Product'
      };
    });

    // Send async email to admin (don't block the response)
    sendAdminOrderEmail(order, req.user, enrichedItems).catch(err => {
      console.error('SMTP email error:', err);
    });

    // Send async email to user (don't block the response)
    sendUserOrderConfirmationEmail(order, req.user, enrichedItems).catch(err => {
      console.error('User SMTP email error:', err);
    });

    res.status(201).json({ success: true, message: 'Order placed successfully!', order });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(name, image_url))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(name, image_url, price))')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById };
