// Event listeners
document.getElementById('searchBtn').addEventListener('click', searchProduct);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchProduct();
});

function searchProduct() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        alert('Vennligst skriv inn et produktnavn');
        return;
    }

    // Vis resultater
    displayResults(query);
}

function displayResults(productName) {
    // Vis resultatseksjonen
    document.getElementById('resultsSection').style.display = 'block';
    
    // Vis produktnavn
    displayProductHeader(productName);
    
    // Vis butikklenker
    displayStoreLinks(productName);
    
    // Skjul prishistorikk
    document.querySelector('.price-history').style.display = 'none';
    
    // Scroll til resultater
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function displayProductHeader(productName) {
    const bestDealDiv = document.getElementById('bestDeal');
    bestDealDiv.innerHTML = `
        <h3>🔍 Søker etter: "${productName}"</h3>
        <p style="margin-top: 10px; font-size: 0.95rem;">Klikk på en butikk nedenfor for å se produkter og priser</p>
    `;
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
