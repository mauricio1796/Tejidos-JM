(function () {
  'use strict';

  /* ── Referencias DOM ── */
  var section  = document.getElementById('process-section');
  var clipRect = document.getElementById('stitch-clip-rect');
  var needle   = document.getElementById('machine-needle');
  var wheel    = document.getElementById('machine-wheel');
  var sweater  = document.getElementById('final-sweater');
  var bar      = document.getElementById('process-bar');
  var steps    = document.querySelectorAll('.process-step');
  var pts      = document.querySelectorAll('.stitch-pt');

  if (!section || !clipRect) return;

  /* ── Configuración ──
     El clipRect tiene x=188. La costura llega hasta ~x=900 (máquina→sweater).
     Rango de width: 0 → 714 px SVG. */
  var CLIP_MAX   = 714;
  var THRESHOLDS = [0.18, 0.38, 0.58, 0.78];
  var SWEATER_TH = 0.88;

  var activeSteps  = [false, false, false, false];
  var sweaterShown = false;

  /* ── Animación loop de la aguja ── */
  var needleRafId = null;
  var needleY     = 0;
  var needleDir   = -1;
  var lastTs      = 0;
  var wheelAngle  = 0;

  function animateNeedle(ts) {
    var dt = ts - lastTs;
    lastTs = ts;
    if (dt > 100) dt = 16;

    needleY += needleDir * 0.25 * dt;
    if (needleY <= -8) { needleY = -8; needleDir =  1; }
    if (needleY >=  0) { needleY =  0; needleDir = -1; }

    if (needle) {
      needle.setAttribute('transform', 'translate(0,' + needleY.toFixed(2) + ')');
    }

    wheelAngle = (wheelAngle + 0.18 * dt) % 360;
    if (wheel) {
      wheel.setAttribute('transform',
        'rotate(' + wheelAngle.toFixed(1) + ',145,95)');
    }

    needleRafId = requestAnimationFrame(animateNeedle);
  }

  function startNeedle() {
    if (needleRafId) return;
    lastTs = performance.now();
    needleRafId = requestAnimationFrame(animateNeedle);
  }

  function stopNeedle() {
    cancelAnimationFrame(needleRafId);
    needleRafId = null;
  }

  /* ── Activar / desactivar paso ── */
  function activateStep(i) {
    if (activeSteps[i]) return;
    activeSteps[i] = true;
    if (steps[i]) steps[i].classList.add('active');
    if (pts[i])   pts[i].setAttribute('opacity', '0.9');
  }

  function deactivateStep(i) {
    if (!activeSteps[i]) return;
    activeSteps[i] = false;
    if (steps[i]) steps[i].classList.remove('active');
    if (pts[i])   pts[i].setAttribute('opacity', '0');
  }

  /* ── Actualizar por progreso (0-1) ── */
  function update(progress) {
    /* Costura crece */
    var clipW = Math.max(0, Math.min(CLIP_MAX, progress * CLIP_MAX * 1.08));
    clipRect.setAttribute('width', clipW.toFixed(1));

    /* Pasos */
    THRESHOLDS.forEach(function (thr, i) {
      if (progress >= thr) activateStep(i);
      else                 deactivateStep(i);
    });

    /* Sweater */
    if (progress >= SWEATER_TH && !sweaterShown) {
      sweaterShown = true;
      if (sweater) {
        if (typeof gsap !== 'undefined') {
          gsap.to(sweater, {
            opacity: 1, duration: 0.7, ease: 'power2.out',
          });
        } else {
          sweater.setAttribute('opacity', '1');
        }
      }
    } else if (progress < SWEATER_TH && sweaterShown) {
      sweaterShown = false;
      if (sweater) sweater.setAttribute('opacity', '0');
    }

    /* Barra de progreso */
    if (bar) bar.style.width = (progress * 100).toFixed(1) + '%';
  }

  /* ── GSAP ScrollTrigger ── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger : section,
      start   : 'top top',
      end     : 'bottom bottom',
      scrub   : 1.5,
      onUpdate: function (self) { update(self.progress); },
    });

    /* Entrada del título */
    gsap.from('.ps-title', {
      opacity: 0, y: 26, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 82%', once: true },
    });

  } else {
    /* Fallback scroll nativo */
    var lastProg = -1;
    var rafId    = null;

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        rafId = null;
        var rect  = section.getBoundingClientRect();
        var total = section.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        var prog = Math.min(1, Math.max(0, -rect.top / total));
        if (Math.abs(prog - lastProg) < 0.001) return;
        lastProg = prog;
        update(prog);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── IntersectionObserver: aguja solo anima cuando visible ── */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) startNeedle();
        else                   stopNeedle();
      });
    }, { threshold: 0.05 }).observe(section);
  } else {
    startNeedle();
  }

  update(0);

})();
