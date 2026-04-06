/**
 * custom-cursor.js
 * Hilo dorado orgánico que sigue el cursor (sin aguja).
 * Cursor del sistema visible (flecha normal).
 * - Hilo: canvas fijo, trail de 22 puntos con curvas quadratic-bezier,
 *         grosor y opacidad decreciente, gravedad al detenerse.
 * - Click: punto de perforación dorado sutil.
 * - Solo desktop (pointer fino, >1024px). Sin dependencias.
 */
(function () {
  'use strict';

  /* ─── Guards ─────────────────────────────────────────────────── */
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.innerWidth <= 1024) return;

  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (rm) return;

  /* ─── Canvas para el hilo ─────────────────────────────────────── */
  var canvas = document.createElement('canvas');
  canvas.id = 'cursor-thread';
  canvas.style.cssText =
    'position:fixed;top:0;left:0;pointer-events:none;z-index:9998;';

  var dpr = window.devicePixelRatio || 1;
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width  = window.innerWidth  + 'px';
  canvas.style.height = window.innerHeight + 'px';
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  /* ─── Estado ──────────────────────────────────────────────────── */
  var mouseX  = window.innerWidth  / 2;
  var mouseY  = window.innerHeight / 2;
  var cursorX = mouseX;
  var cursorY = mouseY;
  var speedX  = 0;
  var speedY  = 0;

  var TRAIL_LEN  = 22;
  var LERP       = 0.14;
  var TRAIL_LERP = 0.10;

  var trail = [];
  for (var ti = 0; ti < TRAIL_LEN; ti++) {
    trail.push({ x: mouseX, y: mouseY });
  }

  /* ─── Idle detection: detiene el loop cuando no hay movimiento ── */
  var loopId    = null;
  var isLooping = false;
  var idleStop  = null;

  function startLoop() {
    if (isLooping) return;
    isLooping = true;
    loopId = requestAnimationFrame(loop);
  }

  function scheduleStop() {
    clearTimeout(idleStop);
    idleStop = setTimeout(function () { isLooping = false; }, 2500);
  }

  /* ─── Mouse move ──────────────────────────────────────────────── */
  document.addEventListener('mousemove', function (e) {
    speedX = e.clientX - mouseX;
    speedY = e.clientY - mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    startLoop();
    scheduleStop();
  }, { passive: true });

  /* ─── Click: punto de perforación ────────────────────────────── */
  var holes = [];

  document.addEventListener('click', function (e) {
    if (holes.length >= 10) {
      var old = holes.shift();
      if (old && old.parentNode) old.parentNode.removeChild(old);
    }

    var dot = document.createElement('div');
    dot.style.cssText =
      'position:fixed;' +
      'left:' + e.clientX + 'px;' +
      'top:'  + e.clientY + 'px;' +
      'width:6px;height:6px;' +
      'border-radius:50%;' +
      'background:rgba(242,197,61,0.55);' +
      'opacity:0;' +
      'transform:translate(-50%,-50%) scale(0);' +
      'pointer-events:none;' +
      'z-index:9997;' +
      'transition:transform 0.12s ease,opacity 0.12s ease;';
    document.body.appendChild(dot);
    holes.push(dot);

    requestAnimationFrame(function () {
      dot.style.opacity   = '1';
      dot.style.transform = 'translate(-50%,-50%) scale(1)';
    });
    setTimeout(function () {
      dot.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      dot.style.opacity    = '0';
      dot.style.transform  = 'translate(-50%,-50%) scale(2.5)';
    }, 120);
    setTimeout(function () {
      if (dot.parentNode) dot.parentNode.removeChild(dot);
      var idx = holes.indexOf(dot);
      if (idx > -1) holes.splice(idx, 1);
    }, 800);
  });

  /* ─── Dibujar hilo ────────────────────────────────────────────── */
  function drawThread() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (trail.length < 2) return;

    for (var i = 1; i < TRAIL_LEN && i < trail.length; i++) {
      var t     = i / TRAIL_LEN;
      var alpha = (1 - t) * 0.75;
      var lw    = 0.6 + (1 - t) * 1.6;

      ctx.beginPath();
      ctx.lineWidth   = lw;
      ctx.lineCap     = 'round';
      ctx.strokeStyle = 'rgba(242,197,61,' + alpha.toFixed(2) + ')';

      if (i === 1) {
        ctx.moveTo(trail[0].x, trail[0].y);
        ctx.lineTo(trail[1].x, trail[1].y);
      } else {
        var pmx = (trail[i - 2].x + trail[i - 1].x) / 2;
        var pmy = (trail[i - 2].y + trail[i - 1].y) / 2;
        var mx  = (trail[i - 1].x + trail[i].x) / 2;
        var my  = (trail[i - 1].y + trail[i].y) / 2;
        ctx.moveTo(pmx, pmy);
        ctx.quadraticCurveTo(trail[i - 1].x, trail[i - 1].y, mx, my);
      }
      ctx.stroke();
    }
  }

  /* ─── Loop de animación ───────────────────────────────────────── */
  function loop() {
    if (!isLooping) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      return;
    }

    cursorX += (mouseX - cursorX) * LERP;
    cursorY += (mouseY - cursorY) * LERP;

    /* Gravedad: el hilo cae levemente cuando el ratón está quieto */
    var speed = Math.sqrt(speedX * speedX + speedY * speedY);
    var grav  = Math.max(0, 1 - speed / 18) * 2.2;
    speedX *= 0.85;
    speedY *= 0.85;

    trail.unshift({ x: cursorX, y: cursorY + grav });
    if (trail.length > TRAIL_LEN) trail.pop();

    /* Suavizar cada punto del trail */
    for (var i = 1; i < trail.length; i++) {
      var factor = TRAIL_LERP * (1 - (i / trail.length) * 0.55);
      trail[i].x += (trail[i - 1].x - trail[i].x) * factor;
      trail[i].y += (trail[i - 1].y - trail[i].y) * factor;
    }

    drawThread();
    loopId = requestAnimationFrame(loop);
  }

  /* El loop arranca solo cuando el usuario mueve el mouse (no en carga) */

  /* ─── Resize ──────────────────────────────────────────────────── */
  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      if (window.innerWidth <= 1024) {
        canvas.style.display = 'none';
        return;
      }
      var d = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * d;
      canvas.height = window.innerHeight * d;
      canvas.style.width  = window.innerWidth  + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx = canvas.getContext('2d');
      ctx.scale(d, d);
    }, 200);
  }, { passive: true });

})();
