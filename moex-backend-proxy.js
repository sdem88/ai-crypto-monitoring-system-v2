/**
 * Backend прокси-сервер для работы с MOEX API
 * Запуск: node moex-backend-proxy.js
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// MOEX API токен
const MOEX_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJaVHA2Tjg1ekE4YTBFVDZ5SFBTajJ2V0ZldzNOc2xiSVR2bnVaYWlSNS1NIn0.eyJleHAiOjE3NTU5NzkwNDgsImlhdCI6MTc1MzM4NzA0OCwiYXV0aF90aW1lIjoxNzUzMzg2OTI3LCJqdGkiOiIyZGFmMDc2OC01MDE3LTRjOTctYjVmYy1jYjkyYWZiOGM0YTciLCJpc3MiOiJodHRwczovL3NzbzIubW9leC5jb20vYXV0aC9yZWFsbXMvY3JhbWwiLCJhdWQiOlsiYWNjb3VudCIsImlzcyJdLCJzdWIiOiJmOjBiYTZhOGYwLWMzOGEtNDlkNi1iYTBlLTg1NmYxZmU0YmY3ZTpmZGE1NmEzMS1iMGZmLTQyMzQtOGFkYi05MGVkNmJiYzgzZTciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJpc3MiLCJzaWQiOiJkY2FmZjE3ZS1lOGY1LTRkNGQtOGEwMy1iMTM4ODFmNTcxNWYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGlzc19hbGdvcGFjayBwcm9maWxlIG9mZmxpbmVfYWNjZXNzIGVtYWlsIGJhY2t3YXJkc19jb21wYXRpYmxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJpc3NfcGVybWlzc2lvbnMiOiIxMzcsIDEzOCwgMTM5LCAxNDAsIDE2NSwgMTY2LCAxNjcsIDE2OCwgMzI5LCA0MjEiLCJuYW1lIjoi0KHQtdGA0LPQtdC5INCU0LXQvNGH0YPQuiIsInByZWZlcnJlZF91c2VybmFtZSI6ImZkYTU2YTMxLWIwZmYtNDIzNC04YWRiLTkwZWQ2YmJjODNlNyIsImdpdmVuX25hbWUiOiLQodC10YDQs9C10LkiLCJzZXNzaW9uX3N0YXRlIjoiZGNhZmYxN2UtZThmNS00ZDRkLThhMDMtYjEzODgxZjU3MTVmIiwiZmFtaWx5X25hbWUiOiLQlNC10LzRh9GD0LoifQ.VokuiqiPsFjLj9nZ4CBphGPzMjM7y2I13-rk9s3AHuUTorzPrfv1j83B59WYzyXzUy69K8V9uUCYwLy4zo3y2JNw1V2O07IajWt1g_uw0M9IC_nmbaL-FnQsPXSd73BjDyOGZXdTTPs5K92WquaoC_dnStN49JanlRfv0phhnP0Iyt0YJBJiWj4i_ATG_VWa4XV41wSKjLTXZ1mEMqftRK4ZV6fxvZ12F2X4q8THOxKq1aKHEhjUgBJ4vguDICqqW2yNjpw6Mf4SYcgySu1lVq67OGm_uBs4788Sl4NXiiTrLQxFULMcZQvHKMUVtLLN2w4ppaGGjYAE0eqk6NtnJA';

// Разрешаем CORS для всех источников
app.use(cors());
app.use(express.json());

// Маппинг контрактов
const CONTRACT_MAPPING = {
    'USDRUBF': 'USDRUBF',
    'Si-9.25': 'SiU5',    // Si сентябрь 2025
    'Si-12.25': 'SiZ5',   // Si декабрь 2025
    'Si-3.26': 'SiH6'     // Si март 2026
};

// Эндпоинт для получения данных по фьючерсам
app.get('/api/moex/futures/:contract', async (req, res) => {
    const { contract } = req.params;
    const secid = CONTRACT_MAPPING[contract];
    
    if (!secid) {
        return res.status(400).json({ error: 'Unknown contract' });
    }
    
    try {
        // Получаем данные с MOEX API
        const response = await axios.get(
            `https://iss.moex.com/iss/engines/futures/markets/forts/securities/${secid}.json`,
            {
                headers: {
                    'Authorization': `Bearer ${MOEX_TOKEN}`,
                    'Accept': 'application/json'
                }
            }
        );
        
        const data = response.data;
        
        // Парсим данные
        const marketdata = data.marketdata;
        const securities = data.securities;
        
        if (marketdata && marketdata.data && marketdata.data.length > 0) {
            const columns = marketdata.columns;
            const row = marketdata.data[0];
            
            // Находим индексы нужных колонок
            const lastIndex = columns.indexOf('LAST');
            const volumeIndex = columns.indexOf('VOLTODAY');
            const changeIndex = columns.indexOf('LASTTOPREVPRICE');
            
            const result = {
                contract: contract,
                secid: secid,
                last: row[lastIndex] || null,
                volume: row[volumeIndex] || null,
                change: row[changeIndex] || null,
                timestamp: new Date().toISOString()
            };
            
            res.json(result);
        } else {
            res.json({
                contract: contract,
                secid: secid,
                last: null,
                volume: null,
                change: null,
                error: 'No data available',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error fetching MOEX data:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch data', 
            message: error.message,
            contract: contract
        });
    }
});

// Эндпоинт для получения всех фьючерсов одним запросом
app.get('/api/moex/futures', async (req, res) => {
    const contracts = Object.keys(CONTRACT_MAPPING);
    const results = {};
    
    for (const contract of contracts) {
        try {
            const secid = CONTRACT_MAPPING[contract];
            const response = await axios.get(
                `https://iss.moex.com/iss/engines/futures/markets/forts/securities/${secid}.json`,
                {
                    headers: {
                        'Authorization': `Bearer ${MOEX_TOKEN}`,
                        'Accept': 'application/json'
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
                
                results[contract] = {
                    last: row[lastIndex] || null,
                    volume: row[volumeIndex] || null,
                    change: row[changeIndex] || null
                };
            } else {
                results[contract] = {
                    last: null,
                    volume: null,
                    change: null
                };
            }
        } catch (error) {
            console.error(`Error fetching data for ${contract}:`, error.message);
            results[contract] = {
                last: null,
                volume: null,
                change: null,
                error: error.message
            };
        }
    }
    
    res.json({
        data: results,
        timestamp: new Date().toISOString()
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`MOEX прокси-сервер запущен на порту ${PORT}`);
    console.log(`Доступные эндпоинты:`);
    console.log(`  GET http://localhost:${PORT}/api/moex/futures - все фьючерсы`);
    console.log(`  GET http://localhost:${PORT}/api/moex/futures/:contract - конкретный контракт`);
    console.log(`\nДоступные контракты:`);
    Object.entries(CONTRACT_MAPPING).forEach(([key, value]) => {
        console.log(`  ${key} -> ${value}`);
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});