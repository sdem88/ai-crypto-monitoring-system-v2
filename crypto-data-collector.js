/**
 * 24/7 сборщик данных с криптобирж и MOEX
 * Записывает данные в Airtable каждые 30 секунд
 */

const axios = require('axios');
const Airtable = require('airtable');
require('dotenv').config();

// Конфигурация Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'YOUR_AIRTABLE_API_KEY';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'YOUR_BASE_ID';
const AIRTABLE_TABLE_NAME = 'CryptoRates';

// Инициализация Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Интервал сбора данных (30 секунд)
const COLLECTION_INTERVAL = 30000; // 30 секунд

// Конфигурация MOEX
const MOEX_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJaVHA2Tjg1ekE4YTBFVDZ5SFBTajJ2V0ZldzNOc2xiSVR2bnVaYWlSNS1NIn0.eyJleHAiOjE3NTU5NzkwNDgsImlhdCI6MTc1MzM4NzA0OCwiYXV0aF90aW1lIjoxNzUzMzg2OTI3LCJqdGkiOiIyZGFmMDc2OC01MDE3LTRjOTctYjVmYy1jYjkyYWZiOGM0YTciLCJpc3MiOiJodHRwczovL3NzbzIubW9leC5jb20vYXV0aC9yZWFsbXMvY3JhbWwiLCJhdWQiOlsiYWNjb3VudCIsImlzcyJdLCJzdWIiOiJmOjBiYTZhOGYwLWMzOGEtNDlkNi1iYTBlLTg1NmYxZmU0YmY3ZTpmZGE1NmEzMS1iMGZmLTQyMzQtOGFkYi05MGVkNmJiYzgzZTciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJpc3MiLCJzaWQiOiJkY2FmZjE3ZS1lOGY1LTRkNGQtOGEwMy1iMTM4ODFmNTcxNWYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGlzc19hbGdvcGFjayBwcm9maWxlIG9mZmxpbmVfYWNjZXNzIGVtYWlsIGJhY2t3YXJkc19jb21wYXRpYmxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJpc3NfcGVybWlzc2lvbnMiOiIxMzcsIDEzOCwgMTM5LCAxNDAsIDE2NSwgMTY2LCAxNjcsIDE2OCwgMzI5LCA0MjEiLCJuYW1lIjoi0KHQtdGA0LPQtdC5INCU0LXQvNGH0YPQuiIsInByZWZlcnJlZF91c2VybmFtZSI6ImZkYTU2YTMxLWIwZmYtNDIzNC04YWRiLTkwZWQ2YmJjODNlNyIsImdpdmVuX25hbWUiOiLQodC10YDQs9C10LkiLCJzZXNzaW9uX3N0YXRlIjoiZGNhZmYxN2UtZThmNS00ZDRkLThhMDMtYjEzODgxZjU3MTVmIiwiZmFtaWx5X25hbWUiOiLQlNC10LzRh9GD0LoifQ.VokuiqiPsFjLj9nZ4CBphGPzMjM7y2I13-rk9s3AHuUTorzPrfv1j83B59WYzyXzUy69K8V9uUCYwLy4zo3y2JNw1V2O07IajWt1g_uw0M9IC_nmbaL-FnQsPXSd73BjDyOGZXdTTPs5K92WquaoC_dnStN49JanlRfv0phhnP0Iyt0YJBJiWj4i_ATG_VWa4XV41wSKjLTXZ1mEMqftRK4ZV6fxvZ12F2X4q8THOxKq1aKHEhjUgBJ4vguDICqqW2yNjpw6Mf4SYcgySu1lVq67OGm_uBs4788Sl4NXiiTrLQxFULMcZQvHKMUVtLLN2w4ppaGGjYAE0eqk6NtnJA';

const MOEX_CONTRACTS = {
    'USDRUBF': 'USDRUBF',
    'Si-9.25': 'SiU5',
    'Si-12.25': 'SiZ5',
    'Si-3.26': 'SiH6'
};

// Объем для расчета (50,000 USDT)
const VOLUME_USD = 50000;

// Функция для расчета средневзвешенной цены
function calculateWeightedPrice(orders, volumeUSDT, isBid = false) {
    if (!orders || orders.length === 0) return null;
    
    let remainingVolume = volumeUSDT;
    let totalCost = 0;
    let totalVolume = 0;
    
    // Преобразуем в единый формат
    const normalizedOrders = orders.map(order => {
        if (order.price !== undefined) {
            // RAPIRA формат
            return { price: parseFloat(order.price), amount: parseFloat(order.amount) };
        } else {
            // GRINEX формат
            return { price: parseFloat(order[0]), amount: parseFloat(order[1]) };
        }
    });
    
    // Сортировка
    normalizedOrders.sort((a, b) => {
        return isBid ? b.price - a.price : a.price - b.price;
    });
    
    for (const order of normalizedOrders) {
        if (remainingVolume <= 0) break;
        
        const volumeToTake = Math.min(order.amount, remainingVolume);
        totalCost += order.price * volumeToTake;
        totalVolume += volumeToTake;
        remainingVolume -= volumeToTake;
    }
    
    if (totalVolume === 0) return null;
    
    return totalCost / totalVolume;
}

