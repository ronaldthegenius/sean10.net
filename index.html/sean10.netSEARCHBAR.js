// ============================================
// RENDER SEARCH BAR FUNCTION
// ============================================
function renderSearchBar() {
    const searchBar = document.getElementById('searchBar');
    if (!searchBar) return;

    searchBar.innerHTML = `
        <div class="search-wrapper">
            <div class="search-bar">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="🔍 Search for products..." 
                    autocomplete="off"
                    aria-label="Search products"
                >
                
                <button class="search-btn search-image-btn" id="imageSearchBtn" title="Search by image">
                    🖼️
                    <span class="badge" id="imageBadge" style="display:none;">1</span>
                </button>
                
                <button class="search-btn search-voice" id="voiceBtn" title="Voice search">
                    🎤
                </button>
                
                <div class="search-voice-status" id="voiceStatus">
                    <span class="pulse-dot"></span> Listening...
                </div>
                
                <button class="search-clear" id="clearBtn" title="Clear search">
                    ✕
                </button>
            </div>
            <div id="searchResults" class="search-results"></div>
        </div>

        <!-- ===== IMAGE UPLOAD MODAL ===== -->
        <div class="image-upload-modal" id="imageUploadModal" style="display:none;">
            <div class="modal-content">
                <button class="modal-close" id="modalCloseBtn">✕</button>
                <h2>🖼️ Search by Image</h2>
                <p>Upload a photo to find similar products</p>
                
                <div class="image-drop-zone" id="imageDropZone">
                    <span class="upload-icon">📸</span>
                    <div class="upload-text">Drop an image here or click to upload</div>
                    <div class="upload-subtext">Supports: JPG, PNG, GIF, WebP (Max 5MB)</div>
                    <input type="file" id="imageInput" accept="image/*" style="display:none;">
                </div>
                
                <div class="image-preview-container" id="imagePreviewContainer" style="display:none;">
                    <img id="uploadedImagePreview" src="" alt="Uploaded image">
                    <div class="image-actions">
                        <button class="btn-primary" id="searchSimilarBtn">🔍 Search Similar</button>
                        <button class="btn-danger" id="clearImageBtn">🗑️ Clear</button>
                    </div>
                </div>
                
                <div id="imageSearchResults"></div>
            </div>
        </div>
    `;
}

