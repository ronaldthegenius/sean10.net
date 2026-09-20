// ============================================
// FILTER BUTTONS UI - filter-buttons.js - FINAL FIX FOR SEAN10.NET
// ============================================

window.currentCategory = 'all';
window.currentSubCategory = null;
window.currentLocation = 'all';
window.allProducts = [];
window.originalProducts = [];
window.filteredProducts = [];
let shuffleTimer = null;

function getCategories() {
    return window.categories || (typeof categories!== 'undefined'? categories : []);
}
function getLocationOptions() {
    return window.locationOptions || (typeof locationOptions!== 'undefined'? locationOptions : []);
}
function getBaseProducts() {
    if (typeof myProducts!== 'undefined' && Array.isArray(myProducts) && myProducts.length) return myProducts;
    if (window.myProducts && Array.isArray(window.myProducts) && window.myProducts.length) return window.myProducts;
    if (window.originalProducts && window.originalProducts.length) return window.originalProducts;
    return [];
}

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
//    .filter-btn.active { background: #007bff; color: #fff; border-color: #007bff; }
   .filter-btn.has-dropdown { padding-right: 28px; }
//    .dropdown-menu { display: none; position: absolute; top: 110%; left: 0; z-index: 999; background: #fff; border: 1px solid #ddd; border-radius: 6px; min-width: 170px; box-shadow: 0 4px 12px rgba(0,0,0,.12); }
//    .dropdown-menu.showDropdown { display: block; }
//    .dropdown-item { display: block; width: 100%; text-align: left; padding: 9px 12px; border: 0; background: #fff; cursor: pointer; font-size: 13px; }
//    .dropdown-item:hover { background: #f5f5f5; }
//    .dropdown-item.active-sub { background: #007bff; color: #fff; }
//    .dropdown-arrow { margin-left: 6px; font-size: 10px; }
//    .location-sort-wrapper { margin-left: auto; }
//    .location-sort-select { padding: 8px 12px; border-radius: 6px; border: 1px solid #ddd; }
    `;
    document.head.appendChild(s);
}

function generateLocationDropdown() {
    const opts = getLocationOptions();
    if (!opts.length) return '';
    return `<div class="location-sort-wrapper"><select id="locationSort" class="location-sort-select">${opts.map(o => {
        const v = (o.value || '').trim();
        const sel = v === window.currentLocation? 'selected' : '';
        return `<option value="${v}" ${sel}>${o.label}</option>`;
    }).join('')}</select></div>`;
}

function renderFilterButtons() {
    const container = document.getElementById('tradingButtons');
    if (!container) return;
    const cats = getCategories();
    if (!cats.length) return;

    const buttonsHtml = cats.map(cat => {
        const isActive = cat.id === window.currentCategory? 'active' : '';
        const hasDropdown = cat.hasDropdown? 'has-dropdown' : '';
        const content = cat.color? `<span style="color:${cat.color};pointer-events:none;">${cat.label}</span>` : cat.label;
        let dropdownHtml = '';
        if (cat.hasDropdown && cat.dropdownItems) {
            const items = cat.dropdownItems.map(item => {
                const isSub = window.currentSubCategory === item.id? 'active-sub' : '';
                return `<button type="button" class="dropdown-item ${isSub}" data-category="${cat.id}" data-sub="${item.id}" data-filter="${item.filter}">${item.label}</button>`;
            }).join('');
            dropdownHtml = `<div class="dropdown-menu"><button type="button" class="dropdown-item" data-category="${cat.id}" data-sub="${cat.id}" data-filter="all">ALL ${cat.label}</button>${items}</div>`;
        }
        return `<div class="btn-wrapper ${hasDropdown}"><button type="button" class="filter-btn ${isActive} ${hasDropdown}" data-category="${cat.id}" data-fixed="${cat.fixed || false}" data-has-dropdown="${cat.hasDropdown || false}">${content} ${cat.hasDropdown? '<span class="dropdown-arrow">▼</span>' : ''}</button>${dropdownHtml}</div>`;
    }).join('');

    container.innerHTML = `<div class="filter-buttons-wrapper">${buttonsHtml}</div>${generateLocationDropdown()}`;

    const locSel = document.getElementById('locationSort');
    if (locSel) {
        locSel.addEventListener('change', (e) => {
            window.currentLocation = e.target.value.trim() || 'all';
            applyFilterAndRender(window.currentCategory, window.currentSubCategory || 'all');
        });
    }
}

document.addEventListener('click', (e) => {
    const dropdownItem = e.target.closest('.dropdown-item');
    const dropdownBtn = e.target.closest('.filter-btn.has-dropdown');
    const regularBtn = e.target.closest('.filter-btn');

    if (dropdownItem) {
        e.preventDefault(); e.stopPropagation();
        window.currentCategory = dropdownItem.dataset.category;
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
        const isFixed = regularBtn.getAttribute('data-fixed') === 'true';
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        regularBtn.classList.add('active');
        window.currentCategory = category;
        window.currentSubCategory = null;
        if (isFixed || category === 'all') { if (shuffleTimer) clearInterval(shuffleTimer); }
        else { startFiveMinuteReshuffle(); }
        applyFilterAndRender(category, 'all');
        return;
    }
    document.querySelectorAll('.dropdown-menu.showDropdown').forEach(m => m.classList.remove('showDropdown'));
});

// ============================================
// MAIN FIXED FILTER - WORKS WITH YOUR DB
// ============================================
function applyFilterAndRender(category, filter) {
    const grid = document.getElementById('productList') || document.getElementById('productGrid');
    if (!grid) return;

    const cat = (category || 'all').toLowerCase().trim();
    const sub = (filter || 'all').toLowerCase().trim();
    const loc = (window.currentLocation || 'all').toLowerCase().trim();

    const base = getBaseProducts();
    let filtered = [];

    // 1. Filter from myProducts array - FIX FOR "laptops macOS used_items"
    base.forEach(p => {
        const rawCats = (p.category || '').toLowerCase().trim();
        const pCats = rawCats.split(/[\s,]+/).filter(Boolean); // ["laptops","macos","used_items"]
        const pBrand = (p.brand || '').toLowerCase().trim();
        const pSub = (p.subCategory || '').toLowerCase().trim();
        const pLoc = (p.location || '').toLowerCase().trim();
        const pClass = (p.class || '').toLowerCase().trim();

        let okCat = true;
        if (cat!== 'all') {
            okCat = pCats.includes(cat) || rawCats.includes(cat) || pClass === cat;
        }

        let okSub = true;
        if (sub!== 'all') {
            okSub = pBrand === sub || pSub === sub || pBrand.includes(sub) || pSub.includes(sub);
        }

        let okLoc = true;
        if (loc!== 'all') {
            okLoc = pLoc.includes(loc);
        }

        if (okCat && okSub && okLoc) {
            filtered.push(p);
        }
    });

    window.filteredProducts = filtered;

    // 2. Now filter the EXISTING GRID - don't recreate
    const keepIds = new Set(filtered.map(p => String(p.id).toLowerCase().trim()));
    const keepNames = new Set(filtered.map(p => (p.name || '').toLowerCase().trim()));

    let visibleCount = 0;
    const productsInDOM = grid.querySelectorAll(':scope >.product, :scope >.product-card, :scope > div[data-id]');

    // If your grid renderer didn't add data-id, we use index fallback
    if (productsInDOM.length === 0) {
        // Fallback: if no DOM yet, call your original renderer once
        if (typeof window.renderProducts === 'function') {
            window.renderProducts(filtered.length? filtered : base);
        }
        return;
    }

    productsInDOM.forEach((el, idx) => {
        if (el.id === 'noProductsMsg') return;

        const elId = (el.dataset.id || el.getAttribute('data-id') || '').toLowerCase().trim();
        const elName = (el.dataset.name || el.querySelector('.product-name')?.textContent || '').toLowerCase().trim();

        let shouldShow = false;
        if (cat === 'all' && sub === 'all' && loc === 'all') {
            shouldShow = true;
        } else if (elId && keepIds.has(elId)) {
            shouldShow = true;
        } else if (elName && keepNames.has(elName)) {
            shouldShow = true;
        } else if (!elId &&!elName) {
            // If no id/name on DOM, match by position using myProducts index
            const p = base[idx];
            if (p && filtered.includes(p)) shouldShow = true;
        }

        el.style.display = shouldShow? '' : 'none';
        if (shouldShow) visibleCount++;
    });

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

    console.log(`[SEAN10 FILTER] ${cat} / ${sub} -> ${visibleCount} visible from ${base.length}`);
}

function shuffleArray(array) {
    const arr = array.map(i => ({...i }));
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function startFiveMinuteReshuffle() {
    if (shuffleTimer) clearInterval(shuffleTimer);
    shuffleTimer = setInterval(() => {
        if (window.currentCategory!== 'all') {
            const grid = document.getElementById('productList') || document.getElementById('productGrid');
            if (grid) {
                const visible = Array.from(grid.children).filter(c => c.style.display!== 'none' && c.id!== 'noProductsMsg');
                const shuffled = shuffleArray(visible);
                shuffled.forEach(el => grid.appendChild(el));
            }
        }
    }, 5 * 60 * 1000);
}
function resetToHome() {
    window.currentCategory = 'all'; window.currentSubCategory = null; window.currentLocation = 'all';
    if (shuffleTimer) clearInterval(shuffleTimer);
    renderFilterButtons();
    applyFilterAndRender('all', 'all');
}
function initStoreUI() {
    injectDropdownStyles();
    const base = getBaseProducts();
    if (base.length) {
        window.originalProducts = base.map(p => ({...p }));
        window.allProducts = [...window.originalProducts];
        window.filteredProducts = [...window.originalProducts];
    }
    renderFilterButtons();
    // Don't call applyFilter here, let your main grid render first
    setTimeout(() => applyFilterAndRender('all', 'all'), 100);
}
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initStoreUI, 0);
} else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initStoreUI, 0));
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') resetToHome(); });
window.renderFilterButtons = renderFilterButtons;
window.applyFilterAndRender = applyFilterAndRender;
window.resetToHome = resetToHome;

