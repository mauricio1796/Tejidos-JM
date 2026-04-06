# Teji Max Sweaters — Landing Page

Landing page profesional de alto rendimiento y conversion para **Teji Max Sweaters**, fabrica colombiana con mas de 25 años de experiencia en sweaters personalizados.

---

## Estructura del Proyecto

```
tejimax-landing/
├── index.html                  # Pagina principal (single page)
├── css/
│   ├── styles.css              # Estilos principales y sistema de diseño
│   ├── animations.css          # Keyframes, transiciones y microinteracciones
│   └── responsive.css          # Media queries mobile-first
├── js/
│   ├── main.js                 # Logica: scroll, counters, FAQ, swiper, AOS
│   ├── animations.js           # GSAP + ScrollTrigger animations
│   └── form.js                 # Validacion y envio a HubSpot CRM
├── assets/
│   ├── images/                 # Imagenes (ver lista de placeholders abajo)
│   └── icons/                  # Iconos SVG adicionales
└── README.md
```

---

## Inicio Rapido

### Opcion A — Abrir directamente en el navegador

1. Descarga o clona el proyecto.
2. Abre `index.html` en tu navegador.
3. No requiere servidor ni dependencias NPM.

### Opcion B — Servidor local (recomendado para desarrollo)

```bash
# Con Python
python -m http.server 3000

# Con Node.js / npx
npx serve .

# Con VS Code: usa la extension "Live Server"
```

Luego abre: `http://localhost:3000`

---

## Lista de Imagenes a Reemplazar

Todos los placeholders visuales deben ser reemplazados con imagenes reales de Teji Max:

| Archivo | Descripcion | Dimension Recomendada | Formato |
|---|---|---|---|
| `assets/images/logo-tejimax.png` | Logo principal (color) | 320x100 px | PNG con fondo transparente |
| `assets/images/logo-tejimax-white.png` | Logo blanco | 320x100 px | PNG con fondo transparente |
| `assets/images/logo-tejimax-black.png` | Logo negro | 320x100 px | PNG con fondo transparente |
| `assets/images/hero-sweater.webp` | Imagen hero principal | 700x800 px | WebP (con fallback JPG) |
| `assets/images/og-image.jpg` | Open Graph para redes sociales | 1200x630 px | JPG |
| `assets/images/favicon.ico` | Favicon | 32x32 px | ICO o PNG |

### Como reemplazar las imagenes del logo

1. Coloca los archivos en `assets/images/`.
2. En `index.html`, busca `logo-placeholder` y quita la clase que oculta las etiquetas `<img>`:
   ```css
   /* En styles.css, buscar y eliminar: */
   .header__logo img { display: none; }
   ```
3. Asegurate de que los `src` en el HTML correspondan a los nombres de archivo correctos.

### Como reemplazar la imagen hero

En `index.html`, seccion hero, descomenta el bloque `<picture>`:
```html
<picture>
  <source srcset="assets/images/hero-sweater.webp" type="image/webp">
  <img
    src="assets/images/hero-sweater.jpg"
    alt="Coleccion de sweaters artesanales Teji Max"
    class="hero__image"
    width="700"
    height="800"
    fetchpriority="high"
  >
</picture>
```
Y elimina el bloque `.hero__image-placeholder`.

---

## Configuracion de HubSpot CRM

### 1. Obtener credenciales

