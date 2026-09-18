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
// RECENT SEARCHES (max 6)
// ============================================
const RECENT_MAX = 6;
const RECENT_KEY = 'recentSearches';

function getRecentSearches() {
    try {
        const raw = localStorage.getItem(RECENT_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.slice(0, RECENT_MAX) : [];
    } catch {
        return [];
    }
}

function saveRecentSearch(query) {
    if (!query || query.trim().length < 2) return;
    const q = query.trim();
    let list = getRecentSearches().filter(item => item.toLowerCase() !== q.toLowerCase());
    list.unshift(q);
    list = list.slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    renderRecentSearches();
}

function clearRecentSearches() {
    localStorage.removeItem(RECENT_KEY);
    renderRecentSearches();
}

function renderRecentSearches() {
    const box = document.getElementById('recentSearches');
    if (!box) return;

    const items = getRecentSearches();

    if (items.length === 0) {
        box.innerHTML = '';
        box.style.display = 'none';
        return;
    }

    box.style.display = 'block';
    box.innerHTML = `
        <div class="recent-header">
            <span>🕘 Recent searches</span>
            <button type="button" class="recent-clear" id="clearRecentBtn">Clear</button>
        </div>
        <div class="recent-list">
            ${items.map(q => `
                <button type="button" class="recent-chip" data-query="${q.replace(/"/g, '&quot;')}">
                    ${q}
                </button>
            `).join('')}
        </div>
    `;

    const clearBtn = document.getElementById('clearRecentBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearRecentSearches();
        });
    }

    box.querySelectorAll('.recent-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.stopPropagation();
            const q = chip.dataset.query;
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = q;
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                searchInput.focus();
            }
        });
    });
}

// ============================================
// RENDER SEARCH BAR
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

            <div id="recentSearches" class="recent-searches" style="display:none;"></div>
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

    renderRecentSearches();
}

