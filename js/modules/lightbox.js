/**
 * lightbox.js
 * Minimal lightbox for .examples__img images.
 * - Click image → opens lightbox
 * - Click backdrop / × button / Escape → closes
 * - Arrow keys / prev–next buttons → navigate between images in the same group
 * - No dependencies.
 */

export function initLightbox() {
  const images = Array.from(document.querySelectorAll('.examples__img'));
  if (!images.length) return;

  // ---- Mark images as interactive ---- //

  images.forEach((img) => {
    img.closest('.examples__item')?.setAttribute('role', 'button');
    img.closest('.examples__item')?.setAttribute('tabindex', '0');
    img.closest('.examples__item')?.setAttribute('aria-label', `Ver imagen: ${img.alt}`);
  });

  // ---- Build lightbox DOM (once) ---- //

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Vista ampliada');
  overlay.setAttribute('aria-hidden', 'true');

  overlay.innerHTML = `
    <div class="lightbox__backdrop"></div>
    <div class="lightbox__stage">
      <button class="lightbox__btn lightbox__btn--prev" aria-label="Imagen anterior">&#8592;</button>
      <figure class="lightbox__figure">
        <img class="lightbox__img" src="" alt="" />
      </figure>
      <button class="lightbox__btn lightbox__btn--next" aria-label="Imagen siguiente">&#8594;</button>
    </div>
    <button class="lightbox__close" aria-label="Cerrar">&times;</button>
  `;

  document.body.appendChild(overlay);

  const lbImg      = overlay.querySelector('.lightbox__img');
  const btnClose   = overlay.querySelector('.lightbox__close');
  const btnPrev    = overlay.querySelector('.lightbox__btn--prev');
  const btnNext    = overlay.querySelector('.lightbox__btn--next');
  const backdrop   = overlay.querySelector('.lightbox__backdrop');

  let currentIndex = 0;
  let previousFocus = null;

  // ---- Open / close ---- //

  function open(index) {
    currentIndex = index;
    previousFocus = document.activeElement;

    _update();
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('lightbox--open');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => btnClose.focus());
  }

  function close() {
    overlay.classList.remove('lightbox--open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    overlay.addEventListener('transitionend', () => {
      lbImg.src = '';
    }, { once: true });

    previousFocus?.focus();
  }

  function _update() {
    const img = images[currentIndex];
    lbImg.src = img.src;
    lbImg.alt = img.alt;

    btnPrev.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
    btnNext.style.visibility = currentIndex < images.length - 1 ? 'visible' : 'hidden';
  }

  // ---- Event listeners ---- //

  images.forEach((img, i) => {
    const item = img.closest('.examples__item');

    item?.addEventListener('click', () => open(i));
    item?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  btnClose.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  btnPrev.addEventListener('click', () => {
    if (currentIndex > 0) { currentIndex--; _update(); }
  });

  btnNext.addEventListener('click', () => {
    if (currentIndex < images.length - 1) { currentIndex++; _update(); }
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('lightbox--open')) return;

    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft'  && currentIndex > 0)               { currentIndex--; _update(); }
    if (e.key === 'ArrowRight' && currentIndex < images.length - 1) { currentIndex++; _update(); }
  });
}
