// ============================================================
// PRODUCTS JS — Fetch, Filter, Search, Display
// ============================================================

let allProducts     = [];
let filteredProducts = [];
let currentPage     = 1;
const PER_PAGE      = 12;

document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  if (page === 'products')       initProductsPage();
  if (page === 'product-detail') initProductDetailPage();
  if (page === 'home')           initHomeProducts();
});

// ============================================================
// HOME: Featured Products
// ============================================================
async function initHomeProducts() {
  const grid = document.getElementById('featured-products-grid');
  if (!grid) return;

  renderSkeletons(grid, 4);

  try {
    const data = await apiCall('/products?featured=true&sort=created_at&order=desc');
    allProducts = data.products || [];
    const featured = allProducts.slice(0, 4);
    grid.innerHTML = featured.map(p => productCardHTML(p)).join('');
    attachCartButtons(grid);
  } catch (err) {
    grid.innerHTML = '<p class="text-muted text-center">Could not load products.</p>';
  }
}

// ============================================================
// PRODUCTS PAGE
// ============================================================
// ============================================================
// PRODUCTS PAGE
// ============================================================
async function initProductsPage() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Load dynamic category filters from the database
  await loadProductCategoryFilters();

  // Get URL params
  const params   = new URLSearchParams(window.location.search);
  const initCat  = params.get('category') || '';

  // Set filter from URL
  if (initCat) {
    const radioEl = document.querySelector(`input[name="category"][value="${initCat}"]`);
    if (radioEl) radioEl.checked = true;
  }

  renderSkeletons(grid, 8);

  try {
    const data = await apiCall('/products');
    allProducts = data.products || [];
    filteredProducts = [...allProducts];
    applyFilters();
  } catch (err) {
    grid.innerHTML = '<p class="text-muted text-center">Could not load products.</p>';
  }

  // Attach filter listeners
  document.querySelectorAll('input[name="category"]').forEach(el => {
    el.addEventListener('change', applyFilters);
  });
  document.getElementById('search-input')?.addEventListener('input', debounce(applyFilters, 300));
  document.getElementById('sort-select')?.addEventListener('change', applyFilters);
  document.getElementById('min-price')?.addEventListener('input', applyFilters);
  document.getElementById('max-price')?.addEventListener('input', applyFilters);
  document.getElementById('filter-reset')?.addEventListener('click', resetFilters);
  document.getElementById('view-grid')?.addEventListener('click', () => setView('grid'));
  document.getElementById('view-list')?.addEventListener('click', () => setView('list'));
  document.getElementById('mobile-filter-toggle')?.addEventListener('click', () => {
    document.querySelector('.filter-sidebar')?.classList.toggle('open');
  });
}

async function loadProductCategoryFilters() {
  const container = document.getElementById('product-category-filters');
  if (!container) return;

  try {
    const data = await apiCall('/categories?type=product');
    const categories = data.categories || [];
    let html = `<label class="filter-option"><input type="radio" name="category" value="" checked> All Categories</label>`;
    html += categories.map(c => `
      <label class="filter-option"><input type="radio" name="category" value="${c.key}"> ${c.name}</label>
    `).join('');
    container.innerHTML = html;
  } catch (err) {
    console.error('Failed to load product categories for filters:', err);
  }
}

