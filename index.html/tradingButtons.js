// ============================================
// FILTER BUTTONS UI - filter-buttons.js
// ============================================

window.currentCategory = 'all';
window.currentSubCategory = null;
window.currentLocation = 'all';
window.allProducts = [];
window.originalProducts = [];
window.filteredProducts = [];

let shuffleTimer = null;

// --------------------------------------------
// SAFE DATA ACCESS
// --------------------------------------------
function getCategories() {
    return window.categories || (typeof categories !== 'undefined' ? categories : []);
}

function getLocationOptions() {
    return window.locationOptions || (typeof locationOptions !== 'undefined' ? locationOptions : []);
}

function getBaseProducts() {
    if (window.originalProducts && window.originalProducts.length) return window.originalProducts;
    if (window.myProducts && Array.isArray(window.myProducts)) return window.myProducts;
    if (typeof myProducts !== 'undefined' && Array.isArray(myProducts)) return myProducts;
    return [];
}

// ============================================
// INJECT CSS STYLES
// ============================================
function injectDropdownStyles() {
    if (document.getElementById('filter-buttons-styles')) return;
    const s = document.createElement('style');
    s.id = 'filter-buttons-styles';
    s.textContent = `
    /* ---------- CONTAINER ---------- */
    #tradingButtons {
        width: 100%;
        max-width: 100%;
        overflow: visible;
        padding: 6px 0;
         position: relative;
        z-index: 10000;         /* above product cards */
    }

    .filter-buttons-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        width: 100%;
        min-width: 0;
        overflow: visible;
        position: relative;
        z-index: 10000;
    }

    /* ---------- BUTTON WRAPPER ---------- */
    .btn-wrapper {
        position: relative;
        display: inline-block;
        //  z-index: 10001;         /* each dropdown's wrapper */
    }

    /* ---------- FILTER BUTTON ---------- */
    .filter-btn {
        padding: 8px 16px;
        border: 1px solid #ddd;
        background: #fff;
        color: #222;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        line-height: 1.2;
        white-space: nowrap;
        transition: background .15s, border-color .15s;
        font-family: inherit;
    }

    .filter-btn:hover {
        background: #f2f2f2;
    }

    .filter-btn.has-dropdown {
        padding-right: 28px;
        position: relative;
    }

    .filter-btn.active {
        background: #007bff;
        color: #fff;
        border-color: #007bff;
    }

    .filter-btn.active:hover {
        background: #0056b3;
    }

    /* ---------- DROPDOWN ARROW ---------- */
    .dropdown-arrow {
        position: absolute;
        right: 9px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 9px;
        opacity: .7;
        pointer-events: none;
        color: green;
    }
    .dropdown-arrow:hover {
        color: orange;
    }

    /* ---------- DROPDOWN MENU ---------- */
    .dropdown-menu {
    display: none;
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    justify-content: center;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    /* color: green; */
    /* background: #fff; */
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, .15);
    padding: 5px;
    z-index: 99999;
    /* overflow-y: auto; */
    z-index: 10002;      /* actual dropdown, highest in the stack */
}

    .dropdown-menu.show {
        display: block;
    }

    .dropdown-item {
        display: block;
        width: 100%;
        padding: 9px 14px;
        border: 0;
        background: none;
        text-align: left;
        cursor: pointer;
        font-size: 13px;
        color: #222;
        font-family: inherit;
        white-space: nowrap;
    }

    .dropdown-item:hover {
        background: #f2f2f2;
    }

    .dropdown-item.active-sub {
        background: #007bff;
        color: #fff;
    }

    /* ---------- LOCATION SORT ---------- */
    .location-sort-wrapper {
        margin-left: auto;
    }

    .location-sort-select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        background: #fff;
        font-size: 13px;
        cursor: pointer;
        font-family: inherit;
    }

    .location-sort-select:hover {
        border-color: #007bff;
    }

    /* ---------- FIXED (HOME) BUTTON ---------- */
    .fixed-btn {
        background: #28a745;
        color: #fff;
        border-color: #28a745;
    }

    .fixed-btn:hover {
        background: #218838;
    }

    .fixed-btn.active {
        background: #28a745;
        border-color: #28a745;
    }
    `;
    document.head.appendChild(s);
}

// ============================================
// LOCATION DROPDOWN
// ============================================
function generateLocationDropdown() {
    const opts = getLocationOptions();
    if (!opts.length) return '';

    return `
        <div class="location-sort-wrapper">
            <select id="locationSort" class="location-sort-select">
                ${opts.map(o => {
                    const v = (o.value || '').trim();
                    const sel = v === window.currentLocation ? 'selected' : '';
                    return `<option value="${v}" ${sel}>${o.label}</option>`;
                }).join('')}
            </select>
        </div>`;
}

