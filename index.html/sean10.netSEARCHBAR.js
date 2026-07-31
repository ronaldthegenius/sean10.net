// ============================================
// SMART SEARCH BAR WITH LOCAL STORAGE
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
        
        this.init();
    }

    init() {
        if (!this.searchInput) return;
        
        // Bind events
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.searchInput.addEventListener('focus', () => this.showSuggestions());
        this.searchInput.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Close results on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                this.hideResults();
            }
        });
        
        // Render initial suggestions
        this.renderSuggestions();
    }

    // ============ MAIN SEARCH LOGIC ============
    handleSearch(e) {
        const query = e.target.value.trim();
        this.currentQuery = query;
        
        clearTimeout(this.debounceTimer);
        
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
            this.saveToHistory(query);
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
                product.tags,
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
                    ${message || 'No products found'}
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
                            <img src="${product.image || 'default-image.jpg'}" alt="${product.name}" loading="lazy">
                        </div>
                        <div class="result-info">
                            <div class="result-name">${product._highlight || product.name}</div>
                            <div class="result-category">${product.category || ''}</div>
                            <div class="result-price">${product.newPrice || product.price || ''}</div>
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
    }

    // ============ SUGGESTIONS / HISTORY ============
    renderSuggestions() {
        if (!this.resultsContainer) return;
        
        const history = this.getHistory();
        
        if (history.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="search-suggestions">
                    <div class="suggestion-hint">🔍 Start typing to search</div>
                </div>
            `;
            return;
        }
        
        this.resultsContainer.innerHTML = `
            <div class="search-suggestions">
                <div class="suggestion-header">Recent Searches</div>
                ${history.map(item => `
                    <div class="suggestion-item" onclick="window.searchInstance.searchFromHistory('${item}')">
                        🔄 ${item}
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
        const results = this.searchProducts(query);
        this.showResults(results);
        this.saveToHistory(query);
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
            if (typeof openPreview === 'function') {
                openPreview(productId);
            }
            // Save to history
            this.saveToHistory(this.currentQuery);
        }
    }

    // ============ VOICE SEARCH (Optional) ============
    voiceSearch() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice search not supported in this browser');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.searchInput.value = transcript;
            this.currentQuery = transcript;
            const results = this.searchProducts(transcript);
            this.showResults(results);
            this.saveToHistory(transcript);
        };
        
        recognition.start();
    }
}


// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Create search instance
    window.searchInstance = new SmartSearch({
        inputId: 'searchInput',
        resultsId: 'searchResults',
        products: myProducts, // Your product array
        maxHistory: 10
    });
});