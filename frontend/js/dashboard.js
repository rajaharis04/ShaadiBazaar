// ============================================================
// DASHBOARD JS — User Dashboard: Orders, Bookings, Profile, Countdown
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth();
  if (!user) return;

  // Set profile info
  document.getElementById('profile-initial').textContent  = user.name?.[0]?.toUpperCase() || '?';
  document.getElementById('profile-name-display').textContent  = user.name || 'User';
  document.getElementById('profile-email-display').textContent = user.email || '';

  // Load sections
  await Promise.all([
    loadMyOrders(user.id),
    loadMyBookings(user.id),
    loadProfileForm(user),
    initCountdown()
  ]);

  // Tab navigation
  document.querySelectorAll('.dash-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.target;
      if (!target) return;

      document.querySelectorAll('.dash-nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.dash-panel').forEach(p => p.classList.add('hidden'));

      item.classList.add('active');
      document.getElementById(target)?.classList.remove('hidden');
    });
  });

  // Profile form submit
  document.getElementById('profile-form')?.addEventListener('submit', saveProfile);

  // Logout
  document.getElementById('nav-logout-btn')?.addEventListener('click', logout);
});

// ============================================================
// MY ORDERS
// ============================================================
async function loadMyOrders(userId) {
  const container = document.getElementById('orders-container');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await apiCall('/orders/my-orders');
    const orders = data.orders || [];

    // Update badge
    const badge = document.getElementById('orders-count-badge');
    if (badge) badge.textContent = orders.length;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No orders yet</h3>
          <p>Start shopping for your wedding!</p>
          <a href="products.html" class="btn btn-primary">Shop Now</a>
        </div>`;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <div class="order-id">Order <strong>#${order.id.slice(0,8).toUpperCase()}</strong></div>
            <div class="order-date">${formatDate(order.created_at)}</div>
          </div>
          <div style="display:flex;gap:0.75rem;align-items:center">
            <span class="badge badge-${order.payment_method === 'cod' ? 'maroon' : 'gold'}">${order.payment_method.toUpperCase()}</span>
            ${statusBadge(order.status)}
          </div>
        </div>
        <div class="order-card-body">
          <div class="order-items-list">
            ${(order.order_items || []).slice(0,3).map(item => `
              <div class="order-item">
                <img src="${item.products?.image_url || 'https://via.placeholder.com/50'}" alt="${item.products?.name}">
                <div class="order-item-info">
                  <h5>${item.products?.name || 'Product'}</h5>
                  <p>Qty: ${item.quantity} × ${formatPrice(item.price)}</p>
                </div>
              </div>`).join('')}
            ${order.order_items?.length > 3 ? `<p class="text-muted text-small">+${order.order_items.length - 3} more items</p>` : ''}
          </div>
        </div>
        <div class="order-card-footer">
          <div>
            <div class="text-muted text-small">Delivery to ${order.city}</div>
          </div>
          <div class="order-total">${formatPrice(order.total_amount)}</div>
        </div>
      </div>`).join('');
  } catch (err) {
    container.innerHTML = '<p class="text-muted text-center">Failed to load orders</p>';
    console.error(err);
  }
}

