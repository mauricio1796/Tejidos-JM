(function () {
  'use strict';

  /* ── CONFIGURACIÓN ── */
  var TOTAL = 8;
  var ANGLE_STEP = 360 / TOTAL; // 45°
  var RADIUS = getRadius();

  /* ── DATOS ── */
  var sweaters = [
    { name: 'Cuello V Ejecutivo',   cat: 'Corporativo',     desc: 'Elegante cuello V para uniformes corporativos.',  tags: ['Lana merino', 'Personalizable'], img: 'tiktok2.png'       },
    { name: 'Crew Neck Clásico',    cat: 'Institucional',   desc: 'Cuello redondo para instituciones educativas.',    tags: ['Algodón premium', 'Durable'],    img: 'tiktok3.png'       },
    { name: 'Cardigan Abotonado',   cat: 'Casual Premium',  desc: 'Cardigan con botones, casual o semi-formal.',      tags: ['Lana blend', 'Versátil'],        img: 'chalecotrenza0.png'},
    { name: 'Cuello Tortuga',       cat: 'Invierno',        desc: 'Cuello alto para temporada fría.',                 tags: ['Lana gruesa', 'Cálido'],         img: 'corazones0.png'    },
    { name: 'Chaleco Institucional',cat: 'Institucional',   desc: 'Chaleco sin mangas para uniformes.',              tags: ['Acrílico premium', 'Ligero'],    img: 'chaleco0.png'      },
    { name: 'Hoodie Corporativo',   cat: 'Casual',          desc: 'Hoodie personalizado con logo.',                   tags: ['Algodón fleece', 'Juvenil'],     img: 'tiktok5.png'       },
    { name: 'Polo Tejido',          cat: 'Deportivo',       desc: 'Polo de punto con cuello y botones.',              tags: ['Algodón piqué', 'Sport'],        img: 'tiktok7.png'       },
    { name: 'Sweater Jacquard',     cat: 'Diseño Especial', desc: 'Patrones tejidos personalizados.',                 tags: ['Lana premium', 'Exclusivo'],     img: 'corazones3.png'    },
  ];

  /* ── REFERENCIAS DOM ── */
  var section   = document.getElementById('gallery-section');
  var cylinder  = document.getElementById('carousel-cylinder');
  var scene     = document.getElementById('carousel-scene');
  var crCurrent = document.getElementById('cr-current');
  var dotsWrap  = document.getElementById('cr-dots');

  if (!cylinder || !scene) return;

  /* ── ESTADO ── */
  var currentAngle  = 0;
  var targetAngle   = 0;
  var isDragging    = false;
  var dragStartX    = 0;
  var dragStartAngle= 0;
  var lastDragX     = 0;
  var lastDragTime  = 0;
  var velocity      = 0;
  var rafId         = null;
  var autoRafId     = null;
  var isAutoRotating= false;

  /* ── CREAR TARJETAS ── */
  sweaters.forEach(function (sw, i) {
    var card = document.createElement('div');
    card.className = 'cr-card';
    card.dataset.index = i;

    /* imagen */
    var imgWrap = document.createElement('div');
    imgWrap.className = 'cr-card-img-wrap';

    var img = document.createElement('img');
    img.src = 'img/' + sw.img;
    img.alt = sw.name + ' - Teji Max Sweaters';
    img.loading = i < 3 ? 'eager' : 'lazy';
    img.addEventListener('error', function () {
      img.style.display = 'none';
      imgWrap.style.background = 'linear-gradient(135deg,#1a2d38,#121E26)';
      var ph = document.createElement('div');
      ph.style.cssText = 'text-align:center;padding-top:30%;color:rgba(255,255,255,0.1);font-family:Montserrat,sans-serif;font-size:12px;font-style:italic;';
      ph.textContent = '[Foto: ' + sw.name + ']';
      imgWrap.appendChild(ph);
    });

    var badge = document.createElement('span');
    badge.className = 'cr-badge';
    badge.textContent = sw.cat;

    imgWrap.appendChild(img);
    imgWrap.appendChild(badge);

    /* info */
    var info = document.createElement('div');
    info.className = 'cr-card-info';

    var nameEl = document.createElement('h3');
    nameEl.className = 'cr-card-name';
    nameEl.textContent = sw.name;

    var descEl = document.createElement('p');
    descEl.className = 'cr-card-desc';
    descEl.textContent = sw.desc;

    var tagsEl = document.createElement('div');
    tagsEl.className = 'cr-card-tags';
    sw.tags.forEach(function (t) {
      var tag = document.createElement('span');
      tag.className = 'cr-card-tag';
      tag.textContent = t;
      tagsEl.appendChild(tag);
    });

    info.appendChild(nameEl);
    info.appendChild(descEl);
    info.appendChild(tagsEl);

    /* borde costura */
    var stitch = document.createElement('div');
    stitch.className = 'cr-card-stitch';
    stitch.setAttribute('aria-hidden', 'true');

    card.appendChild(imgWrap);
    card.appendChild(info);
    card.appendChild(stitch);
    cylinder.appendChild(card);
  });

  var cards = cylinder.querySelectorAll('.cr-card');

  /* ── DOTS ── */
  for (var d = 0; d < TOTAL; d++) {
    var dot = document.createElement('button');
    dot.className = 'cr-dot' + (d === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Sweater ' + (d + 1));
    dot.style.width = d === 0 ? '20px' : '8px';
    dot.addEventListener('click', (function (idx) {
      return function () { rotateTo(idx); };
    })(d));
    dotsWrap.appendChild(dot);
  }

  var dots = dotsWrap.querySelectorAll('.cr-dot');

  /* ── POSICIONAMIENTO Y EFECTOS ── */
  function render() {
    cylinder.style.transform = 'rotateY(' + currentAngle + 'deg)';

    cards.forEach(function (card, i) {
      var cardAngle = ANGLE_STEP * i;
      card.style.transform = 'rotateY(' + cardAngle + 'deg) translateZ(' + RADIUS + 'px)';

      /* distancia angular al frente */
      var diff = ((cardAngle + currentAngle) % 360 + 360) % 360;
      if (diff > 180) diff = 360 - diff;
      var norm = diff / 180; // 0 = frente, 1 = atrás

      card.style.opacity = String(1 - norm * 0.72);
      card.style.filter  = norm > 0.25 ? 'blur(' + (norm * 3.5) + 'px)' : 'none';
      card.style.pointerEvents = diff < 28 ? 'auto' : 'none';
    });

    /* indicadores */
    var front = getFrontIndex();
    if (crCurrent) crCurrent.textContent = String(front + 1).padStart(2, '0');
    dots.forEach(function (dot, i) {
      var active = i === front;
      dot.classList.toggle('active', active);
      dot.style.width = active ? '20px' : '8px';
    });
  }

  function getFrontIndex() {
    var norm = ((-currentAngle % 360) + 360) % 360;
    return Math.round(norm / ANGLE_STEP) % TOTAL;
  }

  /* ── ANIMACIÓN HACIA DESTINO ── */
  function animateTo(target) {
    var start = currentAngle;
    var change = target - start;
    var duration = 620;
    var t0 = performance.now();

    cancelAnimationFrame(rafId);
    function step(now) {
      var p = Math.min((now - t0) / duration, 1);
      var e = 1 - Math.pow(1 - p, 3); // ease-out cubic
      currentAngle = start + change * e;
      render();
      if (p < 1) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  /* ── NAVEGACIÓN ── */
  function rotateTo(index) {
    var desired = -index * ANGLE_STEP;
    var diff = ((desired - currentAngle + 180) % 360) - 180;
    animateTo(currentAngle + diff);
  }

  function next() { animateTo(Math.round((currentAngle - ANGLE_STEP) / ANGLE_STEP) * ANGLE_STEP); }
  function prev() { animateTo(Math.round((currentAngle + ANGLE_STEP) / ANGLE_STEP) * ANGLE_STEP); }

  var btnNext = document.getElementById('cr-next');
  var btnPrev = document.getElementById('cr-prev');
  if (btnNext) btnNext.addEventListener('click', next);
  if (btnPrev) btnPrev.addEventListener('click', prev);

  /* ── DRAG ── */
  function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  scene.addEventListener('mousedown', startDrag);
  scene.addEventListener('touchstart', startDrag, { passive: true });
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: true });
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  function startDrag(e) {
    isDragging = true;
    scene.style.cursor = 'grabbing';
    stopAutoRotate();
    var x = getClientX(e);
    dragStartX    = x;
    lastDragX     = x;
    lastDragTime  = performance.now();
    dragStartAngle= currentAngle;
    velocity      = 0;
    cancelAnimationFrame(rafId);
  }

  function onDrag(e) {
    if (!isDragging) return;
    var x   = getClientX(e);
    var now = performance.now();
    var dt  = now - lastDragTime;
    if (dt > 0) velocity = (x - lastDragX) / dt;
    lastDragX    = x;
    lastDragTime = now;
    currentAngle = dragStartAngle + (x - dragStartX) * 0.28;
    render();
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    scene.style.cursor = 'grab';

    var inertia = velocity * 130;
    var raw     = currentAngle + inertia;
    var snapped = Math.round(raw / ANGLE_STEP) * ANGLE_STEP;
    animateTo(snapped);

    setTimeout(startAutoRotate, 3500);
  }

  /* ── TECLADO ── */
  document.addEventListener('keydown', function (e) {
    var rect = section.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  });

  /* ── AUTO-ROTATE ── */
  function startAutoRotate() {
    if (isAutoRotating || isDragging) return;
    isAutoRotating = true;
    function tick() {
      if (!isAutoRotating) return;
      currentAngle -= 0.06;
      render();
      autoRafId = requestAnimationFrame(tick);
    }
    autoRafId = requestAnimationFrame(tick);
  }

  function stopAutoRotate() {
    isAutoRotating = false;
    cancelAnimationFrame(autoRafId);
  }

  scene.addEventListener('mouseenter', stopAutoRotate);
  scene.addEventListener('mouseleave', function () {
    setTimeout(startAutoRotate, 3000);
  });
  scene.addEventListener('touchstart', stopAutoRotate, { passive: true });

  /* Iniciar auto-rotate cuando la sección es visible */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) startAutoRotate();
        else stopAutoRotate();
      });
    }, { threshold: 0.3 });
    io.observe(section);
  } else {
    startAutoRotate();
  }

  /* ── SCROLL TRIGGER ── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    /* Sección alta + sticky interno para el efecto scroll */
    section.style.minHeight = '250vh';
    var sticky = document.getElementById('gallery-sticky');
    if (sticky) {
      sticky.style.cssText += 'position:sticky;top:0;height:100vh;padding:0;';
    }

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5,
      onUpdate: function (self) {
        if (isDragging) return;
        stopAutoRotate();
        currentAngle = -self.progress * 360 * 1.5;
        render();
      },
      onLeave: function () { startAutoRotate(); },
      onLeaveBack: function () { startAutoRotate(); },
    });

    /* Animación de entrada */
    gsap.from('#gallery-title', {
      opacity: 0, y: 30, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 80%' },
    });
  }

  /* ── RESIZE (radio adaptativo) ── */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      RADIUS = getRadius();
      render();
    }, 200);
  });

  /* ── HELPERS ── */
  function getRadius() {
    var w = window.innerWidth;
    if (w <= 480) return 180;
    if (w <= 768) return 220;
    if (w <= 1024) return 280;
    return 350;
  }

  /* ── INIT ── */
  render();
  scene.style.cursor = 'grab';

})();