// ============================================
// SEARCH ENGINE
// ============================================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    const productContainer = document.getElementById('productList') || document.getElementById('productsContainer');
    const clearBtn = document.getElementById('clearBtn');
    const productCount = document.getElementById('productCount');
    const searchCountDisplay = document.getElementById('searchCount');
    const recentBox = document.getElementById('recentSearches');

    if (!searchInput || !resultsContainer || !productContainer) {
        console.error('Search elements not found!');
        return;
    }

    let debounceTimer = null;
    let searchCount = parseInt(localStorage.getItem('searchCount')) || 0;

    function renderProducts(products) {
        const items = products || (window.myProducts || []);
        if (productCount) productCount.textContent = items.length;
        if (searchCountDisplay) searchCountDisplay.textContent = searchCount;

        if (items.length === 0) {
            productContainer.innerHTML = `
                <div class="no-products">
                    <h3>🔍 No products found</h3>
                    <p>Try adjusting your search terms</p>
                </div>`;
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

    window.renderProductsList = renderProducts;

    // ---------- SEARCH ----------
    function searchProducts(query) {
        const q = query.toLowerCase().trim();
        if (!q) return [];

        const source = window.myProducts || myProducts || [];
        return source.filter(product => {
            const searchable = [
                product.name, product.id, product.category, product.class,
                product.condition, product.location, product.processor,
                product.ram, product.storage, product.graphics, product.note,
                product.PCtitle, product.batteryLIFE, product.keypadLight,
                Array.isArray(product.details) ? product.details.join(' ') : product.details
            ].filter(Boolean).join(' ').toLowerCase();

            return searchable.includes(q);
        });
    }

    function showResults(results, query) {
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-empty">
                    🔍 No products found for "<strong>${query}</strong>"
                </div>`;
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

    window.selectProduct = function(id) {
        const source = window.myProducts || myProducts || [];
        const product = source.find(p => p.id === id);
        if (product) {
            resultsContainer.style.display = 'none';
            searchInput.value = product.name;
            if (typeof openPreview === 'function') openPreview(id);
        }
    };

    // ---------- INPUT ----------
    function handleSearch(e) {
        const query = e.target.value;

        if (clearBtn) clearBtn.classList.toggle('visible', query.length > 0);

        if (query.length === 0) {
            resultsContainer.style.display = 'none';
            if (recentBox) renderRecentSearches();
            renderProducts(window.myProducts || myProducts);
            return;
        }

        // hide recent chips once typing starts
        if (recentBox) recentBox.style.display = 'none';

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const results = searchProducts(query);
            renderProducts(results);
            showResults(results, query);

            if (query.trim().length >= 3 && results.length > 0) {
                saveRecentSearch(query);
                searchCount++;
                localStorage.setItem('searchCount', searchCount);
                if (searchCountDisplay) searchCountDisplay.textContent = searchCount;
            }
        }, 300);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            this.classList.remove('visible');
            resultsContainer.style.display = 'none';
            if (recentBox) renderRecentSearches();
            renderProducts(window.myProducts || myProducts);
            searchInput.focus();
        });
    }

    searchInput.addEventListener('focus', () => {
        if (!searchInput.value && recentBox) renderRecentSearches();
    });

    searchInput.addEventListener('input', handleSearch);

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-wrapper')) {
            resultsContainer.style.display = 'none';
            if (recentBox) recentBox.style.display = 'none';
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchInput.value = '';
            if (clearBtn) clearBtn.classList.remove('visible');
            resultsContainer.style.display = 'none';
            if (recentBox) recentBox.style.display = 'none';
            renderProducts(window.myProducts || myProducts);
            searchInput.blur();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
    });

    renderProducts(window.myProducts || myProducts);
}

// ============================================
// IMAGE SEARCH — REAL (with graceful fallback)
// ============================================
// ⚙️ Configure your API here. If left blank, falls back to
//    keyword matching based on image filename + optional tag input.
const IMAGE_SEARCH_CONFIG = {
    // Example for OpenAI (GPT-4o mini vision). Put your key here to enable real AI search.
    // ⚠️ Do NOT ship a private API key in frontend code for a public site.
    //    For production use a backend proxy.
    openaiApiKey: '',                // <-- put key here to enable real AI
    openaiModel: 'gpt-4o-mini',
    // fallback keyword vocabulary
    keywords: {
        laptop:    ['laptop', 'macbook', 'notebook', 'computer'],
        phone:     ['phone', 'iphone', 'android', 'samsung', 'tecno', 'infinix'],
        charger:   ['charger', 'adapter', 'cable', 'usb'],
        battery:   ['battery', 'powerbank', 'power bank'],
        console:   ['playstation', 'xbox', 'console', 'ps4', 'ps5'],
        controller:['controller', 'gamepad', 'joypad', 'joystick'],
        headphone: ['headphone', 'earphone', 'earbuds', 'headset'],
        watch:     ['watch', 'smartwatch']
    }
};

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

    let currentFile = null;
    let currentDataUrl = null;

    imageSearchBtn.addEventListener('click', () => modal.style.display = 'flex');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

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
        if (file.size > 5 * 1024 * 1024) {
            alert('Image too large. Max 5MB.');
            return;
        }

        currentFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            currentDataUrl = event.target.result;
            previewImg.src = currentDataUrl;
            previewContainer.style.display = 'block';
            dropZone.style.display = 'none';
            if (imageSearchResults) imageSearchResults.innerHTML = '';
        };
        reader.readAsDataURL(file);
    }

    if (clearImageBtn) {
        clearImageBtn.addEventListener('click', () => {
            currentFile = null;
            currentDataUrl = null;
            imageInput.value = '';
            previewImg.src = '';
            previewContainer.style.display = 'none';
            dropZone.style.display = 'block';
            if (imageSearchResults) imageSearchResults.innerHTML = '';
        });
    }

    // ---------- The actual search ----------
    if (searchSimilarBtn) {
        searchSimilarBtn.addEventListener('click', async () => {
            if (!currentDataUrl) {
                alert('Please upload an image first.');
                return;
            }

            imageSearchResults.innerHTML = `
                <div style="text-align:center;padding:10px;">
                    <p>🔍 Analyzing image...</p>
                </div>`;

            let keywords = [];

            // Try AI first
            if (IMAGE_SEARCH_CONFIG.openaiApiKey) {
                try {
                    keywords = await analyzeImageWithOpenAI(currentDataUrl);
                } catch (err) {
                    console.error('OpenAI vision failed:', err);
                }
            }

            // Fallback: derive keywords from filename + config vocabulary
            if (keywords.length === 0) {
                keywords = guessKeywordsFromFilename(currentFile?.name || '');
            }

            // If still nothing, show help
            if (keywords.length === 0) {
                imageSearchResults.innerHTML = `
                    <div style="padding:12px;border:1px solid #eee;border-radius:6px;">
                        <p>⚠️ Couldn't identify the image automatically.</p>
                        <p>To enable AI image search, add an API key in <code>IMAGE_SEARCH_CONFIG.openaiApiKey</code>.</p>
                        <p>Meanwhile, try these shortcuts:</p>
                        <div class="recent-list">
                            ${['laptop','phone','charger','console','controller','headphone','battery'].map(k =>
                                `<button type="button" class="recent-chip" onclick="runImageFallbackSearch('${k}')">${k}</button>`
                            ).join('')}
                        </div>
                    </div>`;
                return;
            }

            const matches = searchProductsByKeywords(keywords);

            if (matches.length === 0) {
                imageSearchResults.innerHTML = `<p>😕 No products matched keywords: <em>${keywords.join(', ')}</em></p>`;
                return;
            }

            imageSearchResults.innerHTML = `
                <h3 style="margin-top:15px;">Similar Products (${matches.length})</h3>
                <p style="font-size:12px;color:#666;">Matched on: ${keywords.join(', ')}</p>
                <div class="similar-results-list" style="display:flex;gap:10px;flex-wrap:wrap;">
                    ${matches.slice(0, 8).map(product => `
                        <div class="product-card"
                             onclick="selectProduct('${product.id}'); document.getElementById('imageUploadModal').style.display='none';"
                             style="cursor:pointer;border:1px solid #ccc;padding:8px;border-radius:6px;width:45%;">
                            <img src="${product.image}" alt="${product.name}" style="width:100%;height:80px;object-fit:contain;">
                            <div style="font-weight:bold;font-size:12px;margin-top:5px;">${product.name}</div>
                            <div style="color:green;font-size:12px;">${product.newPrice || 'Price on request'}</div>
                        </div>
                    `).join('')}
                </div>`;
        });
    }

    // Fallback keyword search exposed to window
    window.runImageFallbackSearch = function(keyword) {
        const matches = searchProductsByKeywords([keyword]);
        imageSearchResults.innerHTML = `
            <h3 style="margin-top:15px;">Results for "${keyword}" (${matches.length})</h3>
            <div class="similar-results-list" style="display:flex;gap:10px;flex-wrap:wrap;">
                ${matches.slice(0, 8).map(product => `
                    <div class="product-card"
                         onclick="selectProduct('${product.id}'); document.getElementById('imageUploadModal').style.display='none';"
                         style="cursor:pointer;border:1px solid #ccc;padding:8px;border-radius:6px;width:45%;">
                        <img src="${product.image}" alt="${product.name}" style="width:100%;height:80px;object-fit:contain;">
                        <div style="font-weight:bold;font-size:12px;margin-top:5px;">${product.name}</div>
                        <div style="color:green;font-size:12px;">${product.newPrice || 'Price on request'}</div>
                    </div>
                `).join('')}
            </div>`;
    };
}

// ---------- helpers for image search ----------
function guessKeywordsFromFilename(filename) {
    const name = filename.toLowerCase();
    const found = [];

    for (const [key, synonyms] of Object.entries(IMAGE_SEARCH_CONFIG.keywords)) {
        if (synonyms.some(word => name.includes(word))) {
            found.push(key);
        }
    }
    return found;
}

function searchProductsByKeywords(keywords) {
    const source = window.myProducts || myProducts || [];
    const lowered = keywords.map(k => k.toLowerCase());

    return source.filter(product => {
        const haystack = [
            product.name, product.category, product.PCtitle, product.details,
            product.processor, product.note
        ].filter(Boolean).join(' ').toLowerCase();

        return lowered.some(k => haystack.includes(k));
    });
}

async function analyzeImageWithOpenAI(dataUrl) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${IMAGE_SEARCH_CONFIG.openaiApiKey}`
        },
        body: JSON.stringify({
            model: IMAGE_SEARCH_CONFIG.openaiModel,
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: 'Identify the product in this image. Reply with ONLY a comma-separated list of up to 5 lowercase keywords (e.g. "laptop, macbook, silver").' },
                    { type: 'image_url', image_url: { url: dataUrl } }
                ]
            }],
            max_tokens: 60
        })
    });

    if (!res.ok) throw new Error('OpenAI request failed: ' + res.status);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    return text.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

