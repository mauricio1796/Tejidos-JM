/**
 * TECHMAX SWEATERS — GALERÍA COVERFLOW 3D
 * gallery-coverflow.js
 *
 * Requiere: GSAP + ScrollTrigger (cargados vía CDN)
 */

(function () {
  'use strict';

  /* ── DATOS ── */
  var sweaters = [
    { name: 'Corazones Artesanal',     cat: 'Diseño Especial',  desc: 'Sweater tejido con patrón de corazones. Exclusivo y artesanal.',       tags: ['Tejido jacquard', 'Exclusivo'],    img: 'img/corazones2.png' },
    { name: 'Pata de Gallo Clásico',   cat: 'Casual Premium',   desc: 'Sweater crewneck con patrón pata de gallo negro y blanco.',             tags: ['Algodón premium', 'Versátil'],     img: 'img/WhatsApp-Image-2025-07-21-at-9.24.png' },
    { name: 'Chaqueta Polo B&N',       cat: 'Corporativo',      desc: 'Chaqueta tejida cuello polo con patrón pata de gallo negro y blanco.',  tags: ['Lana blend', 'Formal'],            img: 'img/tiktok5.png' },
    { name: 'Chaqueta Rosa',           cat: 'Casual Premium',   desc: 'Chaqueta tejida pata de gallo en tonos rosa y negro. Tendencia.',       tags: ['Lana merino', 'Moderno'],          img: 'img/tiktok8.png' },
    { name: 'Pata de Gallo Rojo',      cat: 'Invierno',         desc: 'Sweater crewneck pata de gallo rojo y negro para temporada fría.',      tags: ['Lana gruesa', 'Cálido'],           img: 'img/tiktok12.png' },
    { name: 'Chaleco V-Neck Clásico',  cat: 'Institucional',    desc: 'Chaleco cuello V blanco con franjas negras. Ideal para uniformes.',     tags: ['Algodón', 'Durable'],              img: 'img/chaleco1.png' },
    { name: 'Chaleco Acanalado Camel', cat: 'Corporativo',      desc: 'Chaleco tejido acanalado en camel con franjas blancas.',                tags: ['Acrílico premium', 'Ligero'],      img: 'img/chaleco3.png' },
    { name: 'Chaleco Trenza Rojo',     cat: 'Diseño Especial',  desc: 'Chaleco con trenza artesanal frontal en rojo intenso.',                 tags: ['Tejido trenza', 'Artesanal'],      img: 'img/chalecotrenza2.png' },
  ];

  var TOTAL = sweaters.length;
  var current = 0;
  var isAnimating = false;
  var isDragging = false;
  var startX = 0;
  var dragDelta = 0;
  var autoplayTimer = null;

  /* ── REFERENCIAS DOM ── */
  var section   = document.getElementById('gallery-section');
  var track     = document.getElementById('coverflow-track');
  var dotsWrap  = document.getElementById('cf-dots');
  var currentEl = document.getElementById('cf-current');
  var btnNext   = document.getElementById('cf-next');
  var btnPrev   = document.getElementById('cf-prev');
  var wrapper   = document.getElementById('coverflow-wrapper');

  if (!section || !track) return;

  /* ── CREAR TARJETAS ── */
  sweaters.forEach(function (sw, i) {
    var card = document.createElement('div');
    card.className = 'cf-card';
    card.dataset.index = i;

    /* Imagen */
    var imgWrap = document.createElement('div');
    imgWrap.className = 'cf-card-image';

    var img = document.createElement('img');
    img.src     = sw.img;
    img.alt     = sw.name + ' — TechMax';
    img.loading = i < 3 ? 'eager' : 'lazy';
    img.addEventListener('error', function () {
      img.style.display = 'none';
      imgWrap.style.background = 'linear-gradient(135deg,#1a2d38,#121E26)';
      var fallback = document.createElement('div');
      fallback.style.cssText = 'text-align:center;padding-top:38%;color:rgba(255,255,255,0.2);font-size:12px;font-style:italic;';
      fallback.textContent = sw.name;
      imgWrap.appendChild(fallback);
    });

    var badge = document.createElement('span');
    badge.className   = 'cf-card-badge';
    badge.textContent = sw.cat;

    imgWrap.appendChild(img);
    imgWrap.appendChild(badge);

    /* Info */
    var info = document.createElement('div');
    info.className = 'cf-card-info';

    var title = document.createElement('h3');
    title.className   = 'cf-card-title';
    title.textContent = sw.name;

    var desc = document.createElement('p');
    desc.className   = 'cf-card-desc';
    desc.textContent = sw.desc;

    var tagsWrap = document.createElement('div');
    tagsWrap.className = 'cf-card-tags';
    sw.tags.forEach(function (t) {
      var tag = document.createElement('span');
      tag.className   = 'cf-tag';
      tag.textContent = t;
      tagsWrap.appendChild(tag);
    });

    info.appendChild(title);
    info.appendChild(desc);
    info.appendChild(tagsWrap);

    card.appendChild(imgWrap);
    card.appendChild(info);
    track.appendChild(card);
  });

  var cards = track.querySelectorAll('.cf-card');

  /* ── CREAR DOTS ── */
  for (var d = 0; d < TOTAL; d++) {
    var dot = document.createElement('button');
    dot.className = 'cf-dot' + (d === 0 ? ' active' : '');
    dot.style.width = d === 0 ? '20px' : '8px';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', sweaters[d].name);
    dot.setAttribute('aria-selected', d === 0 ? 'true' : 'false');
    dot.dataset.dotIndex = d;
    dot.addEventListener('click', (function (idx) {
      return function () { goTo(idx); };
    }(d)));
    dotsWrap.appendChild(dot);
  }

  var dots = dotsWrap.querySelectorAll('.cf-dot');

  /* ── POSICIONES COVERFLOW ── */
  var CFG = {
    '-3': { tx: -520, ry:  45, s: 0.55, op: 0.08, z: 1, blur: 4 },
    '-2': { tx: -370, ry:  42, s: 0.65, op: 0.25, z: 2, blur: 2 },
    '-1': { tx: -210, ry:  35, s: 0.80, op: 0.70, z: 3, blur: 0 },
     '0': { tx:    0, ry:   0, s: 1.00, op: 1.00, z: 5, blur: 0 },
    '+1': { tx:  210, ry: -35, s: 0.80, op: 0.70, z: 3, blur: 0 },
    '+2': { tx:  370, ry: -42, s: 0.65, op: 0.25, z: 2, blur: 2 },
    '+3': { tx:  520, ry: -45, s: 0.55, op: 0.08, z: 1, blur: 4 },
  };

  /* ── APLICAR COVERFLOW ── */
  function updateCoverflow(activeIndex) {
    cards.forEach(function (card, i) {
      var offset = i - activeIndex;
      var clampedKey = String(Math.max(-3, Math.min(3, offset)));
      var cfg = CFG[clampedKey];

      if (!cfg || Math.abs(offset) > 3) {
        card.style.transform = 'translateX(' + (offset > 0 ? 700 : -700) + 'px) scale(0.4)';
        card.style.opacity = '0';
        card.style.filter = 'none';
        card.style.zIndex = '0';
        card.style.pointerEvents = 'none';
        card.classList.remove('active');
        return;
      }

      card.style.transform =
        'translateX(' + cfg.tx + 'px) ' +
        'perspective(1200px) ' +
        'rotateY(' + cfg.ry + 'deg) ' +
        'scale(' + cfg.s + ')';
      card.style.opacity = String(cfg.op);
      card.style.zIndex = String(cfg.z);
      card.style.filter = cfg.blur > 0 ? 'blur(' + cfg.blur + 'px)' : 'none';
      card.style.pointerEvents = offset === 0 ? 'auto' : 'none';

      if (offset === 0) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    /* Actualizar dots */
    dots.forEach(function (dot, i) {
      var isActive = i === activeIndex;
      dot.style.width = isActive ? '20px' : '8px';
      dot.style.background = isActive ? '#F2C53D' : 'rgba(255,255,255,0.2)';
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    /* Actualizar contador */
    if (currentEl) currentEl.textContent = String(activeIndex + 1).padStart(2, '0');
  }

  /* ── NAVEGACIÓN ── */
  function goTo(index) {
    if (isAnimating) return;
    var idx = Math.max(0, Math.min(index, TOTAL - 1));
    if (idx === current) return;
    isAnimating = true;
    current = idx;
    updateCoverflow(current);
    setTimeout(function () { isAnimating = false; }, 650);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  /* ── BOTONES ── */
  if (btnNext) btnNext.addEventListener('click', next);
  if (btnPrev) btnPrev.addEventListener('click', prev);

  /* ── CLICK EN TARJETAS VECINAS ── */
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      var idx = parseInt(card.dataset.index, 10);
      if (idx !== current) goTo(idx);
    });
  });

  /* ── TECLADO ── */
  document.addEventListener('keydown', function (e) {
    var rect = section.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  });

  /* ── DRAG (mouse + touch) ── */
  var DRAG_THRESHOLD = 50;

  if (wrapper) {
    wrapper.addEventListener('mousedown', startDrag);
    wrapper.addEventListener('touchstart', startDrag, { passive: true });
  }
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: true });
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  function startDrag(e) {
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    dragDelta = 0;
    stopAutoplay();
  }

  function onDrag(e) {
    if (!isDragging) return;
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    dragDelta = clientX - startX;

    /* Feedback visual en tarjeta activa */
    var activeCard = cards[current];
    if (activeCard) {
      var moveX = dragDelta * 0.25;
      var rotY  = dragDelta * -0.03;
      activeCard.style.transition = 'none';
      activeCard.style.transform  =
        'translateX(' + moveX + 'px) perspective(1200px) rotateY(' + rotY + 'deg) scale(1)';
    }
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;

    if      (dragDelta < -DRAG_THRESHOLD) { next(); }
    else if (dragDelta >  DRAG_THRESHOLD) { prev(); }
    else                                  { updateCoverflow(current); }

    dragDelta = 0;
    startAutoplay();
  }

  /* ── AUTOPLAY ── */
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(function () {
      if (current < TOTAL - 1) next();
      else goTo(0);
    }, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopAutoplay);
    wrapper.addEventListener('mouseleave', startAutoplay);
    wrapper.addEventListener('touchstart', stopAutoplay, { passive: true });
  }

  /* ── INTERSECTION OBSERVER para autoplay ── */
  if (typeof IntersectionObserver !== 'undefined') {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) startAutoplay();
        else stopAutoplay();
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  }

  /* ── ANIMACIÓN DE ENTRADA (GSAP) ── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.cf-header', {
      opacity: 0,
      y: 30,
      duration: 0.7,
      scrollTrigger: { trigger: '#gallery-section', start: 'top 80%' }
    });

    gsap.from('.cf-controls, .cf-counter', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      delay: 0.3,
      scrollTrigger: { trigger: '#gallery-section', start: 'top 75%' }
    });
  }

  /* ── INICIALIZAR ── */
  updateCoverflow(0);

})();
