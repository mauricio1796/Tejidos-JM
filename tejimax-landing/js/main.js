/**
 * TECHMAX SWEATERS — LOGICA PRINCIPAL
 * main.js
 *
 * Incluye:
 * - Header sticky con efecto scroll
 * - Menu hamburguesa (mobile)
 * - Counter animation (numeros animados)
 * - FAQ Acordeon
 * - Back to top
 * - Mobile CTA sticky
 * - Scroll depth tracking
 * - Particulas del hero (canvas)
 * - Event tracking (GA4 / Meta Pixel / HubSpot)
 * - Swiper (testimonios)
 */

'use strict';

/* ===========================================
   UTILIDADES
   =========================================== */

/**
 * Selector de elemento DOM con fallback seguro
 */
const qs  = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/**
 * Observador de interseccion reutilizable
 */
function createObserver(callback, options = {}) {
  const defaults = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  return new IntersectionObserver(callback, { ...defaults, ...options });
}

/**
 * Debounce para eventos de scroll/resize
 */
function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Tracking de eventos (GA4 + Meta Pixel + HubSpot)
 * Encapsulado para facil activacion/desactivacion
 */
function trackEvent(eventName, params = {}) {
  /* Google Analytics 4 */
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }

  /* Meta Pixel (Facebook / Instagram) */
  if (typeof fbq === 'function') {
    fbq('trackCustom', eventName, params);
  }

  /* HubSpot Analytics */
  if (typeof _hsq !== 'undefined') {
    _hsq.push(['trackCustomBehavioralEvent', {
      name: eventName,
      properties: params
    }]);
  }

  /* Desarrollo: log en consola */
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('[Track]', eventName, params);
  }
}


/* ===========================================
   1. HEADER STICKY
   =========================================== */
function initHeader() {
  const header = qs('#header');
  if (!header) return;

  const scrollThreshold = 80;

  function updateHeader() {
    const scrollY = window.scrollY;
    const isScrolled = scrollY > scrollThreshold;

    header.classList.toggle('scrolled', isScrolled);

    /* Cambiar logo: color → blanco cuando hay fondo */
    const logoColor = qs('.logo-color', header);
    const logoWhite = qs('.logo-white', header);

    if (logoColor && logoWhite) {
      logoColor.style.display = isScrolled ? 'none' : 'block';
      logoWhite.style.display = isScrolled ? 'block' : 'none';
    }
  }

  window.addEventListener('scroll', debounce(updateHeader, 10), { passive: true });
  updateHeader(); /* Estado inicial */
}


/* ===========================================
   2. MENU HAMBURGUESA (MOBILE)
   =========================================== */
function initMobileMenu() {
  const hamburger   = qs('#hamburger');
  const mobileMenu  = qs('#mobile-menu');
  const mobileLinks = qsa('.mobile-menu__link, .mobile-menu__cta');

  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('active');
    mobileMenu.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('active');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  /* Cerrar al hacer clic en cualquier enlace del menu */
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Cerrar con tecla Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
}


/* ===========================================
   3. NAVEGACION: LINK ACTIVO AL SCROLL
   =========================================== */
function initActiveNavLink() {
  const sections  = qsa('section[id], header[id]');
  const navLinks  = qsa('.nav__link');

  if (!sections.length || !navLinks.length) return;

  const observer = createObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(section => observer.observe(section));
}


/* ===========================================
   4. CONTADOR ANIMADO (Counter Animation)
   =========================================== */
function initCounters() {
  const counters = qsa('.counter');
  if (!counters.length) return;

  /**
   * Formatea numeros grandes: 10000 → "10,000"
   */
  function formatNumber(num) {
    return num.toLocaleString('es-CO');
  }

  /**
   * Easing: ease out cubic
   */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Anima un unico contador
   */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const duration = 2000; /* ms */
    let startTime  = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current  = Math.floor(easedProgress * target);

      el.textContent = prefix + formatNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + formatNumber(target) + suffix;
        el.classList.add('done'); /* Efecto pop al terminar */
        trackEvent('counter_completed', { counter: el.dataset.target });
      }
    }

    requestAnimationFrame(step);
  }

  /* Observar cuando los contadores entran en el viewport */
  const observer = createObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target); /* Solo animar una vez */
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(counter => observer.observe(counter));
}


/* ===========================================
   5. FAQ ACORDEON
   =========================================== */
function initFAQ() {
  const faqItems = qsa('[data-faq]');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn    = qs('.faq-item__question', item);
    const answer = qs('.faq-item__answer', item);

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Cerrar todos los otros items */
      faqItems.forEach(otherItem => {
        const otherBtn    = qs('.faq-item__question', otherItem);
        const otherAnswer = qs('.faq-item__answer', otherItem);

        if (otherBtn && otherAnswer && otherItem !== item) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.hidden = true;
          otherItem.classList.remove('active');
        }
      });

      /* Toggle del item actual */
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        answer.hidden = true;
        item.classList.remove('active');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        item.classList.add('active');

        trackEvent('faq_open', { question: btn.querySelector('span')?.textContent });
      }
    });

    /* Soporte de teclado */
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}


