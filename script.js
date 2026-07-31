
let tasas = {
  usdBcv: 0,
  eurBcv: 0,
  usdt: 0
};

const inputUsd = document.getElementById('usd-input');
const inputEur = document.getElementById('eur-input');
const inputUsdt = document.getElementById('usdt-input');
const inputVes = document.getElementById('ves-input');
const estadoApi = document.getElementById('estado-api');
const estadoBadge = document.getElementById('estado-badge');
const estadoBadgeText = document.getElementById('estado-badge-text');
const estadoWeekday = document.getElementById('estado-weekday');
const estadoDay = document.getElementById('estado-day');
const estadoMeta = document.getElementById('estado-meta');
const UMBRAL_OBSOLETO_MS = 3 * 60 * 60 * 1000;

function formatearHace(fecha) {
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const minutos = Math.round((fecha.getTime() - Date.now()) / 60000);

  if (Math.abs(minutos) < 60) {
    return rtf.format(minutos, 'minute');
  }

  const horas = Math.round(minutos / 60);
  if (Math.abs(horas) < 24) {
    return rtf.format(horas, 'hour');
  }

  const dias = Math.round(horas / 24);
  return rtf.format(dias, 'day');
}

function parseInputValue(inputElement) {
  const value = parseFloat(inputElement.value);
  return Number.isFinite(value) ? value : 0;
}

function actualizarDesdeInput(inputId) {
  const inputActual = document.getElementById(inputId);
  const valorActual = parseInputValue(inputActual);

  let ves = 0;

  if (inputId === 'usd-input') {
    ves = valorActual * tasas.usdBcv;
  }

  if (inputId === 'eur-input') {
    ves = valorActual * tasas.eurBcv;
  }

  if (inputId === 'usdt-input') {
    ves = valorActual * tasas.usdt;
  }

  if (inputId === 'ves-input') {
    ves = valorActual;
  }

  inputVes.value = ves.toFixed(2);
  inputUsd.value = (ves / tasas.usdBcv).toFixed(2);
  inputEur.value = (ves / tasas.eurBcv).toFixed(2);
  inputUsdt.value = (ves / tasas.usdt).toFixed(2);
}

function ajustarCantidad(inputId, cambio) {
  const inputActual = document.getElementById(inputId);
  const valorActual = parseInputValue(inputActual);
  const nuevoValor = Math.max(0, valorActual + cambio);

  inputActual.value = nuevoValor.toString();
  actualizarDesdeInput(inputId);
}

function reiniciarAnimacion(elemento, clase) {
  elemento.classList.remove(clase);
  void elemento.offsetWidth;
  elemento.classList.add(clase);
}

function actualizarEstadoApi({ badge, weekday, day, meta, variant }) {
  estadoBadgeText.textContent = badge;
  estadoWeekday.textContent = weekday;
  estadoDay.textContent = day;
  estadoMeta.textContent = meta;
  estadoBadge.className = `api-status__badge api-status__badge--${variant}`;
  estadoDay.classList.remove('api-status__date-line--loading');
  reiniciarAnimacion(estadoBadge, 'api-status__badge--pop');
  reiniciarAnimacion(estadoApi, 'api-status__date--fade');
}

function reiniciarCampo(inputId) {
  const inputActual = document.getElementById(inputId);
  inputActual.value = '1';
  actualizarDesdeInput(inputId);
}

async function copiarInput(inputId) {
  const inputActual = document.getElementById(inputId);
  const boton = document.querySelector(`[data-input="${inputId}"][data-action="copy"]`);

  let copiado = false;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(inputActual.value);
      copiado = true;
    } catch (error) {
      copiado = false;
    }
  }

  if (!copiado) {
    inputActual.select();
    copiado = document.execCommand('copy');
  }

  if (copiado && boton) {
    const iconoOriginal = boton.innerHTML;
    const labelOriginal = boton.getAttribute('aria-label');

    boton.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>';
    boton.classList.add('icon-btn--copied');
    boton.setAttribute('aria-label', 'Copiado');

    setTimeout(() => {
      boton.innerHTML = iconoOriginal;
      boton.classList.remove('icon-btn--copied');
      boton.setAttribute('aria-label', labelOriginal);
    }, 1500);
  }
}

async function obtenerTasas() {
  try {
    const APIurl = 'https://churupos.vercel.app/api/tasas';

    const respuesta = await fetch(APIurl);
    const json = await respuesta.json();

    if (json.success) {
      tasas.usdBcv = json.data.usdBcv;
      tasas.eurBcv = json.data.eurBcv;
      tasas.usdt = json.data.usdt;

      const lastUpdate = new Date(json.last_update);

      const weekday = lastUpdate.toLocaleDateString('es-VE', { weekday: 'long' });
      const day = lastUpdate.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const meta = `${lastUpdate.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })} · ${formatearHace(lastUpdate)}`;

      const desactualizado = Date.now() - lastUpdate.getTime() > UMBRAL_OBSOLETO_MS;

      actualizarEstadoApi({
        badge: desactualizado ? 'Posiblemente desactualizado' : 'Actualizado',
        weekday,
        day,
        meta,
        variant: desactualizado ? 'warning' : 'success'
      });

      inicializarCalculadora();
      habilitarInputs();
    } else {
      throw new Error('La API no devuelve exito');
    }
  } catch (error) {
    console.error('Error al obtener tasas:', error);
    actualizarEstadoApi({
      badge: 'Error',
      weekday: '',
      day: 'No se pudo conectar con la API',
      meta: '',
      variant: 'error'
    });
  }
}

function inicializarCalculadora() {
  const valorBaseVes = 1 * tasas.usdBcv;

  inputUsd.value = '1.00';
  inputVes.value = valorBaseVes.toFixed(2);
  inputEur.value = (valorBaseVes / tasas.eurBcv).toFixed(2);
  inputUsdt.value = (valorBaseVes / tasas.usdt).toFixed(2);
}

function habilitarInputs() {
  inputUsd.addEventListener('input', (e) => actualizarDesdeInput(e.target.id));
  inputUsdt.addEventListener('input', (e) => actualizarDesdeInput(e.target.id));
  inputVes.addEventListener('input', (e) => actualizarDesdeInput(e.target.id));
  inputEur.addEventListener('input', (e) => actualizarDesdeInput(e.target.id));

  [inputUsd, inputEur, inputUsdt, inputVes].forEach((input) => {
    input.addEventListener('blur', () => window.scrollTo(0, 0));
  });

  document.querySelectorAll('.icon-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const inputId = button.dataset.input;
      const action = button.dataset.action;

      if (action === 'increment') {
        ajustarCantidad(inputId, 1);
      }

      if (action === 'decrement') {
        ajustarCantidad(inputId, -1);
      }

      if (action === 'reset') {
        reiniciarCampo(inputId);
      }

      if (action === 'copy') {
        copiarInput(inputId);
      }
    });
  });
}

obtenerTasas();