// Получение данных RAPIRA
async function fetchRapiraData() {
    try {
        const response = await axios.get('https://api.rapira.net/market/exchange-plate-mini?symbol=USDT/RUB');
        const data = response.data;
        
        if (data.ask && data.bid) {
            const bidPrice = calculateWeightedPrice(data.bid.items, VOLUME_USD, true);
            const askPrice = calculateWeightedPrice(data.ask.items, VOLUME_USD, false);
            
            return {
                exchange: 'RAPIRA',
                pair: 'USDT/RUB',
                bid: bidPrice,
                ask: askPrice,
                spread: askPrice && bidPrice ? ((askPrice - bidPrice) / bidPrice * 100) : null,
                timestamp: new Date().toISOString()
            };
        }
    } catch (error) {
        console.error('Ошибка RAPIRA:', error.message);
        return null;
    }
}

// Получение данных GRINEX
async function fetchGrinexData() {
    const results = [];
    
    // USDT/RUB
    try {
        const response = await axios.get('https://grinex.io/api/v2/depth?market=usdtrub&limit=50');
        const data = response.data;
        
        if (data.asks && data.bids) {
            const bidPrice = calculateWeightedPrice(data.bids, VOLUME_USD, true);
            const askPrice = calculateWeightedPrice(data.asks, VOLUME_USD, false);
            
            results.push({
                exchange: 'GRINEX',
                pair: 'USDT/RUB',
                bid: bidPrice,
                ask: askPrice,
                spread: askPrice && bidPrice ? ((askPrice - bidPrice) / bidPrice * 100) : null,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Ошибка GRINEX USDT/RUB:', error.message);
    }
    
    // USDT/A7A5
    try {
        const response = await axios.get('https://grinex.io/api/v2/depth?market=usdta7a5&limit=50');
        const data = response.data;
        
        if (data.asks && data.bids) {
            const bidPrice = calculateWeightedPrice(data.bids, VOLUME_USD, true);
            const askPrice = calculateWeightedPrice(data.asks, VOLUME_USD, false);
            
            results.push({
                exchange: 'GRINEX',
                pair: 'USDT/A7A5',
                bid: bidPrice,
                ask: askPrice,
                spread: askPrice && bidPrice ? ((askPrice - bidPrice) / bidPrice * 100) : null,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Ошибка GRINEX USDT/A7A5:', error.message);
    }
    
    return results;
}

// Получение данных MOEX
async function fetchMoexData() {
    const results = [];
    
    for (const [contract, secid] of Object.entries(MOEX_CONTRACTS)) {
        try {
            const response = await axios.get(
                `https://iss.moex.com/iss/engines/futures/markets/forts/securities/${secid}.json`,
                {
                    headers: {
                        'Authorization': `Bearer ${MOEX_TOKEN}`
                    }
                }
            );
            
            const data = response.data;
            const marketdata = data.marketdata;
            
            if (marketdata && marketdata.data && marketdata.data.length > 0) {
                const columns = marketdata.columns;
                const row = marketdata.data[0];
                
                const lastIndex = columns.indexOf('LAST');
                const volumeIndex = columns.indexOf('VOLTODAY');
                const changeIndex = columns.indexOf('LASTTOPREVPRICE');
                
                const lastPrice = row[lastIndex];
                
                results.push({
                    exchange: 'MOEX',
                    pair: contract,
                    bid: null, // MOEX не предоставляет bid/ask через этот API
                    ask: null,
                    last: lastPrice,
                    pricePerUSD: lastPrice ? lastPrice / 1000 : null, // 1 лот = 1000 USD
                    volume: row[volumeIndex] || null,
                    change: row[changeIndex] || null,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error(`Ошибка MOEX ${contract}:`, error.message);
        }
    }
    
    return results;
}

// Запись в Airtable
async function saveToAirtable(records) {
    try {
        const airtableRecords = records.map(record => ({
            fields: {
                'Exchange': record.exchange,
                'Pair': record.pair,
                'Bid': record.bid || 0,
                'Ask': record.ask || 0,
                'Last': record.last || 0,
                'Spread': record.spread || 0,
                'Volume': record.volume || 0,
                'Change': record.change || 0,
                'Timestamp': record.timestamp
            }
        }));
        
        await base(AIRTABLE_TABLE_NAME).create(airtableRecords);
        console.log(`✅ Записано ${records.length} записей в Airtable`);
    } catch (error) {
        console.error('❌ Ошибка записи в Airtable:', error.message);
    }
}

// Основная функция сбора данных
async function collectData() {
    console.log(`\n📊 Сбор данных: ${new Date().toLocaleString('ru-RU')}`);
    
    const allData = [];
    
    // Собираем данные с криптобирж
    const rapiraData = await fetchRapiraData();
    if (rapiraData) allData.push(rapiraData);
    
    const grinexData = await fetchGrinexData();
    allData.push(...grinexData);
    
    // Собираем данные с MOEX
    const moexData = await fetchMoexData();
    allData.push(...moexData);
    
    console.log(`Собрано записей: ${allData.length}`);
    
    // Сохраняем в Airtable
    if (allData.length > 0) {
        await saveToAirtable(allData);
    }
}

// Функция для graceful shutdown
function shutdown() {
    console.log('\n⏹️  Остановка сборщика данных...');
    process.exit(0);
}

// Обработка сигналов завершения
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Запуск сборщика
console.log('🚀 Запуск 24/7 сборщика данных криптобирж и MOEX');
console.log(`📊 Интервал сбора: каждые ${COLLECTION_INTERVAL / 1000} секунд`);
console.log('💾 Сохранение в Airtable\n');

// Первый сбор сразу
collectData();

// Периодический сбор
setInterval(collectData, COLLECTION_INTERVAL);

// Поддержание процесса активным
process.stdin.resume();