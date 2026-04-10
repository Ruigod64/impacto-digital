/**
 * animations.js
 * GSAP + ScrollTrigger animations.
 * Gracefully degrades to visible content if GSAP is not loaded or
 * if the user prefers reduced motion.
 */

export function initAnimations() {
  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // GSAP must be loaded via the CDN scripts in index.html
  if (typeof gsap === 'undefined') return;

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ---- Hero entrance (plays on page load) ---- //

  const heroEls = {
    logoWrap:   document.querySelector('.hero__logo-wrap'),
    divider:    document.querySelector('.hero__divider'),
    subheading: document.querySelector('.hero__subheading'),
    actions:    document.querySelector('.hero__actions'),
    scroll:     document.querySelector('.hero__scroll'),
    corners:    document.querySelectorAll('.hero__corner'),
  };

  if (heroEls.logoWrap) {
    // Set initial hidden state
    gsap.set(heroEls.logoWrap,   { opacity: 0, y: 40, scale: 0.96 });
    gsap.set(heroEls.divider,    { opacity: 0, scaleX: 0 });
    gsap.set(heroEls.subheading, { opacity: 0, y: 22 });
    gsap.set(heroEls.actions,    { opacity: 0, y: 18 });
    if (heroEls.scroll)   gsap.set(heroEls.scroll,   { opacity: 0 });
    if (heroEls.corners.length) gsap.set(heroEls.corners, { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(heroEls.logoWrap,   { opacity: 1, y: 0, scale: 1, duration: 1.1 },       0.2)
      .to(heroEls.divider,    { opacity: 0.6, scaleX: 1, duration: 0.7, ease: 'power2.out' }, 0.9)
      .to(heroEls.subheading, { opacity: 1, y: 0, duration: 0.75 },                 1.1)
      .to(heroEls.actions,    { opacity: 1, y: 0, duration: 0.65 },                 1.35)
      .to(heroEls.scroll,     { opacity: 1, duration: 0.5 },                        1.6)
      .to(heroEls.corners,    { opacity: 0.55, duration: 0.8, stagger: 0.08 },      0.5);
  }

  if (typeof ScrollTrigger === 'undefined') return;

  // ---- Hero shrink on scroll ---- //

  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const heroBg      = heroSection.querySelector('.hero__bg');
    const heroContent  = heroSection.querySelector('.hero__content');
    const heroScroll   = heroSection.querySelector('.hero__scroll');
    const heroCorners  = heroSection.querySelectorAll('.hero__corner');

    const shrinkTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      },
    });

    // Scale + round the hero section as it "shrinks into background"
    shrinkTl.to(heroSection, {
      scale: 0.86,
      borderRadius: '24px',
      ease: 'none',
    }, 0);

    // Background parallax — moves at ~40% scroll speed
    if (heroBg) {
      shrinkTl.to(heroBg, { y: 130, ease: 'none' }, 0);
    }

    // Content fades out and floats up
    if (heroContent) {
      shrinkTl.to(heroContent, { opacity: 0, y: -70, ease: 'none' }, 0);
    }

    // Scroll indicator fades quickly
    if (heroScroll) {
      shrinkTl.to(heroScroll, { opacity: 0, ease: 'none' }, 0);
    }
  }

  // ---- Utility: scroll-reveal factory ---- //

  function reveal(selector, fromVars, triggerEl) {
    const els = gsap.utils.toArray(selector);
    if (!els.length) return;

    gsap.from(els, {
      scrollTrigger: {
        trigger: triggerEl || els[0],
        start: 'top 82%',
        once: true,
      },
      ...fromVars,
    });
  }

  // ---- About section ---- //

  const aboutIntro = document.querySelector('.about__intro');
  if (aboutIntro) {
    gsap.from(aboutIntro, {
      scrollTrigger: { trigger: aboutIntro, start: 'top 84%', once: true },
      opacity: 0,
      y: 38,
      duration: 0.9,
      ease: 'power3.out',
    });
  }

  const aboutCards = gsap.utils.toArray('.about-card');
  if (aboutCards.length) {
    gsap.from(aboutCards, {
      scrollTrigger: { trigger: '.about__grid', start: 'top 82%', once: true },
      opacity: 0,
      y: 45,
      duration: 0.75,
      stagger: 0.15,
      ease: 'power3.out',
    });
  }

  // ---- Section headers ---- //

  document.querySelectorAll('.section__header').forEach((header) => {
    gsap.from(header, {
      scrollTrigger: { trigger: header, start: 'top 84%', once: true },
      opacity: 0,
      y: 38,
      duration: 0.9,
      ease: 'power3.out',
    });
  });

  // ---- Service cards (stagger) ---- //

  const serviceGrid = document.querySelector('.services__grid');
  if (serviceGrid) {
    gsap.from('.service-card', {
      scrollTrigger: { trigger: serviceGrid, start: 'top 82%', once: true },
      opacity: 0,
      y: 50,
      duration: 0.72,
      stagger: 0.12,
      ease: 'power3.out',
    });
  }

  // ---- Methodology steps (slide in from left) ---- //

  const stepsEl = document.querySelector('.methodology__steps');
  if (stepsEl) {
    gsap.from('.methodology__step', {
      scrollTrigger: { trigger: stepsEl, start: 'top 82%', once: true },
      opacity: 0,
      x: -28,
      duration: 0.65,
      stagger: 0.1,
      ease: 'power2.out',
    });
  }

  // ---- Why us: two-column slide ---- //

  const whyLayout = document.querySelector('.why-us__layout');
  if (whyLayout) {
    gsap.from('.why-us__visual', {
      scrollTrigger: { trigger: whyLayout, start: 'top 80%', once: true },
      opacity: 0,
      x: -52,
      duration: 0.95,
      ease: 'power3.out',
    });

    gsap.from('.why-us__content', {
      scrollTrigger: { trigger: whyLayout, start: 'top 80%', once: true },
      opacity: 0,
      x: 52,
      duration: 0.95,
      ease: 'power3.out',
    });
  }

  // ---- Team cards (fade in together, no stagger to keep alignment) ---- //

  const teamGrid = document.querySelector('.team__grid');
  if (teamGrid) {
    gsap.from('.team-card', {
      scrollTrigger: { trigger: teamGrid, start: 'top 82%', once: true },
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0,
      ease: 'power3.out',
    });
  }

  // ---- Contact section ---- //

  const contactLayout = document.querySelector('.contact__layout');
  if (contactLayout) {
    gsap.from('.contact__info', {
      scrollTrigger: { trigger: contactLayout, start: 'top 80%', once: true },
      opacity: 0,
      x: -42,
      duration: 0.9,
      ease: 'power3.out',
    });

    gsap.from('.contact-form', {
      scrollTrigger: { trigger: contactLayout, start: 'top 80%', once: true },
      opacity: 0,
      x: 42,
      duration: 0.9,
      ease: 'power3.out',
    });
  }

  // ---- Parallax images — reveal + parallax (excludes .examples__img) ---- //

  gsap.utils.toArray('.parallax-img').forEach((img) => {
    const wrapper = img.parentElement; // .parallax-wrapper
    const section = img.closest('section') || wrapper;
    const isCutout = wrapper.classList.contains('parallax-wrapper--cutout');

    // Fade-in + lift reveal when wrapper enters viewport
    gsap.from(wrapper, {
      scrollTrigger: { trigger: wrapper, start: 'top 88%', once: true },
      opacity: 0,
      y: isCutout ? 50 : 40,
      duration: isCutout ? 1.2 : 1.0,
      ease: 'power3.out',
    });

    if (isCutout) {
      // PNG cutouts: subtle float, no scale (figure must stay visible)
      gsap.fromTo(img,
        { y: '0%' },
        {
          y: '-6%',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
          },
        }
      );
    } else {
      // Regular images: full parallax with scale buffer
      gsap.fromTo(img,
        { y: '-8%', scale: 1.25 },
        {
          y: '8%',
          scale: 1.25,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        }
      );
    }
  });
}
