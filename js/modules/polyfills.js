/**
 * polyfills.js
 * Feature detection flags and browser polyfills.
 * Runs early in the module graph (imported first in main.js).
 */

// ---- Feature flags on <html> ---- //

const html = document.documentElement;
const supportsCSS = !!(window.CSS && window.CSS.supports);

if (!supportsCSS || !CSS.supports('--t', '0')) {
  html.classList.add('no-css-vars');
}

if (!supportsCSS || !CSS.supports('display', 'grid')) {
  html.classList.add('no-css-grid');
}

if (!('scrollBehavior' in document.documentElement.style)) {
  html.classList.add('no-smooth-scroll');
}

if (!('IntersectionObserver' in window)) {
  html.classList.add('no-intersection-observer');
}

// ---- Polyfill: smooth scroll for non-supporting browsers ---- //

if (!('scrollBehavior' in document.documentElement.style)) {
  document.addEventListener('click', function (e) {
    let target = e.target;

    while (target && target !== document) {
      const href = target.getAttribute && target.getAttribute('href');
      if (target.tagName === 'A' && href && href.charAt(0) === '#') {
        const dest = document.querySelector(href);
        if (dest) {
          e.preventDefault();
          smoothScrollTo(dest.getBoundingClientRect().top + window.pageYOffset - 80, 600);
        }
        break;
      }
      target = target.parentNode;
    }
  });
}

function smoothScrollTo(endY, duration) {
  const startY    = window.pageYOffset;
  const distance  = endY - startY;
  let   startTime = null;

  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    window.scrollTo(0, easeInOutQuad(elapsed, startY, distance, duration));
    if (elapsed < duration) {
      requestAnimationFrame(step);
    } else {
      window.scrollTo(0, endY);
    }
  }

  requestAnimationFrame(step);
}

// ---- Polyfill: Element.closest ---- //

if (!Element.prototype.closest) {
  Element.prototype.closest = function (selector) {
    let el = this;
    while (el && el.nodeType === 1) {
      if ((el.matches || el.msMatchesSelector || el.webkitMatchesSelector).call(el, selector)) {
        return el;
      }
      el = el.parentElement || el.parentNode;
    }
    return null;
  };
}

// ---- Polyfill: Element.matches ---- //

if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

// ---- Polyfill: NodeList.forEach ---- //

if (typeof NodeList !== 'undefined' && NodeList.prototype && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

// ---- localStorage availability (exposed globally for other modules) ---- //

window.__storageAvailable = false;
try {
  const key = '__id_test__';
  localStorage.setItem(key, '1');
  localStorage.removeItem(key);
  window.__storageAvailable = true;
} catch (_) {
  // private mode or blocked
}

// ---- requestAnimationFrame polyfill ---- //

(function () {
  let lastTime = 0;
  const vendors = ['ms', 'moz', 'webkit', 'o'];

  for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame  =
      window[vendors[x] + 'CancelAnimationFrame'] ||
      window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      const currTime  = Date.now();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = setTimeout(() => callback(currTime + timeToCall), timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) { clearTimeout(id); };
  }
})();
