(function () {
  'use strict';

  var testimonials = [
    {
      name: 'María Castillo',
      initials: 'MC',
      role: 'Directora — Colegio San José',
      text: 'Los sweaters para nuestros estudiantes quedaron perfectos. Calidad excepcional y entregaron antes del plazo acordado. Definitivamente volveremos a trabajar con TechMax.',
      color: '#F2C53D',
      stars: '★ ★ ★ ★ ★'
    },
    {
      name: 'Juan Rodríguez',
      initials: 'JR',
      role: 'Gerente RRHH — TechCorp Colombia',
      text: 'Necesitábamos 200 sweaters corporativos en tiempo récord. TechMax cumplió con la calidad y los tiempos. 25 años de experiencia se notan en cada puntada.',
      color: '#D4A82E',
      stars: '★ ★ ★ ★ ★'
    },
    {
      name: 'Laura Pérez',
      initials: 'LP',
      role: 'Diseñadora de Moda Independiente',
      text: 'Llevé mi diseño personalizado y lo reprodujeron fielmente. El acabado jacquard superó mis expectativas. Es raro encontrar una fábrica que acepte diseños custom con tanta calidad.',
      color: '#B8941F',
      stars: '★ ★ ★ ★ ★'
    },
    {
      name: 'Andrés Gómez',
      initials: 'AG',
      role: 'Director — Fundación Esperanza',
      text: 'Los chalecos institucionales para nuestros voluntarios son cómodos, duraderos y se ven profesionales. El equipo de TechMax nos asesoró en cada paso del proceso.',
      color: '#D4A82E',
      stars: '★ ★ ★ ★ ★'
    },
    {
      name: 'Carolina Torres',
      initials: 'CT',
      role: 'Propietaria — Boutique Alpaca',
      text: 'Como boutique de moda, la calidad del tejido es lo que más nos importa. Los sweaters de TechMax tienen un acabado premium que nuestros clientes adoran. Ya van 3 pedidos este año.',
      color: '#F2C53D',
      stars: '★ ★ ★ ★ ★'
    }
  ];

  var TOTAL       = testimonials.length;
  var CHAR_DELAY  = 32;   /* ms por carácter */
  var AFTER_DELAY = 3500; /* pausa tras terminar antes de auto-avanzar */

  var current      = 0;
  var charIndex    = 0;
  var isTyping     = false;
  var typingTimer  = null;
  var autoTimer    = null;
  var started      = false;

  /* ── DOM ── */
  var section    = document.getElementById('testimonios');
  var typedEl    = document.getElementById('typed-text');
  var cursor     = document.getElementById('typing-cursor');
  var avatar     = document.getElementById('testimonial-avatar');
  var nameEl     = document.getElementById('testimonial-name');
  var roleEl     = document.getElementById('testimonial-role');
  var header     = document.getElementById('testimonial-header');
  var dotsWrap   = document.getElementById('test-dots');

  if (!section || !typedEl) return;

  /* ── CREAR DOTS ── */
  for (var d = 0; d < TOTAL; d++) {
    var dot = document.createElement('button');
    dot.className = 'test-dot' + (d === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Testimonio ' + (d + 1) + ' de ' + TOTAL);
    dot.addEventListener('click', (function (idx) {
      return function () { goTo(idx); };
    })(d));
    dotsWrap.appendChild(dot);
  }
  var dots = dotsWrap.querySelectorAll('.test-dot');

  /* ── ACTUALIZAR DOTS ── */
  function updateDots(idx) {
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === idx);
    });
  }

  /* ── TYPING ── */
  function typeTestimonial(idx) {
    var t = testimonials[idx];
    charIndex = 0;
    isTyping  = true;

    typedEl.textContent = '';
    cursor.style.opacity = '1';

    /* Fade out header → actualizar → fade in */
    header.classList.add('test-card__header--fade');
    setTimeout(function () {
      avatar.textContent        = t.initials;
      avatar.style.background   = t.color;
      nameEl.textContent        = t.name;
      roleEl.textContent        = t.role;
      header.classList.remove('test-card__header--fade');
    }, 280);

    updateDots(idx);

    clearInterval(typingTimer);
    clearTimeout(autoTimer);

    typingTimer = setInterval(function () {
      if (charIndex < t.text.length) {
        typedEl.textContent += t.text[charIndex];
        charIndex++;
      } else {
        clearInterval(typingTimer);
        isTyping = false;
        /* Desvanecer cursor al terminar */
        cursor.style.opacity = '0';
        /* Autoplay siguiente */
        autoTimer = setTimeout(function () { next(); }, AFTER_DELAY);
      }
    }, CHAR_DELAY);
  }

  /* ── NAVEGACIÓN ── */
  function goTo(idx) {
    clearInterval(typingTimer);
    clearTimeout(autoTimer);
    current = idx;
    typeTestimonial(current);
  }

  function next() { goTo((current + 1) % TOTAL); }
  function prev() { goTo((current - 1 + TOTAL) % TOTAL); }

  var btnNext = document.getElementById('test-next');
  var btnPrev = document.getElementById('test-prev');
  if (btnNext) btnNext.addEventListener('click', next);
  if (btnPrev) btnPrev.addEventListener('click', prev);

  /* ── PAUSAR AUTOPLAY AL HOVER ── */
  var frame = document.getElementById('testimonial-frame');
  if (frame) {
    frame.addEventListener('mouseenter', function () {
      clearTimeout(autoTimer);
    });
    frame.addEventListener('mouseleave', function () {
      if (!isTyping) {
        autoTimer = setTimeout(function () { next(); }, AFTER_DELAY);
      }
    });
  }

  /* ── TECLADO ── */
  document.addEventListener('keydown', function (e) {
    var rect = section.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  });

  /* ── TOUCH SWIPE ── */
  var touchStartX = 0;
  if (frame) {
    frame.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    frame.addEventListener('touchend', function (e) {
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (delta < -40) next();
      if (delta >  40) prev();
    }, { passive: true });
  }

  /* ── ANIMACIÓN DE ENTRADA CON GSAP ── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.test-header', {
      opacity: 0, y: 24, duration: 0.55, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 82%', once: true }
    });
    gsap.from('#testimonial-card', {
      opacity: 0, y: 30, scale: 0.98, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 72%', once: true }
    });
  }

  /* ── ARRANCAR AL ENTRAR EN VIEWPORT ── */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !started) {
          started = true;
          typeTestimonial(0);
        }
      });
    }, { threshold: 0.3 }).observe(section);
  } else {
    typeTestimonial(0);
  }

})();
