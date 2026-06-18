const { supabaseAdmin } = require('../supabase');

async function createUser() {
  const email = 'testuser@gmail.com';
  const password = 'Password123!';
  const name = 'Test User';
  const phone = '03001234567';
  const city = 'Karachi';

  try {
    // Delete if existing
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers.users.find(u => u.email === email);
    if (existing) {
      await supabaseAdmin.auth.admin.deleteUser(existing.id);
      await supabaseAdmin.from('users').delete().eq('id', existing.id);
      console.log('Deleted existing test user.');
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'customer' }
    });

    if (error) throw error;

    if (data.user) {
      const { error: dbError } = await supabaseAdmin.from('users').insert({
        id: data.user.id,
        name: name,
        email: email,
        phone: phone,
        city: city,
        role: 'customer'
      });

      if (dbError) throw dbError;
      console.log('✅ Test user created successfully:', data.user.id);
    }
  } catch (err) {
    console.error('Error creating test user:', err);
  }
}

createUser();
