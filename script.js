// 1. Empezamos con tasas en cero. Se llenarán al consultar tu API.
let tasas = {
  usdBcv: 0,
  eurBcv: 0,
  usdt: 0    
};

// 2. Conectamos el código con los campos del HTML
const inputUsd = document.getElementById('usd-input');
const inputEur = document.getElementById('eur-input');
const inputUsdt = document.getElementById('usdt-input');
const inputVes = document.getElementById('ves-input');
const estadoApi = document.getElementById('estado-api');

// === NUEVO: FUNCIÓN PARA TRAER LOS DATOS DEL BACKEND ===
async function obtenerTasas() {
  try {
    // IMPORTANTE: Cambia esta URL por la URL real que te dé Vercel al subir tu backend
    // Por ejemplo: 'https://cuantoapp.vercel.app/api/tasas'
    const APIurl = 'https://cuantoapp.vercel.app/api/tasas'; 

    const respuesta = await fetch(APIurl);
    const json = await respuesta.json();

    if (json.success) {
      // Si todo sale bien, actualizamos nuestras variables con los datos reales
      tasas.usdBcv = json.data.usdBcv;
      tasas.eurBcv = json.data.eurBcv;
      tasas.usdt = json.data.usdt;

      // Actualizamos el texto de estado
      const fecha = new Date(json.last_update).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
      estadoApi.innerHTML = `✅ Tasas actualizadas hoy a las ${fecha}`;
      estadoApi.classList.replace('text-gray-500', 'text-green-600');

      // Ahora sí, encendemos la calculadora
      inicializarCalculadora();
      habilitarInputs();
    } else {
      throw new Error("La API no devolvió éxito");
    }

  } catch (error) {
    console.error("Error al obtener tasas:", error);
    estadoApi.innerHTML = `⚠️ Error al conectar con el servidor. Intenta más tarde.`;
    estadoApi.classList.replace('text-gray-500', 'text-red-500');
  }
}

// === LÓGICA DE LA CALCULADORA ===

function inicializarCalculadora() {
  const valorBaseVes = 1 * tasas.usdBcv; 
  
  inputUsd.value = "1.00";
  inputVes.value = valorBaseVes.toFixed(2);
  inputEur.value = (valorBaseVes / tasas.eurBcv).toFixed(2);
  inputUsdt.value = (valorBaseVes / tasas.usdt).toFixed(2);
}

function habilitarInputs() {
  inputUsd.addEventListener('input', (e) => {
    const usdInput = parseFloat(e.target.value) || 0;
    const ves = usdInput * tasas.usdBcv;
    inputVes.value = ves.toFixed(2);
    inputEur.value = (ves / tasas.eurBcv).toFixed(2);
    inputUsdt.value = (ves / tasas.usdt).toFixed(2);
  });

  inputUsdt.addEventListener('input', (e) => {
    const usdtInput = parseFloat(e.target.value) || 0;
    const ves = usdtInput * tasas.usdt; 
    inputVes.value = ves.toFixed(2);
    inputUsd.value = (ves / tasas.usdBcv).toFixed(2);
    inputEur.value = (ves / tasas.eurBcv).toFixed(2);
  });

  inputVes.addEventListener('input', (e) => {
    const vesInput = parseFloat(e.target.value) || 0;
    inputUsd.value = (vesInput / tasas.usdBcv).toFixed(2);
    inputEur.value = (vesInput / tasas.eurBcv).toFixed(2);
    inputUsdt.value = (vesInput / tasas.usdt).toFixed(2);
  });

  inputEur.addEventListener('input', (e) => {
    const eurInput = parseFloat(e.target.value) || 0;
    const ves = eurInput * tasas.eurBcv;
    inputVes.value = ves.toFixed(2);
    inputUsd.value = (ves / tasas.usdBcv).toFixed(2);
    inputUsdt.value = (ves / tasas.usdt).toFixed(2);
  });
}

// === DESACTIVA LOS INPUTS MIENTRAS CARGA (Para evitar errores) ===
inputUsd.disabled = true;
inputEur.disabled = true;
inputUsdt.disabled = true;
inputVes.disabled = true;

function habilitarInputs() {
    inputUsd.disabled = false;
    inputEur.disabled = false;
    inputUsdt.disabled = false;
    inputVes.disabled = false;
    // ... aquí van los EventListeners de arriba (ya incluidos en el bloque anterior)
}

// Arrancamos el proceso consultando la API
obtenerTasas();