function applyFilters() {
  const category = document.querySelector('input[name="category"]:checked')?.value || '';
  const search   = document.getElementById('search-input')?.value.toLowerCase() || '';
  const sort     = document.getElementById('sort-select')?.value || 'newest';
  const minPrice = parseFloat(document.getElementById('min-price')?.value) || 0;
  const maxPrice = parseFloat(document.getElementById('max-price')?.value) || Infinity;

  filteredProducts = allProducts.filter(p => {
    const matchCat   = !category || p.category === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search) || p.description?.toLowerCase().includes(search);
    const matchPrice  = p.price >= minPrice && p.price <= maxPrice;
    return matchCat && matchSearch && matchPrice;
  });

  // Sort
  filteredProducts.sort((a, b) => {
    if (sort === 'price-asc')  return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'name')       return a.name.localeCompare(b.name);
    return new Date(b.created_at) - new Date(a.created_at); // newest
  });

  currentPage = 1;
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('products-count');
  if (!grid) return;

  const start = (currentPage - 1) * PER_PAGE;
  const pageProducts = filteredProducts.slice(start, start + PER_PAGE);

  if (countEl) countEl.textContent = filteredProducts.length;

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <h3>No products found</h3>
        <p>Try adjusting your filters or search term</p>
        <button class="btn btn-primary" onclick="resetFilters()">Clear Filters</button>
      </div>`;
    renderPagination(0);
    return;
  }

  grid.innerHTML = pageProducts.map(p => productCardHTML(p)).join('');
  attachCartButtons(grid);
  renderPagination(filteredProducts.length);
}

function renderPagination(total) {
  const paginationEl = document.getElementById('pagination');
  if (!paginationEl) return;

  const totalPages = Math.ceil(total / PER_PAGE);
  if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&laquo;</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>&raquo;</button>`;
  paginationEl.innerHTML = html;
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredProducts.length / PER_PAGE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderProducts();
  window.scrollTo({ top: document.querySelector('.products-main')?.offsetTop - 100 || 0, behavior: 'smooth' });
}

function setView(view) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  grid.classList.toggle('list-view', view === 'list');
  document.getElementById('view-grid')?.classList.toggle('active', view === 'grid');
  document.getElementById('view-list')?.classList.toggle('active', view === 'list');
}

function resetFilters() {
  document.querySelectorAll('input[name="category"]').forEach(el => el.checked = false);
  const firstRadio = document.querySelector('input[name="category"][value=""]');
  if (firstRadio) firstRadio.checked = true;
  if (document.getElementById('search-input'))     document.getElementById('search-input').value = '';
  if (document.getElementById('sort-select'))      document.getElementById('sort-select').value = 'newest';
  if (document.getElementById('min-price'))        document.getElementById('min-price').value = '';
  if (document.getElementById('max-price'))        document.getElementById('max-price').value = '';
  filteredProducts = [...allProducts];
  applyFilters();
}

// ============================================================
// PRODUCT DETAIL PAGE
// ============================================================
async function initProductDetailPage() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { window.location.href = '/products.html'; return; }

  try {
    const data = await apiCall(`/products/${id}`);
    renderProductDetail(data.product);
    renderReviews(data.reviews || []);
  } catch (err) {
    document.getElementById('product-detail-container').innerHTML =
      '<div class="empty-state"><h3>Product not found</h3></div>';
  }

  // Review form
  const reviewForm = document.getElementById('review-form');
  reviewForm?.addEventListener('submit', submitReview);
}

function renderProductDetail(p) {
  document.title = `${p.name} — Shaadi Bazaar`;
  document.getElementById('product-name').textContent    = p.name;
  document.getElementById('product-category').textContent = getCategoryLabel(p.category);
  document.getElementById('product-price').textContent   = formatPrice(p.price);
  document.getElementById('product-desc').textContent    = p.description || '';
  document.getElementById('product-stock').textContent   = p.stock > 0 ? `In Stock (${p.stock} left)` : 'Out of Stock';
  document.getElementById('product-img').src             = p.image_url || 'https://via.placeholder.com/600x400';
  document.getElementById('breadcrumb-name').textContent = p.name;

  const stockEl = document.getElementById('product-stock');
  stockEl.className = `stock-status ${p.stock > 5 ? 'in-stock' : p.stock > 0 ? 'low-stock' : 'out-stock'}`;

  // Add to cart
  document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
    const qty = parseInt(document.getElementById('qty-display')?.textContent || 1);
    addToCart(p, qty);
  });

  // Quantity controls
  document.getElementById('qty-minus')?.addEventListener('click', () => {
    const el = document.getElementById('qty-display');
    if (el && parseInt(el.textContent) > 1) el.textContent = parseInt(el.textContent) - 1;
  });
  document.getElementById('qty-plus')?.addEventListener('click', () => {
    const el = document.getElementById('qty-display');
    if (el) el.textContent = parseInt(el.textContent) + 1;
  });
}

