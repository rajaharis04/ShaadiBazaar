// ============================================================
// CART JS — Display Cart, Update Quantities, Remove Items
// ============================================================

let cartItems  = [];
let promoCode  = '';
let promoDiscount = 0;

const DELIVERY_THRESHOLD = 10000; // Free delivery above this
const DELIVERY_CHARGE    = 250;
const PROMO_CODES = { 'SHAADI10': 10, 'WEDDING20': 20, 'BARAT15': 15 }; // code: % off

document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  if (page === 'cart') await initCartPage();
});

async function initCartPage() {
  const user = requireAuth();
  if (!user) return;

  await loadCart(user.id);

  document.getElementById('apply-promo-btn')?.addEventListener('click', applyPromoCode);
  document.getElementById('clear-cart-btn')?.addEventListener('click', clearCart);
}

async function loadCart(userId) {
  const container = document.getElementById('cart-items-container');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await apiCall('/cart');
    cartItems = data.cart || [];
    renderCart();
  } catch (err) {
    const loadingEl = document.getElementById('cart-loading');
    if (loadingEl) loadingEl.style.display = 'none';
    container.innerHTML = '<p class="text-muted text-center">Failed to load cart</p>';
  }
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const emptyEl   = document.getElementById('cart-empty');
  const cartEl    = document.getElementById('cart-content');
  const loadingEl = document.getElementById('cart-loading');

  if (loadingEl) loadingEl.style.display = 'none';

  if (cartItems.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (cartEl)  cartEl.style.display  = 'none';
    updateSummary();
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (cartEl)  cartEl.style.display  = 'block';

  if (!container) return;

  container.innerHTML = cartItems.map(item => {
    const p = item.products;
    return `
      <div class="cart-item" data-cart-id="${item.id}" data-product-id="${p.id}">
        <div class="cart-item-product">
          <img src="${p.image_url || 'https://via.placeholder.com/70'}" alt="${p.name}" class="cart-item-img">
          <div class="cart-item-details">
            <h4><a href="product-detail.html?id=${p.id}">${p.name}</a></h4>
            <div class="cart-item-category">${getCategoryLabel(p.category)}</div>
          </div>
        </div>
        <div class="cart-item-price">${formatPrice(p.price)}</div>
        <div class="cart-qty-control">
          <button class="cart-qty-btn qty-minus" onclick="updateQty('${item.id}', ${item.quantity - 1})">−</button>
          <span class="cart-qty-num">${item.quantity}</span>
          <button class="cart-qty-btn qty-plus" onclick="updateQty('${item.id}', ${item.quantity + 1})">+</button>
        </div>
        <div class="cart-item-total">${formatPrice(p.price * item.quantity)}</div>
        <button class="cart-remove-btn" onclick="removeFromCart('${item.id}')" title="Remove">✕</button>
      </div>`;
  }).join('');

  updateSummary();
  updateCartBadge();
}

function updateSummary() {
  const subtotal  = cartItems.reduce((sum, item) => sum + (item.products?.price * item.quantity), 0);
  const delivery  = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const discountAmt = subtotal * (promoDiscount / 100);
  const total     = subtotal - discountAmt + delivery;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('summary-subtotal',  formatPrice(subtotal));
  set('summary-delivery',  delivery === 0 ? 'FREE' : formatPrice(delivery));
  set('summary-discount',  promoDiscount > 0 ? `-${formatPrice(discountAmt)}` : 'Rs. 0');
  set('summary-items',     `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}`);
  set('summary-total',     formatPrice(total));

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.href = cartItems.length > 0 ? 'checkout.html' : '#';
    checkoutBtn.style.opacity = cartItems.length > 0 ? '1' : '0.5';
  }

  const deliveryEl = document.getElementById('summary-delivery');
  if (deliveryEl) deliveryEl.classList.toggle('free', delivery === 0);
}

async function updateQty(cartId, newQty) {
  if (newQty < 1) { removeFromCart(cartId); return; }

  try {
    await apiCall(`/cart/${cartId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: newQty })
    });
    const item = cartItems.find(i => i.id === cartId);
    if (item) item.quantity = newQty;
    renderCart();
  } catch (err) {
    showToast('Failed to update quantity', 'error');
  }
}

async function removeFromCart(cartId) {
  try {
    await apiCall(`/cart/${cartId}`, {
      method: 'DELETE'
    });
    cartItems = cartItems.filter(i => i.id !== cartId);
    renderCart();
    showToast('Item removed from cart', 'info');
  } catch (err) {
    showToast('Failed to remove item', 'error');
  }
}

async function clearCart() {
  const user = getCurrentUser();
  if (!user || !confirm('Clear entire cart?')) return;

  try {
    await apiCall('/cart', {
      method: 'DELETE'
    });
    cartItems = [];
    renderCart();
    showToast('Cart cleared', 'info');
  } catch (err) {
    showToast('Failed to clear cart', 'error');
  }
}

function applyPromoCode() {
  const input = document.getElementById('promo-input')?.value.trim().toUpperCase();
  const resultEl = document.getElementById('promo-result');

  if (PROMO_CODES[input] !== undefined) {
    promoCode     = input;
    promoDiscount = PROMO_CODES[input];
    if (resultEl) {
      resultEl.innerHTML = `<span class="promo-success">Promo applied: ${promoDiscount}% off!</span>`;
    }
    updateSummary();
    showToast(`Promo code applied! ${promoDiscount}% discount`, 'success');
  } else {
    if (resultEl) resultEl.innerHTML = '<span style="color:var(--danger);font-size:0.8rem;">Invalid promo code</span>';
    showToast('Invalid promo code', 'error');
  }
}

// Export cart data for checkout
window.getCartForCheckout = () => ({
  items: cartItems.map(i => ({
    product_id: i.product_id,
    quantity:   i.quantity,
    price:      i.products?.price,
    name:       i.products?.name
  })),
  subtotal:  cartItems.reduce((s, i) => s + (i.products?.price * i.quantity), 0),
  promoCode, promoDiscount
});
