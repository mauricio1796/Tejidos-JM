/**
 * TECHMAX SWEATERS — ANIMACIONES GSAP + SCROLL TRIGGER
 * animations.js
 *
 * Requiere:
 * - GSAP 3.12+
 * - ScrollTrigger plugin
 *
 * Animaciones incluidas:
 * - Hero: stagger de entrada con clip-path
 * - Seccion PAS: split columns reveal
 * - Cards de beneficios: 3D hover
 * - Proceso: timeline line draw
 * - Parallax en imagenes de fondo
 * - Cursor custom
 */

'use strict';

/**
 * Inicializa GSAP y todas las animaciones.
 * Se llama cuando GSAP esta disponible en el DOM.
 */
function initGSAPAnimations() {
  /* Verificar que GSAP y ScrollTrigger esten disponibles */
  if (typeof gsap === 'undefined') {
    console.warn('[TechMax] GSAP no disponible. Activando fallback CSS.');
    activateCSSFallback();
    return;
  }

  /* Registrar plugins */
  gsap.registerPlugin(ScrollTrigger);

  /* Configuracion global de GSAP */
  gsap.config({
    force3D: true,
    nullTargetWarn: false
  });

  /* Respetar preferencia de movimiento reducido */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    activateCSSFallback();
    return;
  }

  /* ==========================================
     1. HERO SPLIT — ENTRADA STAGGERED
     ========================================== */
  function animateHero() {
    const heroSection = document.getElementById('inicio');
    if (!heroSection) return;

    /* Generar marcas de perforación en la costura diagonal */
    (function generateStitchHoles() {
      const holesG = document.getElementById('stitch-holes');
      if (!holesG) return;
      const w = heroSection.offsetWidth;
      const h = heroSection.offsetHeight;
      const startX = w * 0.55;
      const endX   = w * 0.42;
      const spacing = 72;
      const steps = Math.floor(h / spacing);
      for (let i = 0; i <= steps; i++) {
        const t  = i / steps;
        const cx = startX + (endX - startX) * t;
        const cy = h * t;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r',  '2');
        circle.setAttribute('fill', '#F2C53D');
        circle.setAttribute('opacity', '0.18');
        holesG.appendChild(circle);
      }
    })();

    /* Timeline principal */
    const tl = gsap.timeline({ delay: 0.25, defaults: { ease: 'power3.out' } });

    /* 1. Mitad izquierda: fade + slide suave — SIN tocar clip-path */
    tl.from('#hero-left', {
      opacity: 0, x: -30, duration: 0.85
    });

    /* 2. Foto derecha fade in */
    tl.from('#hero-right', {
      opacity: 0, duration: 0.9, ease: 'power2.out'
    }, '-=0.5');

    /* El contenido del hero (badge, headline, sub, ctas, stats)
       se anima via CSS keyframes — ver styles.css .hero-anim-* */

    /* Animación de contadores en las estadísticas */
    document.querySelectorAll('[data-count]').forEach(function(el) {
      var target = parseInt(el.dataset.count, 10);
      gsap.to({ val: 0 }, {
        val: target,
        duration: 2,
        delay: 1.1,
        ease: 'power2.out',
        onUpdate: function() {
          var v = Math.round(this.targets()[0].val);
          if (v >= 1000) {
            el.textContent = '+' + Math.round(v / 1000) + 'K';
          } else {
            el.textContent = '+' + v;
          }
        }
      });
    });
  }

  /* ==========================================
     2. LINEA DEL PROCESO (TIMELINE DRAW)
     ========================================== */
  function animateProcessLine() {
    const timeline = document.querySelector('.process__timeline');
    if (!timeline) return;

    /* Crear una linea animada SVG sobre el fondo */
    ScrollTrigger.create({
      trigger: '.process__timeline',
      start: 'top 70%',
      onEnter: () => {
        gsap.fromTo('.process__timeline::before', {}, {
          /* No podemos animar pseudo-elementos directamente,
             usamos un elemento extra creado via JS */
        });

        /* Animar los numeros de los pasos con stagger */
        gsap.fromTo('.process__step-number',
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            stagger: 0.2,
            ease: 'back.out(1.5)'
          }
        );

        /* Animar las tarjetas con stagger */
        gsap.fromTo('.process__step-card',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.2,
            ease: 'power2.out'
          }
        );
      },
      once: true
    });
  }

  /* ==========================================
     3. PARALLAX EN IMAGENES DE FONDO
     ========================================== */
  function initParallax() {
    /* Parallax sutil en el hero background */
    gsap.to('.hero__bg-pattern', {
      y: '-15%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5
      }
    });

    /* Parallax en la imagen hero */
    gsap.to('.hero__image-placeholder', {
      y: '8%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 2
      }
    });

    /* Parallax sutil en el fondo del lead magnet */
    gsap.to('.lead-magnet__bg', {
      y: '-10%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.lead-magnet',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2
      }
    });
  }

  /* ==========================================
     4. SECCION PAS — REVEAL COLUMNS
     ========================================== */
  function animatePAS() {
    if (!document.querySelector('.pas__problem')) return;

    ScrollTrigger.create({
      trigger: '.pas__grid',
      start: 'top 75%',
      onEnter: () => {
        /* Columna problema desde izquierda */
        gsap.fromTo('.pas__problem',
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out' }
        );

        /* Divisor: escala */
        gsap.fromTo('.pas__divider',
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)', delay: 0.4 }
        );

        /* Columna solucion desde derecha */
        gsap.fromTo('.pas__solution',
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out', delay: 0.15 }
        );

        /* Items de lista con stagger */
        gsap.fromTo('.pas__list li',
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            delay: 0.5
          }
        );
      },
      once: true
    });
  }

  /* ==========================================
     5. BENEFIT CARDS — 3D HOVER
     ========================================== */
  function initBenefitCards3D() {
    const cards = gsap.utils.toArray('.benefit-card');
    if (!cards.length) return;

    /* Solo en desktop */
    if (window.innerWidth <= 768) return;

    cards.forEach(card => {
      let rafCard = null;
      card.addEventListener('mousemove', (e) => {
        if (rafCard) return; /* throttle: max 1 GSAP call por frame */
        rafCard = requestAnimationFrame(() => {
          rafCard = null;
          const rect    = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top  + rect.height / 2;
          const deltaX  = (e.clientX - centerX) / (rect.width / 2);
          const deltaY  = (e.clientY - centerY) / (rect.height / 2);

          gsap.to(card, {
            rotationY:  deltaX * 5,
            rotationX: -deltaY * 5,
            transformPerspective: 1000,
            ease: 'power1.out',
            duration: 0.3
          });
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotationY:  0,
          rotationX:  0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });
  }

  /* ==========================================
     6. SCROLL REVEAL PARA SECCIONES COMPLETAS
     ========================================== */
  function initSectionReveals() {
    /* Contadores: animacion de entrada */
    ScrollTrigger.create({
      trigger: '.counters',
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo('.counter-card',
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.12,
            ease: 'power2.out'
          }
        );
      },
      once: true
    });

    /* Section titles: reveal con clip path */
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.fromTo(title,
        {
          clipPath: 'inset(0 100% 0 0)',
          opacity: 0
        },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 85%',
            once: true
          }
        }
      );
    });

    /* Section labels: fade + scale */
    gsap.utils.toArray('.section-label').forEach(label => {
      gsap.fromTo(label,
        { opacity: 0, scale: 0.8, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: label,
            start: 'top 88%',
            once: true
          }
        }
      );
    });
  }

  /* ==========================================
     7. LEAD MAGNET — ANIMACION DE ENTRADA
     ========================================== */
  function animateLeadMagnet() {
    ScrollTrigger.create({
      trigger: '.lead-magnet',
      start: 'top 70%',
      onEnter: () => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        tl
          .fromTo('.lead-magnet__badge',
            { opacity: 0, scale: 0.8, y: -10 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5 }
          )
          .fromTo('.lead-magnet__heading',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8 },
            '-=0.2'
          )
          .fromTo('.lead-magnet__desc',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7 },
            '-=0.5'
          )
          .fromTo('.lead-magnet__includes li',
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, stagger: 0.1, duration: 0.5 },
            '-=0.4'
          )
          .fromTo('.lead-magnet__urgency',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5 },
            '-=0.2'
          )
          .fromTo('.form-card',
            { opacity: 0, x: 40, scale: 0.97 },
            { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'power2.out' },
            '-=1.0'
          );
      },
      once: true
    });
  }

  /* ==========================================
     8. TESTIMONIO CARDS — REVEAL EN SWIPER
     ========================================== */
  function animateTestimonials() {
    ScrollTrigger.create({
      trigger: '.testimonials-swiper',
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo('.testimonials-swiper',
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }
        );
      },
      once: true
    });
  }

  /* ==========================================
     9. PRE-FOOTER — ENTRADA DRAMATICA
     ========================================== */
  function animatePrefooter() {
    ScrollTrigger.create({
      trigger: '.prefooter',
      start: 'top 80%',
      onEnter: () => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        tl
          .fromTo('.prefooter__heading',
            {
              opacity: 0,
              clipPath: 'inset(0 100% 0 0)'
            },
            {
              opacity: 1,
              clipPath: 'inset(0 0% 0 0)',
              duration: 1
            }
          )
          .fromTo('.prefooter__desc',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7 },
            '-=0.5'
          )
          .fromTo('.prefooter__ctas .btn',
            { opacity: 0, scale: 0.9, y: 20 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              stagger: 0.15,
              duration: 0.6,
              ease: 'back.out(1.3)'
            },
            '-=0.4'
          );
      },
      once: true
    });
  }

  /* ==========================================
     10. CURSOR CUSTOM (SOLO DESKTOP)
     ========================================== */
  function initCustomCursor() {
    if (window.innerWidth <= 768) return;

    const cursor = document.createElement('div');
    cursor.className = 'cursor-custom';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!cursor.classList.contains('visible')) {
        cursor.classList.add('visible');
      }
    });

    /* Suavizar el movimiento del cursor */
    function updateCursor() {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;

      cursorX += dx * 0.12;
      cursorY += dy * 0.12;

      gsap.set(cursor, { x: cursorX, y: cursorY });
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    /* Expandir cursor sobre CTAs */
    const interactiveEls = document.querySelectorAll('.btn, a, button, .benefit-card, .testimonial-card, .faq-item__question');

    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
    });

    /* Ocultar cursor al salir de la ventana */
    document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
  }

  /* ==========================================
     11. HEADER: ANIMACION DE CARGA INICIAL
     ========================================== */
  function animateHeaderLoad() {
    const tl = gsap.timeline({ delay: 0.1 });

    tl
      .fromTo('.header__logo',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' }
      )
      .fromTo('.nav__link',
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' },
        '-=0.5'
      )
      .fromTo('.header__cta',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' },
        '-=0.3'
      );
  }

  /* ==========================================
     EJECUTAR TODAS LAS ANIMACIONES
     ========================================== */
  animateHeaderLoad();
  animateHero();
  animateProcessLine();
  initParallax();
  animatePAS();
  initBenefitCards3D();
  initSectionReveals();
  animateLeadMagnet();
  animateTestimonials();
  animatePrefooter();
  initCustomCursor();

  /* Refrescar ScrollTrigger despues de que todo cargue */
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

  /* Actualizar en resize */
  window.addEventListener('resize', debounce(() => {
    ScrollTrigger.refresh();
  }, 300));

  console.log('%c[GSAP] Animaciones inicializadas correctamente', 'color: #F2C53D;');
}


/**
 * Fallback cuando GSAP no esta disponible:
 * Fuerza visibilidad de elementos que estarian ocultos.
 */
function activateCSSFallback() {
  /* Hero split: siempre visible */
  var heroLeft = document.getElementById('hero-left');
  var heroRight = document.getElementById('hero-right');
  if (heroLeft)  { heroLeft.style.opacity  = '1'; heroLeft.style.transform  = 'none'; }
  if (heroRight) { heroRight.style.opacity = '1'; heroRight.style.transform = 'none'; }

  /* Elementos con data-hero-item */
  document.querySelectorAll('[data-hero-item]').forEach(function(el) {
    el.style.opacity    = '1';
    el.style.transform  = 'none';
    el.style.visibility = 'visible';
  });
}


/**
 * Debounce (duplicado aqui para independencia del archivo)
 */
function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}


/* ==========================================
   ESPERAR A GSAP Y EJECUTAR
   ========================================== */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    /* Pequeño delay para asegurar que GSAP este cargado via CDN */
    setTimeout(initGSAPAnimations, 100);
  });
} else {
  setTimeout(initGSAPAnimations, 100);
}
