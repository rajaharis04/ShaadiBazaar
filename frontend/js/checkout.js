// ============================================================
// CHECKOUT JS — Order Placement, Mock Payment
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  if (page !== 'checkout') return;

  const user = requireAuth();
  if (!user) return;

  await loadCheckoutSummary(user);
  initPaymentMethods();
  initAddressForm(user);

  document.getElementById('place-order-btn')?.addEventListener('click', placeOrder);
});

async function loadCheckoutSummary(user) {
  try {
    const data = await apiCall('/cart');
    const items = data.cart || [];

    if (items.length === 0) {
      showToast('Your cart is empty!', 'warning');
      window.location.href = 'cart.html';
      return;
    }

    const subtotal  = items.reduce((s, i) => s + (i.products.price * i.quantity), 0);
    const delivery  = subtotal >= 10000 ? 0 : 250;
    const total     = subtotal + delivery;

    // Render order items
    const orderItemsList = document.getElementById('checkout-items-list');
    if (orderItemsList) {
      orderItemsList.innerHTML = items.map(item => `
        <div class="checkout-item flex gap-2 mb-2">
          <img src="${item.products.image_url || 'https://via.placeholder.com/50'}" 
               style="width:50px;height:50px;object-fit:cover;border-radius:8px;">
          <div style="flex:1">
            <div style="font-size:0.875rem;font-weight:600;color:var(--maroon-dark)">${item.products.name}</div>
            <div style="font-size:0.8rem;color:var(--gray-500)">Qty: ${item.quantity}</div>
          </div>
          <div style="font-weight:700;color:var(--maroon)">${formatPrice(item.products.price * item.quantity)}</div>
        </div>`).join('');
    }

    // Store cart items for order placement
    window._checkoutCart = {
      items: items.map(i => ({
        product_id: i.product_id,
        quantity:   i.quantity,
        price:      i.products.price
      })),
      total_amount: total,
      subtotal,
      delivery
    };

    // Update summary numbers
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('co-subtotal',  formatPrice(subtotal));
    set('co-delivery',  delivery === 0 ? 'FREE' : formatPrice(delivery));
    set('co-total',     formatPrice(total));
    set('co-items-count', items.length);
  } catch (err) {
    showToast('Failed to load order summary', 'error');
    console.error(err);
  }
}

function initPaymentMethods() {
  const paymentOptions = document.querySelectorAll('.payment-option');
  paymentOptions.forEach(opt => {
    const radio = opt.querySelector('input[type="radio"]');
    opt.addEventListener('click', () => {
      paymentOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      radio.checked = true;
      updatePaymentForm(radio.value);
    });
  });
}

function updatePaymentForm(method) {
  const jazzForm     = document.getElementById('jazzcash-form');
  const easypaisaForm = document.getElementById('easypaisa-form');
  const codMsg       = document.getElementById('cod-message');

  [jazzForm, easypaisaForm, codMsg].forEach(el => el?.classList.add('hidden'));

  if (method === 'jazzcash' && jazzForm)       jazzForm.classList.remove('hidden');
  if (method === 'easypaisa' && easypaisaForm) easypaisaForm.classList.remove('hidden');
  if (method === 'cod' && codMsg)              codMsg.classList.remove('hidden');
}

function initAddressForm(user) {
  // Pre-fill city if known
  const citySelect = document.getElementById('address-city');
  if (citySelect && user.city) citySelect.value = user.city;
}

async function placeOrder() {
  const cart = window._checkoutCart;
  if (!cart) return;

  const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
  const address       = document.getElementById('address-street')?.value?.trim();
  const city          = document.getElementById('address-city')?.value;
  const name          = document.getElementById('address-name')?.value?.trim();
  const phone         = document.getElementById('address-phone')?.value?.trim();

  // Validate
  if (!address || !city || !name || !phone) {
    showToast('Please fill in all delivery details', 'warning');
    return;
  }
  if (!paymentMethod) {
    showToast('Please select a payment method', 'warning');
    return;
  }

  const btn = document.getElementById('place-order-btn');
  const originalText = btn?.innerHTML;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Placing Order...';
  }

  try {
    const data = await apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items:          cart.items,
        total_amount:   cart.total_amount,
        payment_method: paymentMethod,
        address,
        city
      })
    });

    // Show success state
    document.getElementById('checkout-form-section')?.classList.add('hidden');
    const successEl = document.getElementById('order-success');
    if (successEl) {
      successEl.classList.remove('hidden');
      document.getElementById('success-order-id').textContent = data.order.id.slice(0, 8).toUpperCase();
    }

    showToast('Order placed successfully!', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to place order', 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
  }
}
