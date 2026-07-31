

// Location options - EASY TO MODIFY
const locationOptions = [
    { value: "", label: "Sort by Location ▼" },
    { value: "all", label: "All Locations" },
    { value: "kampala", label: "Kampala, Uganda" },
    { value: "makindye", label: "Makindye ,uganda" },
    { value: " dubai", label: " Dubai, united arab emirates" },
    { value: " sharjah", label: "sharjah, united arab emirates" },
    { value: " nansana", label: "nansana, uganda" },
    { value: " kawempe", label: "kawempe, uganda" },
    { value: " kireka", label: "kireka, uganda" },
    { value: " kibuye", label: "kibuye, uganda" },
    { value: " mengo", label: "mengo, uganda" },
    { value: " ntebbe", label: "ntebbe, uganda" },
    { value: " guanzhou", label: "china , guanzhou" },
    { value: " kiseka", label: "uganda , kiseka" }
    
   
];

// SHUFFLE FUNCTION - using proper Fisher-Yates
function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Store current filters
let currentCategory = 'all';
let currentLocation = 'all';
let allProducts = [];

// Store original products for HOME button
let originalProducts = [];

// Dynamic dropdown generation
function generateLocationDropdown() {
    return `
        <div class="location-sort-wrapper">
            <select id="locationSort" class="location-sort-select">
                ${locationOptions.map(opt => 
                    `<option value="${opt.value}" ${opt.value === currentLocation ? 'selected' : ''}>${opt.label}</option>`
                ).join('')}
            </select>
        </div>
    `;
}

// Shuffle function using proper Fisher-Yates
function getShuffledProducts() {
    return shuffleArray(myProducts);
}

// Render filter buttons + dropdown
function renderFilterButtons() {
    const container = document.getElementById('tradingButtons');
    if (!container) return;

    const filterButtonsHtml = categories.map(cat => {
        const isActive = cat.id === currentCategory ? 'active' : '';
        const isFixed = cat.fixed ? 'fixed-btn' : ''; // Special class for HOME button
        const content = cat.color 
            ? `<span style="color: ${cat.color}; pointer-events: none;">${cat.label}</span>` 
            : cat.label;

        return `
            <button class="filter-btn ${isActive} ${isFixed}" data-category="${cat.id}" data-fixed="${cat.fixed || false}">
                ${content}
            </button>
        `;
    }).join('');

    container.innerHTML = `
        <div class="filter-buttons-wrapper">
            ${filterButtonsHtml}
        </div>
        ${generateLocationDropdown()}
    `;

    // Location dropdown event
    const locationSelect = document.getElementById('locationSort');
    if (locationSelect) {
        locationSelect.addEventListener('change', (e) => {
            currentLocation = e.target.value;
            renderProducts();
        });
    }
}

// Render products with filtering
function renderProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    let filtered = allProducts;

    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => 
            (p.category || "").toLowerCase().includes(currentCategory.toLowerCase())
        );
    }

    // Filter by location
    if (currentLocation !== 'all' && currentLocation !== '') {
        filtered = filtered.filter(p => 
            (p.location || "").toLowerCase().includes(currentLocation.toLowerCase())
        );
    }

    if (filtered.length === 0) {
        productList.innerHTML = `
            <div class="no-products">
                <p>No products found in this category</p>
                <button onclick="resetToHome()" class="reset-btn">Show All Products</button>
            </div>
        `;
        return;
    }

    productList.innerHTML = filtered.map(product => `
        <div class="product" data-category="${product.category}" data-location="${product.location || ''}" onclick="openPreview('${product.id}')">
            <div class="image_BX">
                <span class="condition">${product.class}</span> 
                <img height="100px" width="110px" src="${product.image}" alt="${product.name}">
                ${product.isNew ? '<mark>new</mark>' : ''}
                <h3><span>${product.name}</span></h3>
                <p class="price-container">
                    <span> <del>${product.oldPrice}</del>${product.newPrice}</span>
                </p>
            </div>
        </div>
    `).join('');
}

// Reset to HOME (no shuffle, show original order)
function resetToHome() {
    currentCategory = 'all';
    currentLocation = 'all';
    allProducts = [...originalProducts]; // Restore original order (no shuffle)
    renderFilterButtons();
    renderProducts();
}

// Main Logic Controller
document.addEventListener('DOMContentLoaded', () => {
    // Store original products (HOME state)
    originalProducts = [...myProducts];
    
    // Initial load - HOME state (no shuffle)
    allProducts = [...originalProducts];
    
    renderFilterButtons();
    renderProducts();

    const tradingButtonsContainer = document.getElementById('tradingButtons');

    tradingButtonsContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.filter-btn');
        if (!button) return;

        const category = button.getAttribute('data-category');
        const isFixed = button.getAttribute('data-fixed') === 'true';

        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Update current category
        currentCategory = category;

        // LOGIC: Only shuffle if NOT the HOME button
        if (isFixed) {
            // HOME button - restore original order (NO shuffle)
            allProducts = [...originalProducts];
        } else {
            // Category buttons - SHUFFLE
            allProducts = getShuffledProducts();
        }

        renderProducts();
    });
});

// Optional: Keyboard shortcut to reset to HOME
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        resetToHome();
    }
});