// ============================================================
// MY BOOKINGS
// ============================================================
async function loadMyBookings(userId) {
  const container = document.getElementById('bookings-container');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await apiCall('/bookings/my-bookings');
    const bookings = data.bookings || [];

    const badge = document.getElementById('bookings-count-badge');
    if (badge) badge.textContent = bookings.length;

    if (bookings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No bookings yet</h3>
          <p>Book photographers, decorators, and caterers!</p>
          <a href="services.html" class="btn btn-primary">Browse Services</a>
        </div>`;
      return;
    }

    container.innerHTML = bookings.map(b => `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <div class="order-id">Booking <strong>#${b.id.slice(0,8).toUpperCase()}</strong></div>
            <div class="order-date">Event: <strong>${formatDate(b.event_date)}</strong> — ${b.time_slot}</div>
          </div>
          ${statusBadge(b.status)}
        </div>
        <div class="order-card-body">
          <div style="display:flex;gap:1rem;align-items:center">
            <img src="${b.services?.image_url || 'https://via.placeholder.com/60'}" 
                 style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
            <div>
              <h4 style="font-size:0.95rem;color:var(--maroon-dark)">${b.services?.title || 'Service'}</h4>
              <p class="text-muted text-small">Provider: ${b.services?.provider_name || ''}</p>
              <p class="text-muted text-small">City: ${b.services?.city || ''} · ${getCategoryLabel(b.services?.category || '')}</p>
              ${b.notes ? `<p class="text-muted text-small mt-1">Notes: ${b.notes}</p>` : ''}
            </div>
          </div>
        </div>
        <div class="order-card-footer">
          <div>
            ${b.status === 'pending' ? `
              <button class="btn btn-outline btn-sm" style="border-color:var(--danger);color:var(--danger)"
                onclick="cancelBooking('${b.id}')">Cancel Booking</button>` : ''}
          </div>
          <div class="order-total">${formatPrice(b.total_price)}</div>
        </div>
      </div>`).join('');
  } catch (err) {
    container.innerHTML = '<p class="text-muted text-center">Failed to load bookings</p>';
  }
}

async function cancelBooking(bookingId) {
  if (!confirm('Cancel this booking?')) return;
  try {
    await apiCall(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled' })
    });
    showToast('Booking cancelled', 'info');
    const user = getCurrentUser();
    if (user) await loadMyBookings(user.id);
  } catch (err) {
    showToast('Failed to cancel booking', 'error');
  }
}

// ============================================================
// PROFILE FORM
// ============================================================
function loadProfileForm(user) {
  const nameEl  = document.getElementById('profile-name-input');
  const phoneEl = document.getElementById('profile-phone-input');
  const cityEl  = document.getElementById('profile-city-input');

  if (nameEl)  nameEl.value  = user.name  || '';
  if (phoneEl) phoneEl.value = user.phone || '';
  if (cityEl)  cityEl.value  = user.city  || '';
}

async function saveProfile(e) {
  e.preventDefault();
  const btn = document.getElementById('save-profile-btn');
  const name  = document.getElementById('profile-name-input')?.value.trim();
  const phone = document.getElementById('profile-phone-input')?.value.trim();
  const city  = document.getElementById('profile-city-input')?.value;

  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  try {
    const data = await apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, phone, city })
    });

    // Update stored user
    const stored = getCurrentUser();
    localStorage.setItem('sb_user', JSON.stringify({ ...stored, name, phone, city }));

    document.getElementById('profile-name-display').textContent = name;
    document.getElementById('profile-initial').textContent = name?.[0]?.toUpperCase() || '?';

    showToast('Profile updated!', 'success');
  } catch (err) {
    showToast('Failed to update profile', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
  }
}

// ============================================================
// WEDDING COUNTDOWN
// ============================================================
function initCountdown() {
  const dateInput  = document.getElementById('wedding-date-input');
  const countdownEl = document.getElementById('countdown-display');

  const savedDate = localStorage.getItem('wedding_date');
  if (savedDate && dateInput) {
    dateInput.value = savedDate;
    updateCountdown(new Date(savedDate));
  }

  dateInput?.addEventListener('change', (e) => {
    const wDate = new Date(e.target.value);
    localStorage.setItem('wedding_date', e.target.value);
    updateCountdown(wDate);
  });
}

function updateCountdown(targetDate) {
  const display = document.getElementById('countdown-display');
  if (!display) return;

  function tick() {
    const now  = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      display.innerHTML = '<div style="text-align:center;color:var(--gold);font-size:1.5rem">Your special day is here!</div>';
      return;
    }

    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs  = Math.floor((diff % (1000 * 60)) / 1000);

    display.innerHTML = `
      <div class="countdown-units">
        ${[['Days', days], ['Hours', hours], ['Mins', mins], ['Secs', secs]].map(([label, val]) => `
          <div class="countdown-unit">
            <span class="countdown-number">${String(val).padStart(2, '0')}</span>
            <span class="countdown-label">${label}</span>
          </div>`).join('')}
      </div>`;
  }

  tick();
  setInterval(tick, 1000);
}
