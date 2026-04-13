# Guía de Analytics — TechMax Sweaters

## Qué está implementado

| Herramienta | Estado |
|---|---|
| Google Tag Manager (GTM) | ✅ Snippet en HTML listo — falta tu ID |
| Google Analytics 4 (GA4) | Se configura DENTRO de GTM (ver Paso 3) |
| Eventos personalizados | ✅ `js/analytics.js` activo |

---

## PASO 1 — Crear cuenta en Google Tag Manager

1. Ve a **https://tagmanager.google.com**
2. Inicia sesión con tu cuenta de Google (usa la misma de GA4)
3. Clic en **"Crear cuenta"**
4. Rellena:
   - **Nombre de cuenta:** TechMax Sweaters
   - **País:** Colombia
   - **Nombre del contenedor:** techmax-sweaters.com (o el dominio que uses)
   - **Plataforma:** Web
5. Acepta los términos y clic en **"Crear"**
6. GTM te mostrará tu ID: **`GTM-XXXXXXX`** (formato: GTM- + 7 caracteres)

### Reemplazar el ID en el HTML

Abre `index.html` y busca las dos líneas con `GTM-XXXXXXX`, reemplázalas con tu ID real:

```
<!-- En el <head> -->
'GTM-XXXXXXX'  →  'GTM-TU_ID_REAL'

<!-- En el <body> -->
?id=GTM-XXXXXXX  →  ?id=GTM-TU_ID_REAL
```

---

## PASO 2 — Crear propiedad en Google Analytics 4

1. Ve a **https://analytics.google.com**
2. Clic en el engranaje ⚙️ (Administrar) abajo a la izquierda
3. En la columna **"Cuenta"** → **"Crear cuenta"**
   - Nombre: TechMax Sweaters
4. En la columna **"Propiedad"** → **"Crear propiedad"**
   - Nombre: TechMax Landing
   - Zona horaria: Colombia (UTC-5)
   - Moneda: Peso colombiano (COP)
5. En **"Detalles del negocio"**: selecciona Retail / Comercio
6. En **"Objetivos de negocio"**: marca "Generar clientes potenciales"
7. Acepta los términos
8. En la pantalla de flujo de datos → **"Web"**
   - URL: tu dominio
   - Nombre de flujo: TechMax Web
9. Copia el **ID de medición**: **`G-267WGDN8FM`**

---

## PASO 3 — Conectar GA4 dentro de GTM

### 3a. Tag de Configuración GA4

1. En GTM → **"Etiquetas"** → **"Nueva"**
2. **Nombre:** `GA4 - Configuracion`
3. **Tipo de etiqueta:** Google Analytics: Configuración de GA4
4. **ID de medición:** pega tu `G-267WGDN8FM`
5. **Activador:** All Pages (Todas las páginas)
6. Guardar

### 3b. Tags de Eventos personalizados

Crea una etiqueta por cada evento. Ejemplo para **WhatsApp clicks**:

1. Nueva etiqueta → **Nombre:** `GA4 - WhatsApp Click`
2. **Tipo:** Google Analytics: Evento de GA4
3. **Tag de configuración:** selecciona `GA4 - Configuracion`
4. **Nombre del evento:** `whatsapp_click`
5. **Parámetros del evento:**
   | Nombre | Valor |
   |---|---|
   | click_source | `{{DLV - click_source}}` |
6. **Activador:** Crear nuevo activador:
   - Tipo: Evento personalizado
   - Nombre del evento: `whatsapp_click`
7. Guardar

Repite para cada evento de la tabla de abajo.

---

## Eventos que rastrea analytics.js

| Evento GA4 | Cuándo se dispara | Parámetros |
|---|---|---|
| `cta_click` | Click en cualquier botón CTA | `cta_id`, `cta_text`, `page_section` |
| `whatsapp_click` | Click en botón de WhatsApp | `click_source`, `cta_text` |
| `form_start` | Usuario toca el formulario | `form_id` |
| `form_submit` | Envío del formulario | `form_id`, `cantidad_rango` |
| `scroll_depth` | Scroll al 25/50/75/100% | `depth_percent` |
| `section_view` | Sección visible en pantalla | `section_id`, `section_name` |
| `engagement_time` | 30s / 60s / 120s / 300s activos | `seconds_active` |
| `page_visibility` | Tab activo/inactivo | `visible`, `active_time` |

### Variables de capa de datos (Data Layer Variables) a crear en GTM

Para usar los parámetros en los eventos, crea estas variables en GTM → Variables → Nueva:

| Nombre variable GTM | Tipo | Nombre en dataLayer |
|---|---|---|
| `DLV - cta_id` | Variable de capa de datos | `cta_id` |
| `DLV - cta_text` | Variable de capa de datos | `cta_text` |
| `DLV - page_section` | Variable de capa de datos | `page_section` |
| `DLV - click_source` | Variable de capa de datos | `click_source` |
| `DLV - depth_percent` | Variable de capa de datos | `depth_percent` |
| `DLV - section_id` | Variable de capa de datos | `section_id` |
| `DLV - seconds_active` | Variable de capa de datos | `seconds_active` |
| `DLV - cantidad_rango` | Variable de capa de datos | `cantidad_rango` |

---

## PASO 4 — Publicar GTM

1. En GTM clic en el botón azul **"Enviar"** (arriba a la derecha)
2. **Versión:** escribe "v1.0 - Lanzamiento"
3. Clic en **"Publicar"**

> Sin publicar, ninguna etiqueta funciona en producción.

---

## PASO 5 — Verificar que todo funciona

### Con GTM Preview
1. En GTM → clic en **"Vista previa"**
2. Ingresa la URL de tu página
3. Navega por la página y verás todos los eventos disparándose en tiempo real

### Con GA4 en tiempo real
1. En GA4 → **Informes → Tiempo real**
2. Abre tu página en otra pestaña
3. Verás las visitas y eventos apareciendo al instante

### Con la extensión de Chrome
Instala **"Tag Assistant"** de Google Chrome para depurar GTM visualmente.

---

## PASO 6 — Conversiones en GA4 (opcional pero recomendado)

Marca estos eventos como **conversiones** en GA4 (Configurar → Eventos → marcar como conversión):

- `form_submit` — Formulario enviado (lead generado)
- `whatsapp_click` — Contacto por WhatsApp

Esto te permite ver cuántos leads genera la página y desde qué sección.

---

## Resumen de archivos modificados

| Archivo | Cambio |
|---|---|
| `index.html` | GTM snippet en `<head>` y `<body>` |
| `js/analytics.js` | Tracking de todos los eventos via dataLayer |

## IDs que debes reemplazar

- `GTM-XXXXXXX` → tu ID de Google Tag Manager (2 veces en index.html)
- `G-267WGDN8FM` → tu ID de GA4 (se pone dentro de GTM, no en el HTML)
