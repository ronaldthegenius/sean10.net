// START OF THEMETOGGLE

function renderTheme() {
    const theme = document.getElementById('theme');
    if (!theme)  return;

    theme.innerHTML = `
        <!-- ===== HEADER WITH DARK MODE TOGGLE ===== -->
        <div class="header">
            <div class="header-actions">
                <div class="dark-toggle-wrapper">
                    <span id="themeLabel">☀️ Light</span>
                    <label class="dark-toggle">
                        <input type="checkbox" id="darkModeToggle">
                        <span class="slider">
                            <span class="toggle-icons">
                                <span>☀️</span>
                                <span>🌙</span>
                            </span>
                        </span>
                    </label>
                </div>
            </div>
        </div>
        `;
}

// ===== CALL THE FUNCTIONS TO RENDER =====
// IMPORTANT: This is what you were missing!
document.addEventListener('DOMContentLoaded', function() {
    renderTheme();
    
    // Now initialize dark mode AFTER rendering
    initDarkMode();
});
// END OF THEMETOGGLE





// START OF SEARCHBAR RENDERING
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



// ===== CALL THE FUNCTIONS TO RENDER =====
// IMPORTANT: This is what you were missing!
document.addEventListener('DOMContentLoaded', function() {
    renderSearchBar();
    
    // Now initialize search AFTER rendering
    initSearch();
});

// END OF SEARBAR RENDERNG























        // ============================================
        // DARK MODE CONTROLLER
        // ============================================
        (function initDarkMode() {
            const toggle = document.getElementById('darkModeToggle');
            const label = document.getElementById('themeLabel');
            const themeDisplay = document.getElementById('currentTheme');

            const savedTheme = localStorage.getItem('theme') || 'light';
            
            function setTheme(theme) {
                document.documentElement.setAttribute('data-theme', theme);
                toggle.checked = theme === 'dark';
                label.textContent = theme === 'dark' ? '🌙 Dark' : '☀️ Light';
                if (themeDisplay) themeDisplay.textContent = theme === 'dark' ? 'Dark' : 'Light';
                localStorage.setItem('theme', theme);
            }

            setTheme(savedTheme);

            toggle.addEventListener('change', function() {
                const theme = this.checked ? 'dark' : 'light';
                setTheme(theme);
            });
        })();

        // ============================================
        // SEARCH ENGINE - FIXED!
        // ============================================
        (function initSearch() {
            const searchInput = document.getElementById('searchInput');
            const resultsContainer = document.getElementById('searchResults');
            const productGrid = document.getElementById('productGrid');
            const clearBtn = document.getElementById('clearBtn');
            const productCount = document.getElementById('productCount');
            const searchCountDisplay = document.getElementById('searchCount');
            
            let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
            let searchCount = parseInt(localStorage.getItem('searchCount')) || 0;
            let debounceTimer = null;

            // Update counts
            productCount.textContent = myProducts.length;
            searchCountDisplay.textContent = searchCount;

            // ===== RENDER PRODUCTS =====
            function renderProducts(products) {
                const items = products || myProducts;
                productGrid.innerHTML = items.map(product => `
                    <div class="product-card" data-id="${product.id}">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        <div class="product-info">
                            <div class="product-name">${product.name}</div>
                            <div class="product-category">${product.category} • ${product.brand || ''}</div>
                            <div class="product-price">${product.price}</div>
                        </div>
                    </div>
                `).join('');
            }

            // ===== SEARCH FUNCTION - FIXED =====
            function searchProducts(query) {
                const q = query.toLowerCase().trim();
                if (!q) return [];

                // Search in name, category, brand, and description
                return myProducts.filter(product => {
                    const searchable = [
                        product.name || '',
                        product.category || '',
                        product.brand || '',
                        product.description || ''
                    ].join(' ').toLowerCase();
                    
                    return searchable.includes(q);
                });
            }

            // ===== DISPLAY RESULTS =====
            function showResults(results, query) {
                if (!results || results.length === 0) {
                    resultsContainer.innerHTML = `<div class="search-empty">🔍 No products found for "${query}"</div>`;
                    resultsContainer.style.display = 'block';
                    return;
                }

                resultsContainer.innerHTML = results.map(product => `
                    <div class="search-result-item" onclick="selectProduct(${product.id})">
                        <div class="result-image">
                            <img src="${product.image}" alt="${product.name}" loading="lazy">
                        </div>
                        <div class="result-info">
                            <div class="result-name">${product.name}</div>
                            <div class="result-category">${product.category} • ${product.brand || ''}</div>
                            <div class="result-price">${product.price}</div>
                        </div>
                        <div class="result-score">⭐ ${Math.floor(Math.random() * 30 + 70)}%</div>
                    </div>
                `).join('');

                resultsContainer.style.display = 'block';
            }

            // ===== SELECT PRODUCT =====
            window.selectProduct = function(id) {
                const product = myProducts.find(p => p.id === id);
                if (product) {
                    resultsContainer.style.display = 'none';
                    searchInput.value = product.name;
                    alert(`✅ Selected: ${product.name}\nPrice: ${product.price}\nCategory: ${product.category}`);
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
                searchCountDisplay.textContent = searchCount;
            }

            // ===== HANDLE SEARCH - FIXED =====
            function handleSearch(e) {
                const query = e.target.value;
                
                clearBtn.classList.toggle('visible', query.length > 0);

                if (query.length === 0) {
                    resultsContainer.style.display = 'none';
                    renderProducts(myProducts);
                    return;
                }

                // Allow searching with 1 character
                if (query.length < 1) {
                    resultsContainer.style.display = 'none';
                    return;
                }

                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const results = searchProducts(query);
                    showResults(results, query);
                    if (results.length > 0) {
                        saveToHistory(query);
                    }
                }, 300);
            }

            // ===== CLEAR SEARCH =====
            clearBtn.addEventListener('click', function() {
                searchInput.value = '';
                this.classList.remove('visible');
                resultsContainer.style.display = 'none';
                renderProducts(myProducts);
                searchInput.focus();
            });

            // ===== SEARCH INPUT =====
            searchInput.addEventListener('input', handleSearch);
            searchInput.addEventListener('blur', function() {
                setTimeout(() => {
                    resultsContainer.style.display = 'none';
                }, 200);
            });

            // ===== CLICK OUTSIDE =====
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.search-wrapper')) {
                    resultsContainer.style.display = 'none';
                }
            });

            // ===== KEYBOARD SHORTCUT =====
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    clearBtn.classList.remove('visible');
                    resultsContainer.style.display = 'none';
                    renderProducts(myProducts);
                    searchInput.blur();
                }
                
                // Ctrl+K or Cmd+K to focus search
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    searchInput.focus();
                    searchInput.select();
                }
            });

            // ===== INITIAL RENDER =====
            renderProducts(myProducts);

            console.log('✅ Search initialized!');
            console.log('📦 Products:', myProducts.length);
            console.log('🔍 Type to search - works with 1+ characters');
            console.log('⌨️  Press Ctrl+K to focus search');
        })();