/* ===========================================
   6. BACK TO TOP
   =========================================== */
function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;

  function updateVisibility() {
    const isVisible = window.scrollY > 500;
    btn.hidden = !isVisible;
  }

  window.addEventListener('scroll', debounce(updateVisibility, 100), { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  updateVisibility();
}


/* ===========================================
   7. MOBILE CTA STICKY
   =========================================== */
function initMobileCTASticky() {
  /* Solo en mobile */
  if (window.innerWidth > 768) return;

  /* Crear el elemento si no existe */
  let stickyEl = qs('.mobile-cta-sticky');
  if (!stickyEl) {
    stickyEl = document.createElement('div');
    stickyEl.className = 'mobile-cta-sticky';
    stickyEl.innerHTML = `
      <a
        href="https://wa.me/573058366886?text=Hola%20Teji%20Max,%20quiero%20cotizar%20sweaters%20personalizados"
        class="btn btn--amarillo"
        target="_blank"
        rel="noopener noreferrer"
        data-track="whatsapp_click"
        aria-label="Cotizar por WhatsApp"
      >
        <i class="fab fa-whatsapp" aria-hidden="true"></i>
        WhatsApp
      </a>
      <a
        href="#cotizacion"
        class="btn btn--outline"
        style="border-color: rgba(255,255,255,0.4); color: #fff;"
        data-track="cta_click"
        data-cta="mobile_sticky_cotizar"
        aria-label="Cotizar sweater"
      >
        Cotizar
      </a>
    `;
    document.body.appendChild(stickyEl);

    /* Agregar eventos de tracking a los nuevos botones */
    initCTATracking();
  }

  /* Mostrar cuando el hero ya no es visible */
  const hero = qs('#inicio');
  if (!hero) return;

  const observer = createObserver((entries) => {
    entries.forEach(entry => {
      stickyEl.classList.toggle('visible', !entry.isIntersecting);
    });
  }, { threshold: 0 });

  observer.observe(hero);
}


/* ===========================================
   8. TRACKING DE SCROLL DEPTH
   =========================================== */
function initScrollDepthTracking() {
  const milestones = [25, 50, 75, 100];
  const tracked    = new Set();

  function getScrollDepth() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
  }

  window.addEventListener('scroll', debounce(() => {
    const depth = getScrollDepth();

    milestones.forEach(milestone => {
      if (depth >= milestone && !tracked.has(milestone)) {
        tracked.add(milestone);
        trackEvent('scroll_depth', { percent: milestone });
      }
    });
  }, 200), { passive: true });
}


/* ===========================================
   9. TRACKING DE CTAs
   =========================================== */
function initCTATracking() {
  /* Botones CTA con data-track */
  qsa('[data-track="cta_click"]').forEach(el => {
    el.addEventListener('click', () => {
      trackEvent('cta_click', {
        cta_location: el.dataset.cta || 'unknown',
        cta_text: el.textContent.trim().substring(0, 50)
      });
    });
  });

  /* Botones WhatsApp */
  qsa('[data-track="whatsapp_click"]').forEach(el => {
    el.addEventListener('click', () => {
      trackEvent('whatsapp_click', {
        location: el.closest('section')?.id || el.className
      });
    });
  });

  /* Boton flotante de WhatsApp */
  const waFloat = qs('#whatsapp-float');
  if (waFloat) {
    waFloat.addEventListener('click', () => {
      trackEvent('whatsapp_click', { location: 'floating_button' });
    });
  }
}


/* ===========================================
   10. PARTICULAS DEL HERO (Canvas)
   =========================================== */
function initHeroParticles() {
  const container = qs('#hero-particles');
  if (!container) return;

  /* No renderizar particulas en dispositivos de baja potencia */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  /* Crear canvas */
  const canvas  = document.createElement('canvas');
  const ctx     = canvas.getContext('2d');
  container.appendChild(canvas);

  let width, height, particles;

  function resize() {
    width  = canvas.width  = container.offsetWidth;
    height = canvas.height = container.offsetHeight;
  }

  /* Clase particula */
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x     = Math.random() * width;
      this.y     = Math.random() * height;
      this.vx    = (Math.random() - 0.5) * 0.4;
      this.vy    = (Math.random() - 0.5) * 0.4;
      this.size  = Math.random() * 3 + 1;
      this.alpha = Math.random() * 0.4 + 0.1;
      this.color = Math.random() > 0.6 ? '#F2C53D' : 'rgba(255,255,255,0.6)';
      this.isThread = Math.random() > 0.7;
      this.length = Math.random() * 20 + 10;
      this.angle = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.angle += 0.01;

      /* Wrap en bordes */
      if (this.x < -this.size)  this.x = width + this.size;
      if (this.x > width + this.size) this.x = -this.size;
      if (this.y < -this.size)  this.y = height + this.size;
      if (this.y > height + this.size) this.y = -this.size;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;

      if (this.isThread) {
        /* Dibujar hilo */
        ctx.strokeStyle = this.color;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(
          this.x + Math.cos(this.angle) * this.length / 2,
          this.y + Math.sin(this.angle) * this.length / 2
        );
        ctx.lineTo(
          this.x - Math.cos(this.angle) * this.length / 2,
          this.y - Math.sin(this.angle) * this.length / 2
        );
        ctx.stroke();
      } else {
        /* Dibujar punto */
        ctx.fillStyle   = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function init() {
    resize();
    const count = Math.min(40, Math.floor((width * height) / 25000));
    particles = Array.from({ length: count }, () => new Particle());
  }

  let animId;
  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    animId = requestAnimationFrame(animate);
  }

  /* Pausar cuando el canvas sale del viewport (performance) */
  const visibilityObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animId);
    }
  });

  init();
  animate();
  visibilityObserver.observe(canvas);

  window.addEventListener('resize', debounce(() => {
    cancelAnimationFrame(animId);
    init();
    animate();
  }, 300));
}


