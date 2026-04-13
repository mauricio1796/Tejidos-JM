/**
 * analytics.js — TechMax Sweaters
 * Tracking de eventos via dataLayer → Google Tag Manager → GA4
 *
 * Eventos rastreados:
 *  - cta_click       : clicks en botones CTA (cotizar, llamar, etc.)
 *  - whatsapp_click  : clicks en botones de WhatsApp
 *  - form_submit     : envio del formulario de cotizacion
 *  - scroll_depth    : profundidad de scroll (25%, 50%, 75%, 100%)
 *  - section_view    : que secciones vio el usuario
 *  - engagement_time : tiempo activo en la pagina (30s, 60s, 120s, 300s)
 */

(function () {
  'use strict';

  /* Asegurar que dataLayer existe antes que GTM lo use */
  window.dataLayer = window.dataLayer || [];

  /* ─── Utilidad para push seguro ─────────────────────────── */
  function push(obj) {
    try { window.dataLayer.push(obj); } catch (e) { /* silencioso */ }
  }

  /* ─── 1. CTA CLICKS (data-track="cta_click") ────────────── */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (!el) return;

    var track = el.getAttribute('data-track');
    var cta   = el.getAttribute('data-cta') || '';
    var label = el.textContent.trim().slice(0, 60);
    var href  = el.getAttribute('href') || '';

    if (track === 'cta_click') {
      push({
        event:      'cta_click',
        cta_id:     cta,
        cta_text:   label,
        cta_url:    href,
        page_section: getSectionFromCta(cta)
      });
    }

    if (track === 'whatsapp_click') {
      push({
        event:        'whatsapp_click',
        click_source: cta || getClosestSectionId(el) || 'unknown',
        cta_text:     label
      });
    }
  }, true);

  function getSectionFromCta(cta) {
    if (!cta) return 'unknown';
    if (cta.indexOf('header')   !== -1) return 'header';
    if (cta.indexOf('hero')     !== -1) return 'hero';
    if (cta.indexOf('pas')      !== -1) return 'beneficios';
    if (cta.indexOf('process')  !== -1) return 'proceso';
    if (cta.indexOf('prefooter')!== -1) return 'prefooter';
    if (cta.indexOf('footer')   !== -1) return 'footer';
    if (cta.indexOf('mobile')   !== -1) return 'menu_mobile';
    return cta;
  }

  function getClosestSectionId(el) {
    var section = el.closest('section, header, footer');
    return section ? (section.id || section.className.split(' ')[0]) : 'unknown';
  }

  /* ─── 2. FORMULARIO DE COTIZACION ───────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {

    /* Formulario principal */
    var form = document.querySelector('[data-track="form_submit"]');
    if (form) {
      /* Inicio de interaccion con el formulario */
      var formStarted = false;
      form.addEventListener('focusin', function () {
        if (!formStarted) {
          formStarted = true;
          push({ event: 'form_start', form_id: 'cotizacion' });
        }
      });

      /* Envio */
      form.addEventListener('submit', function () {
        var empresa  = form.querySelector('[name="empresa"]');
        var cantidad = form.querySelector('[name="cantidad"]');
        push({
          event:           'form_submit',
          form_id:         'cotizacion',
          empresa_tipo:    empresa  ? 'relleno' : 'vacio',
          cantidad_rango:  getCantidadRango(cantidad ? cantidad.value : '')
        });
      });
    }

    /* ─── 3. SCROLL DEPTH ───────────────────────────────── */
    var scrollDepths  = [25, 50, 75, 100];
    var depthsReached = {};

    window.addEventListener('scroll', throttle(function () {
      var scrolled = window.scrollY + window.innerHeight;
      var total    = document.documentElement.scrollHeight;
      var pct      = Math.round((scrolled / total) * 100);

      scrollDepths.forEach(function (depth) {
        if (pct >= depth && !depthsReached[depth]) {
          depthsReached[depth] = true;
          push({ event: 'scroll_depth', depth_percent: depth });
        }
      });
    }, 300), { passive: true });

    /* ─── 4. SECTION VIEW (IntersectionObserver) ─────────── */
    var sections = document.querySelectorAll('section[id], header[id], footer[id]');
    if ('IntersectionObserver' in window) {
      var sectionsSeen = {};
      var sectionObs   = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !sectionsSeen[entry.target.id]) {
            sectionsSeen[entry.target.id] = true;
            push({
              event:      'section_view',
              section_id: entry.target.id,
              section_name: entry.target.getAttribute('aria-labelledby')
                ? document.getElementById(entry.target.getAttribute('aria-labelledby'))
                    ? document.getElementById(entry.target.getAttribute('aria-labelledby')).textContent.trim().slice(0, 60)
                    : entry.target.id
                : entry.target.id
            });
          }
        });
      }, { threshold: 0.4 });

      sections.forEach(function (s) { sectionObs.observe(s); });
    }

    /* ─── 5. ENGAGEMENT TIME ────────────────────────────── */
    var timeMilestones  = [30, 60, 120, 300]; /* segundos */
    var timeReached     = {};
    var startTime       = Date.now();
    var activeTime      = 0;
    var lastActive      = Date.now();
    var isActive        = true;

    /* Detectar inactividad */
    ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(function (ev) {
      document.addEventListener(ev, function () {
        if (!isActive) {
          isActive   = true;
          lastActive = Date.now();
        } else {
          lastActive = Date.now();
        }
      }, { passive: true });
    });

    setInterval(function () {
      var now = Date.now();
      if (isActive && (now - lastActive) < 30000) {
        activeTime += 1;
      } else {
        isActive = false;
      }

      timeMilestones.forEach(function (t) {
        if (activeTime >= t && !timeReached[t]) {
          timeReached[t] = true;
          push({
            event:           'engagement_time',
            seconds_active:  t,
            total_seconds:   Math.round((now - startTime) / 1000)
          });
        }
      });
    }, 1000);

    /* ─── 6. PAGE VISIBILITY (abandono de tab) ──────────── */
    document.addEventListener('visibilitychange', function () {
      push({
        event:       'page_visibility',
        visible:     !document.hidden,
        active_time: activeTime
      });
    });

  }); /* fin DOMContentLoaded */

  /* ─── Helpers ───────────────────────────────────────────── */
  function getCantidadRango(val) {
    var n = parseInt(val, 10);
    if (isNaN(n))  return 'no_especificado';
    if (n < 10)    return '1-9';
    if (n < 25)    return '10-24';
    if (n < 50)    return '25-49';
    if (n < 100)   return '50-99';
    if (n < 200)   return '100-199';
    return '200+';
  }

  function throttle(fn, ms) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= ms) { last = now; fn.apply(this, arguments); }
    };
  }

})();