1. Inicia sesion en [HubSpot](https://app.hubspot.com).
2. **Portal ID**: `Settings > Account Setup > Account > Account ID`.
3. **Form ID**: `Marketing > Lead Capture > Forms`, abre tu formulario y copia el ID de la URL.

### 2. Configurar en el codigo

**En `js/form.js`**, reemplaza:
```javascript
const HUBSPOT_CONFIG = {
  portalId: 'TU_PORTAL_ID',   // Reemplazar
  formId:   'TU_FORM_ID',     // Reemplazar
  region:   'na1',
};
```

**Alternativa:** Usa los atributos `data-` en el formulario HTML:
```html
<form
  id="lead-form"
  data-hubspot-portal="12345678"
  data-hubspot-form="abcd1234-..."
>
```

### 3. Instalar HubSpot Tracking Code

En `index.html`, descomenta y configura:
```html
<script type="text/javascript" id="hs-script-loader" async defer
  src="//js.hs-scripts.com/TU_PORTAL_ID.js">
</script>
```

### 4. Campos del formulario en HubSpot

Crea estos campos en HubSpot > Settings > Properties > Contact Properties:

| Campo HubSpot | Tipo | Descripcion |
|---|---|---|
| `firstname` | Text | Nombre del contacto |
| `email` | Email | Correo electronico |
| `mobilephone` | Phone | WhatsApp |
| `what_are_you_interested_in` | Dropdown | Tipo de interes |

---

## Configuracion de Analytics

### Google Analytics 4

En `index.html`, descomenta y reemplaza `G-XXXXXXXXXX`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Meta Pixel (Facebook / Instagram)

En `index.html`, descomenta y reemplaza `YOUR_PIXEL_ID`:
```html
<!-- Agregar el snippet completo del Meta Pixel -->
```

### Eventos de tracking incluidos

| Evento | Cuando se dispara |
|---|---|
| `cta_click` | Clic en cualquier boton CTA |
| `form_submit` | Envio exitoso del formulario |
| `form_attempt` | Intento de envio (antes de validar) |
| `form_error` | Error al enviar el formulario |
| `whatsapp_click` | Clic en cualquier enlace de WhatsApp |
| `scroll_depth` | Al llegar al 25%, 50%, 75%, 100% de scroll |
| `faq_open` | Apertura de una pregunta FAQ |
| `newsletter_subscribe` | Suscripcion al newsletter del footer |
| `counter_completed` | Fin de la animacion de un contador |

---

## Configuracion de Google Maps

En el footer, reemplaza el placeholder del mapa:

1. Ve a [Google Maps](https://maps.google.com).
2. Busca "Calle 37 Su # 35-61".
3. Haz clic en "Compartir" > "Insertar un mapa".
4. Copia el `<iframe>` y reemplaza el bloque `.footer__map-placeholder` en `index.html`.

---

## Personalizacion de Colores

Todos los colores se controlan desde variables CSS en `css/styles.css`:

```css
:root {
  --azul-noche: #121E26;    /* Color primario principal */
  --amarillo:   #F2C53D;    /* Color de acento / CTA */
  --negro:      #000000;    /* Sofisticacion */
  --blanco:     #FFFFFF;    /* Base */
}
```

**Importante:** Respetar la paleta del manual de marca. No modificar estos valores sin autorizacion.

---

## Actualizacion de Contenido

### Testimonios

En `index.html`, seccion `#testimonios`, cada testimonio sigue esta estructura:
```html
<div class="swiper-slide">
  <article class="testimonial-card">
    <div class="testimonial-card__stars">...</div>
    <blockquote class="testimonial-card__quote">
      "Tu testimonio real aqui."
    </blockquote>
    <div class="testimonial-card__author">
      <div class="testimonial-card__avatar"><span>AB</span></div>
      <div class="testimonial-card__info">
        <strong>Nombre Apellido</strong>
        <span>Cargo — Empresa</span>
      </div>
    </div>
  </article>
</div>
```

Para agregar foto real del cliente:
```html
<div class="testimonial-card__avatar">
  <img src="assets/images/cliente-nombre.jpg" alt="Nombre Cliente" width="52" height="52">
</div>
```

### FAQ

Para agregar/quitar preguntas, duplica o elimina bloques `.faq-item` en la seccion `#faq`. Recuerda actualizar los IDs: `faq-N-btn` y `faq-N-answer`.

### Numeros de los contadores

En `index.html`, seccion `#cifras`, modifica el atributo `data-target`:
```html
<span class="counter" data-target="25" data-suffix="+">0</span>
```

---

## Despliegue en Produccion

### Opcion 1 — GitHub Pages (gratis)

```bash
git init
git add .
git commit -m "Teji Max landing page"
git branch -M main
git remote add origin https://github.com/tu-usuario/tejimax-landing.git
git push -u origin main
```

Luego en GitHub: `Settings > Pages > Deploy from branch: main`.

### Opcion 2 — Netlify (recomendado, gratis)

1. Ve a [netlify.com](https://netlify.com) y crea cuenta gratuita.
2. Arrastra la carpeta `tejimax-landing/` al dashboard de Netlify.
3. Configura el dominio personalizado: `www.tejimax.com`.

### Opcion 3 — cPanel / Hosting tradicional

1. Comprime toda la carpeta en `.zip`.
2. Accede al File Manager de tu cPanel.
3. Sube y descomprime en `public_html/`.
4. Apunta tu dominio al servidor.

---

## Checklist Pre-Lanzamiento

### Contenido
- [ ] Imagenes reales del logo (3 variaciones) instaladas
- [ ] Imagen hero real instalada (`hero-sweater.webp`)
- [ ] Open Graph image creada (`og-image.jpg` - 1200x630px)
- [ ] Favicon instalado
- [ ] Testimonios reales agregados
- [ ] Mapa de Google Maps configurado en el footer
- [ ] URL del catalogo PDF actualizada en `form.js`

### Integraciones
- [ ] HubSpot Portal ID y Form ID configurados
- [ ] HubSpot Tracking Code instalado en el `<head>`
- [ ] Google Analytics 4 configurado
- [ ] Meta Pixel configurado (si tienes campanas en Facebook/Instagram)
- [ ] Workflow de emails en HubSpot creado

### SEO
- [ ] URL canonica actualizada a `https://www.tejimax.com/`
- [ ] Open Graph URLs actualizadas
- [ ] Schema.org `foundingDate` verificado
- [ ] Google Search Console verificado
- [ ] Sitemap.xml creado (si hay mas paginas)

### Performance
- [ ] Imagenes optimizadas (WebP + compresion)
- [ ] Testar con [PageSpeed Insights](https://pagespeed.web.dev/)
- [ ] Verificar LCP < 2.5s en movil

### Legal (Colombia - Ley 1581 de 2012)
- [ ] Pagina de Politica de Privacidad creada
- [ ] Pagina de Terminos y Condiciones creada
- [ ] Pagina de Tratamiento de Datos creada

---

## Dependencias (CDN — Sin instalacion)

| Libreria | Version | Uso |
|---|---|---|
| Google Fonts (Montserrat) | — | Tipografia |
| GSAP | 3.12.5 | Animaciones avanzadas |
| ScrollTrigger | 3.12.5 | Animaciones al scroll |
| AOS | 2.3.4 | Animate On Scroll |
| Swiper | 11.0.5 | Carrusel de testimonios |
| Font Awesome | 6.5.1 | Iconografia |

---

## Soporte y Contacto del Proyecto

- **Cliente:** Teji Max Sweaters
- **Web:** www.tejimax.com
- **Email:** tejimax30@hotmail.com
- **WhatsApp:** 3058366886
- **Instagram:** @30teji_max

---

*Landing Page v1.0 — Creada con enfoque en conversion, SEO y experiencia de usuario. Optimizada para LCP < 2.5s, CLS < 0.1, FID < 100ms.*
