// ============================================
// FILTER BUTTONS UI — filter-buttons.js
// FINAL — with Country → Region cascade dropdown
// ============================================

window.currentCategory   = 'all';
window.currentSubCategory = null;
window.currentLocation   = 'all';
window.currentCountry    = 'all';
window.currentRegion     = 'all';
window.allProducts       = [];
window.originalProducts  = [];
window.filteredProducts  = [];
let shuffleTimer = null;

/* ---------------------------------------------
   Data accessors (safe fallbacks)
--------------------------------------------- */
function getCategories() {
    return window.categories || (typeof categories !== 'undefined' ? categories : []);
}
function getLocationOptions() {
    return window.locationOptions || (typeof locationOptions !== 'undefined' ? locationOptions : {});
}
function getBaseProducts() {
    if (typeof myProducts !== 'undefined' && Array.isArray(myProducts) && myProducts.length) return myProducts;
    if (window.myProducts && Array.isArray(window.myProducts) && window.myProducts.length) return window.myProducts;
    if (window.originalProducts && window.originalProducts.length) return window.originalProducts;
    return [];
}

/* ---------------------------------------------
   Inject styles
--------------------------------------------- */
function injectDropdownStyles() {
    if (document.getElementById('filter-buttons-styles')) return;
    const s = document.createElement('style');
    s.id = 'filter-buttons-styles';
    s.textContent = `
    #tradingButtons { width: fit-content; padding: 6px 0; position: relative; }
    .filter-buttons-wrapper { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; width: 100%; }
    .btn-wrapper { position: relative; display: inline-block; }
    .filter-btn { padding: 8px 16px; border: 1px solid #ddd; background: #fff; color: #222; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; white-space: nowrap; }
    .filter-btn:hover { background: #f2f2f2; }
    .filter-btn.has-dropdown { padding-right: 28px; }


    `;
    document.head.appendChild(s);
}

/* ---------------------------------------------
   Build the country + region dropdowns
--------------------------------------------- */
function generateLocationDropdown() {
    const countries = Object.entries(getLocationOptions());

    const countryOpts = `
        <option value="all">All Countries</option>
        ${countries.map(([key, c]) => `<option value="${key}">${c.label}</option>`).join('')}
    `;

    return `
        <div class="location-sort-wrapper">
            <select id="countrySelect" class="location-sort-select">
                ${countryOpts}
            </select>
            <select id="regionSelect" class="location-sort-select" style="display:none;">
                <option value="all">All Regions</option>
            </select>
        </div>
    `;
}

/* ---------------------------------------------
   Render filter buttons + location dropdowns
--------------------------------------------- */
function renderFilterButtons() {
    const container = document.getElementById('tradingButtons');
    if (!container) return;
    const cats = getCategories();
    if (!cats.length) return;

    const buttonsHtml = cats.map(cat => {
        const isActive    = cat.id === window.currentCategory ? 'active' : '';
        const hasDropdown = cat.hasDropdown ? 'has-dropdown' : '';
        const content     = cat.color
            ? `<span style="color:${cat.color};pointer-events:none;">${cat.label}</span>`
            : cat.label;

        let dropdownHtml = '';
        if (cat.hasDropdown && cat.dropdownItems) {
            const items = cat.dropdownItems.map(item => {
                const isSub = window.currentSubCategory === item.id ? 'active-sub' : '';
                return `<button type="button" class="dropdown-item ${isSub}" data-category="${cat.id}" data-sub="${item.id}" data-filter="${item.filter}">${item.label}</button>`;
            }).join('');
            dropdownHtml = `<div class="dropdown-menu">
                <button type="button" class="dropdown-item" data-category="${cat.id}" data-sub="${cat.id}" data-filter="all">ALL ${cat.label}</button>
                ${items}
            </div>`;
        }

        return `<div class="btn-wrapper ${hasDropdown}">
            <button type="button" class="filter-btn ${isActive} ${hasDropdown}" data-category="${cat.id}" data-fixed="${cat.fixed || false}" data-has-dropdown="${cat.hasDropdown || false}">
                ${content} ${cat.hasDropdown ? '<span class="dropdown-arrow">▼</span>' : ''}
            </button>
            ${dropdownHtml}
        </div>`;
    }).join('');

    container.innerHTML = `<div class="filter-buttons-wrapper">${buttonsHtml}</div>${generateLocationDropdown()}`;

    wireLocationDropdowns();
    restoreLocationSelection();
}

