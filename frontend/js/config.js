// ============================================================
// SHAADI BAZAAR — FRONTEND CONFIG
// Replace BOTH values below with your actual Supabase credentials
// ============================================================

const SUPABASE_URL = 'https://tvaasweoknmymxfbgvix.supabase.co';       // e.g. https://xyzabc.supabase.co
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2YWFzd2Vva25teW14ZmJndml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzUwOTEsImV4cCI6MjA5Njk1MTA5MX0.4SifqADtMsMvvmUx5XCoYgeoh5HD57UovnRlXBs71-k';  // from Project Settings > API

// Backend API base URL
const API_BASE = 'https://shaadibazaar-production-3275.up.railway.app/api';  // Change to Render URL for production

// ============================================================
// Initialize Supabase Client
// ============================================================
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON);

// Automatically set session on supabaseClient if token is present
(function () {
  const token = localStorage.getItem('sb_token');
  if (token) {
    supabaseClient.auth.setSession({
      access_token: token,
      refresh_token: ''
    }).catch(err => console.error('Failed to set Supabase session on client:', err));
  }
})();

// ============================================================
// Utility Functions (available globally)
// ============================================================

/**
 * Show a toast notification
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✓ ', error: '✕ ', warning: '! ', info: 'i ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/**
 * Format price in Pakistani Rupees
 */
