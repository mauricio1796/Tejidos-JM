/**
 * thread-animation.js
 * Hilo de doble hebra (#F2C53D + #D4A82E) que se descuelga desde un ovillo
 * al hacer scroll por el lateral izquierdo de la página.
 * GSAP ScrollTrigger (scrub:1.5) con fallback nativo.
 * Solo desktop (>1024px). Respeta prefers-reduced-motion.
 */
(function () {
  'use strict';

  if (window.innerWidth <= 1024) return;

  var NS  = 'http://www.w3.org/2000/svg';

  /* ─── Configuración ─────────────────────────────────────────── */
  var CFG = {
    cx         : 45,     /* eje horizontal del hilo                  */
    amp        : 4,      /* amplitud del entrelazado (px a cada lado) */
    period     : 35,     /* distancia entre cruces (px)               */
    gravAmp    : 7,      /* amplitud ondulación de gravedad           */
    gravPeriod : 200,    /* período de la onda de gravedad            */
    yBallCY    : 15,     /* centro Y del ovillo                       */
    yStart     : 30,     /* donde arranca el hilo (bajo el ovillo)    */
    colorA     : '#F2C53D',
    colorB     : '#D4A82E',
    strokeW    : 2.5,
    scrub      : 1.5,
  };

  /* ─── Helpers SVG ────────────────────────────────────────────── */
  function mkEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, String(attrs[k])); });
    return el;
  }

  /* ─── Genera los paths de doble hebra ───────────────────────── */
  function buildPaths(vh) {
    var pA = [], pB = [];
    var halfPeriod = CFG.period / 2;

    for (var y = CFG.yStart; y <= vh; y += 1.5) {
      var t    = (y / CFG.period) * Math.PI * 2;
      var grav = Math.sin(y / CFG.gravPeriod) * CFG.gravAmp;
      var sinT = Math.sin(t);
      pA.push((CFG.cx + sinT  * CFG.amp + grav).toFixed(2) + ' ' + y.toFixed(1));
      pB.push((CFG.cx - sinT  * CFG.amp + grav).toFixed(2) + ' ' + y.toFixed(1));
    }

    /* Puntos de cruce: sin(t)=0  →  y = k * period/2 */
    var crossings = [];
    var firstCross = Math.ceil(CFG.yStart / halfPeriod) * halfPeriod;
    for (var cy = firstCross; cy <= vh; cy += halfPeriod) {
      crossings.push({
        y: cy,
        x: parseFloat((CFG.cx + Math.sin(cy / CFG.gravPeriod) * CFG.gravAmp).toFixed(1)),
      });
    }

    return {
      dA: 'M ' + pA.join(' L '),
      dB: 'M ' + pB.join(' L '),
      crossings: crossings,
    };
  }

  /* ─── Construye el SVG ───────────────────────────────────────── */
  function buildSVG(dA, dB, crossings, vh) {
    var svg = mkEl('svg', {
      id: 'thread-svg',
      width: '90',
      height: vh,
      viewBox: '0 0 90 ' + vh,
      'aria-hidden': 'true',
    });
    svg.style.display  = 'block';
    svg.style.overflow = 'visible';

    /* ── Ovillo de lana ── */
    var yarnBall = mkEl('g', { id: 'yarn-ball' });

    /* sombra del ovillo */
    yarnBall.appendChild(mkEl('ellipse', {
      cx: '47', cy: '31', rx: '11', ry: '3', fill: '#000', opacity: '0.07',
    }));
    /* cuerpo */
    yarnBall.appendChild(mkEl('circle', {
      cx: '45', cy: CFG.yBallCY, r: '14', fill: CFG.colorA, opacity: '0.92',
    }));
    /* vueltas de lana enrollada */
    [
      { rx: '12', ry: '8',  s: '#D4A82E', sw: '0.8', r: '20'  },
      { rx: '11', ry: '6',  s: '#D4A82E', sw: '0.6', r: '-30' },
      { rx: '10', ry: '9',  s: '#D4A82E', sw: '0.5', r: '60'  },
      { rx: '8',  ry: '5',  s: '#B8941F', sw: '0.4', r: '-10' },
      { rx: '6',  ry: '11', s: '#D4A82E', sw: '0.4', r: '80'  },
    ].forEach(function (e) {
      yarnBall.appendChild(mkEl('ellipse', {
        cx: '45', cy: CFG.yBallCY,
        rx: e.rx, ry: e.ry,
        fill: 'none', stroke: e.s, 'stroke-width': e.sw,
        transform: 'rotate(' + e.r + ',45,' + CFG.yBallCY + ')',
      }));
    });
    /* brillo */
    yarnBall.appendChild(mkEl('circle', { cx: '41', cy: '10', r: '4', fill: '#fff', opacity: '0.12' }));

    svg.appendChild(yarnBall);

    /* ── Hebra B (capa inferior) ── */
    var bShadow = mkEl('path', {
      id: 'strand-b-shadow', d: dB, fill: 'none',
      stroke: '#000', 'stroke-width': '4.5', 'stroke-linecap': 'round', opacity: '0.06',
    });
    var strandB = mkEl('path', {
      id: 'strand-b', d: dB, fill: 'none',
      stroke: CFG.colorB, 'stroke-width': CFG.strokeW, 'stroke-linecap': 'round',
    });
    var bHigh = mkEl('path', {
      id: 'strand-b-hi', d: dB, fill: 'none',
      stroke: '#fff', 'stroke-width': '0.8', 'stroke-linecap': 'round', opacity: '0.12',
    });
    svg.appendChild(bShadow);
    svg.appendChild(strandB);
    svg.appendChild(bHigh);

    /* ── Sombras en puntos de cruce (efecto de profundidad) ── */
    var crossG = mkEl('g', { id: 'cross-shadows' });
    crossings.forEach(function (c, i) {
      /* Alternar: en cruces pares la sombra refuerza que B pasa por encima de A */
      if (i % 2 === 0) {
        crossG.appendChild(mkEl('line', {
          x1: c.x - 3, y1: c.y,
          x2: c.x + 3, y2: c.y,
          stroke: '#000', 'stroke-width': '2.4',
          opacity: '0.13', 'stroke-linecap': 'round',
        }));
      }
    });
    svg.appendChild(crossG);

    /* ── Hebra A (capa superior) ── */
    var aShadow = mkEl('path', {
      id: 'strand-a-shadow', d: dA, fill: 'none',
      stroke: '#000', 'stroke-width': '4.5', 'stroke-linecap': 'round', opacity: '0.06',
    });
    var strandA = mkEl('path', {
      id: 'strand-a', d: dA, fill: 'none',
      stroke: CFG.colorA, 'stroke-width': CFG.strokeW, 'stroke-linecap': 'round',
    });
    var aHigh = mkEl('path', {
      id: 'strand-a-hi', d: dA, fill: 'none',
      stroke: '#fff', 'stroke-width': '0.8', 'stroke-linecap': 'round', opacity: '0.15',
    });
    svg.appendChild(aShadow);
    svg.appendChild(strandA);
    svg.appendChild(aHigh);

    return { svg: svg, yarnBall: yarnBall, strandA: strandA, strandB: strandB,
             aShadow: aShadow, bShadow: bShadow, aHigh: aHigh, bHigh: bHigh };
  }

  /* ─── Inicializa stroke-dash en un elemento ─────────────────── */
  function initDash(el) {
    var len = el.getTotalLength();
    el.setAttribute('stroke-dasharray',  len);
    el.setAttribute('stroke-dashoffset', len);
    return len;
  }

  /* ─── Setup principal ───────────────────────────────────────── */
  function setup() {
    var container = document.getElementById('sewing-thread-container');
    if (!container) return;
    container.innerHTML = '';

    var vh  = window.innerHeight;
    var gen = buildPaths(vh);
    var els = buildSVG(gen.dA, gen.dB, gen.crossings, vh);
    container.appendChild(els.svg);

    var animated = [els.strandA, els.strandB, els.aShadow, els.bShadow, els.aHigh, els.bHigh];
    var lengths  = animated.map(initDash);

    /* Prefers-reduced-motion: mostrar hilo completo estático */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animated.forEach(function (el) { el.setAttribute('stroke-dashoffset', '0'); });
      return;
    }

    /* ── GSAP ── */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      var stConfig = {
        trigger: document.documentElement,
        start  : 'top top',
        end    : 'bottom bottom',
        scrub  : CFG.scrub,
      };

      /* Descuelgue del hilo (hebras A y B ligeramente desfasadas) */
      var tl = gsap.timeline({ scrollTrigger: stConfig });
      tl.to(els.strandA, { attr: { 'stroke-dashoffset': 0 }, ease: 'none', duration: 1 }, 0);
      tl.to(els.aShadow, { attr: { 'stroke-dashoffset': 0 }, ease: 'none', duration: 1 }, 0);
      tl.to(els.aHigh,   { attr: { 'stroke-dashoffset': 0 }, ease: 'none', duration: 1 }, 0);
      tl.to(els.strandB, { attr: { 'stroke-dashoffset': 0 }, ease: 'none', duration: 1 }, 0.01);
      tl.to(els.bShadow, { attr: { 'stroke-dashoffset': 0 }, ease: 'none', duration: 1 }, 0.01);
      tl.to(els.bHigh,   { attr: { 'stroke-dashoffset': 0 }, ease: 'none', duration: 1 }, 0.01);

      /* Ovillo gira mientras se desenrolla */
      gsap.to(els.yarnBall, {
        rotation    : 1080,
        svgOrigin   : '45 ' + CFG.yBallCY,
        ease        : 'none',
        scrollTrigger: stConfig,
      });

    } else {
      /* ── Fallback: scroll nativo + RAF ── */
      var lastProg = -1;
      var rafId    = null;

      function update() {
        rafId = null;
        var maxS = document.documentElement.scrollHeight - window.innerHeight;
        var prog = maxS > 0 ? Math.min(1, window.scrollY / maxS) : 0;
        if (Math.abs(prog - lastProg) < 0.0008) return;
        lastProg = prog;
        animated.forEach(function (el, i) {
          el.setAttribute('stroke-dashoffset', String(lengths[i] * (1 - prog)));
        });
      }

      window.addEventListener('scroll', function () {
        if (!rafId) rafId = requestAnimationFrame(update);
      }, { passive: true });

      update();
    }
  }

  /* ─── Boot ───────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }

  /* ─── Resize ─────────────────────────────────────────────────── */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth <= 1024) return;
      setup();
    }, 300);
  }, { passive: true });

})();