/* ---------------------------------------------
   Wire country → region cascade
--------------------------------------------- */
function wireLocationDropdowns() {
    const countrySel = document.getElementById('countrySelect');
    const regionSel  = document.getElementById('regionSelect');

    if (countrySel) {
        countrySel.addEventListener('change', (e) => {
            const country = e.target.value;
            window.currentCountry = country;
            window.currentRegion  = 'all';
            window.currentLocation = country === 'all' ? 'all' : country;

            const loc = getLocationOptions();

            if (country === 'all' || !loc[country]) {
                regionSel.style.display = 'none';
                regionSel.innerHTML = '<option value="all">All Regions</option>';
                applyFilterAndRender(window.currentCategory, window.currentSubCategory || 'all');
                return;
            }

            // Populate region dropdown
            const regions = loc[country].regions || {};
            const regionOpts = Object.entries(regions)
                .map(([key, r]) => `<option value="${key}">${r.label}</option>`)
                .join('');

            regionSel.innerHTML =
                `<option value="all">All ${loc[country].label} regions</option>${regionOpts}`;
            regionSel.style.display = 'inline-block';
            regionSel.value = 'all';

            applyFilterAndRender(window.currentCategory, window.currentSubCategory || 'all');
        });
    }

    if (regionSel) {
        regionSel.addEventListener('change', (e) => {
            const region = e.target.value;
            window.currentRegion = region;
            window.currentLocation = region === 'all'
                ? (window.currentCountry || 'all')
                : region;
            applyFilterAndRender(window.currentCategory, window.currentSubCategory || 'all');
        });
    }
}

/* ---------------------------------------------
   Keep dropdown selections after re-render
--------------------------------------------- */
function restoreLocationSelection() {
    const countrySel = document.getElementById('countrySelect');
    const regionSel  = document.getElementById('regionSelect');
    if (!countrySel) return;

    if (window.currentCountry && window.currentCountry !== 'all') {
        countrySel.value = window.currentCountry;

        const loc = getLocationOptions();
        if (loc[window.currentCountry]) {
            const regions = loc[window.currentCountry].regions || {};
            const regionOpts = Object.entries(regions)
                .map(([key, r]) => `<option value="${key}">${r.label}</option>`)
                .join('');
            regionSel.innerHTML =
                `<option value="all">All ${loc[window.currentCountry].label} regions</option>${regionOpts}`;
            regionSel.style.display = 'inline-block';
            regionSel.value = window.currentRegion || 'all';
        }
    }
}

/* ---------------------------------------------
   Global click handling (buttons + dropdowns)
--------------------------------------------- */
document.addEventListener('click', (e) => {
    const dropdownItem = e.target.closest('.dropdown-item');
    const dropdownBtn  = e.target.closest('.filter-btn.has-dropdown');
    const regularBtn   = e.target.closest('.filter-btn');

    if (dropdownItem) {
        e.preventDefault(); e.stopPropagation();
        window.currentCategory    = dropdownItem.dataset.category;
        window.currentSubCategory = dropdownItem.dataset.sub;

        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.dropdown-item').forEach(d => d.classList.remove('active-sub'));
        dropdownItem.classList.add('active-sub');

        const pbtn = dropdownItem.closest('.btn-wrapper')?.querySelector('.filter-btn');
        if (pbtn) pbtn.classList.add('active');

        document.querySelectorAll('.dropdown-menu.showDropdown').forEach(m => m.classList.remove('showDropdown'));

        applyFilterAndRender(dropdownItem.dataset.category, dropdownItem.dataset.filter);
        startFiveMinuteReshuffle();
        return;
    }

    if (dropdownBtn) {
        e.preventDefault(); e.stopPropagation();
        const menu = dropdownBtn.closest('.btn-wrapper')?.querySelector('.dropdown-menu');
        if (!menu) return;
        const wasOpen = menu.classList.contains('showDropdown');
        document.querySelectorAll('.dropdown-menu.showDropdown').forEach(m => m.classList.remove('showDropdown'));
        if (!wasOpen) menu.classList.add('showDropdown');
        return;
    }

    if (regularBtn) {
        e.preventDefault(); e.stopPropagation();
        const category = regularBtn.getAttribute('data-category');
        const isFixed  = regularBtn.getAttribute('data-fixed') === 'true';

        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        regularBtn.classList.add('active');

        window.currentCategory    = category;
        window.currentSubCategory = null;

        if (isFixed || category === 'all') {
            if (shuffleTimer) clearInterval(shuffleTimer);
        } else {
            startFiveMinuteReshuffle();
        }

        applyFilterAndRender(category, 'all');
        return;
    }

    document.querySelectorAll('.dropdown-menu.showDropdown').forEach(m => m.classList.remove('showDropdown'));
});

