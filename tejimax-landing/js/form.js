/**
 * TECHMAX SWEATERS — VALIDACION DE FORMULARIOS Y LEAD CAPTURE
 * form.js
 *
 * Funcionalidades:
 * - Validacion del formulario principal de lead magnet
 * - Integracion con HubSpot CRM (via API de submissions)
 * - Tracking de eventos de formulario
 * - Estados de carga y exito
 * - Validacion en tiempo real (on blur)
 *
 * ============================================
 * CONFIGURACION HUBSPOT
 * ============================================
 * Antes de lanzar a produccion, reemplazar:
 * - HUBSPOT_PORTAL_ID: Tu Portal ID de HubSpot (menu: Settings > Account > Account Setup)
 * - HUBSPOT_FORM_ID:   ID del formulario creado en HubSpot
 *
 * COMO CREAR EL FORMULARIO EN HUBSPOT:
 * 1. Ve a HubSpot > Marketing > Lead Capture > Forms
 * 2. Crea un nuevo formulario con los campos:
 *    - firstname (Nombre)
 *    - email (Correo electronico)
 *    - mobilephone (WhatsApp)
 *    - what_are_you_interested_in (propiedad de contacto personalizada)
 * 3. En Settings del formulario: habilita "Redirect to another page" apuntando a la URL del catalogo PDF
 * 4. Copia el Portal ID y el Form ID al config de abajo
 * ============================================
 */

'use strict';

/* ==========================================
   CONFIGURACION HUBSPOT
   ========================================== */
const HUBSPOT_CONFIG = {
  portalId: '51288752',
  formId:   '1cc36ea0-9b33-4ee6-9cf7-eca551923c3c',
  region:   'na1',
  apiUrl: function() {
    return `https://api.hsforms.com/submissions/v3/integration/submit/${this.portalId}/${this.formId}`;
  }
};

/*
  URL DEL CATALOGO:
  Una vez tengas el PDF del catalogo, sube a Google Drive / Dropbox / tu servidor
  y coloca la URL aqui. Se redirigira al usuario al enviar el formulario.
*/
const CATALOGO_URL = 'https://www.techmax.com/catalogo-2026.pdf'; /* REEMPLAZAR */


/* ==========================================
   VALIDADORES
   ========================================== */

/* Regexes compiladas una sola vez */
const RE_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
const RE_EMAIL  = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const RE_PHONE  = /^(\+57|57)?[3][0-9]{9}$|^\+?[1-9]\d{6,14}$/;
const RE_CLEAN  = /[\s\-\(\)]/g;

const validators = {
  nombre(value) {
    if (!value || value.trim().length < 2) {
      return 'Por favor ingresa tu nombre completo (minimo 2 caracteres).';
    }
    if (!RE_NOMBRE.test(value.trim())) {
      return 'El nombre solo debe contener letras y espacios.';
    }
    return null;
  },

  email(value) {
    if (!value || !value.trim()) {
      return 'Por favor ingresa tu correo electronico.';
    }
    if (!RE_EMAIL.test(value.trim())) {
      return 'Por favor ingresa un correo electronico valido.';
    }
    return null;
  },

  whatsapp(value) {
    if (!value || !value.trim()) {
      return 'Por favor ingresa tu numero de WhatsApp.';
    }
    const cleaned = value.replace(RE_CLEAN, '');
    if (!RE_PHONE.test(cleaned)) {
      return 'Ingresa un numero de WhatsApp valido (ej: 300 123 4567).';
    }
    return null;
  },

  /**
   * Valida consentimiento de privacidad
   */
  consent(checked) {
    if (!checked) {
      return 'Debes aceptar la politica de privacidad para continuar.';
    }
    return null;
  }
};


/* ==========================================
   MANEJO DE ERRORES EN EL FORMULARIO
   ========================================== */

/**
 * Muestra el error de un campo
 */
function showFieldError(fieldId, message) {
  const field    = document.getElementById(fieldId);
  const errorEl  = document.getElementById(`${fieldId}-error`);

  if (field) {
    field.classList.add('is-invalid');
    field.classList.add('shake');
    /* Remover clase shake despues de la animacion */
    setTimeout(() => field.classList.remove('shake'), 600);
  }

  if (errorEl) {
    errorEl.textContent = message;
  }
}

/**
 * Limpia el error de un campo
 */
function clearFieldError(fieldId) {
  const field   = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);

  if (field)   field.classList.remove('is-invalid');
  if (errorEl) errorEl.textContent = '';
}

/**
 * Marca un campo como valido
 */
