/**
 * MAIN.JS — Navigation mobile, scroll effects, animations
 * Sofra — Restaurant Kebab Boulogne-Billancourt
 */

'use strict';

/* ====================================================
   1. NAVIGATION MOBILE
   ==================================================== */

const navbarBurger = document.querySelector('.navbar__burger');
const navbarMobileMenu = document.querySelector('.navbar__mobile-menu');
const navbar = document.querySelector('.navbar');
const mobileLinks = document.querySelectorAll('.navbar__mobile-link');

/**
 * Toggle menu mobile
 */
function toggleMobileMenu() {
  const isOpen = navbarMobileMenu.classList.toggle('is-open');
  navbarBurger.classList.toggle('is-open', isOpen);
  navbarBurger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

/**
 * Fermeture menu mobile
 */
function closeMobileMenu() {
  navbarMobileMenu.classList.remove('is-open');
  navbarBurger.classList.remove('is-open');
  navbarBurger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (navbarBurger && navbarMobileMenu) {
  navbarBurger.addEventListener('click', toggleMobileMenu);

  // Fermer en cliquant sur un lien
  mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

  // Fermer avec la touche Échap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}

/* ====================================================
   2. NAVBAR — EFFET SCROLL
   ==================================================== */

/**
 * Ajoute la classe scrollée à la navbar
 */
function handleNavbarScroll() {
  if (!navbar) return;

  // Ne pas appliquer sur pages avec navbar--solid
  if (navbar.classList.contains('navbar--solid')) return;

  if (window.scrollY > 60) {
    navbar.classList.add('navbar--scrolled');
  } else {
    navbar.classList.remove('navbar--scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll(); // Appel initial

/* ====================================================
   3. LIEN ACTIF dans la navbar
   ==================================================== */

(function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar__link, .navbar__mobile-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('navbar__link--active');
    }
  });
})();

/* ====================================================
   4. INTERSECTION OBSERVER — Animations au scroll
   ==================================================== */

const animatedElements = document.querySelectorAll(
  '.feature-card, .dish-card, .specialite-card, .avis-card, .valeur-card, .apropos-intro'
);

if ('IntersectionObserver' in window) {
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Délai progressif pour les cartes enfants d'une grille
        const delay = i * 60;
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });
}

/* ====================================================
   5. TABS MENU (page menu.html)
   ==================================================== */

const menuTabs = document.querySelectorAll('.menu-tab');
const menuSections = document.querySelectorAll('.menu-category-section');

if (menuTabs.length > 0) {
  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;

      // Mise à jour des onglets
      menuTabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      // Affichage de la section correspondante
      menuSections.forEach(section => {
        if (target === 'all' || section.dataset.category === target) {
          section.style.display = 'block';
          // Animation d'entrée
          section.style.opacity = '0';
          section.style.transform = 'translateY(10px)';
          requestAnimationFrame(() => {
            section.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
          });
        } else {
          section.style.display = 'none';
        }
      });
    });
  });
}

/* ====================================================
   6. SMOOTH SCROLL pour les ancres internes
   ==================================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;

    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - navH - 16,
      behavior: 'smooth'
    });
  });
});

/* ====================================================
   7. ANNÉE COURANTE dans le footer
   ==================================================== */

const yearEl = document.getElementById('current-year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* ====================================================
   8. COMPTEUR ANIMÉ (section hero meta)
   ==================================================== */

function animateCounter(el, target, duration = 1500) {
  const start = performance.now();
  const initial = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Easing ease-out
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(initial + (target - initial) * eased) + (el.dataset.suffix || '');

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// Observer pour déclencher les compteurs quand visibles
const counterEls = document.querySelectorAll('[data-counter]');
if (counterEls.length > 0 && 'IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.counter);
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => counterObserver.observe(el));
}
