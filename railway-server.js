/**
 * Railway-optimized Crypto Monitoring Server
 * Production-ready version with API endpoints and health checks
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data storage
const DATA_DIR = path.join(__dirname, 'crypto-data');
const COLLECTION_INTERVAL = 30000; // 30 seconds
const VOLUME_USD = 50000;

// MOEX Configuration
const MOEX_TOKEN = process.env.MOEX_TOKEN || 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJaVHA2Tjg1ekE4YTBFVDZ5SFBTajJ2V0ZldzNOc2xiSVR2bnVaYWlSNS1NIn0.eyJleHAiOjE3NTU5NzkwNDgsImlhdCI6MTc1MzM4NzA0OCwiYXV0aF90aW1lIjoxNzUzMzg2OTI3LCJqdGkiOiIyZGFmMDc2OC01MDE3LTRjOTctYjVmYy1jYjkyYWZiOGM0YTciLCJpc3MiOiJodHRwczovL3NzbzIubW9leC5jb20vYXV0aC9yZWFsbXMvY3JhbWwiLCJhdWQiOlsiYWNjb3VudCIsImlzcyJdLCJzdWIiOiJmOjBiYTZhOGYwLWMzOGEtNDlkNi1iYTBlLTg1NmYxZmU0YmY3ZTpmZGE1NmEzMS1iMGZmLTQyMzQtOGFkYi05MGVkNmJiYzgzZTciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJpc3MiLCJzaWQiOiJkY2FmZjE3ZS1lOGY1LTRkNGQtOGEwMy1iMTM4ODFmNTcxNWYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGlzc19hbGdvcGFjayBwcm9maWxlIG9mZmxpbmVfYWNjZXNzIGVtYWlsIGJhY2t3YXJkc19jb21wYXRpYmxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJpc3NfcGVybWlzc2lvbnMiOiIxMzcsIDEzOCwgMTM5LCAxNDAsIDE2NSwgMTY2LCAxNjcsIDE2OCwgMzI5LCA0MjEiLCJuYW1lIjoi0KHQtdGA0LPQtdC5INCU0LXQvNGH0YPQuiIsInByZWZlcnJlZF91c2VybmFtZSI6ImZkYTU2YTMxLWIwZmYtNDIzNC04YWRiLTkwZWQ2YmJjODNlNyIsImdpdmVuX25hbWUiOiLQodC10YDQs9C10LkiLCJzZXNzaW9uX3N0YXRlIjoiZGNhZmYxN2UtZThmNS00ZDRkLThhMDMtYjEzODgxZjU3MTVmIiwiZmFtaWx5X25hbWUiOiLQlNC10LzRh9GD0LoifQ.VokuiqiPsFjLj9nZ4CBphGPzMjM7y2I13-rk9s3AHuUTorzPrfv1j83B59WYzyXzUy69K8V9uUCYwLy4zo3y2JNw1V2O07IajWt1g_uw0M9IC_nmbaL-FnQsPXSd73BjDyOGZXdTTPs5K92WquaoC_dnStN49JanlRfv0phhnP0Iyt0YJBJiWj4i_ATG_VWa4XV41wSKjLTXZ1mEMqftRK4ZV6fxvZ12F2X4q8THOxKq1aKHEhjUgBJ4vguDICqqW2yNjpw6Mf4SYcgySu1lVq67OGm_uBs4788Sl4NXiiTrLQxFULMcZQvHKMUVtLLN2w4ppaGGjYAE0eqk6NtnJA';

// In-memory storage for latest rates
let latestRates = {
    timestamp: null,
    rapira: null,
    grinex: null,
    moex: null,
    arbitrage: null
};

// Initialize data directory
async function initDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        console.log('📁 Data directory initialized:', DATA_DIR);
    } catch (error) {
        console.error('Error creating directory:', error);
    }
}

// Calculate weighted price
function calculateWeightedPrice(orders, volumeUSDT, isBid = false) {
    if (!orders || orders.length === 0) return null;
    
    let remainingVolume = volumeUSDT;
    let totalCost = 0;
    let totalVolume = 0;
    
    const normalizedOrders = orders.map(order => {
        if (order.price !== undefined) {
            return { price: parseFloat(order.price), amount: parseFloat(order.amount) };
        } else {
            return { price: parseFloat(order[0]), amount: parseFloat(order[1]) };
        }
    });
    
    const sortedOrders = isBid 
        ? normalizedOrders.sort((a, b) => b.price - a.price)
        : normalizedOrders.sort((a, b) => a.price - b.price);
    
    for (const order of sortedOrders) {
        const price = order.price;
        const amount = order.amount;
        
        if (remainingVolume <= 0) break;
        
        const volumeToTake = Math.min(amount, remainingVolume);
        totalCost += price * volumeToTake;
        totalVolume += volumeToTake;
        remainingVolume -= volumeToTake;
    }
    
    if (totalVolume === 0) return null;
    return totalCost / totalVolume;
}

// Fetch RAPIRA rates
async function fetchRapiraRates() {
    const url = 'https://api.rprsb.ru/api/public/depth?pair=USDT-USDT';
    try {
        const response = await axios.get(url, { timeout: 10000 });
        const data = response.data;
        
        if (data && data.bids && data.asks) {
            const bidPrice = calculateWeightedPrice(data.bids, VOLUME_USD, true);
            const askPrice = calculateWeightedPrice(data.asks, VOLUME_USD, false);
            
            return {
                exchange: 'RAPIRA',
                bid: bidPrice ? bidPrice.toFixed(2) : 'N/A',
                ask: askPrice ? askPrice.toFixed(2) : 'N/A',
                spread: bidPrice && askPrice ? (askPrice - bidPrice).toFixed(2) : 'N/A',
                timestamp: new Date().toISOString()
            };
        }
    } catch (error) {
        console.error('RAPIRA error:', error.message);
        return { exchange: 'RAPIRA', error: error.message };
    }
    return null;
}

// Fetch GRINEX rates
async function fetchGrinexRates() {
    const url = 'https://api.garantex.org/v2/depth?market=usdtrub';
    try {
        const response = await axios.get(url, { timeout: 10000 });
        const data = response.data;
        
        if (data && data.bids && data.asks) {
            const bidPrice = calculateWeightedPrice(data.bids, VOLUME_USD, true);
            const askPrice = calculateWeightedPrice(data.asks, VOLUME_USD, false);
            
            return {
                exchange: 'GRINEX',
                bid: bidPrice ? bidPrice.toFixed(2) : 'N/A',
                ask: askPrice ? askPrice.toFixed(2) : 'N/A',
                spread: bidPrice && askPrice ? (askPrice - bidPrice).toFixed(2) : 'N/A',
                timestamp: new Date().toISOString()
            };
        }
    } catch (error) {
        console.error('GRINEX error:', error.message);
        return { exchange: 'GRINEX', error: error.message };
    }
    return null;
}

// Collect all data
async function collectData() {
    console.log('\n📊 Collecting data...');
    
    const [rapiraData, grinexData] = await Promise.all([
        fetchRapiraRates(),
        fetchGrinexRates()
    ]);
    
    // Calculate arbitrage opportunity
    let arbitrage = null;
    if (rapiraData && grinexData && rapiraData.bid && grinexData.ask) {
        const rapiraBid = parseFloat(rapiraData.bid);
        const grinexAsk = parseFloat(grinexData.ask);
        
        if (!isNaN(rapiraBid) && !isNaN(grinexAsk)) {
            const profit = rapiraBid - grinexAsk;
            const profitPercent = (profit / grinexAsk) * 100;
            
            arbitrage = {
                buy: 'GRINEX',
                buyPrice: grinexAsk,
                sell: 'RAPIRA',
                sellPrice: rapiraBid,
                profit: profit.toFixed(2),
                profitPercent: profitPercent.toFixed(2),
                viable: profitPercent > 0.5
            };
        }
    }
    
    // Update latest rates
    latestRates = {
        timestamp: new Date().toISOString(),
        rapira: rapiraData,
        grinex: grinexData,
        arbitrage: arbitrage
    };
    
    // Save to file
    const filename = `rates-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(DATA_DIR, filename);
    
    try {
        let existingData = [];
        try {
            const fileContent = await fs.readFile(filepath, 'utf8');
            existingData = JSON.parse(fileContent);
        } catch {}
        
        existingData.push(latestRates);
        await fs.writeFile(filepath, JSON.stringify(existingData, null, 2));
        
        console.log('✅ Data saved to:', filename);
    } catch (error) {
        console.error('❌ Error saving data:', error);
    }
    
    return latestRates;
}

// API Routes
app.get('/', (req, res) => {
    res.json({
        name: 'AI Crypto Monitoring System',
        version: '2.0.0',
        status: 'online',
        endpoints: {
            health: '/health',
            rates: '/api/rates',
            history: '/api/history',
            arbitrage: '/api/arbitrage'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        lastUpdate: latestRates.timestamp
    });
});

app.get('/api/rates', async (req, res) => {
    if (!latestRates.timestamp) {
        latestRates = await collectData();
    }
    res.json(latestRates);
});

app.get('/api/arbitrage', (req, res) => {
    if (latestRates.arbitrage) {
        res.json(latestRates.arbitrage);
    } else {
        res.json({ message: 'No arbitrage opportunity at the moment' });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const files = await fs.readdir(DATA_DIR);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        
        if (jsonFiles.length === 0) {
            return res.json({ message: 'No history available' });
        }
        
        // Get latest file
        const latestFile = jsonFiles.sort().pop();
        const content = await fs.readFile(path.join(DATA_DIR, latestFile), 'utf8');
        const data = JSON.parse(content);
        
        res.json({
            file: latestFile,
            records: data.length,
            data: data.slice(-10) // Last 10 records
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start collection interval
async function startMonitoring() {
    await initDataDir();
    
    // Initial collection
    await collectData();
    
    // Schedule regular collection
    setInterval(collectData, COLLECTION_INTERVAL);
    
    console.log(`⏰ Data collection scheduled every ${COLLECTION_INTERVAL/1000} seconds`);
}

// Start server
app.listen(PORT, () => {
    console.log('🚀 Crypto Monitoring Server started');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🌐 Railway ready on port ${PORT}`);
    
    // Start monitoring
    startMonitoring();
});