/* ===========================================
   11. SWIPER — TESTIMONIOS
   =========================================== */
function initTestimonialsSwiper() {
  if (typeof Swiper === 'undefined') return;

  new Swiper('.testimonials-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true
    },
    navigation: {
      prevEl: '.swiper-button-prev',
      nextEl: '.swiper-button-next'
    },
    breakpoints: {
      640: {
        slidesPerView: 1.5,
        centeredSlides: true
      },
      900: {
        slidesPerView: 2,
        centeredSlides: false
      },
      1200: {
        slidesPerView: 3,
        centeredSlides: false
      }
    },
    a11y: {
      prevSlideMessage: 'Testimonio anterior',
      nextSlideMessage: 'Testimonio siguiente'
    }
  });
}


/* ===========================================
   12. AOS — ANIMATE ON SCROLL
   =========================================== */
function initAOS() {
  if (typeof AOS === 'undefined') return;

  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,           /* Solo animar una vez */
    offset: 60,
    delay: 0,
    anchorPlacement: 'top-bottom',
    disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  });
}


/* ===========================================
   13. NEWSLETTER FOOTER
   =========================================== */
function initNewsletterForm() {
  const form = qs('#newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput?.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput?.classList.add('is-invalid');
      return;
    }

    emailInput?.classList.remove('is-invalid');

    /*
      INTEGRACION NEWSLETTER:
      Descomentar y configurar segun tu plataforma de email.

      OPCION A — HubSpot:
      fetch(`https://api.hsforms.com/submissions/v3/integration/submit/TU_PORTAL_ID/TU_NEWSLETTER_FORM_ID`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: [{ name: 'email', value: email }],
          context: { pageUri: window.location.href, pageName: document.title }
        })
      });

      OPCION B — Mailchimp:
      fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email }) });
    */

    trackEvent('newsletter_subscribe', { email_domain: email.split('@')[1] });

    /* Feedback visual */
    form.innerHTML = `
      <p style="color: var(--amarillo); font-size: 0.875rem; font-weight: 600;">
        <i class="fas fa-check-circle" aria-hidden="true"></i>
        Suscrito exitosamente!
      </p>
    `;
  });
}


/* ===========================================
   14. RIPPLE EFFECT EN BOTONES
   =========================================== */
function initButtonRipple() {
  qsa('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect   = this.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const ripple = document.createElement('span');

      ripple.className = 'ripple';
      ripple.style.cssText = `
        width: 100px;
        height: 100px;
        left: ${x - 50}px;
        top: ${y - 50}px;
      `;

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
}


/* ===========================================
   15. SMOOTH SCROLL PARA ENLACES DE ANCLA
   =========================================== */
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href   = this.getAttribute('href');
      const target = qs(href);

      if (!target) return;

      e.preventDefault();

      const headerHeight = qs('#header')?.offsetHeight || 80;
      const targetTop    = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth'
      });

      /* Actualizar URL sin recargar */
      history.pushState(null, null, href);

      /* Mover foco al elemento (accesibilidad) */
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}


/* ===========================================
   INICIALIZACION GLOBAL
   =========================================== */
function init() {
  /* Iniciamos todo cuando el DOM esta listo */
  initHeader();
  initMobileMenu();
  initActiveNavLink();
  initCounters();
  initFAQ();
  initBackToTop();
  initMobileCTASticky();
  initScrollDepthTracking();
  initCTATracking();
  initHeroParticles();
  initTestimonialsSwiper();
  initAOS();
  initNewsletterForm();
  initButtonRipple();
  initSmoothScroll();

  console.log('%cTechMax Sweaters — Landing cargada correctamente', 'color: #F2C53D; font-weight: bold; font-size: 14px;');
}

/* Esperar a que el DOM este completamente cargado */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
