const axios = require('axios');
const cheerio = require('cheerio');

export default async function handler(req, res) {
  // 1. Configurar CORS para que tu web (frontend) pueda leer esta API sin bloqueos
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 2. SCRAPING AL BCV CON CHEERIO
    // Engañamos un poco al servidor usando un User-Agent de un navegador real 
    // para evitar que el firewall del BCV nos bloquee de inmediato.
    const bcvResponse = await axios.get('https://www.bcv.org.ve/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      },
      timeout: 10000 // Si el BCV tarda más de 10 seg, abortamos
    });

    // Cargamos el HTML en Cheerio
    const $ = cheerio.load(bcvResponse.data);

    // Función auxiliar para limpiar el texto: cambiar la coma por punto y convertir a número
    const extraerTasa = (selector) => {
      const texto = $(selector).text().trim().replace(',', '.');
      return parseFloat(texto);
    };

    // Extraemos los valores usando los selectores CSS de la página del BCV
    const usdBcv = extraerTasa('#dolar strong');
    const eurBcv = extraerTasa('#euro strong');


    // 3. CONSULTA A LA API DE BINANCE P2P (USDT)
    const binancePayload = {
      "fiat": "VES",
      "page": 1,
      "rows": 5, // Traemos los 5 primeros anuncios para sacar un promedio
      "tradeType": "SELL",
      "asset": "USDT",
      "countries": [],
      "payTypes": [],
      "publisherType": null
    };

    const binanceResponse = await axios.post(
      'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', 
      binancePayload
    );

    // Sacamos el promedio de los 5 primeros vendedores
    const anuncios = binanceResponse.data.data;
    let sumaUsdt = 0;
    anuncios.forEach(anuncio => {
      sumaUsdt += parseFloat(anuncio.adv.price);
    });
    const usdtPromedio = sumaUsdt / anuncios.length;


    // 4. EL TRUCO MAGISTRAL: CACHÉ DE VERCEL
    // Le decimos a Vercel: "Guarda esta respuesta por 2 horas (7200 segundos)".
    // Así, si 1000 personas entran a tu app, Vercel solo lee el BCV 1 vez y a los demás les da el dato guardado.
    res.setHeader('Cache-Control', 's-maxage=7200, stale-while-revalidate');

    // 5. Enviamos la respuesta limpia y empaquetada
    res.status(200).json({
      success: true,
      data: {
        usdBcv: usdBcv,
        eurBcv: eurBcv,
        usdt: parseFloat(usdtPromedio.toFixed(2))
      },
      last_update: new Date().toISOString()
    });

  } catch (error) {
    // Si la página del BCV se cae, capturamos el error elegantemente
    res.status(500).json({
      success: false,
      message: 'Error obteniendo las tasas. El BCV podría estar caído.',
      error: error.message
    });
  }
}