// ============================================
// RENDER FILTER BUTTONS
// ============================================
function renderFilterButtons() {
    const container = document.getElementById('tradingButtons');
    if (!container) {
        console.error('❌ #tradingButtons container not found in HTML!');
        return;
    }

    const cats = getCategories();
    if (!cats.length) {
        console.error('❌ categories data missing!');
        return;
    }

    const buttonsHtml = cats.map(cat => {
        const isActive = cat.id === window.currentCategory ? 'active' : '';
        const isFixed = cat.fixed ? 'fixed-btn' : '';
        const hasDropdown = cat.hasDropdown ? 'has-dropdown' : '';
        const content = cat.color
            ? `<span style="color:${cat.color};pointer-events:none;">${cat.label}</span>`
            : cat.label;

        let dropdownHtml = '';
        if (cat.hasDropdown && cat.dropdownItems) {
            const items = cat.dropdownItems.map(item => {
                const isSub = window.currentSubCategory === item.id ? 'active-sub' : '';
                return `<button type="button" class="dropdown-item ${isSub}"
                          data-category="${cat.id}"
                          data-sub="${item.id}"
                          data-filter="${item.filter}">${item.label}</button>`;
            }).join('');

            dropdownHtml = `
                <div class="dropdown-menu">
                    <button type="button" class="dropdown-item"
                            data-category="${cat.id}"
                            data-sub="${cat.id}"
                            data-filter="all">ALL ${cat.label}</button>
                    ${items}
                </div>`;
        }

        return `
            <div class="btn-wrapper ${hasDropdown}">
                <button type="button"
                        class="filter-btn ${isActive} ${isFixed} ${hasDropdown}"
                        data-category="${cat.id}"
                        data-fixed="${cat.fixed || false}"
                        data-has-dropdown="${cat.hasDropdown || false}">
                    ${content}
                    ${cat.hasDropdown ? '<span class="dropdown-arrow">▼</span>' : ''}
                </button>
                ${dropdownHtml}
            </div>`;
    }).join('');

    container.innerHTML = `
        <div class="filter-buttons-wrapper">${buttonsHtml}</div>
        ${generateLocationDropdown()}
    `;

    // Re-attach location select listener (element is recreated each render)
    const locSel = document.getElementById('locationSort');
    if (locSel) {
        locSel.addEventListener('change', (e) => {
            window.currentLocation = e.target.value.trim() || 'all';
            applyFilterAndRender(
                window.currentCategory,
                window.currentSubCategory || 'all'
            );
        });
    }
}

// ============================================
// SINGLE DELEGATED CLICK HANDLER
// ============================================
document.addEventListener('click', (e) => {
    const dropdownItem = e.target.closest('.dropdown-item');
    const dropdownBtn  = e.target.closest('.filter-btn.has-dropdown');
    const regularBtn   = e.target.closest('.filter-btn');

    // ---- Case 1: dropdown item clicked ----
    if (dropdownItem) {
        e.preventDefault();
        e.stopPropagation();

        const category    = dropdownItem.dataset.category;
        const subCategory = dropdownItem.dataset.sub;
        const filter      = dropdownItem.dataset.filter;

        window.currentCategory    = category;
        window.currentSubCategory = subCategory;

        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.dropdown-item').forEach(d => d.classList.remove('active-sub'));
        dropdownItem.classList.add('active-sub');

        const wrap = dropdownItem.closest('.btn-wrapper');
        const pbtn = wrap ? wrap.querySelector('.filter-btn') : null;
        if (pbtn) pbtn.classList.add('active');

        document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));

        window.allProducts = getShuffledProducts();
        startFiveMinuteReshuffle();
        applyFilterAndRender(category, filter);
        return;
    }

    // ---- Case 2: dropdown toggle clicked ----
    if (dropdownBtn) {
        e.preventDefault();
        e.stopPropagation();

        const wrap = dropdownBtn.closest('.btn-wrapper');
        const menu = wrap ? wrap.querySelector('.dropdown-menu') : null;
        if (!menu) return;

        const wasOpen = menu.classList.contains('show');
        document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
        if (!wasOpen) menu.classList.add('show');
        return;
    }

    // ---- Case 3: regular filter button clicked ----
    if (regularBtn) {
        e.preventDefault();
        e.stopPropagation();

        const category = regularBtn.getAttribute('data-category');
        const isFixed  = regularBtn.getAttribute('data-fixed') === 'true';

        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        regularBtn.classList.add('active');

        window.currentCategory    = category;
        window.currentSubCategory = null;

        if (isFixed || category === 'all') {
            window.allProducts = [...getBaseProducts()];
            if (shuffleTimer) clearInterval(shuffleTimer);
        } else {
            window.allProducts = getShuffledProducts();
            startFiveMinuteReshuffle();
        }

        applyFilterAndRender(category, 'all');
        return;
    }

    // ---- Case 4: click elsewhere → close dropdowns ----
    document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
});

