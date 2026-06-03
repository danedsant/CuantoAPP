
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


async function obtenerTasas() {
  try {

    const APIurl = 'https://churupos.vercel.app/api/tasas'; 

    const respuesta = await fetch(APIurl);
    const json = await respuesta.json();

    if (json.success) {
      
      tasas.usdBcv = json.data.usdBcv;
      tasas.eurBcv = json.data.eurBcv;
      tasas.usdt = json.data.usdt;


      const fecha = new Date(json.last_update).toLocaleString('es-VE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'});
      estadoApi.innerHTML = `Tasas actualizadas: ${fecha}`;
      estadoApi.classList.replace('text-gray-500', 'text-green-600');

      
      inicializarCalculadora();
      habilitarInputs();

    } else {
      throw new Error("La API no devuelve exito");
    }

  } catch (error) {
    console.error("Error al obtener tasas:", error);
    estadoApi.innerHTML = ` Error al conectar con el servidor. Intenta más tarde bb.`;
    estadoApi.classList.replace('text-gray-500', 'text-red-500');
  }
}


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

obtenerTasas();
