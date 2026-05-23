
// Tasas de cambio
const tasas = {
  usdBcv: 526.87, // Tasa oficial Dolar BCV
  eurBcv: 604.15, // Tasa oficial Euro
  usdt: 722.81    // Promedio P2P de Binance USDT/VES

  // PENDIENTE PA DESPUES:
  // implementar crawler en backend para sacar estos datos
  // Cypress o cheerio con node.js
};

// tomar los inputs del HTML
const inputUsd = document.getElementById('usd-input');
const inputEur = document.getElementById('eur-input');
const inputUsdt = document.getElementById('usdt-input');
const inputVes = document.getElementById('ves-input');

// Funcion para inicializar la calculadora
function inicializarCalculadora() {
  const valorBaseVes = 1 * tasas.usdBcv; 
  
  // Llenamos los campos
  inputUsd.value = "1.00";
  inputVes.value = valorBaseVes.toFixed(2);
  inputEur.value = (valorBaseVes / tasas.eurBcv).toFixed(2);
  inputUsdt.value = (valorBaseVes / tasas.usdt).toFixed(2);
}

// Listener para cambios en Dolar
inputUsd.addEventListener('input', (e) => {
  const usdInput = parseFloat(e.target.value) || 0; // Si borra todo, asume 0
  const ves = usdInput * tasas.usdBcv;
  
  inputVes.value = ves.toFixed(2);
  inputEur.value = (ves / tasas.eurBcv).toFixed(2);
  inputUsdt.value = (ves / tasas.usdt).toFixed(2);
});

// Listener para cambios en USDT
inputUsdt.addEventListener('input', (e) => {
  const usdtInput = parseFloat(e.target.value) || 0;
  const ves = usdtInput * tasas.usdt; 
  
  
  inputVes.value = ves.toFixed(2);
  inputUsd.value = (ves / tasas.usdBcv).toFixed(2);
  inputEur.value = (ves / tasas.eurBcv).toFixed(2);
});

// Listener pa cambios en Bs:
inputVes.addEventListener('input', (e) => {
  const vesInput = parseFloat(e.target.value) || 0;
  
  inputUsd.value = (vesInput / tasas.usdBcv).toFixed(2);
  inputEur.value = (vesInput / tasas.eurBcv).toFixed(2);
  inputUsdt.value = (vesInput / tasas.usdt).toFixed(2);
});

// Listener pa cambios en Euros:
inputEur.addEventListener('input', (e) => {
  const eurInput = parseFloat(e.target.value) || 0;
  const ves = eurInput * tasas.eurBcv;
  
  inputVes.value = ves.toFixed(2);
  inputUsd.value = (ves / tasas.usdBcv).toFixed(2);
  inputUsdt.value = (ves / tasas.usdt).toFixed(2);
});

// Inicializar 
inicializarCalculadora();