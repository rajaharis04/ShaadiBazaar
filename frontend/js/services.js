// ============================================================
// SERVICES JS — Fetch, Filter, Display, Booking
// ============================================================

let allServices      = [];
let filteredServices = [];

document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  if (page === 'services')        initServicesPage();
  if (page === 'service-detail')  initServiceDetailPage();
  if (page === 'home')            initHomeServices();

  // Register modal submit event listener
  document.getElementById('modal-booking-form')?.addEventListener('submit', handleModalBookingSubmit);
});

// ============================================================
// HOME: Featured Services
// ============================================================
async function initHomeServices() {
  const grid = document.getElementById('featured-services-grid');
  if (!grid) return;

  grid.innerHTML = Array(3).fill('<div class="skeleton skeleton-card"></div>').join('');

  try {
    const data = await apiCall('/services?sort=rating&order=desc');
    const services = (data.services || []).slice(0, 3);
    grid.innerHTML = services.map(s => serviceCardHTML(s)).join('');
  } catch (err) {
    grid.innerHTML = '<p class="text-muted text-center">Could not load services.</p>';
  }
}

// ============================================================
// SERVICES PAGE
// ============================================================
async function initServicesPage() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;

  grid.innerHTML = Array(6).fill('<div class="skeleton skeleton-card"></div>').join('');

  // Load dynamic service category filters first
  await loadServiceCategoryFilters();

  try {
    const data = await apiCall('/services');
    allServices = data.services || [];
    filteredServices = [...allServices];
    renderServices();
  } catch (err) {
    grid.innerHTML = '<p class="text-muted text-center">Failed to load services</p>';
  }

  // Listeners
  document.querySelectorAll('input[name="svc-category"]').forEach(el => {
    el.addEventListener('change', applyServiceFilters);
  });
  document.getElementById('svc-city-filter')?.addEventListener('change', applyServiceFilters);
  document.getElementById('svc-search')?.addEventListener('input', debounce(applyServiceFilters, 300));
  document.getElementById('svc-sort')?.addEventListener('change', applyServiceFilters);
  document.getElementById('svc-min-price')?.addEventListener('input', applyServiceFilters);
  document.getElementById('svc-max-price')?.addEventListener('input', applyServiceFilters);
  document.getElementById('svc-filter-reset')?.addEventListener('click', resetServiceFilters);
}

async function loadServiceCategoryFilters() {
  const container = document.getElementById('service-category-filters');
  if (!container) return;

  try {
    const data = await apiCall('/categories?type=service');
    const categories = data.categories || [];
    let html = `<label class="filter-option"><input type="radio" name="svc-category" value="" checked> All Services</label>`;
    html += categories.map(c => `
      <label class="filter-option"><input type="radio" name="svc-category" value="${c.key}"> ${c.name}</label>
    `).join('');
    container.innerHTML = html;
  } catch (err) {
    console.error('Failed to load service categories for filters:', err);
  }
}

function applyServiceFilters() {
  const category = document.querySelector('input[name="svc-category"]:checked')?.value || '';
  const city     = document.getElementById('svc-city-filter')?.value?.toLowerCase() || '';
  const search   = document.getElementById('svc-search')?.value?.toLowerCase() || '';
  const sort     = document.getElementById('svc-sort')?.value || 'rating';
  const minPrice = parseFloat(document.getElementById('svc-min-price')?.value) || 0;
  const maxPrice = parseFloat(document.getElementById('svc-max-price')?.value) || Infinity;

  filteredServices = allServices.filter(s => {
    const matchCat   = !category || s.category === category;
    const matchCity  = !city || s.city.toLowerCase().includes(city);
    const matchSearch = !search || s.title.toLowerCase().includes(search) || s.provider_name.toLowerCase().includes(search);
    const matchPrice  = s.price_per_day >= minPrice && s.price_per_day <= maxPrice;
    return matchCat && matchCity && matchSearch && matchPrice;
  });

  filteredServices.sort((a, b) => {
    if (sort === 'price-asc')  return a.price_per_day - b.price_per_day;
    if (sort === 'price-desc') return b.price_per_day - a.price_per_day;
    return b.rating - a.rating;
  });

  renderServices();
}