function markFieldValid(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
  }
}


/* ==========================================
   VALIDACION EN TIEMPO REAL (ON BLUR)
   ========================================== */
function initRealtimeValidation() {
  const fields = [
    { id: 'lead-name',      validator: () => validators.nombre(document.getElementById('lead-name')?.value) },
    { id: 'lead-email',     validator: () => validators.email(document.getElementById('lead-email')?.value) },
    { id: 'lead-whatsapp',  validator: () => validators.whatsapp(document.getElementById('lead-whatsapp')?.value) }
  ];

  fields.forEach(({ id, validator }) => {
    const input = document.getElementById(id);
    if (!input) return;

    /* Validar al perder el foco */
    input.addEventListener('blur', () => {
      const error = validator();
      if (error) {
        showFieldError(id, error);
      } else {
        clearFieldError(id);
        markFieldValid(id);
      }
    });

    /* Limpiar error mientras el usuario escribe */
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        clearFieldError(id);
      }
    });
  });
}


/* ==========================================
   VALIDACION COMPLETA DEL FORMULARIO
   ========================================== */
function validateLeadForm(formData) {
  const errors = [];

  /* Validar nombre */
  const nombreError = validators.nombre(formData.firstName);
  if (nombreError) {
    showFieldError('lead-name', nombreError);
    errors.push('nombre');
  } else {
    clearFieldError('lead-name');
  }

  /* Validar email */
  const emailError = validators.email(formData.email);
  if (emailError) {
    showFieldError('lead-email', emailError);
    errors.push('email');
  } else {
    clearFieldError('lead-email');
  }

  /* Validar WhatsApp */
  const wpError = validators.whatsapp(formData.mobilephone);
  if (wpError) {
    showFieldError('lead-whatsapp', wpError);
    errors.push('whatsapp');
  } else {
    clearFieldError('lead-whatsapp');
  }

  /* Validar consentimiento */
  const consentEl = document.getElementById('lead-consent');
  const consentError = validators.consent(consentEl?.checked);
  if (consentError) {
    showFieldError('lead-consent', consentError);
    errors.push('consent');
  } else {
    clearFieldError('lead-consent');
  }

  return errors.length === 0;
}


/* ==========================================
   INTEGRACION CON HUBSPOT CRM
   ========================================== */

/**
 * Envia los datos al API de HubSpot
 *
 * DOCUMENTACION API:
 * https://developers.hubspot.com/docs/api/marketing/forms
 *
 * PAYLOAD ESPERADO:
 * {
 *   "fields": [
 *     { "name": "firstname", "value": "Juan" },
 *     { "name": "email",     "value": "juan@empresa.com" },
 *     ...
 *   ],
 *   "context": {
 *     "hutk":    "cookie de seguimiento (opcional)",
 *     "pageUri": "https://www.techmax.com/",
 *     "pageName": "TechMax Sweaters — Landing"
 *   },
 *   "legalConsentOptions": {
 *     "consent": {
 *       "consentToProcess": true,
 *       "text": "Acepto la politica de privacidad y autorizo el tratamiento de mis datos."
 *     }
 *   }
 * }
 */
async function submitToHubSpot(formData) {
  /* Obtener cookie de tracking de HubSpot (hutk) si existe */
  const hutkCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('hubspotutk='))
    ?.split('=')[1] || '';

  const context = {
    pageUri:  window.location.href,
    pageName: document.title
  };
  /* Solo incluir hutk si existe — HubSpot rechaza el envío con hutk vacío */
  if (hutkCookie) context.hutk = hutkCookie;

  const payload = {
    fields: [
      { name: 'firstname',   value: formData.firstName.trim() },
      { name: 'email',       value: formData.email.trim().toLowerCase() },
      { name: 'mobilephone', value: formData.mobilephone.trim() },
    ],
    context
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); /* 10s max */

  const response = await fetch(HUBSPOT_CONFIG.apiUrl(), {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body:    JSON.stringify(payload),
    signal:  controller.signal
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[TechMax] HubSpot error detalle:', JSON.stringify(errorData, null, 2));
    /* Mensaje legible: errores por campo */
    const msg = (errorData.errors && errorData.errors.length)
      ? errorData.errors.map(function(e){ return e.message; }).join(' | ')
      : (errorData.message || 'HTTP ' + response.status);
    throw new Error(msg);
  }

  return await response.json();
}


/* ==========================================
   ESTADO VISUAL DEL BOTON
   ========================================== */

