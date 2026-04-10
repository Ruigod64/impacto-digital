/**
 * theme.js
 * Dark / light mode toggle.
 * Note: the page always starts in dark mode (set inline in <head>).
 * The toggle works for the current session only.
 */

export function initTheme() {
  const html      = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');

  if (!toggleBtn) return;

  // Theme is already set to 'dark' by the inline script in <head>.
  // Sync aria-label to the current state.
  _updateLabel(toggleBtn, html.getAttribute('data-theme') || 'dark');

  toggleBtn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    _updateLabel(toggleBtn, next);
  });
}

function _updateLabel(btn, theme) {
  btn.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
  );
}