// ============================================
// VOICE SEARCH
// ============================================
function initVoiceSearch() {
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const searchInput = document.getElementById('searchInput');

    if (!voiceBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        voiceBtn.style.display = 'none';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let isListening = false;

    voiceBtn.addEventListener('click', () => {
        if (isListening) recognition.stop();
        else {
            try { recognition.start(); } catch (e) { console.error(e); }
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
    recognition.onerror = (ev) => {
        isListening = false;
        if (voiceStatus) voiceStatus.style.display = 'none';
        voiceBtn.classList.remove('listening');
        console.error('Speech error:', ev.error);
    };
    recognition.onresult = (ev) => {
        const transcript = ev.results[0][0].transcript;
        if (searchInput) {
            searchInput.value = transcript;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            searchInput.focus();
        }
    };
}

// ============================================
// PRODUCT SHUFFLE SCHEDULER
// ============================================
function initProductShuffle() {
    const source = window.myProducts || myProducts;
    if (!Array.isArray(source)) return;

    function applyShuffle() {
        shuffleArray(source);
        const searchInput = document.getElementById('searchInput');
        if (!searchInput || !searchInput.value.trim()) {
            if (typeof window.renderProductsList === 'function') {
                window.renderProductsList(source);
            }
        }
    }

    applyShuffle();
    setInterval(applyShuffle, 20 * 60 * 1000);
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing application...');
    renderSearchBar();
    initProductShuffle();
    initSearch();
    initImageSearch();
    initVoiceSearch();
    console.log('✅ Application initialized successfully!');
});