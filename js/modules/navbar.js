/**
 * navbar.js
 * Handles:
 *   - Scroll-aware navbar (is-scrolled class)
 *   - Hamburger ↔ X toggle with GSAP animations
 *   - Full-screen mobile menu with GSAP (stagger items)
 *   - Focus trap inside the mobile menu
 *   - Active nav-link highlighting on scroll (IntersectionObserver)
 *   - Close menu on Escape or any link click
 */

export function initNavbar() {
  const navbar     = document.querySelector('.navbar');
  const hamburger  = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!navbar || !hamburger || !mobileMenu) return;

  // ---- Scroll state ---- //

  const handleScroll = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ---- Logo → scroll to top ---- //
  // The hero uses position:sticky, so the browser thinks #inicio is already
  // visible and skips the scroll. We intercept and force scrollTo(0,0).

  document.querySelectorAll('a[href="#inicio"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // ---- Element refs for animation ---- //

  const lines      = hamburger.querySelectorAll('.hamburger__line');
  const menuItems  = Array.from(mobileMenu.querySelectorAll('.mobile-menu__item'));
  const menuFooter = mobileMenu.querySelector('.mobile-menu__footer');

  // ---- GSAP helpers ---- //

  // GSAP is loaded with `defer`, so it's available by the time
  // the user taps the hamburger (well after DOMContentLoaded).
  const g = () => (typeof gsap !== 'undefined' ? gsap : null);

  // ---- State ---- //

  let isOpen      = false;
  let isAnimating = false;

  // ---- CSS-only fallback (no GSAP) ---- //

  function cssOpen() {
    mobileMenu.classList.add('is-open');
    mobileMenu.removeAttribute('aria-hidden');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden';
    isAnimating = false;
  }

  function cssClose() {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
    isAnimating = false;
  }

  // ---- GSAP open ---- //

  function gsapOpen(anim) {
    const tl = anim.timeline({ defaults: { ease: 'power3.out' } });

    // Reveal overlay
    anim.set(mobileMenu, {
      visibility: 'visible',
      pointerEvents: 'auto',
      opacity: 0,
      y: -24,
    });

    tl.to(mobileMenu, { opacity: 1, y: 0, duration: 0.42 });

    // Stagger nav items
    if (menuItems.length) {
      anim.set(menuItems, { opacity: 0, y: 28 });
      tl.to(
        menuItems,
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07 },
        0.18
      );
    }

    // Footer fade-in
    if (menuFooter) {
      anim.set(menuFooter, { opacity: 0, y: 16 });
      tl.to(menuFooter, { opacity: 1, y: 0, duration: 0.38 }, 0.44);
    }

    // Hamburger → X
    tl.to(lines[0], { y: 8, rotation: 45, duration: 0.32, ease: 'power2.inOut' }, 0);
    tl.to(lines[1], { opacity: 0, scaleX: 0, duration: 0.18, ease: 'power2.in' }, 0);
    tl.to(lines[2], { y: -8, rotation: -45, duration: 0.32, ease: 'power2.inOut' }, 0);

    tl.eventCallback('onComplete', () => { isAnimating = false; });

    return tl;
  }

  // ---- GSAP close ---- //

  function gsapClose(anim) {
    const tl = anim.timeline({ defaults: { ease: 'power3.in' } });

    // X → Hamburger
    tl.to(lines[0], { y: 0, rotation: 0, duration: 0.28, ease: 'power2.inOut' }, 0);
    tl.to(lines[1], { opacity: 1, scaleX: 1, duration: 0.24, ease: 'power2.out' }, 0.08);
    tl.to(lines[2], { y: 0, rotation: 0, duration: 0.28, ease: 'power2.inOut' }, 0);

    // Fade overlay out
    tl.to(mobileMenu, { opacity: 0, y: -16, duration: 0.32 }, 0.04);

    tl.eventCallback('onComplete', () => {
      anim.set(mobileMenu, {
        visibility: 'hidden',
        pointerEvents: 'none',
        y: 0,
      });
      mobileMenu.setAttribute('aria-hidden', 'true');
      isAnimating = false;
    });

    return tl;
  }

  // ---- Public open / close ---- //

  function openMenu() {
    if (isAnimating || isOpen) return;
    isOpen = true;
    isAnimating = true;

    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden';

    const anim = g();
    if (anim) {
      // Remove residual CSS class so GSAP is sole source of truth
      mobileMenu.classList.remove('is-open');
      gsapOpen(anim);
    } else {
      cssOpen();
    }

    // Move focus
    const firstFocusable = _getFocusable(mobileMenu)[0];
    if (firstFocusable) requestAnimationFrame(() => firstFocusable.focus());
  }

  function closeMenu() {
    if (isAnimating || !isOpen) return;
    isOpen = false;
    isAnimating = true;

    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';

    const anim = g();
    if (anim) {
      mobileMenu.classList.remove('is-open');
      gsapClose(anim);
    } else {
      cssClose();
    }
  }

  // ---- Event listeners ---- //

  hamburger.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  // Close on ALL anchors inside the menu (nav links + CTA button)
  mobileMenu.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', () => {
      // Small delay so the browser has time to start the scroll
      // before overflow is restored and the menu fades out.
      setTimeout(closeMenu, 80);
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
      hamburger.focus();
    }
  });

  // ---- Focus trap ---- //

  mobileMenu.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    const focusable = _getFocusable(mobileMenu);
    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });

  // ---- Active link via IntersectionObserver ---- //

  if ('IntersectionObserver' in window) {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.navbar__link:not(.navbar__link--cta)');

    if (sections.length && navLinks.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
              link.classList.toggle(
                'is-active',
                link.getAttribute('href') === `#${entry.target.id}`
              );
            });
          });
        },
        { rootMargin: '-35% 0px -55% 0px' }
      );
      sections.forEach((section) => observer.observe(section));
    }
  }
}

// ---- Helper ---- //

function _getFocusable(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href]:not([tabindex="-1"]), button:not([disabled]), input:not([disabled]), [tabindex="0"]'
    )
  );
}