/* ---------------------------------------------
   MAIN FILTER
--------------------------------------------- */
function applyFilterAndRender(category, filter) {
    const grid = document.getElementById('productList') || document.getElementById('productGrid');
    if (!grid) return;

    const cat = (category || 'all').toLowerCase().trim();
    const sub = (filter   || 'all').toLowerCase().trim();
    const loc = (window.currentLocation || 'all').toLowerCase().trim();

    const base = getBaseProducts();
    const filtered = [];

    base.forEach(p => {
        const rawCats = (p.category || '').toLowerCase().trim();
        const pCats   = rawCats.split(/[\s,]+/).filter(Boolean);
        const pBrand  = (p.brand || '').toLowerCase().trim();
        const pSub    = (p.subCategory || '').toLowerCase().trim();
        const pLoc    = (p.location || p.Location || '').toLowerCase().trim();
        const pClass  = (p.class || '').toLowerCase().trim();

        // Category match
        let okCat = true;
        if (cat !== 'all') {
            okCat = pCats.includes(cat) || rawCats.includes(cat) || pClass === cat;
        }

        // Subcategory / brand match
        let okSub = true;
        if (sub !== 'all') {
            okSub = pBrand === sub || pSub === sub || pBrand.includes(sub) || pSub.includes(sub);
        }

        // Location match — try region key first, then country, then free text
        let okLoc = true;
        if (loc !== 'all') {
            const country = (window.currentCountry || '').toLowerCase();
            const region  = (window.currentRegion  || '').toLowerCase();
            const L = getLocationOptions();

            let countryLabel = '';
            let regionLabel  = '';

            if (country && L[country]) {
                countryLabel = L[country].label.toLowerCase();
                if (region && region !== 'all' && L[country].regions[region]) {
                    regionLabel = L[country].regions[region].label.toLowerCase();
                }
            }

            okLoc = pLoc.includes(loc)
                 || (regionLabel  && pLoc.includes(regionLabel))
                 || (countryLabel && pLoc.includes(countryLabel));
        }

        if (okCat && okSub && okLoc) filtered.push(p);
    });

    window.filteredProducts = filtered;

    // Filter DOM
    const keepIds   = new Set(filtered.map(p => String(p.id).toLowerCase().trim()));
    const keepNames = new Set(filtered.map(p => (p.name || '').toLowerCase().trim()));

    let visibleCount = 0;
    const productsInDOM = grid.querySelectorAll(':scope > .product, :scope > .product-card, :scope > div[data-id]');

    if (productsInDOM.length === 0) {
        if (typeof window.renderProducts === 'function') {
            window.renderProducts(filtered.length ? filtered : base);
        }
        return;
    }

    productsInDOM.forEach((el, idx) => {
        if (el.id === 'noProductsMsg') return;

        const elId   = (el.dataset.id || el.getAttribute('data-id') || '').toLowerCase().trim();
        const elName = (el.dataset.name || el.querySelector('.product-name')?.textContent || '').toLowerCase().trim();

        let shouldShow = false;
        if (cat === 'all' && sub === 'all' && loc === 'all') {
            shouldShow = true;
        } else if (elId && keepIds.has(elId)) {
            shouldShow = true;
        } else if (elName && keepNames.has(elName)) {
            shouldShow = true;
        } else if (!elId && !elName) {
            const p = base[idx];
            if (p && filtered.includes(p)) shouldShow = true;
        }

        el.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleCount++;
    });

    // Empty state
    let msg = document.getElementById('noProductsMsg');
    if (visibleCount === 0) {
        if (!msg) {
            msg = document.createElement('div');
            msg.id = 'noProductsMsg';
            msg.style.cssText = 'grid-column:1/-1;text-align:center;padding:40px;color:#666;';
            grid.appendChild(msg);
        }
        msg.textContent = `No products found in ${category}`;
        msg.style.display = 'block';
    } else if (msg) {
        msg.style.display = 'none';
    }

    console.log(`[SEAN10 FILTER] ${cat} / ${sub} / ${loc} -> ${visibleCount} visible from ${base.length}`);
}

/* ---------------------------------------------
   Reshuffle utilities
--------------------------------------------- */
function shuffleArray(array) {
    const arr = array.map(i => ({ ...i }));
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function startFiveMinuteReshuffle() {
    if (shuffleTimer) clearInterval(shuffleTimer);
    shuffleTimer = setInterval(() => {
        if (window.currentCategory !== 'all') {
            const grid = document.getElementById('productList') || document.getElementById('productGrid');
            if (grid) {
                const visible = Array.from(grid.children)
                    .filter(c => c.style.display !== 'none' && c.id !== 'noProductsMsg');
                const shuffled = shuffleArray(visible);
                shuffled.forEach(el => grid.appendChild(el));
            }
        }
    }, 5 * 60 * 1000);
}

/* ---------------------------------------------
   Reset
--------------------------------------------- */
function resetToHome() {
    window.currentCategory    = 'all';
    window.currentSubCategory = null;
    window.currentLocation    = 'all';
    window.currentCountry     = 'all';
    window.currentRegion      = 'all';

    if (shuffleTimer) clearInterval(shuffleTimer);
    renderFilterButtons();
    applyFilterAndRender('all', 'all');
}

/* ---------------------------------------------
   Init
--------------------------------------------- */
function initStoreUI() {
    injectDropdownStyles();

    const base = getBaseProducts();
    if (base.length) {
        window.originalProducts  = base.map(p => ({ ...p }));
        window.allProducts       = [...window.originalProducts];
        window.filteredProducts  = [...window.originalProducts];
    }

    renderFilterButtons();
    setTimeout(() => applyFilterAndRender('all', 'all'), 100);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initStoreUI, 0);
} else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initStoreUI, 0));
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') resetToHome();
});

// Expose for other scripts
window.renderFilterButtons  = renderFilterButtons;
window.applyFilterAndRender = applyFilterAndRender;
window.resetToHome          = resetToHome;