function renderServices() {
  const grid    = document.getElementById('services-grid');
  const countEl = document.getElementById('services-count');
  if (!grid) return;

  if (countEl) countEl.textContent = filteredServices.length;

  if (filteredServices.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <h3>No services found</h3>
        <p>Try a different city or category</p>
        <button class="btn btn-primary" onclick="resetServiceFilters()">Clear Filters</button>
      </div>`;
    return;
  }

  grid.innerHTML = filteredServices.map(s => serviceCardHTML(s)).join('');
}

function resetServiceFilters() {
  document.querySelectorAll('input[name="svc-category"]').forEach(el => el.checked = false);
  const all = document.querySelector('input[name="svc-category"][value=""]');
  if (all) all.checked = true;
  ['svc-city-filter','svc-search','svc-min-price','svc-max-price'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  filteredServices = [...allServices];
  renderServices();
}

// ============================================================
// SERVICE DETAIL PAGE
// ============================================================
async function initServiceDetailPage() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { window.location.href = '/services.html'; return; }

  try {
    const data = await apiCall(`/services/${id}`);
    renderServiceDetail(data.service);
    renderServiceReviews(data.reviews || []);
  } catch (err) {
    document.getElementById('service-detail-container').innerHTML =
      '<div class="empty-state"><h3>Service not found</h3></div>';
  }

  // Booking form on details page opens the booking details modal
  document.getElementById('booking-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    openBookingModal(id, window._servicePrice);
  });

  // Set min date to today
  const dateInput = document.getElementById('event-date');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
}

function renderServiceDetail(s) {
  document.title = `${s.title} — Shaadi Bazaar`;
  document.getElementById('service-title').textContent    = s.title;
  document.getElementById('service-provider').textContent = s.provider_name;
  document.getElementById('service-category').textContent = getCategoryLabel(s.category);
  document.getElementById('service-city').textContent     = `City: ${s.city}`;
  document.getElementById('service-price').textContent    = formatPrice(s.price_per_day);
  document.getElementById('service-desc').textContent     = s.description || '';
  document.getElementById('service-img').src             = s.image_url || 'https://via.placeholder.com/600x400';
  document.getElementById('service-rating').innerHTML    = renderStars(s.rating);

  // Update price in booking form
  const pricePreviewEl = document.getElementById('booking-price-preview');
  if (pricePreviewEl) pricePreviewEl.textContent = formatPrice(s.price_per_day) + '/day';

  // Compute total when date changes
  document.getElementById('event-date')?.addEventListener('change', () => {
    const totalEl = document.getElementById('booking-total');
    if (totalEl) totalEl.textContent = formatPrice(s.price_per_day);
    window._servicePrice = s.price_per_day;
  });

  window._servicePrice = s.price_per_day;
}

function renderServiceReviews(reviews) {
  const grid = document.getElementById('service-reviews-grid');
  if (!grid) return;
  if (reviews.length === 0) {
    grid.innerHTML = '<p class="text-muted">No reviews yet.</p>';
    return;
  }
  grid.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <span class="review-author">${r.users?.name || 'Anonymous'}</span>
        <span class="review-date">${formatDate(r.created_at)}</span>
      </div>
      <div class="mb-1">${renderStars(r.rating)}</div>
      <p class="review-text">${r.comment || ''}</p>
    </div>`).join('');
}

async function submitBooking(e, serviceId) {
  e.preventDefault();
  // Booking logic disabled completely
}

