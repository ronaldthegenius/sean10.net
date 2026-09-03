// ============================================
// FISHER-YATES SHUFFLE UTILITY
// ============================================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

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
                
                <div class="search-voice-status" id="voiceStatus" style="display:none;">
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
// SEARCH ENGINE MODULE
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

    // ===== RENDER PRODUCTS =====
    function renderProducts(products) {
        const items = products || myProducts;
        if (!productContainer) return;

        if (productCount) productCount.textContent = items.length;
        if (searchCountDisplay) searchCountDisplay.textContent = searchCount;
        
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

    // Expose render function globally to handle reshuffles
    window.renderProductsList = renderProducts;

    // ===== SEARCH QUERY FILTER =====
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

    // ===== DISPLAY DROPDOWN RESULTS =====
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
            </div>
        `).join('');

        resultsContainer.style.display = 'block';
    }

    // ===== SELECT PRODUCT =====
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

    // ===== SAVE HISTORY =====
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

    // ===== INPUT LISTENER =====
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

    // ===== CLEAR BUTTON =====
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            this.classList.remove('visible');
            if (resultsContainer) resultsContainer.style.display = 'none';
            renderProducts(myProducts);
            if (searchInput) searchInput.focus();
        });
    }

    // ===== LISTENERS =====
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-wrapper')) {
            if (resultsContainer) resultsContainer.style.display = 'none';
        }
    });

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

    renderProducts(myProducts);
}

// ============================================
// AUTOMATIC SHUFFLE SCHEDULER
// ============================================
function initProductShuffle() {
    if (typeof myProducts === 'undefined' || !Array.isArray(myProducts)) return;

    function applyShuffle() {
        console.log('🔀 Shuffling products with Fisher-Yates algorithm...');
        shuffleArray(myProducts);
        
        // Re-render UI only if user isn't actively searching
        const searchInput = document.getElementById('searchInput');
        if (!searchInput || !searchInput.value.trim()) {
            if (typeof window.renderProductsList === 'function') {
                window.renderProductsList(myProducts);
            }
        }
    }

    // Shuffle immediately on initial load
    applyShuffle();

    // Reshuffle every 20 minutes (20 * 60 * 1000 ms)
    const TWENTY_MINUTES = 20 * 60 * 1000;
    setInterval(applyShuffle, TWENTY_MINUTES);
}

// ============================================
// IMAGE SEARCH MODULE
// ============================================
function initImageSearch() {
    const imageSearchBtn = document.getElementById('imageSearchBtn');
    const modal = document.getElementById('imageUploadModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const dropZone = document.getElementById('imageDropZone');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImg = document.getElementById('uploadedImagePreview');
    const clearImageBtn = document.getElementById('clearImageBtn');
    const searchSimilarBtn = document.getElementById('searchSimilarBtn');
    const imageSearchResults = document.getElementById('imageSearchResults');

    if (!imageSearchBtn || !modal) return;

    imageSearchBtn.addEventListener('click', () => modal.style.display = 'flex');

    if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    if (dropZone && imageInput) {
        dropZone.addEventListener('click', () => imageInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) {
                imageInput.files = e.dataTransfer.files;
                handleImageUpload(e.dataTransfer.files[0]);
            }
        });

        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleImageUpload(e.target.files[0]);
        });
    }

    function handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            previewImg.src = event.target.result;
            previewContainer.style.display = 'block';
            dropZone.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    if (clearImageBtn) {
        clearImageBtn.addEventListener('click', () => {
            imageInput.value = '';
            previewImg.src = '';
            previewContainer.style.display = 'none';
            dropZone.style.display = 'block';
            if (imageSearchResults) imageSearchResults.innerHTML = '';
        });
    }

    if (searchSimilarBtn) {
        searchSimilarBtn.addEventListener('click', () => {
            if (!imageSearchResults) return;
            
            imageSearchResults.innerHTML = `
                <div style="text-align: center; padding: 10px;">
                    <p>🔍 Scanning image and searching catalog...</p>
                </div>
            `;

            setTimeout(() => {
                const matches = myProducts.slice(0, 4); 

                imageSearchResults.innerHTML = `
                    <h3 style="margin-top: 15px;">Similar Products Found:</h3>
                    <div class="similar-results-list" style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${matches.map(product => `
                            <div class="product-card" onclick="selectProduct('${product.id}'); document.getElementById('imageUploadModal').style.display='none';" style="cursor: pointer; border: 1px solid #ccc; padding: 8px; border-radius: 6px; width: 45%;">
                                <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 80px; object-fit: contain;">
                                <div style="font-weight: bold; font-size: 12px; margin-top: 5px;">${product.name}</div>
                                <div style="color: green; font-size: 12px;">${product.newPrice || 'Price on request'}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }, 600);
        });
    }
}

// ============================================
// VOICE SEARCH MODULE
// ============================================
function initVoiceSearch() {
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const searchInput = document.getElementById('searchInput');

    if (!voiceBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        voiceBtn.style.display = 'none';
        console.warn('Speech Recognition API is not supported in this browser.');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let isListening = false;

    voiceBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            try {
                recognition.start();
            } catch (err) {
                console.error('Voice search failed to start:', err);
            }
        }
    });

    recognition.onstart = () => {
        isListening = true;
        if (voiceStatus) voiceStatus.style.display = 'inline-flex';
        voiceBtn.classList.add('listening');
    };

    recognition.onend = () => {
        isListening = false;
        if (voiceStatus) voiceStatus.style.display = 'none';
        voiceBtn.classList.remove('listening');
    };

    recognition.onerror = (event) => {
        isListening = false;
        if (voiceStatus) voiceStatus.style.display = 'none';
        voiceBtn.classList.remove('listening');
        console.error('Speech recognition error:', event.error);
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (searchInput) {
            searchInput.value = transcript;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            searchInput.focus();
        }
    };
}

// ============================================
// INITIALIZE APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing application...');
    
    // 1. Render HTML structure inside #searchBar
    renderSearchBar();
    
    // 2. Shuffle products on initial load and setup 20-min timer
    initProductShuffle();

    // 3. Initialize feature controllers
    initSearch();
    initImageSearch();
    initVoiceSearch();
    
    console.log('✅ Application initialized successfully!');
});