/**
 * zipper-reveal.js
 * Cremallera vertical en V que revela "¿Cómo Trabajamos?".
 * El tirador grande dorado (#F2C53D) empieza arriba centrado.
 * Al arrastrarlo hacia abajo, las dos mitades de tela se curvan
 * hacia la izquierda y derecha formando una V cuya apertura
 * crece de arriba hacia abajo mientras el tirador desciende.
 * 100 % Vanilla JS + SVG + CSS clip-path. Sin dependencias.
 */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    var section = document.getElementById('proceso');
    if (!section) return;
    if (sessionStorage.getItem('zipperOpened') === 'true') return;
    buildZipper(section);
  }

  /* ─── Construye la estructura DOM del zipper ─────────────────── */
  function buildZipper(section) {
    var NS = 'http://www.w3.org/2000/svg';

    /* Wrapper que envuelve la sección original */
    var wrapper = document.createElement('div');
    wrapper.id = 'como-trabajamos-wrapper';
    section.parentNode.insertBefore(wrapper, section);

    /* Contenido real dentro del wrapper */
    var content = document.createElement('div');
    content.id = 'zp-content';
    content.setAttribute('aria-hidden', 'true');
    content.appendChild(section);
    wrapper.appendChild(content);

    /* Tela izquierda */
    var fabricLeft = document.createElement('div');
    fabricLeft.id = 'zp-fabric-left';
    wrapper.appendChild(fabricLeft);

    /* Tela derecha */
    var fabricRight = document.createElement('div');
    fabricRight.id = 'zp-fabric-right';
    wrapper.appendChild(fabricRight);

    /* SVG contenedor de los dientes */
    var teethSVG = document.createElementNS(NS, 'svg');
    teethSVG.id = 'zp-teeth-svg';
    teethSVG.setAttribute('xmlns', NS);
    teethSVG.setAttribute('aria-hidden', 'true');
    wrapper.appendChild(teethSVG);

    /* Tirador grande y dorado */
    var pull = document.createElement('div');
    pull.id = 'zp-pull';
    pull.setAttribute('role', 'slider');
    pull.setAttribute('tabindex', '0');
    pull.setAttribute('aria-label', 'Desliza hacia abajo para abrir y ver cómo trabajamos');
    pull.setAttribute('aria-valuemin', '0');
    pull.setAttribute('aria-valuemax', '100');
    pull.setAttribute('aria-valuenow', '0');
    pull.setAttribute('aria-orientation', 'vertical');
    pull.innerHTML =
      '<svg width="50" height="65" viewBox="0 0 50 65" xmlns="' + NS + '">' +
        '<rect x="7" y="0" width="36" height="38" rx="6" fill="#F2C53D" stroke="#D4A82E" stroke-width="1.5"/>' +
        '<rect x="11" y="4" width="10" height="30" rx="3" fill="#fff" opacity="0.12"/>' +
        '<rect x="16" y="12" width="18" height="10" rx="2" fill="#D4A82E" stroke="#B8941F" stroke-width="0.5"/>' +
        '<rect x="18" y="14" width="14" height="6" rx="1.5" fill="#121E26"/>' +
        '<line x1="15" y1="28" x2="35" y2="28" stroke="#B8860B" stroke-width="1" stroke-linecap="round"/>' +
        '<line x1="15" y1="31" x2="35" y2="31" stroke="#B8860B" stroke-width="1" stroke-linecap="round"/>' +
        '<line x1="15" y1="34" x2="35" y2="34" stroke="#B8860B" stroke-width="1" stroke-linecap="round"/>' +
        '<path d="M16,38 Q16,56 25,60 Q34,56 34,38" fill="none" stroke="#F2C53D" stroke-width="4.5" stroke-linecap="round"/>' +
        '<path d="M19,38 Q19,52 25,55 Q31,52 31,38" fill="none" stroke="#D4A82E" stroke-width="1.5" stroke-linecap="round"/>' +
        '<rect x="7" y="0" width="36" height="38" rx="6" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="3"/>' +
      '</svg>';
    wrapper.appendChild(pull);

    /* Texto de invitación */
    var hint = document.createElement('div');
    hint.id = 'zp-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML =
      '<div class="zp-hint__main">' +
        '<span class="zp-hint__arrow">↓</span> Desliza la cremallera' +
      '</div>' +
      '<div class="zp-hint__sub">para descubrir cómo trabajamos</div>';
    wrapper.appendChild(hint);

    /* Dos rAF garantizan que wrapper ya tiene dimensiones reales */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        runZipper({ wrapper: wrapper, content: content,
                    fabricLeft: fabricLeft, fabricRight: fabricRight,
                    teethSVG: teethSVG, pull: pull, hint: hint, NS: NS });
      });
    });
  }

  /* ─── Lógica central ─────────────────────────────────────────── */
  function runZipper(refs) {
    var wrapper     = refs.wrapper;
    var content     = refs.content;
    var fabricLeft  = refs.fabricLeft;
    var fabricRight = refs.fabricRight;
    var teethSVG    = refs.teethSVG;
    var pull        = refs.pull;
    var hint        = refs.hint;
    var NS          = refs.NS;

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Dimensiones */
    var W  = wrapper.offsetWidth;
    var H  = wrapper.offsetHeight;
    var CX = W / 2;                     /* centro horizontal */

    /* Recorrido del tirador */
    var PULL_Y_MIN = 18;
    var PULL_Y_MAX = H - 78;            /* 78 ≈ SVG height (65) + margen */
    var TRAVEL     = PULL_Y_MAX - PULL_Y_MIN;
    var MAX_OPEN_X = W * 0.44;          /* apertura máxima: 44% del ancho por lado */

    /* Estado */
    var pullY      = PULL_Y_MIN;
    var isDragging = false;
    var dragOriginY    = 0;
    var dragOriginPull = 0;
    var animating  = false;
    var rafId      = null;

    /* Posición inicial del tirador (centrado, arriba) */
    pull.style.left = (CX - 25) + 'px'; /* 25 = SVG width / 2 */
    pull.style.top  = PULL_Y_MIN + 'px';

    /* ── Dimensiones del SVG de dientes ── */
    teethSVG.setAttribute('width',   W);
    teethSVG.setAttribute('height',  H);
    teethSVG.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    /* Cinta de cierre (solo visible en la zona no abierta, debajo del tirador) */
    var tape = document.createElementNS(NS, 'line');
    tape.id = 'zp-tape';
    tape.setAttribute('x1', CX);
    tape.setAttribute('x2', CX);
    tape.setAttribute('stroke', '#3a4a55');
    tape.setAttribute('stroke-width', '4');
    tape.setAttribute('stroke-linecap', 'round');
    teethSVG.appendChild(tape);

    /* ── Generar dientes ── */
    var teeth    = [];
    var TW       = 6;   /* ancho del diente */
    var TH       = 7;   /* alto del diente */
    var T_SPACE  = 13;
    var T_START  = 92;  /* empieza debajo de la SVG del tirador */

    for (var ty = T_START; ty < H - 10; ty += T_SPACE) {
      /* Diente izquierdo: cuelga a la izquierda del centro */
      var tLeft = makeTooth(NS, CX - TW - 2, ty, TW, TH);
      /* Diente derecho: desplazado T_SPACE/2 para entrelazar */
      var tyRight = ty + T_SPACE / 2;
      var tRight  = makeTooth(NS, CX + 2, tyRight, TW, TH);
      teethSVG.insertBefore(tLeft, tape);
      teethSVG.insertBefore(tRight, tape);
      teeth.push({ y: ty, yRight: tyRight, left: tLeft, right: tRight });
    }

    /* Render inicial */
    updateZipper(pullY);

    /* ── Drag: mouse ── */
    pull.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    /* ── Drag: touch ── */
    pull.addEventListener('touchstart', onDragStart, { passive: false });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd, { passive: true });

    /* ── Teclado ── */
    pull.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hint.style.opacity = '0';
        animateTo(PULL_Y_MAX, 720, onFullyOpen);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        animateTo(PULL_Y_MIN, 420, function () {
          hint.style.transition = 'opacity 0.4s ease';
          hint.style.opacity = '1';
        });
      }
    });

    /* ─── Handlers de arrastre ──────────────────────────────────── */
    function onDragStart(e) {
      e.preventDefault();
      isDragging  = true;
      animating   = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }

      dragOriginY    = e.touches ? e.touches[0].clientY : e.clientY;
      dragOriginPull = pullY;
      pull.style.cursor = 'grabbing';
      hint.style.opacity = '0';
    }

    function onDragMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      var delta   = clientY - dragOriginY;

      /* Resistencia al inicio (primeros 28 px cuestan más) */
      if (dragOriginPull <= PULL_Y_MIN + 5 && delta > 0 && delta < 28) {
        delta *= (0.35 + 0.65 * (delta / 28));
      }

      pullY = Math.min(Math.max(dragOriginPull + delta, PULL_Y_MIN), PULL_Y_MAX);
      updateZipper(pullY);
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      pull.style.cursor = 'grab';

      var progress = TRAVEL > 0 ? (pullY - PULL_Y_MIN) / TRAVEL : 0;

      if (progress >= 0.35) {
        animateTo(PULL_Y_MAX, 690, onFullyOpen);
      } else {
        animateTo(PULL_Y_MIN, 420, function () {
          hint.style.transition = 'opacity 0.4s ease';
          hint.style.opacity = '1';
        });
      }
    }

    /* ─── Actualiza toda la visual ──────────────────────────────── */
    function updateZipper(py) {
      var progress = TRAVEL > 0 ? Math.min(Math.max((py - PULL_Y_MIN) / TRAVEL, 0), 1) : 0;
      var openX    = progress * MAX_OPEN_X;

      /* Posición del tirador */
      pull.style.top = py + 'px';
      pull.setAttribute('aria-valuenow', Math.round(progress * 100));

      /* Clip-paths de las telas */
      var clips = computeClips(py, openX);
      fabricLeft.style.clipPath  = clips.left;
      fabricRight.style.clipPath = clips.right;

      /* Cinta: solo zona cerrada debajo del tirador */
      tape.setAttribute('y1', py + 66);
      tape.setAttribute('y2', H);

      /* Dientes */
      updateTeeth(py, openX, progress);

      /* Opacidad del contenido */
      content.style.opacity = Math.min(progress * 2, 1).toFixed(3);
    }

    /* ─── Clip-path de las telas ────────────────────────────────── */
    /*
     * La V se abre ENCIMA del tirador (área ya "desabrochada").
     *
     *  - Vértice de la V en (CX, pullY) — posición del tirador
     *  - La apertura se ensancha hacia ARRIBA (y → 0)
     *  - En y=0: apertura = ±openX (máxima cuando progress=1)
     *  - En y=pullY: apertura = 0 (V tip)
     *
     *  Curva ease-in cuadrática: poca apertura cerca del tirador,
     *  máxima apertura en el borde superior.
     */
    function computeClips(py, openX) {
      var NUM_PTS = 10;

      /*
       * LEFT FABRIC polygon (en sentido horario):
       *   (0,H) → (CX,H) → (CX,py) → [curva sube hacia izquierda] → (0,0) → cierra
       */
      var leftPts  = [[0, H], [CX, H], [CX, py]];
      var rightPts = [[W, H], [CX, H], [CX, py]];

      /* Curva desde el tirador subiendo hacia el borde superior */
      for (var i = 0; i <= NUM_PTS; i++) {
        var t     = i / NUM_PTS;     /* 0 = tirador, 1 = borde superior */
        var y     = py * (1 - t);    /* py → 0 */
        var eased = t * t;           /* ease-in: pequeño cerca del tirador, grande arriba */
        leftPts.push([CX - openX * eased, y]);
        rightPts.push([CX + openX * eased, y]);
      }

      /* Esquinas superiores para cerrar el polígono */
      leftPts.push([0, 0]);
      rightPts.push([W, 0]);

      return {
        left  : ptsToClip(leftPts),
        right : ptsToClip(rightPts),
      };
    }

    function ptsToClip(pts) {
      return 'polygon(' +
        pts.map(function (p) {
          return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px';
        }).join(', ') +
        ')';
    }

    /* ─── Actualiza la posición de los dientes ──────────────────── */
    function updateTeeth(py, openX, progress) {
      teeth.forEach(function (t) {

        /* Diente izquierdo */
        if (t.y < py) {
          /* Por encima del tirador: separado hacia la izquierda */
          var tL    = py > 0 ? (py - t.y) / py : 1;   /* 0 en tirador, 1 en y=0 */
          var eL    = tL * tL;
          t.left.setAttribute('x', (CX - openX * eL - TW).toFixed(1));
        } else {
          t.left.setAttribute('x', CX - TW - 2);
        }

        /* Diente derecho (posición y desplazada T_SPACE/2 para entrelazar) */
        if (t.yRight < py) {
          var tR = py > 0 ? (py - t.yRight) / py : 1;
          var eR = tR * tR;
          t.right.setAttribute('x', (CX + openX * eR).toFixed(1));
        } else {
          t.right.setAttribute('x', CX + 2);
        }

        /* Fade-out gradual una vez que la apertura supera el 60% */
        var alpha = progress > 0.60
          ? Math.max(0, 1 - (progress - 0.60) / 0.40).toFixed(3)
          : '1';
        t.left.style.opacity  = alpha;
        t.right.style.opacity = alpha;
      });
    }

    /* ─── Animación auto-completar / cerrar ─────────────────────── */
    function animateTo(targetPY, durationMs, onDone) {
      if (animating) return;
      animating = true;
      var startPY = pullY;
      var startTs = performance.now();

      function step(ts) {
        var elapsed = ts - startTs;
        var raw     = Math.min(elapsed / durationMs, 1);
        var eased   = 1 - Math.pow(1 - raw, 3);   /* ease-out cubic */
        pullY = startPY + (targetPY - startPY) * eased;
        updateZipper(pullY);

        if (raw < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          animating = false;
          rafId = null;
          if (onDone) onDone();
        }
      }
      rafId = requestAnimationFrame(step);
    }

    /* ─── Cremallera completamente abierta ──────────────────────── */
    function onFullyOpen() {
      [fabricLeft, fabricRight, pull, teethSVG, hint].forEach(function (el) {
        el.style.transition = 'opacity 0.5s ease';
        el.style.opacity    = '0';
      });

      setTimeout(function () {
        [fabricLeft, fabricRight, pull, teethSVG, hint].forEach(function (el) {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
        content.style.opacity = '1';
        content.removeAttribute('aria-hidden');
        wrapper.style.overflow = 'visible';
        wrapper.style.position = 'static';
        if (window.AOS) {
          setTimeout(function () { window.AOS.refresh(); }, 100);
        }
      }, 560);

      sessionStorage.setItem('zipperOpened', 'true');
    }

    /* ─── Jiggle al entrar en viewport ─────────────────────────── */
    if (!reducedMotion && typeof IntersectionObserver !== 'undefined') {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          if (typeof pull.animate === 'function') {
            pull.animate([
              { transform: 'translateY(0px)' },
              { transform: 'translateY(20px)' },
              { transform: 'translateY(0px)' },
              { transform: 'translateY(13px)' },
              { transform: 'translateY(0px)' },
            ], { duration: 1050, easing: 'ease-in-out', fill: 'none' });
          }
          obs.disconnect();
        });
      }, { threshold: 0.25 });
      obs.observe(wrapper);
    }
  }

  /* ─── Helper: crea un diente SVG ────────────────────────────── */
  function makeTooth(NS, x, y, w, h) {
    var r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', x);
    r.setAttribute('y', y);
    r.setAttribute('width', w);
    r.setAttribute('height', h);
    r.setAttribute('rx', '1.8');
    r.setAttribute('fill', '#F2C53D');
    r.setAttribute('stroke', '#C08000');
    r.setAttribute('stroke-width', '0.5');
    return r;
  }

})();
