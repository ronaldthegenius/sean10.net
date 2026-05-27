
// Dropdown menu HTML for location sorting
const locationDropdown = `
    <div class="location-sort-wrapper">
        <select id="locationSort" class="location-sort-select">
            <option value="">Sort by Location ▼</option>
            <option value="all">All Locations</option>
            <option value="kampala">Kampala, Uganda</option>
            <option value="masaka">masaka</option>
            <option value="south africa">south africa, east london</option>
            <option value="jinja">jinja</option>
            <option value="ndeeba">ndeeba</option>
            <option value="kireka">kireka</option>
            <option value="makindye">makindye</option>
            <option value="busega">busega</option>
            <option value="zana">zana</option>
        </select>
    </div>
`;

// Store current filters
let currentCategory = 'all';
let currentLocation = 'all';

// 2. Optimized Render Function
function renderFilterButtons() {
    const container = document.getElementById('tradingButtons');
    if (!container) return;

    const filterButtonsHtml = categories.map(cat => {
        const content = cat.color 
            ? `<span style="color: ${cat.color}; pointer-events: none;">${cat.label}</span>` 
            : cat.label;

        return `
            <button class="filter-btn ${cat.id === 'all' ? 'active' : ''}" data-category="${cat.id}">
                ${content}
            </button>
        `;
    }).join('');

    // Combine buttons and dropdown
    container.innerHTML = `
        <div class="filter-buttons-wrapper">
            ${filterButtonsHtml}
        </div>
        ${locationDropdown}
    `;

    // Add event listener for location dropdown
    const locationSelect = document.getElementById('locationSort');
    if (locationSelect) {
        locationSelect.addEventListener('change', (e) => {
            currentLocation = e.target.value;
            applyFilters();
        });
    }
}

// Function to apply both category and location filters
function applyFilters() {
    const products = document.querySelectorAll('.product');
    
    products.forEach(product => {
        // Check category match
        const categoryString = product.dataset.category || "";
        const productCategories = categoryString.trim().split(/\s+/);
        const categoryMatch = currentCategory === 'all' || productCategories.includes(currentCategory);
        
        // Check location match
        let locationMatch = false;
        if (currentLocation === 'all' || currentLocation === '') {
            locationMatch = true;
        } else {
            const productLocation = (product.dataset.location || "").toLowerCase();
            locationMatch = productLocation.includes(currentLocation.toLowerCase());
        }
        
        // Show product only if BOTH filters match
        product.style.display = (categoryMatch && locationMatch) ? 'block' : 'none';
    });
}

// 3. Main Logic Controller
document.addEventListener('DOMContentLoaded', () => {
    renderFilterButtons();
    
    const tradingButtonsContainer = document.getElementById('tradingButtons');

    tradingButtonsContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.filter-btn');
        if (!button) return;

        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        currentCategory = button.getAttribute('data-category');
        applyFilters();
    });
});

