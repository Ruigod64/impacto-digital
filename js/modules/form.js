/**
 * form.js
 * Contact form: client-side validation, lead capture, and WhatsApp redirect.
 *
 * Flow:
 *  1. Validate all required fields.
 *  2. POST the lead to the backend (fire-and-forget with timeout).
 *  3. Open WhatsApp regardless of backend response so no conversion is lost.
 *
 * To connect the backend set LEADS_API_URL to your deployed backend URL, e.g.:
 *   const LEADS_API_URL = 'https://tu-backend.railway.app/leads';
 */

const LEADS_API_URL = ''; // <- paste your backend URL here when you deploy

// ---------------------------------------------------------------------------

export function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successEl = document.getElementById('formSuccess');

  // ---- Field definitions ---- //

  const fields = {
    firstName: {
      el:       form.querySelector('#firstName'),
      errEl:    form.querySelector('#firstNameError'),
      validate: (v) =>
        v.trim().length >= 2
          ? null
          : 'Por favor ingresa tu nombre (mínimo 2 caracteres).',
    },
    lastName: {
      el:       form.querySelector('#lastName'),
      errEl:    form.querySelector('#lastNameError'),
      validate: (v) =>
        v.trim().length >= 2
          ? null
          : 'Por favor ingresa tu apellido (mínimo 2 caracteres).',
    },
    email: {
      el:       form.querySelector('#email'),
      errEl:    form.querySelector('#emailError'),
      validate: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
          ? null
          : 'Por favor ingresa un correo electrónico válido.',
    },
    phone: {
      el:       form.querySelector('#phone'),
      errEl:    form.querySelector('#phoneError'),
      validate: (v) =>
        /^[\d\s\+\-\(\)]{7,20}$/.test(v.trim())
          ? null
          : 'Por favor ingresa un número de teléfono válido.',
    },
  };

  // ---- Validate a single field ---- //

  function validateField(key) {
    const { el, errEl, validate } = fields[key];
    if (!el || !errEl) return true;

    const error = validate(el.value);
    errEl.textContent = error || '';
    el.classList.toggle('is-error', Boolean(error));
    el.setAttribute('aria-invalid', Boolean(error).toString());
    return !error;
  }

  // ---- Real-time feedback (on blur + on input after first error) ---- //

  Object.keys(fields).forEach((key) => {
    const { el } = fields[key];
    if (!el) return;

    el.addEventListener('blur',  () => validateField(key));
    el.addEventListener('input', () => {
      if (el.classList.contains('is-error')) validateField(key);
    });
  });

  // ---- Submit handler ---- //

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const allValid = Object.keys(fields)
      .map((key) => validateField(key))
      .every(Boolean);

    if (!allValid) {
      const firstInvalid = form.querySelector('.is-error');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // ---- Collect values ---- //

    const firstName  = form.querySelector('#firstName')?.value.trim()  ?? '';
    const lastName   = form.querySelector('#lastName')?.value.trim()   ?? '';
    const email      = form.querySelector('#email')?.value.trim()      ?? '';
    const phone      = form.querySelector('#phone')?.value.trim()      ?? '';
    const serviceEl  = form.querySelector('#service');
    const details    = form.querySelector('#details')?.value.trim()    ?? '';
    const serviceText = serviceEl?.options[serviceEl.selectedIndex]?.text ?? '';
    const serviceValue = serviceEl?.value ?? '';

    // ---- Save lead to backend (best-effort, does NOT block WhatsApp) ---- //

    if (LEADS_API_URL) {
      _saveLead({ firstName, lastName, email, phone, service: serviceValue, details });
    }

    // ---- Build WhatsApp message ---- //

    const serviceLine = serviceText && serviceText !== 'Selecciona un servicio'
      ? `*Servicio:* ${serviceText}\n`
      : '';
    const detailsLine = details ? `*Detalles:* ${details}\n` : '';

    const message =
      `Hola, Impacto Digital 👋\n\n` +
      `*Nombre:* ${firstName} ${lastName}\n` +
      `*Teléfono:* ${phone}\n` +
      `*Correo:* ${email}\n` +
      serviceLine +
      detailsLine;

    const waURL = `https://wa.me/523310067968?text=${encodeURIComponent(message)}`;

    window.open(waURL, '_blank', 'noopener,noreferrer');

    _showSuccess();
    form.reset();
    Object.keys(fields).forEach((key) => {
      const { el } = fields[key];
      if (el) el.setAttribute('aria-invalid', 'false');
    });

    setTimeout(_hideSuccess, 7000);
  });

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * POST lead data to the backend.
   * Uses a 5 s timeout. Failures are silently ignored so the user flow
   * (WhatsApp redirect) is never blocked by a backend issue.
   */
  async function _saveLead(data) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    try {
      await fetch(LEADS_API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name:  data.lastName,
          email:      data.email,
          phone:      data.phone,
          service:    data.service,
          details:    data.details,
        }),
        signal: controller.signal,
      });
    } catch {
      // Backend unreachable — WhatsApp still opens, no conversion lost.
    } finally {
      clearTimeout(timer);
    }
  }

  function _showSuccess() {
    if (!successEl) return;
    successEl.removeAttribute('hidden');
    successEl.setAttribute('aria-live', 'polite');
    successEl.focus();
  }

  function _hideSuccess() {
    if (!successEl) return;
    successEl.setAttribute('hidden', '');
  }
}
