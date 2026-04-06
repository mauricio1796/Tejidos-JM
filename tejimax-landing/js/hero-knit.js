/**
 * hero-knit.js — Parallax de mouse para el hero.
 * Optimizado: idle detection, LERP aumentado, sin toFixed en RAF.
 */
(function () {
  'use strict';

  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.innerWidth <= 1024) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var knitBg      = document.getElementById('hero-knit-bg');
  var sweaterWrap = document.getElementById('hero-sweater-parallax');
  if (!knitBg || !sweaterWrap) return;

  var tBgX = 0, tBgY = 0;
  var cBgX = 0, cBgY = 0;
  var tSwX = 0, tSwY = 0;
  var cSwX = 0, cSwY = 0;
  var rafId = null;
  var idleTimer = null;
  var isRunning = false;

  var LERP = 0.12; /* aumentado de 0.05 — converge más rápido, menos frames necesarios */
  var THRESHOLD = 0.01; /* parar el loop cuando el movimiento es imperceptible */

  function tick() {
    cBgX += (tBgX - cBgX) * LERP;
    cBgY += (tBgY - cBgY) * LERP;
    cSwX += (tSwX - cSwX) * LERP;
    cSwY += (tSwY - cSwY) * LERP;

    knitBg.style.transform      = 'translate(' + (cBgX | 0) + 'px,' + (cBgY | 0) + 'px)';
    sweaterWrap.style.transform = 'translate(' + (cSwX | 0) + 'px,' + (cSwY | 0) + 'px)';

    /* Parar el loop si ya convergió */
    var dx = Math.abs(tBgX - cBgX) + Math.abs(tBgY - cBgY);
    if (dx < THRESHOLD) {
      isRunning = false;
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (!isRunning) {
      isRunning = true;
      rafId = requestAnimationFrame(tick);
    }
  }

  document.addEventListener('mousemove', function (e) {
    var nx = (e.clientX / window.innerWidth  - 0.5) * 2;
    var ny = (e.clientY / window.innerHeight - 0.5) * 2;

    tBgX =  nx * 15;
    tBgY =  ny * 10;
    tSwX = -nx * 8;
    tSwY = -ny * 5;

    startLoop();

    /* Parar definitivamente si hay 3s sin movimiento */
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      tBgX = tBgY = tSwX = tSwY = 0;
      startLoop();
    }, 3000);
  }, { passive: true });

  window.addEventListener('resize', function () {
    if (window.innerWidth <= 1024) {
      knitBg.style.transform      = '';
      sweaterWrap.style.transform = '';
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; isRunning = false; }
    }
  }, { passive: true });

})();
