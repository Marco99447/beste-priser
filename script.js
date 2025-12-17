// SerpAPI konfigurasjon
const SERPAPI_KEY = '895cd663e8829780e62fcd736e85b70b1dd88a8f43691875cc20dbc9499f633f';

// Event listeners
document.getElementById('searchBtn').addEventListener('click', searchProduct);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchProduct();
});

async function searchProduct() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        alert('Vennligst skriv inn et produktnavn');
        return;
    }

    // Vis loading
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('bestDeal').innerHTML = `
        <h3>🔍 Søker etter produkter...</h3>
        <p style="margin-top: 10px;">Vennligst vent...</p>
    `;
    document.getElementById('priceTableBody').innerHTML = `
        <tr><td colspan="4" style="text-align: center; padding: 20px;">Laster...</td></tr>
    `;

    try {
        // Bruk CORS-proxy for å omgå CORS-problemer
        const apiUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&google_domain=google.no&gl=no&hl=no&num=40&api_key=${SERPAPI_KEY}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
        
        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.shopping_results && data.shopping_results.length > 0) {
            displayResults(query, data.shopping_results);
        } else {
            displayNoResults(query);
        }
    } catch (error) {
        console.error('Feil ved søk:', error);
        displayNoResults(query);
    }
    
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function displayResults(productName, results) {
    // Filtre bort tilbehør
    const accessories = ['case', 'cover', 'charger', 'cable', 'screen protector', 'adapter', 'beskytter', 'deksel', 'lader', 'kabel', 'etui', 'glass'];
    
    let filteredResults = results.filter(item => {
        const title = (item.title || '').toLowerCase();
        const isAccessory = accessories.some(acc => title.includes(acc));
        return !isAccessory && item.price;
    });
    
    // Sorter etter pris
    const sortedResults = filteredResults
        .sort((a, b) => parseFloat(a.price.replace(/[^0-9.-]+/g, '')) - parseFloat(b.price.replace(/[^0-9.-]+/g, '')));
    
    if (sortedResults.length > 0) {
        displayBestDeal(productName, sortedResults[0]);
        displayPriceTable(sortedResults.slice(0, 10));
    } else {
        displayNoResults(productName);
    }
    
    document.querySelector('.price-history').style.display = 'none';
}

function displayBestDeal(productName, bestDeal) {
    const bestDealDiv = document.getElementById('bestDeal');
    const price = bestDeal.extracted_price || bestDeal.price;
    const store = bestDeal.source || 'Ukjent butikk';
    
    bestDealDiv.innerHTML = `
        <h3>🏆 Beste pris funnet:</h3>
        <div class="price">${price} kr</div>
        <div class="store">hos ${store}</div>
    `;
}

function displayPriceTable(results) {
    const tbody = document.getElementById('priceTableBody');
    tbody.innerHTML = '';
    
    results.forEach((item, index) => {
        const price = item.extracted_price || item.price;
        const store = item.source || 'Ukjent butikk';
        const link = item.link || '#';
        const title = item.title || '';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${store}</strong><br><small style="color: #666;">${title.substring(0, 50)}${title.length > 50 ? '...' : ''}</small></td>
            <td class="price-cell">${price} kr</td>
            <td>${item.delivery || 'Se i butikk'}</td>
            <td>
                <button class="visit-btn">Se produkt</button>
            </td>
        `;
        tbody.appendChild(row);
        
        const button = row.querySelector('.visit-btn');
        button.addEventListener('click', function() {
            window.open(link, '_blank');
        });
    });
}

function displayNoResults(productName) {
    const bestDealDiv = document.getElementById('bestDeal');
    bestDealDiv.innerHTML = `
        <h3>🔍 Søker etter: "${productName}"</h3>
        <p style="margin-top: 10px; font-size: 0.95rem;">Klikk på en butikk nedenfor for å søke direkte</p>
    `;
    
    displayStoreLinks(productName);
}

function displayStoreLinks(productName) {
    // Liste over norske nettbutikker med søke-URL-maler
    const stores = [
        { name: "Elkjøp", searchUrl: "https://www.elkjop.no/search?searchTerm=", logo: "🔵" },
        { name: "Power", searchUrl: "https://www.power.no/search/?q=", logo: "⚡" },
        { name: "Komplett", searchUrl: "https://www.komplett.no/search?q=", logo: "💻" },
        { name: "NetOnNet", searchUrl: "https://www.netonnet.no/search?q=", logo: "🟠" },
        { name: "Proshop", searchUrl: "https://www.proshop.no/?s=", logo: "🔴" }
    ];
    
    const tbody = document.getElementById('priceTableBody');
    tbody.innerHTML = '';
    
    // Encode søkeord for URL
    const encodedQuery = encodeURIComponent(productName);
    
    stores.forEach((store, index) => {
        const searchUrl = store.searchUrl + encodedQuery;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${store.logo} ${store.name}</strong></td>
            <td class="price-cell" style="color: #666;">Se i butikk</td>
            <td>Varierer</td>
            <td>
                <button class="visit-btn" data-url="${searchUrl}">
                    Søk i butikk
                </button>
            </td>
        `;
        tbody.appendChild(row);
        
        // Legg til event listener på knappen
        const button = row.querySelector('.visit-btn');
        button.addEventListener('click', function() {
            window.open(searchUrl, '_blank');
        });
    });
}