function formatPrice(amount) {
  return `Rs. ${parseFloat(amount).toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
}

/**
 * Generate star HTML
 */
function renderStars(rating, maxStars = 5) {
  let html = '<span class="stars">';
  for (let i = 1; i <= maxStars; i++) {
    html += `<span class="${i <= Math.round(rating) ? 'star-filled' : 'star-empty'}">★</span>`;
  }
  return html + '</span>';
}

/**
 * Format date nicely
 */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

/**
 * Truncate text
 */
function truncate(text, maxLen = 80) {
  return text && text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
}

let globalCategories = [];

// Fetch global categories from backend database
async function loadGlobalCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    if (data.success) {
      globalCategories = data.categories || [];
    }
  } catch (err) {
    console.error('Error fetching global categories:', err);
  }
}

// Initiate fetch immediately
loadGlobalCategories();

/**
 * Get category display name
 */
function getCategoryLabel(cat) {
  if (!cat) return '';
  const cleanCat = cat.toLowerCase().trim();
  const found = globalCategories.find(c => c.key === cleanCat);
  if (found) return found.name;

  const map = {
    bridal: 'Bridal', jewellery: 'Jewellery', mehndi: 'Mehndi',
    decor: 'Decor', baraat: 'Baraat',
    photographer: 'Photography', decorator: 'Decoration', catering: 'Catering'
  };
  return map[cleanCat] || cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ').replace(/-/g, ' ');
}

/**
 * Get status badge HTML
 */
function statusBadge(status) {
  const map = {
    pending: { cls: 'status-pending', label: 'Pending' },
    confirmed: { cls: 'status-confirmed', label: 'Confirmed' },
    delivered: { cls: 'status-delivered', label: 'Delivered' },
    cancelled: { cls: 'status-cancelled', label: 'Cancelled' }
  };
  const s = map[status] || { cls: 'badge-info', label: status };
  return `<span class="order-status ${s.cls}">${s.label}</span>`;
}

/**
 * Get auth token from localStorage
 */
function getToken() {
  return localStorage.getItem('sb_token');
}

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
  const u = localStorage.getItem('sb_user');
  return u ? JSON.parse(u) : null;
}

/**
 * Check if user is logged in, redirect if not
 */
function requireAuth(redirectTo = 'auth.html') {
  const token = getToken();
  if (!token) {
    window.location.href = redirectTo;
    return null;
  }
  return getCurrentUser();
}

/**
 * Check if admin, redirect if not
 */
function requireAdmin() {
  const user = requireAuth('auth.html?tab=admin');
  if (user && user.role !== 'admin') {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

/**
 * API helper with auth token
 */
async function apiCall(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

/**
 * Update cart badge count in navbar
 */
async function updateCartBadge() {
  const user = getCurrentUser();
  if (!user) return;
  try {
    const data = await apiCall('/cart');
    const items = data.cart || [];
    const total = items.reduce((sum, i) => sum + i.quantity, 0);
    const badge = document.querySelector('.cart-badge');
    if (badge) {
      badge.textContent = total;
      badge.style.display = total > 0 ? 'flex' : 'none';
    }
  } catch (_) { }
}

/**
 * Update navbar based on auth state
 */
function updateNavbar() {
  const user = getCurrentUser();
  const loginBtn = document.getElementById('nav-login-btn');
  const logoutBtn = document.getElementById('nav-logout-btn');
  const dashLink = document.getElementById('nav-dashboard-link');
  const brandLink = document.querySelector('.navbar-brand');
  const homeLink = document.querySelector('#nav-links li a[href="index.html"]') || document.querySelector('#nav-links li a[href="../index.html"]');
  const cartLink = document.querySelector('.nav-cart-btn');

  const isAdminDir = window.location.pathname.includes('/admin/');

  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'flex';
    if (dashLink) dashLink.style.display = 'inline-flex';

    // Point brand logo to dashboard when logged in
    if (brandLink) {
      brandLink.href = user.role === 'admin'
        ? (isAdminDir ? 'admin-dashboard.html' : 'admin/admin-dashboard.html')
        : (isAdminDir ? '../dashboard.html' : 'dashboard.html');
    }

    // Hide Home link when logged in
    if (homeLink) homeLink.parentElement.style.display = 'none';

    // Point cart link to cart page when logged in
    if (cartLink) {
      cartLink.href = isAdminDir ? '../cart.html' : 'cart.html';
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (dashLink) dashLink.style.display = 'none';

    if (brandLink) brandLink.href = isAdminDir ? '../index.html' : 'index.html';
    if (homeLink) homeLink.parentElement.style.display = 'block';

    // Point cart link to auth page with redirect to cart when not logged in
    if (cartLink) {
      cartLink.href = isAdminDir ? '../auth.html?redirect=cart.html' : 'auth.html?redirect=cart.html';
    }
  }
  updateCartBadge();
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
});

// Mobile hamburger
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  hamburger?.addEventListener('click', () => navLinks?.classList.toggle('open'));

  // Global logout button listener
  document.getElementById('nav-logout-btn')?.addEventListener('click', logout);

  updateNavbar();
});

// Global logout function
async function logout() {
  try {
    await apiCall('/auth/logout', { method: 'POST' });
  } catch (_) { }

  localStorage.removeItem('sb_token');
  localStorage.removeItem('sb_user');
  showToast('Logged out successfully', 'info');

  const isAdminDir = window.location.pathname.includes('/admin/');
  setTimeout(() => {
    window.location.href = isAdminDir ? '../index.html' : 'index.html';
  }, 600);
}

// Automatically redirect logged-in users away from the public landing page to their dashboard
(function () {
  const path = window.location.pathname;
  const isLandingPage = path.endsWith('index.html') || path === '/' || path.endsWith('/');
  if (isLandingPage) {
    const user = getCurrentUser();
    if (user) {
      if (user.role === 'admin') {
        window.location.replace('admin/admin-dashboard.html');
      } else {
        window.location.replace('dashboard.html');
      }
    }
  }
})();

// ============================================================
// Wishlist / Favorites Helpers (stored in localStorage)
// ============================================================
function getWishlist() {
  try {
    const list = localStorage.getItem('sb_wishlist');
    return list ? JSON.parse(list) : [];
  } catch (_) {
    return [];
  }
}

function toggleWishlist(item) {
  // item: { id, name, price, image_url, type: 'product'|'service', category, provider_name }
  const list = getWishlist();
  const idx = list.findIndex(i => i.id === item.id);
  if (idx > -1) {
    list.splice(idx, 1);
    localStorage.setItem('sb_wishlist', JSON.stringify(list));
    showToast('Removed from favorites', 'info');
    return false;
  } else {
    list.push(item);
    localStorage.setItem('sb_wishlist', JSON.stringify(list));
    showToast('Added to favorites!', 'success');
    return true;
  }
}

function isInWishlist(id) {
  const list = getWishlist();
  return list.some(i => i.id === id);
}
