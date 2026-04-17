/**
 * FORM.JS — Validation & soumission du formulaire de contact
 * Sofra — Restaurant Kebab Boulogne-Billancourt
 */

'use strict';

/* ====================================================
   RÈGLES DE VALIDATION
   ==================================================== */

const VALIDATION_RULES = {
  nom: {
    required: true,
    minLength: 2,
    maxLength: 80,
    pattern: /^[a-zA-ZÀ-ÿ\s'\-]+$/,
    messages: {
      required: 'Votre nom est requis.',
      minLength: 'Le nom doit contenir au moins 2 caractères.',
      maxLength: 'Le nom ne peut pas dépasser 80 caractères.',
      pattern: 'Le nom ne peut contenir que des lettres et espaces.'
    }
  },
  telephone: {
    required: true,
    pattern: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.\-]*\d{2}){4}$/,
    messages: {
      required: 'Votre numéro de téléphone est requis.',
      pattern: 'Veuillez entrer un numéro de téléphone français valide (ex: 06 12 34 56 78).'
    }
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      pattern: 'Veuillez entrer une adresse e-mail valide.'
    }
  },
  date: {
    required: false,
    futureDate: true,
    messages: {
      futureDate: 'La date souhaitée doit être dans le futur.'
    }
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 1000,
    messages: {
      required: 'Votre message est requis.',
      minLength: 'Votre message doit contenir au moins 10 caractères.',
      maxLength: 'Votre message ne peut pas dépasser 1000 caractères.'
    }
  }
};

/* ====================================================
   UTILITAIRES
   ==================================================== */

/**
 * Valide un champ selon ses règles
 * @param {string} name - nom du champ
 * @param {string} value - valeur du champ
 * @returns {string|null} message d'erreur ou null si valide
 */
function validateField(name, value) {
  const rules = VALIDATION_RULES[name];
  if (!rules) return null;

  const trimmed = value.trim();

  // Required
  if (rules.required && !trimmed) {
    return rules.messages.required;
  }

  // Si vide et non required → ok
  if (!trimmed) return null;

  // MinLength
  if (rules.minLength && trimmed.length < rules.minLength) {
    return rules.messages.minLength;
  }

  // MaxLength
  if (rules.maxLength && trimmed.length > rules.maxLength) {
    return rules.messages.maxLength;
  }

  // Pattern
  if (rules.pattern && !rules.pattern.test(trimmed)) {
    return rules.messages.pattern;
  }

  // Date future
  if (rules.futureDate && trimmed) {
    const selectedDate = new Date(trimmed);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return rules.messages.futureDate;
    }
  }

  return null;
}

/**
 * Affiche ou cache l'erreur d'un champ
 */
function setFieldState(group, errorMsg) {
  const errorEl = group.querySelector('.form-error-msg');

  if (errorMsg) {
    group.classList.add('has-error');
    group.querySelector('.form-control')?.classList.add('is-error');
    group.querySelector('.form-control')?.classList.remove('is-success');
    if (errorEl) errorEl.textContent = errorMsg;
  } else {
    group.classList.remove('has-error');
    const control = group.querySelector('.form-control');
    if (control && control.value.trim()) {
      control.classList.remove('is-error');
      control.classList.add('is-success');
    }
    if (errorEl) errorEl.textContent = '';
  }
}

/* ====================================================
   INITIALISATION DU FORMULAIRE
   ==================================================== */

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('[type="submit"]');
  const successMsg = document.querySelector('.form-success');

  // ---- Validation en temps réel (blur) ----
  const fields = form.querySelectorAll('.form-control[name]');
  fields.forEach(field => {
    field.addEventListener('blur', () => {
      const group = field.closest('.form-group');
      const error = validateField(field.name, field.value);
      setFieldState(group, error);
    });

    // Nettoyer l'erreur pendant la saisie
    field.addEventListener('input', () => {
      const group = field.closest('.form-group');
      if (group.classList.contains('has-error')) {
        const error = validateField(field.name, field.value);
        setFieldState(group, error);
      }
    });
  });

  // ---- Date minimum = aujourd'hui ----
  const dateInput = form.querySelector('input[name="date"]');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // ---- Soumission ----
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isFormValid = true;

    // Valider tous les champs
    fields.forEach(field => {
      const group = field.closest('.form-group');
      const error = validateField(field.name, field.value);
      setFieldState(group, error);
      if (error) isFormValid = false;
    });

    if (!isFormValid) {
      // Focus sur le premier champ en erreur
      const firstError = form.querySelector('.has-error .form-control');
      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Simulation envoi
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Envoi en cours…</span> ⏳';
    submitBtn.style.opacity = '0.7';

    setTimeout(() => {
      // Succès simulé
      form.style.display = 'none';
      if (successMsg) {
        successMsg.classList.add('is-visible');
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 1500);
  });
}

/* ====================================================
   COMPTEUR DE CARACTÈRES (textarea)
   ==================================================== */

function initCharCounters() {
  const textareas = document.querySelectorAll('textarea[maxlength], textarea[name="message"]');
  textareas.forEach(ta => {
    const max = parseInt(ta.getAttribute('maxlength') || VALIDATION_RULES.message?.maxLength || 1000);

    // Créer le compteur
    const counter = document.createElement('div');
    counter.className = 'form-char-counter';
    counter.style.cssText = 'font-size:0.75rem;color:var(--color-text-light);text-align:right;margin-top:4px;';
    counter.textContent = `0 / ${max}`;

    ta.parentNode.insertBefore(counter, ta.nextSibling);

    ta.addEventListener('input', () => {
      const len = ta.value.length;
      counter.textContent = `${len} / ${max}`;
      counter.style.color = len > max * 0.9
        ? 'var(--color-error)'
        : 'var(--color-text-light)';
    });
  });
}

/* ====================================================
   INIT AU CHARGEMENT
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initCharCounters();
});
