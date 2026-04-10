/**
 * main.js — ES Module entry point
 * Imports run top-to-bottom: polyfills first, then feature modules.
 */

import './modules/polyfills.js';
import { initTheme }      from './modules/theme.js';
import { initNavbar }     from './modules/navbar.js';
import { initAnimations } from './modules/animations.js';
import { initForm }       from './modules/form.js';
import { initFavicon }    from './modules/favicon.js';
import { initLightbox }   from './modules/lightbox.js';

document.addEventListener('DOMContentLoaded', () => {
  // Remove the preload class (prevents transition flash on theme init)
  document.documentElement.classList.remove('preload');

  initTheme();
  initNavbar();
  initFavicon();
  initForm();
  initLightbox();

  // GSAP is loaded via CDN scripts with defer — wait for window.load
  // so ScrollTrigger has accurate layout measurements.
  if (typeof gsap !== 'undefined') {
    initAnimations();
  } else {
    window.addEventListener('load', initAnimations);
  }

  // Footer: current year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