// ============================================
// FILTER + RENDER
// ============================================
function applyFilterAndRender(category, filter) {
    const base = getBaseProducts();
    window.originalProducts = base.map(p => ({ ...p }));

    let filtered = [...base];

    // ---------- CATEGORY + SUBCATEGORY ----------
    if (category && category !== 'all') {
        filtered = filtered.filter(product => {
            const pc = (product.category || '').toLowerCase().trim();
            const tc = category.toLowerCase().trim();
            const matchesCat =
                pc === tc ||
                pc.includes(tc) ||
                pc.includes(tc.replace(/_/g, ' '));

            if (filter && filter !== 'all') {
                const pb   = (product.brand || '').toLowerCase().trim();
                const psub = (product.subCategory || '').toLowerCase().trim();
                const tf   = filter.toLowerCase().trim();
                return matchesCat && (pb === tf || psub === tf);
            }
            return matchesCat;
        });
    }

    // ---------- LOCATION ----------
    if (window.currentLocation &&
        window.currentLocation !== 'all' &&
        window.currentLocation !== '') {

        const loc = window.currentLocation.toLowerCase().trim();

        filtered = filtered.filter(p => {
            const raw = (p.location || '').toLowerCase();
            // "uganda > kampala > ham shopping grounds" →
            // "uganda kampala ham shopping grounds"
            const normalized = raw
                .replace(/[>|,]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            return normalized.split(' ').includes(loc) || normalized.includes(loc);
        });
    }

    window.filteredProducts = filtered;

    // ---------- RENDER ----------
    if (typeof window.renderProducts === 'function') {
        window.renderProducts(filtered);
    } else if (typeof renderProducts === 'function') {
        renderProducts(filtered);
    } else {
        const container =
            document.getElementById('productList') ||
            document.getElementById('productGrid');

        if (container) {
            container.innerHTML = filtered.length
                ? filtered.map(p => `
                    <div class="product" data-category="${p.category || ''}">
                        <div class="image_BX">
                            <img src="${p.image}" alt="${p.name || ''}" loading="fast">
                            <div class="product-info">
                                <div class="product-name">${p.name || ''}</div>
                                <div class="price-container">${p.newPrice || ''}</div>
                            </div>
                        </div>
                    </div>`).join('')
                : '<p>No products found.</p>';
        }
    }
}

// ============================================
// SHUFFLE UTILITIES
// ============================================
function shuffleArray(array) {
    if (!Array.isArray(array)) return [];
    const arr = array.map(i => ({ ...i }));
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getShuffledProducts() {
    return shuffleArray(getBaseProducts());
}

function startFiveMinuteReshuffle() {
    if (shuffleTimer) clearInterval(shuffleTimer);
    shuffleTimer = setInterval(() => {
        if (window.currentCategory !== 'all') {
            window.allProducts = getShuffledProducts();
            applyFilterAndRender(
                window.currentCategory,
                window.currentSubCategory || 'all'
            );
        }
    }, 5 * 60 * 1000);
}

// ============================================
// RESET TO HOME
// ============================================
function resetToHome() {
    window.currentCategory    = 'all';
    window.currentSubCategory = null;
    window.currentLocation    = 'all';

    if (shuffleTimer) clearInterval(shuffleTimer);

    renderFilterButtons();
    applyFilterAndRender('all', 'all');
}

// ============================================
// INIT
// ============================================
function initStoreUI() {
    // Inject CSS first
    injectDropdownStyles();

    // Sync products from whatever global source exists
    const base = getBaseProducts();
    if (base.length) {
        window.originalProducts = base.map(p => ({ ...p }));
        window.allProducts      = [...window.originalProducts];
        window.filteredProducts = [...window.originalProducts];
    } else {
        console.warn('⚠️ No products found. Is products.js loaded before filter-buttons.js?');
    }

    renderFilterButtons();
    applyFilterAndRender('all', 'all');
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initStoreUI();
} else {
    document.addEventListener('DOMContentLoaded', initStoreUI);
}

// Escape key → reset to home
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') resetToHome();
});

// Expose for other scripts / debugging
window.renderFilterButtons  = renderFilterButtons;
window.applyFilterAndRender = applyFilterAndRender;
window.resetToHome          = resetToHome;