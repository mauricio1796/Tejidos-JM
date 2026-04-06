/**
 * TECHMAX SWEATERS — GALERÍA 3D STACK MOTION
 * gallery-stack.js
 *
 * Requiere: GSAP + ScrollTrigger (cargados vía CDN)
 */

(function () {
  'use strict';

  /* ── DATOS CON IMÁGENES REALES ── */
  var sweaters = [
    { name: 'Corazones Artesanal',      cat: 'Diseño Especial',  desc: 'Sweater tejido con patrón de corazones. Exclusivo y artesanal.',       tags: ['Tejido jacquard', 'Exclusivo'],    img: 'img/corazones2.png' },
    { name: 'Pata de Gallo Clásico',    cat: 'Casual Premium',   desc: 'Sweater crewneck con patrón pata de gallo negro y blanco.',             tags: ['Algodón premium', 'Versátil'],     img: 'img/WhatsApp-Image-2025-07-21-at-9.24.png' },
    { name: 'Chaqueta Polo B&N',        cat: 'Corporativo',      desc: 'Chaqueta tejida cuello polo con patrón pata de gallo negro y blanco.',  tags: ['Lana blend', 'Formal'],            img: 'img/tiktok5.png' },
    { name: 'Chaqueta Rosa',            cat: 'Casual Premium',   desc: 'Chaqueta tejida pata de gallo en tonos rosa y negro. Tendencia.',       tags: ['Lana merino', 'Moderno'],          img: 'img/tiktok8.png' },
    { name: 'Pata de Gallo Rojo',       cat: 'Invierno',         desc: 'Sweater crewneck pata de gallo rojo y negro para temporada fría.',      tags: ['Lana gruesa', 'Cálido'],           img: 'img/tiktok12.png' },
    { name: 'Chaleco V-Neck Clásico',   cat: 'Institucional',    desc: 'Chaleco cuello V blanco con franjas negras. Ideal para uniformes.',     tags: ['Algodón', 'Durable'],              img: 'img/chaleco1.png' },
    { name: 'Chaleco Acanalado Camel',  cat: 'Corporativo',      desc: 'Chaleco tejido acanalado en camel con franjas blancas.',                tags: ['Acrílico premium', 'Ligero'],      img: 'img/chaleco3.png' },
    { name: 'Chaleco Trenza Rojo',      cat: 'Diseño Especial',  desc: 'Chaleco con trenza artesanal frontal en rojo intenso.',                 tags: ['Tejido trenza', 'Artesanal'],      img: 'img/chalecotrenza2.png' },
  ];

  var TOTAL   = sweaters.length;   // 8
  var VISIBLE = 5;
  var current = 0;
  var isAnimating = false;

  /* ── REFERENCIAS DOM ── */
  var stack      = document.getElementById('gs-stack');
  var section    = document.getElementById('gs-section');
  var currentEl  = document.getElementById('gs-current');
  var barEl      = document.getElementById('gs-bar');
  var btnNext    = document.getElementById('gs-next');
  var btnPrev    = document.getElementById('gs-prev');
  var swipeHint  = document.getElementById('gs-swipe-hint');

  if (!stack || !section) return;

  /* ── CREAR TARJETAS ── */
  sweaters.forEach(function (sw, i) {
    var card = document.createElement('div');
    card.className = 'gs-card';
    card.dataset.index = i;

    var imgTag = i === 0
      ? '<img src="' + sw.img + '" alt="' + sw.name + ' — TechMax" loading="eager" />'
      : '<img src="' + sw.img + '" alt="' + sw.name + ' — TechMax" loading="lazy" />';

    card.innerHTML =
      '<div class="gs-card__img">' +
        imgTag +
        '<span class="gs-card__badge">' + sw.cat + '</span>' +
      '</div>' +
      '<div class="gs-card__info">' +
        '<h3 class="gs-card__title">' + sw.name + '</h3>' +
        '<p class="gs-card__desc">' + sw.desc + '</p>' +
        '<div class="gs-card__tags">' +
          sw.tags.map(function (t) { return '<span class="gs-card__tag">' + t + '</span>'; }).join('') +
        '</div>' +
        '<a href="#cotizacion" class="gs-card__cta" data-track="cta_click" data-cta="gallery3d_' + i + '">Cotizar este diseño</a>' +
      '</div>';

    stack.appendChild(card);
  });

  var cards = stack.querySelectorAll('.gs-card');

  /* ── POSICIONES DEL STACK ── */
  var POSITIONS = [
    { scale: 1,    tx: 0,   tz: 0,    ry: 0,    opacity: 1,    blur: 0, zi: 5 },
    { scale: 0.93, tx: 34,  tz: -50,  ry: -2.5, opacity: 0.82, blur: 0, zi: 4 },
    { scale: 0.86, tx: 62,  tz: -100, ry: -4.5, opacity: 0.58, blur: 1, zi: 3 },
    { scale: 0.79, tx: 86,  tz: -150, ry: -6,   opacity: 0.35, blur: 2, zi: 2 },
    { scale: 0.72, tx: 106, tz: -200, ry: -7.5, opacity: 0.15, blur: 3, zi: 1 },
  ];

  /* ── APLICAR POSICIÓN A TARJETA ── */
  function applyPos(card, pos, duration) {
    var t = 'translateX(' + pos.tx + 'px) translateZ(' + pos.tz + 'px) rotateY(' + pos.ry + 'deg) scale(' + pos.scale + ')';
    card.style.transition  = duration > 0 ? 'transform ' + duration + 's ease-out, opacity ' + duration + 's ease-out, filter ' + duration + 's ease-out' : 'none';
    card.style.transform   = t;
    card.style.opacity     = pos.opacity;
    card.style.filter      = pos.blur > 0 ? 'blur(' + pos.blur + 'px)' : 'none';
    card.style.zIndex      = pos.zi;
    card.style.pointerEvents = pos.zi === 5 ? 'auto' : 'none';
  }

  /* ── RENDERIZAR STACK COMPLETO ── */
  function renderStack(dur) {
    var d = (dur === undefined) ? 0.42 : dur;

    cards.forEach(function (card, i) {
      var offset = i - current;

      if (offset < 0) {
        /* Tarjeta ya usada: sale por la izquierda */
        card.style.transition = d > 0 ? 'all ' + d + 's ease-out' : 'none';
        card.style.transform  = 'translateX(-650px) rotateY(18deg) scale(0.78)';
        card.style.opacity    = '0';
        card.style.filter     = 'none';
        card.style.zIndex     = '0';
        card.style.pointerEvents = 'none';
        return;
      }

      if (offset >= VISIBLE) {
        /* Tarjeta futura: oculta al fondo */
        card.style.transition = d > 0 ? 'all ' + d + 's ease-out' : 'none';
        card.style.transform  = 'translateX(110px) translateZ(-220px) scale(0.62)';
        card.style.opacity    = '0';
        card.style.filter     = 'none';
        card.style.zIndex     = '0';
        card.style.pointerEvents = 'none';
        return;
      }

      applyPos(card, POSITIONS[offset], d);
    });

    /* Indicadores */
    if (currentEl) currentEl.textContent = String(current + 1).padStart(2, '0');
    if (barEl)     barEl.style.width = ((current + 1) / TOTAL * 100) + '%';

    /* Botones */
    if (btnPrev) btnPrev.style.opacity = current === 0        ? '0.3' : '1';
    if (btnNext) btnNext.style.opacity = current === TOTAL - 1 ? '0.3' : '1';
  }

  /* ── NAVEGACIÓN ── */
  function goTo(index, dur) {
    if (isAnimating) return;
    var idx = Math.max(0, Math.min(index, TOTAL - 1));
    if (idx === current) return;
    isAnimating = true;
    current = idx;
    renderStack(dur);
    setTimeout(function () { isAnimating = false; }, 450);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  /* ── BOTONES ── */
  if (btnNext) btnNext.addEventListener('click', next);
  if (btnPrev) btnPrev.addEventListener('click', prev);

  /* ── TECLADO ── */
  document.addEventListener('keydown', function (e) {
    if (!isInView()) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    { e.preventDefault(); prev(); }
  });

  function isInView() {
    var r = section.getBoundingClientRect();
    return r.top <= 0 && r.bottom >= window.innerHeight;
  }

  /* ── SCROLL TRIGGER ── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: function (self) {
        var target = Math.round(self.progress * (TOTAL - 1));
        if (target !== current) {
          current = target;
          renderStack(0.28);
        }
      }
    });
  }

  /* ── DRAG (mouse + touch) ── */
  var isDragging   = false;
  var dragStartX   = 0;
  var dragDelta    = 0;
  var DRAG_THRESH  = 55;

  stack.addEventListener('mousedown',  startDrag);
  stack.addEventListener('touchstart', startDrag, { passive: true });
  document.addEventListener('mousemove',  onDrag);
  document.addEventListener('touchmove',  onDrag, { passive: false });
  document.addEventListener('mouseup',   endDrag);
  document.addEventListener('touchend',  endDrag);

  function startDrag(e) {
    isDragging = true;
    dragStartX = e.touches ? e.touches[0].clientX : e.clientX;
    dragDelta  = 0;
    stack.style.cursor = 'grabbing';
    if (swipeHint) swipeHint.style.opacity = '0';
  }

  function onDrag(e) {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    var x     = e.touches ? e.touches[0].clientX : e.clientX;
    dragDelta = x - dragStartX;

    /* Feedback en la tarjeta frontal */
    var active = cards[current];
    if (active) {
      var mx = dragDelta * 0.28;
      var ry = dragDelta * 0.018;
      active.style.transition = 'none';
      active.style.transform  = 'translateX(' + mx + 'px) rotateY(' + ry + 'deg) scale(1)';
    }
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    stack.style.cursor = 'grab';

    if      (dragDelta < -DRAG_THRESH) { next(); }
    else if (dragDelta >  DRAG_THRESH) { prev(); }
    else                               { renderStack(0.3); }

    dragDelta = 0;
  }

  /* ── INICIALIZAR ── */
  renderStack(0);

  /* Ocultar swipe hint tras primera interacción */
  ['mousedown', 'touchstart', 'click'].forEach(function (ev) {
    section.addEventListener(ev, function () {
      if (swipeHint) swipeHint.style.display = 'none';
    }, { once: true });
  });

})();
