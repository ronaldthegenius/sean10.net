 // ============================================
        // SMART SEARCH CLASS (FULL CODE)
        // ============================================
        class SmartSearch {
            constructor(options = {}) {
                this.searchInput = document.getElementById(options.inputId || 'searchInput');
                this.resultsContainer = document.getElementById(options.resultsId || 'searchResults');
                this.products = options.products || [];
                this.searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
                this.maxHistory = options.maxHistory || 10;
                this.debounceTimer = null;
                this.currentQuery = '';
                this.isListening = false;
                this.recognition = null;
                
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

                // Close results on outside click
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.search-wrapper')) {
                        this.hideResults();
                    }
                });

                // Render initial suggestions
                this.renderSuggestions();
                
                // Show clear button if there's text
                this.updateClearButton();
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
                    // Create searchable text
                    const searchableText = [
                        product.name,
                        product.category,
                        product.description,
                        product.tags ? product.tags.join(' ') : '',
                        product.brand,
                        product.model,
                        product.location
                    ].filter(Boolean).join(' ').toLowerCase();
                    
                    // Calculate relevance score
                    let score = 0;
                    let matchCount = 0;
                    
                    // Check each search term
                    searchTerms.forEach(term => {
                        if (term.length < 2) return;
                        
                        // Exact matches get higher score
                        if (searchableText.includes(term)) {
                            score += 10;
                            matchCount++;
                        }
                        
                        // Partial matches
                        if (searchableText.split(' ').some(word => word.includes(term))) {
                            score += 5;
                        }
                        
                        // Category matches are weighted higher
                        if (product.category && product.category.toLowerCase().includes(term)) {
                            score += 15;
                        }
                        
                        // Name matches are weighted highest
                        if (product.name && product.name.toLowerCase().includes(term)) {
                            score += 20;
                        }
                        
                        // Brand matches
                        if (product.brand && product.brand.toLowerCase().includes(term)) {
                            score += 12;
                        }
                    });
                    
                    // Prioritize results with more term matches
                    if (matchCount > 0) {
                        score += matchCount * 2;
                    }
                    
                    // Add to results if score > 0
                    if (score > 0) {
                        results.push({
                            ...product,
                            _score: score,
                            _highlight: this.highlightMatch(product.name, q)
                        });
                    }
                });
                
                // Sort by score (highest first)
                results.sort((a, b) => b._score - a._score);
                
                // Return top 20 results
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
                        
                        ${results.length >= 20 ? `
                            <div class="search-more">Showing top 20 results</div>
                        ` : ''}
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
                
                // Remove duplicates
                this.searchHistory = this.searchHistory.filter(item => item !== query);
                
                // Add to front
                this.searchHistory.unshift(query);
                
                // Limit size
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
                    
                    // Scroll to product in grid
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
                    
                    // Save to history
                    this.saveToHistory(product.name);
                    
                    // Show alert with product details
                    alert(`✅ Selected: ${product.name}\nPrice: ${product.price}\nCategory: ${product.category}\nBrand: ${product.brand}`);
                }
            }

            // ============ VOICE SEARCH ============
            voiceSearch() {
                // Check if voice search is supported
                const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
                
                if (!isSupported) {
                    document.getElementById('voiceFallback').classList.add('active');
                    return;
                }

                // Check if already listening
                if (this.isListening) {
                    this.stopVoiceSearch();
                    return;
                }

                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                
                // Configure
                recognition.lang = 'en-US';
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.maxAlternatives = 3;
                
                // Visual feedback - show listening state
                this.searchInput.placeholder = '🎤 Listening... Speak now';
                this.searchInput.classList.add('listening');
                
                // Update button
                const voiceBtn = document.getElementById('voiceBtn');
                if (voiceBtn) {
                    voiceBtn.classList.add('active');
                    voiceBtn.innerHTML = '⏹️';
                }
                
                // Show status
                const status = document.getElementById('voiceStatus');
                if (status) {
                    status.classList.add('active');
                }
                
                this.isListening = true;

                // Handle results
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
                    
                    // Show interim results
                    if (interimTranscript) {
                        this.searchInput.value = interimTranscript;
                    }
                    
                    // Process final result
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

                // Handle errors
                recognition.onerror = (event) => {
                    console.error('Voice search error:', event.error);
                    
                    let errorMessage = '';
                    switch(event.error) {
                        case 'not-allowed':
                            errorMessage = '⚠️ Microphone access denied. Please allow microphone access.';
                            break;
                        case 'no-speech':
                            errorMessage = '🔇 No speech detected. Please try again.';
                            break;
                        case 'audio-capture':
                            errorMessage = '🎤 Microphone not found. Please check your microphone.';
                            break;
                        case 'network':
                            errorMessage = '🌐 Network error. Please check your internet connection.';
                            break;
                        default:
                            errorMessage = `❌ Voice search error: ${event.error}`;
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

                // Handle end of speech
                recognition.onend = () => {
                    if (this.isListening) {
                        this.stopVoiceSearch();
                    }
                };

                // Start listening
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

                // Store recognition for cleanup
                this.recognition = recognition;
            }

            stopVoiceSearch() {
                this.isListening = false;
                
                // Reset UI
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
                
                // Stop recognition if active
                if (this.recognition) {
                    try {
                        this.recognition.stop();
                    } catch (e) {
                        // Ignore errors on stop
                    }
                    this.recognition = null;
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
            
            console.log('✅ Smart Search initialized!');
            console.log('📦 Products loaded:', myProducts.length);
            console.log('🎤 Voice search available:', 
                'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
            );
        });

        