function setButtonLoading(btn, isLoading) {
  const textEl    = btn.querySelector('.btn-text');
  const loadingEl = btn.querySelector('.btn-loading');

  btn.disabled = isLoading;

  if (textEl)    textEl.style.display    = isLoading ? 'none' : 'flex';
  if (loadingEl) loadingEl.style.display = isLoading ? 'flex' : 'none';

  if (isLoading) {
    btn.style.opacity = '0.8';
    btn.style.cursor  = 'not-allowed';
  } else {
    btn.style.opacity = '';
    btn.style.cursor  = '';
  }
}


/* ==========================================
   MOSTRAR ESTADO DE EXITO
   ========================================== */

function showFormSuccess() {
  const form        = document.getElementById('lead-form');
  const successEl   = document.getElementById('form-success');

  if (form)      form.style.display      = 'none';
  if (successEl) successEl.style.display = 'block';

  /* Hacer scroll hacia el mensaje de exito */
  successEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  /* OPCIONAL: Redirigir al catalogo despues de 3 segundos */
  /*
  setTimeout(() => {
    window.open(CATALOGO_URL, '_blank');
  }, 3000);
  */
}


/* ==========================================
   HANDLER PRINCIPAL DEL FORMULARIO
   ========================================== */

function handleLeadFormSubmit(e) {
  e.preventDefault();

  const form   = e.target;
  const btn    = document.getElementById('form-submit-btn');
  if (!btn) return;

  /* Recopilar datos del formulario */
  const formData = {
    firstName:  document.getElementById('lead-name')?.value     || '',
    email:      document.getElementById('lead-email')?.value    || '',
    mobilephone: document.getElementById('lead-whatsapp')?.value || '',
    interest:   document.getElementById('lead-interest')?.value || ''
  };

  /* Validar */
  const isValid = validateLeadForm(formData);
  if (!isValid) {
    /* Scroll al primer campo con error */
    const firstError = form.querySelector('.is-invalid');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
    return;
  }

  /* Iniciar carga */
  setButtonLoading(btn, true);

  /* Tracking de intento de envio */
  if (typeof trackEvent === 'function') {
    trackEvent('form_attempt', {
      form_name: 'lead_catalogo_2026',
      interest:  formData.interest
    });
  }

  /* Verificar si HubSpot esta configurado */
  const isHubSpotConfigured = HUBSPOT_CONFIG.portalId !== 'TU_PORTAL_ID';

  let submitPromise;

  if (isHubSpotConfigured) {
    /* Enviar a HubSpot */
    submitPromise = submitToHubSpot(formData);
  } else {
    /*
      MODO DESARROLLO / DEMO:
      Cuando HubSpot no esta configurado, simulamos el envio
      para demostrar el flujo completo.
    */
    console.warn('[TechMax] HubSpot no configurado. Simulando envio...');
    submitPromise = new Promise(resolve => setTimeout(resolve, 1500));
  }

  submitPromise
    .then(() => {
      /* Exito */
      if (typeof trackEvent === 'function') {
        trackEvent('form_submit', {
          form_name:    'lead_catalogo_2026',
          interest:     formData.interest,
          email_domain: formData.email.split('@')[1]
        });
      }

      /* Meta Pixel: evento de lead */
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', {
          content_name: 'Catalogo TechMax 2026',
          content_category: formData.interest
        });
      }

      /* HubSpot: marcar conversion (si el tracking code esta activo) */
      if (typeof _hsq !== 'undefined') {
        _hsq.push(['identify', { email: formData.email }]);
        _hsq.push(['trackPageView']);
      }

      /* Google Analytics: conversion */
      if (typeof gtag === 'function') {
        gtag('event', 'conversion', {
          send_to:      'AW-XXXXXXXXXX/XXXXXXXX', /* Reemplazar con tu conversion ID */
          event_category: 'Lead',
          event_label:    'Catalogo 2026'
        });
      }

      showFormSuccess();
    })
    .catch((error) => {
      console.error('[TechMax] Error al enviar formulario:', error);
      setButtonLoading(btn, false);

      /* Mostrar error generico al usuario */
      const errorMsg = document.createElement('div');
      errorMsg.className = 'form-submit-error';
      errorMsg.style.cssText = `
        color: var(--rojo-error, #e53935);
        font-size: 0.875rem;
        font-weight: 600;
        text-align: center;
        margin-top: 0.75rem;
        padding: 0.75rem;
        background: rgba(229, 57, 53, 0.08);
        border-radius: 8px;
        border: 1px solid rgba(229, 57, 53, 0.2);
      `;
      errorMsg.textContent = 'Hubo un error al enviar el formulario. Por favor intentalo de nuevo o contactanos directamente por WhatsApp.';

      /* Eliminar mensajes de error previos */
      form.querySelectorAll('.form-submit-error').forEach(el => el.remove());
      btn.parentNode.insertBefore(errorMsg, btn.nextSibling);

      if (typeof trackEvent === 'function') {
        trackEvent('form_error', {
          form_name: 'lead_catalogo_2026',
          error:      error.message
        });
      }
    });
}


