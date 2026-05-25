const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

export default async function handler(req, res) {
  
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {

    const agent = new https.Agent({  
      rejectUnauthorized: false
    });

    const bcvResponse = await axios.get('https://www.bcv.org.ve/', {
        httpsAgent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      },
      timeout: 10000 
    });

    
    const $ = cheerio.load(bcvResponse.data);

     
    const extraerTasa = (selector) => {
      const texto = $(selector).text().trim().replace(',', '.');
      return parseFloat(texto);
    };

   
    const usdBcv = extraerTasa('#dolar strong');
    const eurBcv = extraerTasa('#euro strong');


    
    const binancePayload = {
      "fiat": "VES",
      "page": 1,
      "rows": 5, // primero 5 ads de p2p 
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

    
    const anuncios = binanceResponse.data.data;
    let sumaUsdt = 0;
    anuncios.forEach(anuncio => {
      sumaUsdt += parseFloat(anuncio.adv.price);
    });
    const usdtPromedio = sumaUsdt / anuncios.length;


    res.setHeader('Cache-Control', 's-maxage=7200, stale-while-revalidate');

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
    res.status(500).json({
      success: false,
      message: 'Error obteniendo las tasas. Intenta de nuevo más tarde.',
      error: error.message
    });
  }
}