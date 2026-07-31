 // ============================================
        // SMART SEARCH CLASS (Updated with Image Search)
        // ============================================
        class SmartSearch {
            constructor(options = {}) {
                this.searchInput = document.getElementById(options.inputId || 'searchInput');
                this.resultsContainer = document.getElementById(options.resultsId || 'searchResults');
                this.products = options.products || [];
                this.searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
                this.imageHistory = JSON.parse(localStorage.getItem('imageSearchHistory')) || [];
                this.maxHistory = options.maxHistory || 10;
                this.debounceTimer = null;
                this.currentQuery = '';
                this.isListening = false;
                this.recognition = null;
                this.uploadedImageData = null;
                this.uploadedImageFeatures = null;
                
                this.init();
            }

            init() {
                if (!this.searchInput) {
                    console.error('Search input not found!');
                    return;
                }

                // Bind events
                this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
                this.searchInput.addEventListener('focus', () => this.showSuggestions());
                this.searchInput.addEventListener('keydown', (e) => this.handleKeyboard(e));
                this.searchInput.addEventListener('blur', () => {
                    setTimeout(() => this.hideResults(), 200);
                });

                // Clear button
                const clearBtn = document.getElementById('clearBtn');
                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        this.searchInput.value = '';
                        this.currentQuery = '';
                        this.hideResults();
                        clearBtn.classList.remove('visible');
                        this.renderSuggestions();
                    });
                }

                // Voice button
                const voiceBtn = document.getElementById('voiceBtn');
                if (voiceBtn) {
                    voiceBtn.addEventListener('click', () => this.voiceSearch());
                }

                // Image search button
                const imageBtn = document.getElementById('imageSearchBtn');
                if (imageBtn) {
                    imageBtn.addEventListener('click', () => this.openImageModal());
                }

                // Modal close
                const modalClose = document.getElementById('modalCloseBtn');
                if (modalClose) {
                    modalClose.addEventListener('click', () => this.closeImageModal());
                }

                // Close modal on outside click
                document.getElementById('imageUploadModal').addEventListener('click', (e) => {
                    if (e.target === e.currentTarget) {
                        this.closeImageModal();
                    }
                });

                // Image upload
                this.setupImageUpload();

                // Close results on outside click
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.search-wrapper')) {
                        this.hideResults();
                    }
                });

                // Render initial suggestions
                this.renderSuggestions();
                this.updateClearButton();
                this.updateImageBadge();
            }

            // ============ MAIN SEARCH LOGIC ============
            handleSearch(e) {
                const query = e.target.value.trim();
                this.currentQuery = query;
                
                clearTimeout(this.debounceTimer);
                this.updateClearButton();
                
                if (query.length === 0) {
                    this.hideResults();
                    this.renderSuggestions();
                    return;
                }
                
                if (query.length < 2) {
                    this.showResults([], 'Type more characters...');
                    return;
                }
                
                this.debounceTimer = setTimeout(() => {
                    const results = this.searchProducts(query);
                    this.showResults(results);
                    if (results.length > 0) {
                        this.saveToHistory(query);
                    }
                }, 300);
            }

            // ============ SEARCH ALGORITHM ============
            searchProducts(query) {
                const q = query.toLowerCase().trim();
                const results = [];
                const searchTerms = q.split(' ');
                
                this.products.forEach(product => {
                    const searchableText = [
                        product.name,
                        product.category,
                        product.description,
                        product.tags ? product.tags.join(' ') : '',
                        product.brand,
                        product.model,
                        product.location,
                        product.imageFeatures ? product.imageFeatures.join(' ') : ''
                    ].filter(Boolean).join(' ').toLowerCase();
                    
                    let score = 0;
                    let matchCount = 0;
                    
                    searchTerms.forEach(term => {
                        if (term.length < 2) return;
                        
                        if (searchableText.includes(term)) {
                            score += 10;
                            matchCount++;
                        }
                        
                        if (searchableText.split(' ').some(word => word.includes(term))) {
                            score += 5;
                        }
                        
                        if (product.category && product.category.toLowerCase().includes(term)) {
                            score += 15;
                        }
                        
                        if (product.name && product.name.toLowerCase().includes(term)) {
                            score += 20;
                        }
                        
                        if (product.brand && product.brand.toLowerCase().includes(term)) {
                            score += 12;
                        }
                        
                        // Image features match
                        if (product.imageFeatures && product.imageFeatures.some(f => f.toLowerCase().includes(term))) {
                            score += 18;
                        }
                    });
                    
                    if (matchCount > 0) {
                        score += matchCount * 2;
                    }
                    
                    if (score > 0) {
                        results.push({
                            ...product,
                            _score: score,
                            _highlight: this.highlightMatch(product.name, q)
                        });
                    }
                });
                
                results.sort((a, b) => b._score - a._score);
                return results.slice(0, 20);
            }

            // ============ HIGHLIGHT MATCHES ============
            highlightMatch(text, query) {
                if (!text || !query) return text;
                const regex = new RegExp(`(${query})`, 'gi');
                return text.replace(regex, '<mark class="search-highlight">$1</mark>');
            }

            // ============ DISPLAY RESULTS ============
            showResults(results, message = '') {
                if (!this.resultsContainer) return;
                
                if (results.length === 0) {
                    this.resultsContainer.innerHTML = `
                        <div class="search-empty">
                            ${message || '🔍 No products found'}
                        </div>
                    `;
                    this.resultsContainer.style.display = 'block';
                    return;
                }
                
                this.resultsContainer.innerHTML = `
                    <div class="search-results-list">
                        ${results.map(product => `
                            <div class="search-result-item" data-id="${product.id}" onclick="window.searchInstance.selectResult('${product.id}')">
                                <div class="result-image">
                                    <img src="${product.image || 'https://via.placeholder.com/50/333/fff?text=?'}" alt="${product.name}" loading="lazy">
                                </div>
                                <div class="result-info">
                                    <div class="result-name">${product._highlight || product.name}</div>
                                    <div class="result-category">${product.category || ''} • ${product.brand || ''}</div>
                                    <div class="result-price">${product.price || product.newPrice || ''}</div>
                                </div>
                                <div class="result-score">⭐ ${Math.round(product._score)}%</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                this.resultsContainer.style.display = 'block';
                this.resultsContainer.scrollTop = 0;
            }

            // ============ SUGGESTIONS / HISTORY ============
            renderSuggestions() {
                if (!this.resultsContainer) return;
                
                const history = this.getHistory();
                
                if (history.length === 0) {
                    this.resultsContainer.innerHTML = `
                        <div class="search-suggestions">
                            <div class="suggestion-hint">🔍 Start typing to search products</div>
                        </div>
                    `;
                    return;
                }
                
                this.resultsContainer.innerHTML = `
                    <div class="search-suggestions">
                        <div class="suggestion-header">🕒 Recent Searches</div>
                        ${history.map(item => `
                            <div class="suggestion-item" onclick="window.searchInstance.searchFromHistory('${item.replace(/'/g, "\\'")}')">
                                <span class="suggestion-icon">🔄</span>
                                ${item}
                            </div>
                        `).join('')}
                        <div class="suggestion-clear" onclick="window.searchInstance.clearHistory()">
                            🗑️ Clear History
                        </div>
                    </div>
                `;
            }

            showSuggestions() {
                if (!this.currentQuery || this.currentQuery.length < 2) {
                    this.renderSuggestions();
                    this.resultsContainer.style.display = 'block';
                }
            }

            hideResults() {
                if (this.resultsContainer) {
                    this.resultsContainer.style.display = 'none';
                }
            }

            // ============ HISTORY MANAGEMENT ============
            saveToHistory(query) {
                if (!query || query.length < 2) return;
                
                this.searchHistory = this.searchHistory.filter(item => item !== query);
                this.searchHistory.unshift(query);
                
                if (this.searchHistory.length > this.maxHistory) {
                    this.searchHistory = this.searchHistory.slice(0, this.maxHistory);
                }
                
                localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
            }

            getHistory() {
                return this.searchHistory;
            }

            clearHistory() {
                this.searchHistory = [];
                localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
                this.renderSuggestions();
            }

            searchFromHistory(query) {
                this.searchInput.value = query;
                this.currentQuery = query;
                this.updateClearButton();
                const results = this.searchProducts(query);
                this.showResults(results);
                if (results.length > 0) {
                    this.saveToHistory(query);
                }
            }

            // ============ KEYBOARD NAVIGATION ============
            handleKeyboard(e) {
                const items = document.querySelectorAll('.search-result-item, .suggestion-item');
                if (items.length === 0) return;
                
                let currentIndex = Array.from(items).findIndex(item => item.classList.contains('active'));
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    currentIndex = (currentIndex + 1) % items.length;
                    this.highlightItem(items, currentIndex);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    currentIndex = (currentIndex - 1 + items.length) % items.length;
                    this.highlightItem(items, currentIndex);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (currentIndex >= 0) {
                        items[currentIndex].click();
                    }
                } else if (e.key === 'Escape') {
                    this.hideResults();
                    this.searchInput.blur();
                }
            }

            highlightItem(items, index) {
                items.forEach(item => item.classList.remove('active'));
                items[index].classList.add('active');
                items[index].scrollIntoView({ block: 'nearest' });
            }

            // ============ SELECT RESULT ============
            selectResult(productId) {
                const product = this.products.find(p => p.id == productId);
                if (product) {
                    this.hideResults();
                    this.searchInput.value = product.name;
                    this.currentQuery = product.name;
                    this.updateClearButton();
                    
                    const productCards = document.querySelectorAll('.product-card');
                    productCards.forEach(card => {
                        if (card.dataset.id == productId) {
                            card.style.border = '3px solid #4CAF50';
                            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            setTimeout(() => {
                                card.style.border = 'none';
                            }, 3000);
                        }
                    });
                    
                    this.saveToHistory(product.name);
                    
                    // Show product details
                    alert(`✅ Selected: ${product.name}\nPrice: ${product.price}\nCategory: ${product.category}\nBrand: ${product.brand}`);
                }
            }

            // ============ VOICE SEARCH ============
            voiceSearch() {
                const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
                
                if (!isSupported) {
                    alert('🎤 Voice search is not supported in your browser. Please use Chrome or Edge.');
                    return;
                }

                if (this.isListening) {
                    this.stopVoiceSearch();
                    return;
                }

                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                
                recognition.lang = 'en-US';
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.maxAlternatives = 3;
                
                this.searchInput.placeholder = '🎤 Listening... Speak now';
                this.searchInput.classList.add('listening');
                
                const voiceBtn = document.getElementById('voiceBtn');
                if (voiceBtn) {
                    voiceBtn.classList.add('active');
                    voiceBtn.innerHTML = '⏹️';
                }
                
                const status = document.getElementById('voiceStatus');
                if (status) {
                    status.classList.add('active');
                }
                
                this.isListening = true;

                recognition.onresult = (event) => {
                    let finalTranscript = '';
                    let interimTranscript = '';
                    
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                        } else {
                            interimTranscript += transcript;
                        }
                    }
                    
                    if (interimTranscript) {
                        this.searchInput.value = interimTranscript;
                    }
                    
                    if (finalTranscript) {
                        this.searchInput.value = finalTranscript;
                        this.currentQuery = finalTranscript;
                        this.updateClearButton();
                        const results = this.searchProducts(finalTranscript);
                        this.showResults(results);
                        if (results.length > 0) {
                            this.saveToHistory(finalTranscript);
                        }
                        this.stopVoiceSearch();
                    }
                };

                recognition.onerror = (event) => {
                    console.error('Voice search error:', event.error);
                    
                    let errorMessage = '';
                    switch(event.error) {
                        case 'not-allowed':
                            errorMessage = '⚠️ Microphone access denied';
                            break;
                        case 'no-speech':
                            errorMessage = '🔇 No speech detected';
                            break;
                        case 'audio-capture':
                            errorMessage = '🎤 Microphone not found';
                            break;
                        case 'network':
                            errorMessage = '🌐 Network error';
                            break;
                        default:
                            errorMessage = `❌ Error: ${event.error}`;
                    }
                    
                    this.searchInput.placeholder = errorMessage;
                    this.searchInput.style.borderColor = '#ff4444';
                    
                    setTimeout(() => {
                        if (this.searchInput.value === '') {
                            this.searchInput.placeholder = '🔍 Search for products...';
                        }
                        this.searchInput.style.borderColor = '';
                    }, 3000);
                    
                    this.stopVoiceSearch();
                };

                recognition.onend = () => {
                    if (this.isListening) {
                        this.stopVoiceSearch();
                    }
                };

                try {
                    recognition.start();
                } catch (error) {
                    console.error('Failed to start voice recognition:', error);
                    this.searchInput.placeholder = '❌ Failed to start voice recognition';
                    setTimeout(() => {
                        if (this.searchInput.value === '') {
                            this.searchInput.placeholder = '🔍 Search for products...';
                        }
                    }, 3000);
                    this.stopVoiceSearch();
                }

                this.recognition = recognition;
            }

            stopVoiceSearch() {
                this.isListening = false;
                
                this.searchInput.placeholder = '🔍 Search for products...';
                this.searchInput.classList.remove('listening');
                this.searchInput.style.borderColor = '';
                
                const voiceBtn = document.getElementById('voiceBtn');
                if (voiceBtn) {
                    voiceBtn.classList.remove('active');
                    voiceBtn.innerHTML = '🎤';
                }
                
                const status = document.getElementById('voiceStatus');
                if (status) {
                    status.classList.remove('active');
                }
                
                if (this.recognition) {
                    try {
                        this.recognition.stop();
                    } catch (e) {}
                    this.recognition = null;
                }
            }

            // ============ IMAGE SEARCH ============
            openImageModal() {
                document.getElementById('imageUploadModal').classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            closeImageModal() {
                document.getElementById('imageUploadModal').classList.remove('active');
                document.body.style.overflow = '';
            }

            setupImageUpload() {
                const dropZone = document.getElementById('imageDropZone');
                const fileInput = document.getElementById('imageInput');

                // Click to upload
                dropZone.addEventListener('click', () => {
                    fileInput.click();
                });

                // File selected
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        this.handleImageUpload(file);
                    }
                });

                // Drag and drop
                dropZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropZone.classList.add('dragover');
                });

                dropZone.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    dropZone.classList.remove('dragover');
                });

                dropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropZone.classList.remove('dragover');
                    
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                        this.handleImageUpload(file);
                    } else {
                        alert('Please drop an image file!');
                    }
                });
            }

            handleImageUpload(file) {
                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image is too large! Maximum 5MB.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    // Show preview
                    const preview = document.getElementById('imagePreviewContainer');
                    const img = document.getElementById('uploadedImagePreview');
                    img.src = e.target.result;
                    preview.classList.add('active');
                    
                    // Store image data
                    this.uploadedImageData = e.target.result;
                    
                    // Extract image features
                    this.extractImageFeatures(e.target.result);
                    
                    // Hide drop zone
                    document.getElementById('imageDropZone').style.display = 'none';
                    
                    // Update badge
                    this.updateImageBadge();
                };
                reader.readAsDataURL(file);
            }

            extractImageFeatures(imageData) {
                const img = new Image();
                img.onload = () => {
                    // Get dominant colors
                    const colors = this.getDominantColors(img);
                    
                    // Generate features
                    const features = this.generateFeatures(img, colors);
                    
                    this.uploadedImageFeatures = {
                        colors: colors,
                        features: features,
                        aspectRatio: img.width / img.height,
                        width: img.width,
                        height: img.height
                    };
                    
                    console.log('✅ Image features extracted:', this.uploadedImageFeatures);
                    
                    // Auto-search
                    this.searchByImage();
                };
                img.src = imageData;
            }

            getDominantColors(img) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 50;
                canvas.height = 50;
                ctx.drawImage(img, 0, 0, 50, 50);
                
                const imageData = ctx.getImageData(0, 0, 50, 50);
                const data = imageData.data;
                const colorCount = {};
                
                for (let i = 0; i < data.length; i += 20) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const key = `${Math.round(r/20)*20},${Math.round(g/20)*20},${Math.round(b/20)*20}`;
                    colorCount[key] = (colorCount[key] || 0) + 1;
                }
                
                const sortedColors = Object.entries(colorCount)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([color]) => {
                        const [r, g, b] = color.split(',').map(Number);
                        return this.rgbToName(r, g, b);
                    });
                
                return sortedColors;
            }

            rgbToName(r, g, b) {
                const colors = {
                    'black': [0, 0, 0],
                    'white': [255, 255, 255],
                    'red': [255, 0, 0],
                    'green': [0, 255, 0],
                    'blue': [0, 0, 255],
                    'yellow': [255, 255, 0],
                    'purple': [128, 0, 128],
                    'orange': [255, 165, 0],
                    'pink': [255, 192, 203],
                    'gray': [128, 128, 128],
                    'silver': [192, 192, 192],
                    'gold': [255, 215, 0],
                    'brown': [165, 42, 42],
                    'teal': [0, 128, 128],
                    'navy': [0, 0, 128],
                    'maroon': [128, 0, 0],
                    'olive': [128, 128, 0],
                    'lime': [0, 255, 0],
                    'cyan': [0, 255, 255],
                    'magenta': [255, 0, 255]
                };
                
                let closest = 'unknown';
                let minDistance = Infinity;
                
                for (const [name, rgb] of Object.entries(colors)) {
                    const distance = Math.sqrt(
                        Math.pow(r - rgb[0], 2) +
                        Math.pow(g - rgb[1], 2) +
                        Math.pow(b - rgb[2], 2)
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        closest = name;
                    }
                }
                
                return closest;
            }

            generateFeatures(img, colors) {
                const tags = [];
                const width = img.width;
                const height = img.height;
                
                tags.push(...colors);
                
                if (width > height * 1.5) tags.push('wide');
                else if (height > width * 1.5) tags.push('tall');
                else tags.push('square');
                
                if (width < 100 && height < 100) tags.push('small');
                else if (width > 500 && height > 500) tags.push('large');
                else tags.push('medium');
                
                return tags;
            }

            searchByImage() {
                if (!this.uploadedImageFeatures) {
                    alert('Please upload an image first!');
                    return;
                }
                
                const results = [];
                const queryFeatures = this.uploadedImageFeatures.features;
                const queryColors = this.uploadedImageFeatures.colors;
                
                this.products.forEach(product => {
                    let score = 0;
                    
                    // Check feature matches
                    if (product.imageFeatures) {
                        product.imageFeatures.forEach(feature => {
                            if (queryFeatures.some(qf => 
                                qf.toLowerCase().includes(feature.toLowerCase()) ||
                                feature.toLowerCase().includes(qf.toLowerCase())
                            )) {
                                score += 20;
                            }
                        });
                    }
                    
                    // Check color matches
                    if (product.dominantColors) {
                        product.dominantColors.forEach(color => {
                            if (queryColors.includes(color)) {
                                score += 15;
                            }
                        });
                    }
                    
                    // Check category matches
                    if (product.category) {
                        queryFeatures.forEach(feature => {
                            if (product.category.toLowerCase().includes(feature.toLowerCase()) ||
                                feature.toLowerCase().includes(product.category.toLowerCase())) {
                                score += 10;
                            }
                        });
                    }
                    
                    // Check name matches
                    if (product.name) {
                        queryFeatures.forEach(feature => {
                            if (product.name.toLowerCase().includes(feature.toLowerCase()) ||
                                feature.toLowerCase().includes(product.name.toLowerCase())) {
                                score += 8;
                            }
                        });
                    }
                    
                    if (score > 0) {
                        results.push({
                            ...product,
                            matchScore: score,
                            matchPercentage: Math.min(100, Math.round(score / 1.5))
                        });
                    }
                });
                
                results.sort((a, b) => b.matchScore - a.matchScore);
                this.displayImageResults(results);
                
                // Save to image history
                this.saveImageToHistory();
            }

            displayImageResults(results) {
                const container = document.getElementById('imageSearchResults');
                
                if (results.length === 0) {
                    container.innerHTML = `
                        <div style="text-align:center; padding:20px; color:#999;">
                            <h3>😕 No similar products found</h3>
                            <p style="font-size:14px;">Try uploading a different image</p>
                        </div>
                    `;
                    return;
                }
                
                container.innerHTML = `
                    <h3 style="margin: 20px 0 10px; color: #333;">
                        Found ${results.length} similar products 
                        <span style="font-size:14px; color:#999; font-weight:normal;">
                            (by image similarity)
                        </span>
                    </h3>
                    <div style="display: grid; gap: 12px;">
                        ${results.slice(0, 10).map(product => `
                            <div class="search-result-item" onclick="window.searchInstance.selectResult('${product.id}')">
                                <div class="result-image">
                                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                                </div>
                                <div class="result-info">
                                    <div class="result-name">${product.name}</div>
                                    <div class="result-category">${product.category}</div>
                                    <div class="result-price">${product.price}</div>
                                </div>
                                <div class="result-match-badge">${product.matchPercentage}% Match</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                // Scroll to results
                container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            saveImageToHistory() {
                const history = JSON.parse(localStorage.getItem('imageSearchHistory')) || [];
                const timestamp = new Date().toLocaleString();
                history.unshift({ timestamp, image: this.uploadedImageData.substring(0, 100) + '...' });
                
                if (history.length > 10) {
                    history.pop();
                }
                
                localStorage.setItem('imageSearchHistory', JSON.stringify(history));
            }

            clearUploadedImage() {
                this.uploadedImageData = null;
                this.uploadedImageFeatures = null;
                
                document.getElementById('imagePreviewContainer').classList.remove('active');
                document.getElementById('uploadedImagePreview').src = '';
                document.getElementById('imageInput').value = '';
                document.getElementById('imageDropZone').style.display = '';
                document.getElementById('imageSearchResults').innerHTML = '';
                
                this.updateImageBadge();
                
                // Close modal after clearing
                setTimeout(() => {
                    this.closeImageModal();
                }, 500);
            }

            updateImageBadge() {
                const badge = document.getElementById('imageBadge');
                if (this.uploadedImageData) {
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }

            // ============ CLEAR BUTTON ============
            updateClearButton() {
                const clearBtn = document.getElementById('clearBtn');
                if (clearBtn) {
                    if (this.searchInput.value.length > 0) {
                        clearBtn.classList.add('visible');
                    } else {
                        clearBtn.classList.remove('visible');
                    }
                }
            }
        }

        // ============================================
        // RENDER PRODUCT GRID
        // ============================================
        function renderProducts() {
            const grid = document.getElementById('productGrid');
            if (!grid) return;
            
            grid.innerHTML = myProducts.map(product => `
                <div class="product-card" data-id="${product.id}">
                    <img src="${product.image || 'https://via.placeholder.com/200x150/333/fff?text=Product'}" alt="${product.name}" loading="lazy">
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-category">${product.category} • ${product.brand || ''}</div>
                        <div class="product-price">${product.price || product.newPrice || ''}</div>
                    </div>
                </div>
            `).join('');
        }

        // ============================================
        // GLOBAL FUNCTIONS
        // ============================================
        function searchByImage() {
            if (window.searchInstance) {
                window.searchInstance.searchByImage();
            }
        }

        function clearUploadedImage() {
            if (window.searchInstance) {
                window.searchInstance.clearUploadedImage();
            }
        }

        // ============================================
        // INITIALIZE EVERYTHING
        // ============================================
        document.addEventListener('DOMContentLoaded', () => {
            // Render products
            renderProducts();
            
            // Create search instance
            window.searchInstance = new SmartSearch({
                inputId: 'searchInput',
                resultsId: 'searchResults',
                products: myProducts,
                maxHistory: 10
            });
            
            console.log('✅ Smart Search with Image Search initialized!');
            console.log('📦 Products loaded:', myProducts.length);
            console.log('🎤 Voice search available:', 
                'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
            );
            console.log('🖼️ Image search ready! Click the image icon 🖼️');
        });
   

        
