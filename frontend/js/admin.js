// ============================================================
// ADMIN JS — Dashboard Stats, Product/Service CRUD, Order/Booking Management
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;

  if (page === 'admin-dashboard')  initAdminDashboard();
  if (page === 'manage-products')  initManageProducts();
  if (page === 'manage-services')  initManageServices();
  if (page === 'manage-orders')    initManageOrders();

  // Admin logout
  document.getElementById('admin-logout-btn')?.addEventListener('click', logout);

  // Admin nav highlighting
  const currentPath = window.location.pathname.split('/').pop();
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    if (item.getAttribute('href') === currentPath) item.classList.add('active');
  });

  // Mobile sidebar toggle
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.querySelector('.admin-sidebar')?.classList.toggle('open');
  });
});

// ============================================================
// ADMIN AUTH CHECK
// ============================================================
function checkAdminAuth() {
  const user = requireAdmin();
  if (!user) return null;
  const adminName = document.getElementById('admin-name');
  if (adminName) adminName.textContent = user.name || 'Admin';
  return user;
}

// ============================================================
// DASHBOARD STATS
// ============================================================
async function initAdminDashboard() {
  if (!checkAdminAuth()) return;

  try {
    const data = await apiCall('/admin/stats');
    const { stats } = data;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-users',     stats.totalUsers || 0);
    set('stat-products',  stats.totalProducts || 0);
    set('stat-services',  stats.totalServices || 0);
    set('stat-orders',    stats.totalOrders || 0);
    set('stat-bookings',  stats.totalBookings || 0);
    set('stat-revenue',   formatPrice(stats.totalRevenue || 0));
  } catch (err) {
    showToast('Failed to load stats', 'error');
  }

  // Load recent orders
  try {
    const data = await apiCall('/admin/orders');
    renderRecentOrdersTable((data.orders || []).slice(0, 10));
  } catch (_) {}
}

function renderRecentOrdersTable(orders) {
  const tbody = document.getElementById('recent-orders-tbody');
  if (!tbody) return;
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No orders yet</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><code>#${o.id.slice(0,8).toUpperCase()}</code></td>
      <td>${o.users?.name || '-'}</td>
      <td class="table-price">${formatPrice(o.total_amount)}</td>
      <td><span class="badge ${o.payment_method}">${o.payment_method.toUpperCase()}</span></td>
      <td>${statusBadge(o.status)}</td>
      <td>${formatDate(o.created_at)}</td>
    </tr>`).join('');
}

// ============================================================
// MANAGE PRODUCTS
// ============================================================
let editingProductId = null;

async function initManageProducts() {
  if (!checkAdminAuth()) return;
  await loadProductsTable();

  document.getElementById('add-product-btn')?.addEventListener('click', () => openProductModal(null));
  document.getElementById('product-modal-close')?.addEventListener('click', closeProductModal);
  document.getElementById('product-form')?.addEventListener('submit', saveProduct);
  document.getElementById('admin-product-search')?.addEventListener('input', debounce(filterProductsTable, 300));

  // Image URL preview
  document.getElementById('product-image-url')?.addEventListener('input', (e) => {
    const preview = document.getElementById('product-image-preview');
    if (preview && e.target.value) {
      preview.src = e.target.value;
      preview.style.display = 'block';
    }
  });
}

async function loadProductsTable() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="spinner"></div></td></tr>';

  try {
    const data = await apiCall('/products?sort=created_at&order=desc');
    window._adminProducts = data.products || [];
    renderProductsTable(data.products || []);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Failed to load</td></tr>';
  }
}

function renderProductsTable(products) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  const countEl = document.getElementById('products-total-count');
  if (countEl) countEl.textContent = products.length;

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No products found</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image_url || 'https://via.placeholder.com/48'}" class="table-product-img" alt="${p.name}"></td>
      <td><div class="table-product-name" title="${p.name}">${p.name}</div></td>
      <td><span class="badge badge-maroon">${p.category}</span></td>
      <td class="table-price">${formatPrice(p.price)}</td>
      <td>${p.stock}</td>
      <td>${p.is_featured ? '<span class="badge badge-gold">Yes</span>' : '<span class="text-muted">No</span>'}</td>
      <td>${formatDate(p.created_at)}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn action-btn-edit" onclick="openProductModal('${p.id}')" title="Edit">Edit</button>
          <button class="action-btn action-btn-delete" onclick="deleteProduct('${p.id}','${p.name}')" title="Delete">Delete</button>
        </div>
      </td>
    </tr>`).join('');
}

function filterProductsTable() {
  const search = document.getElementById('admin-product-search')?.value?.toLowerCase() || '';
  const products = (window._adminProducts || []).filter(p =>
    p.name.toLowerCase().includes(search) || p.category.includes(search)
  );
  renderProductsTable(products);
}