/* ==========================================
   INICIALIZACION DEL FORMULARIO
   ========================================== */

function initLeadForm() {
  const form = document.getElementById('lead-form');
  if (!form) return;

  /* Cargar configuracion desde atributos data- del form (opcional) */
  const portalIdFromData = form.dataset.hubspotPortal;
  const formIdFromData   = form.dataset.hubspotForm;

  if (portalIdFromData && portalIdFromData !== 'TU_PORTAL_ID') {
    HUBSPOT_CONFIG.portalId = portalIdFromData;
  }

  if (formIdFromData && formIdFromData !== 'TU_FORM_ID') {
    HUBSPOT_CONFIG.formId = formIdFromData;
  }

  /* Adjuntar handler de envio */
  form.addEventListener('submit', handleLeadFormSubmit);

  /* Validacion en tiempo real */
  initRealtimeValidation();

  /* Formatear numero de telefono mientras escribe */
  const phoneInput = document.getElementById('lead-whatsapp');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/[^\d+\s\-()]/g, '');
      e.target.value = val;
    });
  }

  /* Auto-capitalizar nombre */
  const nameInput = document.getElementById('lead-name');
  if (nameInput) {
    nameInput.addEventListener('blur', (e) => {
      const val = e.target.value.trim();
      if (val) {
        e.target.value = val
          .toLowerCase()
          .replace(/(?:^|\s)\S/g, char => char.toUpperCase());
      }
    });
  }
}


/* ==========================================
   EJECUTAR AL CARGAR EL DOM
   ========================================== */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLeadForm);
} else {
  initLeadForm();
}


/*
  ============================================
  GUIA DE INTEGRACION COMPLETA CON HUBSPOT
  ============================================

  PASO 1 — Crear cuenta HubSpot (gratuita):
  https://www.hubspot.com/products/crm

  PASO 2 — Obtener tu Portal ID:
  Ve a HubSpot > Settings (icono de engranaje) > Account Setup > Account > Account ID
  Ese numero es tu PORTAL_ID.

  PASO 3 — Crear propiedades de contacto personalizadas:
  Settings > Properties > Contact Properties > Create property
  - Nombre: "what_are_you_interested_in"
  - Tipo: Dropdown select
  - Opciones: Corporativo, Institucional, Marca propia, Revendedor, Otro

  PASO 4 — Crear formulario en HubSpot:
  Marketing > Lead Capture > Forms > Create Form
  - Tipo: Embedded Form
  - Campos: Nombre, Email, Telefono, Tipo de interes
  - Copia el Form ID de la URL: /forms/editor/TU-FORM-ID/edit/form

  PASO 5 — Configurar workflow de automatizacion:
  Automation > Workflows > Create Workflow
  - Disparador: Form submission (tu formulario)
  - Accion 1 (inmediato): Enviar email "Tu catalogo esta aqui" con link al PDF
  - Accion 2 (espera 2 dias): Email "Cuanto sabes de sweaters premium?"
  - Accion 3 (espera 5 dias): Email "Tu 15% de descuento esta por vencer"
  - Accion 4 (espera 10 dias): Email "Clientes exitosos de TechMax"
  - Accion 5 (espera 15 dias): Email "Ultima oportunidad - cierre de oferta"

  PASO 6 — Configurar notificacion interna:
  En el workflow, agrega:
  - Accion: "Notify team member"
  - Envia notificacion al WhatsApp del equipo de ventas
  - O conecta con Slack via HubSpot integration

  PASO 7 — Instalar HubSpot Tracking Code:
  Settings > Tracking & Analytics > Tracking Code
  Copia el snippet e instalalo en el <head> del HTML
  (reemplazar el comentario en index.html)

  ============================================
  METRICAS A MONITOREAR EN HUBSPOT
  ============================================
  - Tasa de conversion del formulario (objetivo: > 15%)
  - Tasa de apertura de emails (objetivo: > 25%)
  - Tasa de clicks en emails (objetivo: > 3%)
  - Tiempo hasta primera cotizacion
  - % de leads que se convierten en clientes

  ============================================
*/