// ============================================================
// TEMPLATE
// ============================================================
function serviceCardHTML(s) {
  return `
    <div class="service-card">
      <div class="service-card-image">
        <img src="${s.image_url || 'https://via.placeholder.com/400x200'}" alt="${s.title}" loading="lazy">
        <div class="service-category-overlay">
          <span class="badge badge-gold">${getCategoryLabel(s.category)}</span>
        </div>
      </div>
      <div class="service-card-body">
        <h3>${truncate(s.title, 45)}</h3>
        <p class="service-provider">Provider: ${s.provider_name}</p>
        <div class="service-meta">
          <span>City: ${s.city}</span>
          <span>${renderStars(s.rating)} (${s.rating})</span>
        </div>
        <div class="service-card-footer">
          <div class="service-price">
            ${formatPrice(s.price_per_day)}
            <small>/day</small>
          </div>
          <button onclick="openBookingModal('${s.id}', ${s.price_per_day})" class="btn btn-primary btn-sm" style="border:none; cursor:pointer;">Book Now</button>
        </div>
      </div>
    </div>`;
}

function debounce(fn, delay) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), delay); };
}

// ============================================================
// BOOKING MODAL CONTROL & SUBMISSION LOGIC
// ============================================================
function openBookingModal(serviceId, pricePerDay) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to book a service', 'warning');
    const path = window.location.pathname;
    const search = window.location.search;
    window.location.href = `auth.html?redirect=${encodeURIComponent(path + search)}`;
    return;
  }

  // Pre-fill user info
  const nameInput = document.getElementById('modal-user-name');
  const phoneInput = document.getElementById('modal-user-phone');
  if (nameInput) nameInput.value = user.name || '';
  if (phoneInput) phoneInput.value = user.phone || '';

  // Pre-fill hidden inputs
  const serviceIdInput = document.getElementById('modal-service-id');
  const servicePriceInput = document.getElementById('modal-service-price');
  if (serviceIdInput) serviceIdInput.value = serviceId;
  if (servicePriceInput) servicePriceInput.value = pricePerDay;

  // Set min date to today
  const dateInput = document.getElementById('modal-event-date');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  // Show modal
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

async function handleModalBookingSubmit(e) {
  e.preventDefault();

  const user = getCurrentUser();
  if (!user) return;

  const serviceId = document.getElementById('modal-service-id')?.value;
  const totalPrice = parseFloat(document.getElementById('modal-service-price')?.value) || 0;
  const name = document.getElementById('modal-user-name')?.value.trim();
  const phone = document.getElementById('modal-user-phone')?.value.trim();
  const eventDate = document.getElementById('modal-event-date')?.value;
  const timeSlot = document.getElementById('modal-time-slot')?.value;
  const address = document.getElementById('modal-user-address')?.value.trim();

  if (!serviceId || !eventDate || !timeSlot || !address || !name || !phone) {
    showToast('Please fill in all required fields', 'warning');
    return;
  }

  const btn = document.getElementById('modal-book-btn');
  const originalText = btn ? btn.innerHTML : 'Book Now';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Booking...';
  }

  try {
    // 1. Update user profile if name or phone has changed
    if (name !== user.name || phone !== user.phone) {
      await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone, city: user.city })
      });
      localStorage.setItem('sb_user', JSON.stringify({ ...user, name, phone }));
    }

    // 2. Submit the booking to the backend
    const notes = `Address: ${address}\nContact Name: ${name}\nContact Phone: ${phone}`;
    await apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        service_id: serviceId,
        event_date: eventDate,
        time_slot: timeSlot,
        total_price: totalPrice,
        notes: notes
      })
    });

    // 3. Close the booking modal
    closeBookingModal();

    // 4. Show success animation overlay
    const overlay = document.getElementById('booking-success-overlay');
    if (overlay) {
      overlay.classList.add('show');
    } else {
      showToast('Booking Confirmed!', 'success');
    }

    // 5. Redirect after 3 seconds
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 3000);

  } catch (err) {
    showToast(err.message || 'Booking failed', 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
}