function renderReviews(reviews) {
  const grid = document.getElementById('reviews-grid');
  const count = document.getElementById('reviews-count');
  if (!grid) return;

  if (count) count.textContent = reviews.length;

  if (reviews.length === 0) {
    grid.innerHTML = '<p class="text-muted">No reviews yet. Be the first to review!</p>';
    return;
  }

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  grid.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <span class="review-author">${r.users?.name || 'Anonymous'}</span>
        <span class="review-date">${formatDate(r.created_at)}</span>
      </div>
      <div class="mb-1">${renderStars(r.rating)}</div>
      <p class="review-text">${r.comment || ''}</p>
    </div>
  `).join('');
}

async function submitReview(e) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) { showToast('Please login to review', 'warning'); return; }

  const id      = new URLSearchParams(window.location.search).get('id');
  const rating  = document.querySelector('input[name="rating"]:checked')?.value;
  const comment = document.getElementById('review-comment')?.value;

  if (!rating) { showToast('Please select a rating', 'warning'); return; }

  try {
    await apiCall(`/products/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating: parseInt(rating), comment })
    });
    showToast('Review submitted!', 'success');
    setTimeout(() => window.location.reload(), 1000);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================
// CART HELPERS
// ============================================================
async function addToCart(product, quantity = 1) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to add to cart', 'warning');
    window.location.href = `auth.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }

  try {
    await apiCall('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id, quantity })
    });

    showToast(`${product.name} added to cart!`, 'success');
    updateCartBadge();
  } catch (err) {
    showToast('Failed to add to cart', 'error');
    console.error(err);
  }
}

function attachCartButtons(container) {
  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.product-card');
      const product = {
        id:    card?.dataset.productId,
        name:  card?.dataset.productName,
        price: card?.dataset.productPrice,
        image_url: card?.dataset.productImage
      };
      addToCart(product);
    });
  });
}

// ============================================================
// HTML TEMPLATES
// ============================================================
function productCardHTML(p) {
  const heartIcon = isInWishlist(p.id) ? '♥' : '♡';
  const activeClass = isInWishlist(p.id) ? 'active' : '';
  return `
    <div class="product-card"
      data-product-id="${p.id}"
      data-product-name="${p.name}"
      data-product-price="${p.price}"
      data-product-image="${p.image_url || ''}">
      <div class="product-card-image">
        <img src="${p.image_url || 'https://via.placeholder.com/400x300'}" alt="${p.name}" loading="lazy">
        ${p.is_featured ? '<span class="product-card-badge">Featured</span>' : ''}
        <button class="favorite-btn ${activeClass}" onclick="toggleProductFavorite('${p.id}', event)">${heartIcon}</button>
        <div class="product-card-actions">
          <a href="product-detail.html?id=${p.id}" class="product-action-btn" title="View">View</a>
        </div>
      </div>
      <div class="product-card-body">
        <div class="product-category-tag">${getCategoryLabel(p.category)}</div>
        <h3>${truncate(p.name, 50)}</h3>
      </div>
      <div class="product-card-footer">
        <div class="product-price">
          ${formatPrice(p.price)}
          <small>PKR</small>
        </div>
        <button class="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>`;
}

function toggleProductFavorite(id, event) {
  if (event) event.stopPropagation();
  const p = allProducts.find(item => item.id === id);
  if (p) {
    const itemData = {
      id: p.id,
      name: p.name,
      price: p.price,
      image_url: p.image_url,
      type: 'product',
      category: p.category
    };
    toggleWishlist(itemData);
    renderProducts();
  }
}

// ============================================================
// HELPERS
// ============================================================
function renderSkeletons(container, count) {
  container.innerHTML = Array(count).fill('<div class="skeleton skeleton-card"></div>').join('');
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
