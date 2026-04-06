(function () {
  'use strict';

  var sweaters = [
    {
      name: 'Cuello V Ejecutivo',
      cat: 'Corporativo',
      desc: 'Elegante cuello V para uniformes corporativos.',
      tags: ['Lana merino', 'Personalizable'],
      img: 'tiktok2.png',
    },
    {
      name: 'Crew Neck Clásico',
      cat: 'Institucional',
      desc: 'Cuello redondo para instituciones educativas.',
      tags: ['Algodón premium', 'Durable'],
      img: 'tiktok3.png',
    },
    {
      name: 'Cardigan Abotonado',
      cat: 'Casual Premium',
      desc: 'Cardigan con botones, casual o semi-formal.',
      tags: ['Lana blend', 'Versátil'],
      img: 'chalecotrenza0.png',
    },
    {
      name: 'Cuello Tortuga',
      cat: 'Invierno',
      desc: 'Cuello alto para temporada fría.',
      tags: ['Lana gruesa', 'Cálido'],
      img: 'corazones0.png',
    },
    {
      name: 'Chaleco Institucional',
      cat: 'Institucional',
      desc: 'Chaleco sin mangas para uniformes.',
      tags: ['Acrílico premium', 'Ligero'],
      img: 'chaleco0.png',
    },
    {
      name: 'Hoodie Corporativo',
      cat: 'Casual',
      desc: 'Hoodie personalizado con logo.',
      tags: ['Algodón fleece', 'Juvenil'],
      img: 'tiktok5.png',
    },
    {
      name: 'Polo Tejido',
      cat: 'Deportivo',
      desc: 'Polo de punto con cuello y botones.',
      tags: ['Algodón piqué', 'Sport'],
      img: 'tiktok7.png',
    },
    {
      name: 'Sweater Jacquard',
      cat: 'Diseño Especial',
      desc: 'Patrones tejidos personalizados.',
      tags: ['Lana premium', 'Exclusivo'],
      img: 'corazones3.png',
    },
  ];

  var container = document.getElementById('gallery-container');
  if (!container) return;

  // ── CREAR TARJETAS ──
  sweaters.forEach(function (sw, i) {
    var card = document.createElement('div');
    card.className = 'gallery-card';

    // card-bg
    var bg = document.createElement('div');
    bg.className = 'card-bg';

    var img = document.createElement('img');
    img.alt = sw.name + ' - Teji Max Sweaters';
    img.loading = i < 4 ? 'eager' : 'lazy';
    img.src = 'img/' + sw.img;

    img.addEventListener('error', function () {
      img.style.display = 'none';
      var placeholder = document.createElement('div');
      placeholder.style.cssText =
        'text-align:center;padding-top:35%;color:rgba(255,255,255,0.12);' +
        'font-family:Montserrat,sans-serif;font-size:12px;font-style:italic;width:100%;';
      placeholder.textContent = '[Foto: ' + sw.name + ']';
      bg.appendChild(placeholder);
    });

    bg.appendChild(img);

    // card-overlay
    var overlay = document.createElement('div');
    overlay.className = 'card-overlay';

    var badge = document.createElement('span');
    badge.className = 'card-badge';
    badge.textContent = sw.cat;

    var title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = sw.name;

    var desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = sw.desc;

    var tags = document.createElement('div');
    tags.className = 'card-tags';
    sw.tags.forEach(function (t) {
      var tag = document.createElement('span');
      tag.className = 'card-tag';
      tag.textContent = t;
      tags.appendChild(tag);
    });

    overlay.appendChild(badge);
    overlay.appendChild(title);
    overlay.appendChild(desc);
    overlay.appendChild(tags);

    card.appendChild(bg);
    card.appendChild(overlay);
    container.appendChild(card);
  });

  // ── COMPORTAMIENTO TOUCH ──
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouch) {
    document.querySelectorAll('.gallery-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var isActive = card.classList.contains('active');
        document.querySelectorAll('.gallery-card.active').forEach(function (c) {
          c.classList.remove('active');
        });
        if (!isActive) card.classList.add('active');
      });
    });
  }

  // ── ANIMACIÓN DE ENTRADA (GSAP, opcional) ──
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.from('.gallery-card', {
      opacity: 0,
      y: 40,
      scale: 0.95,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#gallery-section',
        start: 'top 75%',
      },
    });
  }
})();
