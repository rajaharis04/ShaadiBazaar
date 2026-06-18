// ============================================================
// DATABASE CLEANUP SCRIPT
// Wipes all dummy/seed data from Supabase except admin accounts.
// ============================================================

const { supabaseAdmin } = require('../supabase');

async function cleanDatabase() {
  console.log('----------------------------------------------------');
  console.log('🧹 SHAADI BAZAAR — Database Cleanup Script');
  console.log('----------------------------------------------------');

  try {
    // 1. Delete reviews
    console.log('Deleting all reviews...');
    const { error: revErr } = await supabaseAdmin.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (revErr) throw revErr;

    // 2. Delete cart items
    console.log('Deleting all cart items...');
    const { error: cartErr } = await supabaseAdmin.from('cart_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (cartErr) throw cartErr;

    // 3. Delete order items
    console.log('Deleting all order items...');
    const { error: itemErr } = await supabaseAdmin.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (itemErr) throw itemErr;

    // 4. Delete orders
    console.log('Deleting all orders...');
    const { error: orderErr } = await supabaseAdmin.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (orderErr) throw orderErr;

    // 5. Delete bookings
    console.log('Deleting all bookings...');
    const { error: bookErr } = await supabaseAdmin.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (bookErr) throw bookErr;

    // 6. Delete products
    console.log('Deleting all products...');
    const { error: prodErr } = await supabaseAdmin.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (prodErr) throw prodErr;

    // 7. Delete services
    console.log('Deleting all services...');
    const { error: svcErr } = await supabaseAdmin.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (svcErr) throw svcErr;

    // 8. Delete users (except the admin user)
    console.log('Deleting customer users (keeping admin)...');
    const { error: userErr } = await supabaseAdmin
      .from('users')
      .delete()
      .neq('role', 'admin');
    if (userErr) throw userErr;

    console.log('----------------------------------------------------');
    console.log('✅ Database cleaned successfully!');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
  }
}

cleanDatabase();
