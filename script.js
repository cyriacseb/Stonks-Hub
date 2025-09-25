$(document).ready(function() {
    // --- MOCK DATA ---
    // In a real application, this would come from an API
    let stocks = [
        { ticker: "GOOGL", name: "Alphabet Inc.", price: 175.45, lastPrice: 175.45, sector: "Technology", marketCap: 2180, peRatio: 26.5, dividendYield: 0.45, bio: "An American multinational technology company that focuses on artificial intelligence, search engine technology, online advertising, and more.", history: Array.from({length: 30}, () => 170 + Math.random() * 10) },
        { ticker: "AAPL", name: "Apple Inc.", price: 214.29, lastPrice: 214.29, sector: "Technology", marketCap: 3280, peRatio: 32.8, dividendYield: 0.46, bio: "Designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.", history: Array.from({length: 30}, () => 210 + Math.random() * 10) },
        { ticker: "MSFT", name: "Microsoft Corp.", price: 444.85, lastPrice: 444.85, sector: "Technology", marketCap: 3300, peRatio: 38.6, dividendYield: 0.66, bio: "Develops, licenses, and supports software, services, devices, and solutions worldwide.", history: Array.from({length: 30}, () => 440 + Math.random() * 10) },
        { ticker: "JPM", name: "JPMorgan Chase & Co.", price: 198.58, lastPrice: 198.58, sector: "Financial", marketCap: 570, peRatio: 11.9, dividendYield: 2.31, bio: "A global financial services firm providing investment banking, financial services for consumers and small businesses, and more.", history: Array.from({length: 30}, () => 195 + Math.random() * 8) },
        { ticker: "V", name: "Visa Inc.", price: 275.50, lastPrice: 275.50, sector: "Financial", marketCap: 560, peRatio: 31.2, dividendYield: 0.76, bio: "Operates as a payments technology company worldwide.", history: Array.from({length: 30}, () => 270 + Math.random() * 10) },
        { ticker: "JNJ", name: "Johnson & Johnson", price: 147.25, lastPrice: 147.25, sector: "Healthcare", marketCap: 375, peRatio: 21.5, dividendYield: 3.24, bio: "Researches, develops, manufactures, and sells products in the healthcare field worldwide.", history: Array.from({length: 30}, () => 145 + Math.random() * 5) },
        { ticker: "WMT", name: "Walmart Inc.", price: 67.40, lastPrice: 67.40, sector: "Consumer Staples", marketCap: 545, peRatio: 28.1, dividendYield: 1.35, bio: "Engages in the operation of retail, wholesale, and other units worldwide.", history: Array.from({length: 30}, () => 65 + Math.random() * 4) },
        { ticker: "TSLA", name: "Tesla, Inc.", price: 183.01, lastPrice: 183.01, sector: "Automotive", marketCap: 580, peRatio: 40.7, dividendYield: 0.00, bio: "Designs, develops, manufactures, and sells electric vehicles, energy generation, and storage systems.", history: Array.from({length: 30}, () => 180 + Math.random() * 15) },
        { ticker: "NKE", name: "NIKE, Inc.", price: 93.88, lastPrice: 93.88, sector: "Consumer Discretionary", marketCap: 143, peRatio: 28.3, dividendYield: 1.58, bio: "Engages in the design, development, marketing, and sale of athletic footwear, apparel, and accessories.", history: Array.from({length: 30}, () => 90 + Math.random() * 8) },
    ];

    let chartInstance; // To hold the chart object

    // --- INITIALIZATION ---

    // Populate sector filter dropdown
    const sectors = [...new Set(stocks.map(stock => stock.sector))];
    sectors.forEach(sector => {
        $('#filter-sector').append(`<option value="${sector}">${sector}</option>`);
    });

    // Initial render of all stocks
    renderStocks(stocks);


    // --- RENDERING FUNCTIONS ---
    
    // Function to render the stock list
    function renderStocks(stocksToRender) {
        const stockListings = $('#stock-listings');
        stockListings.empty();

        if (stocksToRender.length === 0) {
            stockListings.append('<tr><td colspan="4" class="text-center text-secondary py-5">No stocks match your criteria.</td></tr>');
            return;
        }

        stocksToRender.forEach(stock => {
            const change = stock.price - stock.lastPrice;
            const changePercent = (change / stock.lastPrice * 100).toFixed(2);
            const priceClass = change > 0.01 ? 'price-up' : change < -0.01 ? 'price-down' : 'price-no-change';
            
            const stockRow = `
                <tr class="stock-row" data-ticker="${stock.ticker}">
                    <td>
                        <div class="fw-bold">${stock.ticker}</div>
                        <div class="text-secondary small">${stock.name}</div>
                    </td>
                    <td class="text-end fw-bold fs-5">${stock.price.toFixed(2)}</td>
                    <td class="text-end ${priceClass}">
                        <div>${change.toFixed(2)}</div>
                        <div class="small">(${changePercent}%)</div>
                    </td>
                    <td class="text-end d-none d-md-table-cell">$${stock.marketCap}B</td>
                </tr>
            `;
            stockListings.append(stockRow);
        });
    }

    // Function to show stock details
    function showStockDetails(ticker) {
        const stock = stocks.find(s => s.ticker === ticker);
        if (!stock) return;

        // Populate detail view
        $('#detail-company-name').text(`${stock.name} (${stock.ticker})`);
        
        const change = stock.price - stock.lastPrice;
        const priceClass = change > 0.01 ? 'price-up' : change < -0.01 ? 'price-down' : 'price-no-change';
        $('#detail-price').html(`
            <span class="display-6 me-3">${stock.price.toFixed(2)}</span>
            <span class="${priceClass} fs-4">${change.toFixed(2)}</span>
        `);

        $('#detail-profile').text(stock.bio);

        $('#detail-metrics').html(`
            <li class="d-flex justify-content-between py-2 border-bottom border-secondary"><span>Market Cap</span> <strong>$${stock.marketCap}B</strong></li>
            <li class="d-flex justify-content-between py-2 border-bottom border-secondary"><span>P/E Ratio</span> <strong>${stock.peRatio}</strong></li>
            <li class="d-flex justify-content-between py-2"><span>Dividend Yield</span> <strong>${stock.dividendYield}%</strong></li>
        `);

        // Render chart
        renderChart(stock);

        // Switch views
        $('#stock-list-view').hide();
        $('#stock-detail-view').show();
        window.scrollTo(0, 0);
    }

    // Function to render the price history chart
    function renderChart(stock) {
        const ctx = document.getElementById('stock-chart').getContext('2d');
        
        if (chartInstance) {
            chartInstance.destroy();
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 123, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 123, 255, 0)');

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 30}, (_, i) => `Day ${i + 1}`),
                datasets: [{
                    label: 'Price',
                    data: stock.history,
                    borderColor: '#0d6efd',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { display: false },
                    y: {
                        ticks: { color: '#adb5bd' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    // --- EVENT HANDLERS ---

    // Search and filter logic
    function applyFilters() {
        const searchTerm = $('#search-input').val().toLowerCase();
        const selectedSector = $('#filter-sector').val();
        const selectedMarketCap = $('#filter-market-cap').val();

        let filteredStocks = stocks.filter(stock => {
            // Search filter
            const matchesSearch = stock.name.toLowerCase().includes(searchTerm) || stock.ticker.toLowerCase().includes(searchTerm);
            
            // Sector filter
            const matchesSector = selectedSector === 'all' || stock.sector === selectedSector;
            
            // Market cap filter
            let matchesMarketCap = true;
            if (selectedMarketCap !== 'all') {
                const cap = stock.marketCap;
                if (selectedMarketCap === 'large') matchesMarketCap = cap > 10;
                else if (selectedMarketCap === 'mid') matchesMarketCap = cap >= 2 && cap <= 10;
                else if (selectedMarketCap === 'small') matchesMarketCap = cap < 2;
            }

            return matchesSearch && matchesSector && matchesMarketCap;
        });
        
        renderStocks(filteredStocks);
    }

    $('#search-input, #filter-sector, #filter-market-cap').on('input change', applyFilters);

    // Click on a stock row to see details
    $('#stock-listings').on('click', '.stock-row', function() {
        const ticker = $(this).data('ticker');
        showStockDetails(ticker);
    });

    // Back button to return to the list
    $('#back-to-list').on('click', function() {
        $('#stock-detail-view').hide();
        $('#stock-list-view').show();
        // We re-apply filters in case prices updated while on detail view
        applyFilters();
    });
    

    // --- REAL-TIME SIMULATION ---
    setInterval(() => {
        stocks.forEach(stock => {
            stock.lastPrice = stock.price;
            const change = (Math.random() - 0.5) * (stock.price * 0.01); // Fluctuate by up to 1%
            stock.price = Math.max(0, stock.price + change); // Ensure price doesn't go negative
        });
        
        // Only re-render if the list view is visible
        if ($('#stock-list-view').is(':visible')) {
            applyFilters();
        }
    }, 2000); // Update prices every 2 seconds
});
