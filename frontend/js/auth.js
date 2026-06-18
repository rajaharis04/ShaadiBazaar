// ============================================================
// AUTH JS — Shared auth utilities (logout, navbar guard)
// The main login/signup/admin logic is in auth.html inline script
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Logout button anywhere in the site
  document.getElementById('nav-logout-btn')?.addEventListener('click', logout);
});

// ============================================================
// LOGOUT
// ============================================================
async function logout() {
  try {
    await apiCall('/auth/logout', { method: 'POST' });
  } catch (_) {}

  localStorage.removeItem('sb_token');
  localStorage.removeItem('sb_user');
  showToast('Logged out successfully', 'info');
  setTimeout(() => { window.location.href = 'index.html'; }, 600);
}