function openProductModal(productId) {
  editingProductId = productId;
  const modal  = document.getElementById('product-modal');
  const title  = document.getElementById('modal-title');
  const form   = document.getElementById('product-form');

  form?.reset();
  document.getElementById('product-image-preview').style.display = 'none';

  if (productId) {
    const p = (window._adminProducts || []).find(x => x.id === productId);
    if (p) {
      title.textContent = 'Edit Product';
      document.getElementById('product-name-input').value  = p.name;
      document.getElementById('product-desc-input').value  = p.description || '';
      document.getElementById('product-price-input').value = p.price;
      document.getElementById('product-category-input').value = p.category;
      document.getElementById('product-stock-input').value = p.stock;
      document.getElementById('product-image-url').value   = p.image_url || '';
      document.getElementById('product-featured-toggle').checked = p.is_featured;
      if (p.image_url) {
        const preview = document.getElementById('product-image-preview');
        preview.src = p.image_url;
        preview.style.display = 'block';
      }
    }
  } else {
    if (title) title.textContent = 'Add New Product';
  }

  modal?.classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('product-modal')?.classList.add('hidden');
  editingProductId = null;
}

async function saveProduct(e) {
  e.preventDefault();
  const btn = document.getElementById('product-save-btn');

  const productData = {
    name:        document.getElementById('product-name-input').value.trim(),
    description: document.getElementById('product-desc-input').value.trim(),
    price:       parseFloat(document.getElementById('product-price-input').value),
    category:    document.getElementById('product-category-input').value,
    stock:       parseInt(document.getElementById('product-stock-input').value),
    image_url:   document.getElementById('product-image-url').value.trim(),
    is_featured: document.getElementById('product-featured-toggle').checked
  };

  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  try {
    if (editingProductId) {
      await apiCall(`/products/${editingProductId}`, { method: 'PUT', body: JSON.stringify(productData) });
      showToast('Product updated!', 'success');
    } else {
      await apiCall('/products', { method: 'POST', body: JSON.stringify(productData) });
      showToast('Product added!', 'success');
    }
    closeProductModal();
    await loadProductsTable();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save Product'; }
  }
}