// ============================================
// SEARCH ENGINE - MATCHES YOUR HTML STRUCTURE
// ============================================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    const productContainer = document.getElementById('productList');
    const clearBtn = document.getElementById('clearBtn');
    const productCount = document.getElementById('productCount');
    const searchCountDisplay = document.getElementById('searchCount');
    
    if (!searchInput || !resultsContainer || !productContainer) {
        console.error('Search elements not found!');
        return;
    }
    
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    let searchCount = parseInt(localStorage.getItem('searchCount')) || 0;
    let debounceTimer = null;

    // Update counts
    if (productCount) productCount.textContent = myProducts.length;
    if (searchCountDisplay) searchCountDisplay.textContent = searchCount;

    // ===== RENDER PRODUCTS - MATCHES YOUR HTML STRUCTURE =====
    function renderProducts(products) {
        const items = products || myProducts;
        if (!productContainer) return;
        
        if (items.length === 0) {
            productContainer.innerHTML = `
                <div class="no-products">
                    <h3>🔍 No products found</h3>
                    <p>Try adjusting your search terms</p>
                </div>
            `;
            return;
        }
        
       productContainer.innerHTML = items.map(product => `
    <div class="product" data-category="${product.category}" onclick="openPreview('${product.id}')">
        <div class="image_BX">
            <img height="140px" width="160px" src="${product.image}" alt="${product.name}" loading="lazy">
            ${product.class === 'new' ? '<mark>🔥 NEW</mark>' : ''}
            ${product.class === 'used' ? '<mark class="used-mark">📦 USED</mark>' : ''}
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                
                <!-- PRICE MARQUEE CONTAINER -->
                <div class="price-container">
                    <div class="price-track">
                        ${product.oldPrice && product.oldPrice !== 'soon coming' && product.oldPrice !== 'negotiable' ? `<del>${product.oldPrice}</del>` : ''}
                        <span class="${product.newPrice === 'negotiable' ? 'negotiable' : 'new-price'}">
                            ${product.newPrice || 'Price on request'}
                        </span>
                    </div>
                </div>

                ${product.h4 ? `<div class="availability">${product.h4}</div>` : ''}
            </div>
        </div>
    </div>
`).join('');
       }


    





    // ===== SEARCH FUNCTION - SEARCHES ALL FIELDS =====
    function searchProducts(query) {
        const q = query.toLowerCase().trim();
        if (!q) return [];

        return myProducts.filter(product => {
            const searchable = [
                product.name || '',
                product.id || '',
                product.category || '',
                product.class || '',
                product.condition || '',
                product.location || '',
                product.processor || '',
                product.ram || '',
                product.storage || '',
                product.graphics || '',
                product.note || '',
                product.PCtitle || '',
                product.batteryLIFE || '',
                product.keypadLight || '',
                product.sellerEmail || '',
                product.email || '',
                Array.isArray(product.details) ? product.details.join(' ') : product.details || ''
            ].join(' ').toLowerCase();
            
            return searchable.includes(q);
        });
    }

    // ===== DISPLAY RESULTS IN DROPDOWN =====
    function showResults(results, query) {
        if (!resultsContainer) return;
        
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-empty">
                    🔍 No products found for "<strong>${query}</strong>"
                    <br><small>Try searching for: laptops, chargers, controllers, batteries, gaming, etc.</small>
                </div>
            `;
            resultsContainer.style.display = 'block';
            return;
        }

        resultsContainer.innerHTML = results.map(product => `
            <div class="search-result-item" onclick="selectProduct('${product.id}')">
                <div class="result-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <span class="result-badge ${product.class}">${product.class || ''}</span>
                </div>
                <div class="result-info">
                    <div class="result-name">${product.name}</div>
                    <div class="result-category">${product.category || 'Uncategorized'}</div>
                    <div class="result-price">
                        ${product.oldPrice && product.oldPrice !== 'soon coming' && product.oldPrice !== 'negotiable' ? `<del>${product.oldPrice}</del>` : ''}
                        ${product.newPrice || 'Price on request'}
                    </div>
                    ${product.location ? `<div class="result-location">📍 ${product.location}</div>` : ''}
                    ${product.h4 ? `<div class="result-availability">${product.h4}</div>` : ''}
                </div>
                <div class="result-score">⭐ ${Math.floor(Math.random() * 30 + 70)}%</div>
            </div>
        `).join('');

        resultsContainer.style.display = 'block';
    }

    // ===== SELECT PRODUCT - USES YOUR openPreview =====
    window.selectProduct = function(id) {
        const product = myProducts.find(p => p.id === id);
        if (product) {
            if (resultsContainer) resultsContainer.style.display = 'none';
            if (searchInput) searchInput.value = product.name;
            
            if (typeof openPreview === 'function') {
                openPreview(id);
            } else {
                alert(
                    `✅ ${product.name}\n` +
                    `📂 ${product.category || 'N/A'}\n` +
                    `💰 ${product.newPrice || product.oldPrice || 'N/A'}\n` +
                    `📍 ${product.location || 'N/A'}`
                );
            }
            saveToHistory(product.name);
        }
    };

    // ===== SAVE TO HISTORY =====
    function saveToHistory(query) {
        if (!query || query.length < 2) return;
        searchHistory = searchHistory.filter(item => item !== query);
        searchHistory.unshift(query);
        if (searchHistory.length > 10) searchHistory.pop();
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        
        searchCount++;
        localStorage.setItem('searchCount', searchCount);
        if (searchCountDisplay) searchCountDisplay.textContent = searchCount;
    }

    // ===== HANDLE SEARCH =====
    function handleSearch(e) {
        const query = e.target.value;
        
        if (clearBtn) clearBtn.classList.toggle('visible', query.length > 0);

        if (query.length === 0) {
            if (resultsContainer) resultsContainer.style.display = 'none';
            renderProducts(myProducts);
            return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const results = searchProducts(query);
            renderProducts(results);
            showResults(results, query);
            if (results.length > 0) {
                saveToHistory(query);
            }
        }, 300);
    }

    // ===== CLEAR SEARCH =====
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            this.classList.remove('visible');
            if (resultsContainer) resultsContainer.style.display = 'none';
            renderProducts(myProducts);
            if (searchInput) searchInput.focus();
        });
    }

    // ===== SEARCH INPUT =====
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('blur', function() {
            setTimeout(() => {
                if (resultsContainer) resultsContainer.style.display = 'none';
            }, 200);
        });
    }

    // ===== CLICK OUTSIDE =====
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-wrapper')) {
            if (resultsContainer) resultsContainer.style.display = 'none';
        }
    });

    // ===== KEYBOARD SHORTCUT =====
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (searchInput) {
                searchInput.value = '';
                if (clearBtn) clearBtn.classList.remove('visible');
                if (resultsContainer) resultsContainer.style.display = 'none';
                renderProducts(myProducts);
                searchInput.blur();
            }
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });

    // ===== INITIAL RENDER =====
    renderProducts(myProducts);

    console.log('✅ Search initialized with your HTML structure!');
    console.log('📦 Products loaded:', myProducts.length);
    console.log('🔍 Container ID: productList | Class: product-container');
    console.log('⌨️  Press Ctrl+K to focus search');
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing application...');
    
    // 1. Render the search bar
    renderSearchBar();
    
    // 2. Initialize search
    initSearch();
    
    console.log('✅ Application initialized successfully!');
});














