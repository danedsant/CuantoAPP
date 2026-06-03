# Churupitos 💸

Una herramienta web moderna y ligera diseñada para consultar y calcular conversiones de divisas en tiempo real, adaptada al contexto económico venezolano. La aplicación obtiene automáticamente las tasas oficiales del **Banco Central de Venezuela (BCV)** y el promedio del mercado P2P de **Binance (USDT)**.

## 🚀 Características Principales

* **Calculadora Bidireccional:** Convierte montos instantáneamente entre cualquier moneda (VES, USD, EUR, USDT) con solo escribir en uno de los campos.
* **Tasas en Tiempo Real:** Realiza web scraping automatizado a la página del BCV para obtener el precio oficial del Dólar (USD) y Euro (EUR).
* **Integración con Binance P2P:** Se conecta a la API de Binance para calcular un promedio del precio de venta de Tether (USDT) en Bolívares (VES).


## 🛠️ Tecnologías Utilizadas

* JavaScript Vanilla (Lógica de conversión y consumo de API).
* Node.js
* [Axios](https://axios-http.com/) (Para peticiones HTTP a Binance y al BCV).
* [Cheerio](https://cheerio.js.org/) (Para procesar y extraer los datos del DOM del BCV).