async function deleteProduct(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  try {
    await apiCall(`/products/${id}`, { method: 'DELETE' });
    showToast('Product deleted', 'info');
    await loadProductsTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================
// MANAGE SERVICES
// ============================================================
let editingServiceId = null;

async function initManageServices() {
  if (!checkAdminAuth()) return;
  await loadServicesTable();

  document.getElementById('add-service-btn')?.addEventListener('click', () => openServiceModal(null));
  document.getElementById('service-modal-close')?.addEventListener('click', closeServiceModal);
  document.getElementById('service-form')?.addEventListener('submit', saveService);
  document.getElementById('admin-service-search')?.addEventListener('input', debounce(filterServicesTable, 300));
}

async function loadServicesTable() {
  const tbody = document.getElementById('services-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="spinner"></div></td></tr>';

  try {
    const data = await apiCall('/services?sort=created_at&order=desc');
    window._adminServices = data.services || [];
    renderServicesTable(data.services || []);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Failed to load</td></tr>';
  }
}

function renderServicesTable(services) {
  const tbody = document.getElementById('services-tbody');
  if (!tbody) return;

  const countEl = document.getElementById('services-total-count');
  if (countEl) countEl.textContent = services.length;

  tbody.innerHTML = services.map(s => `
    <tr>
      <td><img src="${s.image_url || 'https://via.placeholder.com/48'}" class="table-product-img" alt="${s.title}"></td>
      <td><div class="table-product-name" title="${s.title}">${s.title}</div><div class="text-muted" style="font-size:0.75rem">${s.provider_name}</div></td>
      <td><span class="badge badge-maroon">${s.category}</span></td>
      <td>${s.city}</td>
      <td class="table-price">${formatPrice(s.price_per_day)}/day</td>
      <td>${renderStars(s.rating)} ${s.rating}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn action-btn-edit" onclick="openServiceModal('${s.id}')" title="Edit">Edit</button>
          <button class="action-btn action-btn-delete" onclick="deleteService('${s.id}','${s.title}')" title="Delete">Delete</button>
        </div>
      </td>
    </tr>`).join('');
}

function filterServicesTable() {
  const search = document.getElementById('admin-service-search')?.value?.toLowerCase() || '';
  const services = (window._adminServices || []).filter(s =>
    s.title.toLowerCase().includes(search) || s.city.toLowerCase().includes(search) || s.category.includes(search)
  );
  renderServicesTable(services);
}

function openServiceModal(serviceId) {
  editingServiceId = serviceId;
  const modal = document.getElementById('service-modal');
  const title = document.getElementById('service-modal-title');
  const form  = document.getElementById('service-form');
  form?.reset();

  if (serviceId) {
    const s = (window._adminServices || []).find(x => x.id === serviceId);
    if (s) {
      title.textContent = 'Edit Service';
      document.getElementById('service-title-input').value    = s.title;
      document.getElementById('service-provider-input').value = s.provider_name;
      document.getElementById('service-cat-input').value      = s.category;
      document.getElementById('service-city-input').value     = s.city;
      document.getElementById('service-price-input').value    = s.price_per_day;
      document.getElementById('service-rating-input').value   = s.rating;
      document.getElementById('service-desc-input').value     = s.description || '';
      document.getElementById('service-image-url').value      = s.image_url || '';
    }
  } else {
    if (title) title.textContent = 'Add New Service';
  }
  modal?.classList.remove('hidden');
}

function closeServiceModal() {
  document.getElementById('service-modal')?.classList.add('hidden');
  editingServiceId = null;
}

async function saveService(e) {
  e.preventDefault();
  const btn = document.getElementById('service-save-btn');

  const serviceData = {
    title:         document.getElementById('service-title-input').value.trim(),
    provider_name: document.getElementById('service-provider-input').value.trim(),
    category:      document.getElementById('service-cat-input').value,
    city:          document.getElementById('service-city-input').value.trim(),
    price_per_day: parseFloat(document.getElementById('service-price-input').value),
    rating:        parseFloat(document.getElementById('service-rating-input').value),
    description:   document.getElementById('service-desc-input').value.trim(),
    image_url:     document.getElementById('service-image-url').value.trim()
  };

  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  try {
    if (editingServiceId) {
      await apiCall(`/services/${editingServiceId}`, { method: 'PUT', body: JSON.stringify(serviceData) });
      showToast('Service updated!', 'success');
    } else {
      await apiCall('/services', { method: 'POST', body: JSON.stringify(serviceData) });
      showToast('Service added!', 'success');
    }
    closeServiceModal();
    await loadServicesTable();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save Service'; }
  }
}

async function deleteService(id, title) {
  if (!confirm(`Delete "${title}"?`)) return;
  try {
    await apiCall(`/services/${id}`, { method: 'DELETE' });
    showToast('Service deleted', 'info');
    await loadServicesTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================
// MANAGE ORDERS
// ============================================================
async function initManageOrders() {
  if (!checkAdminAuth()) return;
  await loadOrdersTable();
  document.getElementById('order-status-filter')?.addEventListener('change', filterOrdersTable);
  document.getElementById('admin-order-search')?.addEventListener('input', debounce(filterOrdersTable, 300));
}

async function loadOrdersTable() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="spinner"></div></td></tr>';

  try {
    const data = await apiCall('/admin/orders');
    window._adminOrders = data.orders || [];
    renderOrdersTable(data.orders || []);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Failed to load</td></tr>';
  }
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  const countEl = document.getElementById('orders-total-count');
  if (countEl) countEl.textContent = orders.length;

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><code>#${o.id.slice(0,8).toUpperCase()}</code></td>
      <td><div>${o.users?.name || '-'}</div><div class="text-muted" style="font-size:0.75rem">${o.users?.email || ''}</div></td>
      <td class="table-price">${formatPrice(o.total_amount)}</td>
      <td>${o.city}</td>
      <td><span class="badge">${o.payment_method.toUpperCase()}</span></td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">
          ${['pending','confirmed','delivered','cancelled'].map(s =>
            `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
          ).join('')}
        </select>
      </td>
      <td>${formatDate(o.created_at)}</td>
    </tr>`).join('');
}

function filterOrdersTable() {
  const statusFilter = document.getElementById('order-status-filter')?.value || '';
  const search = document.getElementById('admin-order-search')?.value?.toLowerCase() || '';
  const orders = (window._adminOrders || []).filter(o => {
    const matchStatus = !statusFilter || o.status === statusFilter;
    const matchSearch = !search || o.users?.name?.toLowerCase().includes(search) || o.id.includes(search);
    return matchStatus && matchSearch;
  });
  renderOrdersTable(orders);
}

async function updateOrderStatus(orderId, status) {
  try {
    await apiCall(`/admin/orders/${orderId}`, { method: 'PUT', body: JSON.stringify({ status }) });
    showToast(`Order status updated to "${status}"`, 'success');
    // Update local cache
    const o = (window._adminOrders || []).find(x => x.id === orderId);
    if (o) o.status = status;
  } catch (err) {
    showToast('Failed to update order status', 'error');
    await loadOrdersTable();
  }
}

// ============================================================
// SHARED HELPERS
// ============================================================
function debounce(fn, delay) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), delay); };
}

async function logout() {
  try { await apiCall('/auth/logout', { method: 'POST' }); } catch (_) {}
  localStorage.removeItem('sb_token');
  localStorage.removeItem('sb_user');
  window.location.href = 'admin-login.html';
}
