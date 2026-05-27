 // ============ DARK MODE IMPLEMENTATION ============
    function initDarkMode() {
        const toggle = document.getElementById('darkModeToggle');
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (toggle) toggle.checked = true;
        }
        
        if (toggle) {
            toggle.addEventListener('change', function() {
                if (this.checked) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'light');
                }
            });
        }
    }
    
    // ============ CONFIGURATION ============
    const MAX_MESSAGE_LENGTH = 500;
    const RATE_LIMIT_KEY = 'lastEmailSentTime';
    const RATE_LIMIT_MINUTES = 2;
    
    const productId = "${product.id}" || "default";
    const sellerEmail = "${product.email}";
    
    let recaptchaCompleted = false;
    
    // reCAPTCHA callbacks
    window.onRecaptchaSuccess = function() {
        recaptchaCompleted = true;
        const recaptchaError = document.getElementById('recaptchaError');
        if (recaptchaError) recaptchaError.style.display = 'none';
    };
    
    window.onRecaptchaExpired = function() {
        recaptchaCompleted = false;
        const recaptchaError = document.getElementById('recaptchaError');
        if (recaptchaError) {
            recaptchaError.style.display = 'block';
            recaptchaError.textContent = 'reCAPTCHA expired. Please verify again.';
        }
    };
    
    // ============ LOCALSTORAGE AUTO-SAVE ============
    function loadSavedData() {
        const savedEmail = localStorage.getItem(`buyerEmail_${productId}`);
        const savedMessage = localStorage.getItem(`message_${productId}`);
        
        const emailInput = document.getElementById('userEmail');
        const messageInput = document.getElementById('userMessage');
        
        if (savedEmail && emailInput) emailInput.value = savedEmail;
        if (savedMessage && messageInput) messageInput.value = savedMessage;
        
        updateCharCount();
    }
    
    function saveData() {
        const email = document.getElementById('userEmail')?.value;
        const message = document.getElementById('userMessage')?.value;
        
        if (email) localStorage.setItem(`buyerEmail_${productId}`, email);
        if (message) localStorage.setItem(`message_${productId}`, message);
    }
    
    function updateCharCount() {
        const message = document.getElementById('userMessage');
        const charCountDiv = document.getElementById('charCount');
        
        if (!message || !charCountDiv) return;
        
        const length = message.value.length;
        const remaining = MAX_MESSAGE_LENGTH - length;
        
        charCountDiv.innerHTML = `${length}/${MAX_MESSAGE_LENGTH} characters`;
        
        if (remaining < 0) {
            charCountDiv.style.color = 'var(--error-color)';
            message.value = message.value.substring(0, MAX_MESSAGE_LENGTH);
        } else if (remaining < 50) {
            charCountDiv.style.color = 'var(--warning-color)';
        } else {
            charCountDiv.style.color = 'var(--button-bg)';
        }
    }
    
    // ============ SPAM PROTECTION: RATE LIMITING ============
    function isRateLimited() {
        const lastSent = localStorage.getItem(RATE_LIMIT_KEY);
        if (!lastSent) return false;
        
        const minutesSinceLast = (Date.now() - parseInt(lastSent)) / 1000 / 60;
        return minutesSinceLast < RATE_LIMIT_MINUTES;
    }
    
    function getRemainingWaitTime() {
        const lastSent = localStorage.getItem(RATE_LIMIT_KEY);
        if (!lastSent) return 0;
        
        const minutesSinceLast = (Date.now() - parseInt(lastSent)) / 1000 / 60;
        const remaining = RATE_LIMIT_MINUTES - minutesSinceLast;
        return Math.ceil(remaining * 60);
    }
    
    // ============ CLIPBOARD FALLBACK ============
    function showClipboardFallback() {
        const email = document.getElementById('userEmail')?.value || '';
        const message = document.getElementById('userMessage')?.value || '';
        
        const fallbackText = `To: ${sellerEmail}\nFrom: ${email}\n\nMessage:\n${message}\n\n---\nSent via ${window.location.href}`;
        const fallbackMessage = document.getElementById('fallbackMessage');
        const clipboardFallback = document.getElementById('clipboardFallback');
        
        if (fallbackMessage) fallbackMessage.value = fallbackText;
        if (clipboardFallback) clipboardFallback.style.display = 'block';
        
        showStatus('⚠️ Form submission failed. Use fallback below.', 'warning');
    }
    
    window.copyToClipboard = function() {
        const textarea = document.getElementById('fallbackMessage');
        if (!textarea) return;
        
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            showStatus('✅ Copied to clipboard! You can now paste into your email.', 'success');
        } catch(err) {
            showStatus('❌ Failed to copy. Please copy manually.', 'error');
        }
    };
    
    // ============ UI STATUS DISPLAY ============
    function showStatus(message, type) {
        const statusDiv = document.getElementById('formStatus');
        if (!statusDiv) return;
        
        statusDiv.innerHTML = `<div class="status-${type}">${message}</div>`;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            if (statusDiv.innerHTML === `<div class="status-${type}">${message}</div>`) {
                statusDiv.innerHTML = '';
            }
        }, 5000);
    }
    
    // ============ FORM SUBMISSION WITH RECAPTCHA ============
    async function handleSubmit(event) {
        event.preventDefault();
        
        const email = document.getElementById('userEmail')?.value;
        const message = document.getElementById('userMessage')?.value;
        const submitBtn = document.getElementById('submitBtn');
        const originalButtonText = submitBtn?.innerHTML || 'Email Seller';
        
        // Clear previous status
        const statusDiv = document.getElementById('formStatus');
        if (statusDiv) statusDiv.innerHTML = '';
        
        // Validation
        if (!email || !email.includes('@')) {
            showStatus('❌ Please enter a valid email address.', 'error');
            return;
        }
        
        if (!message || !message.trim()) {
            showStatus('❌ Please enter a message.', 'error');
            return;
        }
        
        if (message.length > MAX_MESSAGE_LENGTH) {
            showStatus(`❌ Message exceeds ${MAX_MESSAGE_LENGTH} characters.`, 'error');
            return;
        }
        
        // Check reCAPTCHA
        if (!recaptchaCompleted) {
            showStatus('❌ Please complete the reCAPTCHA verification.', 'error');
            const recaptchaError = document.getElementById('recaptchaError');
            if (recaptchaError) recaptchaError.style.display = 'block';
            return;
        }
        
        // Rate limiting check
        if (isRateLimited()) {
            const waitSeconds = getRemainingWaitTime();
            showStatus(`⏳ Please wait ${waitSeconds} seconds before sending another message.`, 'warning');
            return;
        }
        
        // Get reCAPTCHA response
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            showStatus('❌ Please complete the reCAPTCHA.', 'error');
            return;
        }
        
        // Disable button and show loading
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span>Sending...';
        }
        
        try {
            // Submit to Formspree with reCAPTCHA verification
            const form = document.getElementById('emailSellerForm');
            const formData = new FormData(form);
            formData.append('g-recaptcha-response', recaptchaResponse);
            
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                showStatus('✅ Message sent successfully! The seller will contact you soon.', 'success');
                
                // Set rate limit
                localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
                
                // Clear message but keep email
                localStorage.removeItem(`message_${productId}`);
                const messageInput = document.getElementById('userMessage');
                if (messageInput) {
                    messageInput.value = '';
                    updateCharCount();
                }
                
                // Reset reCAPTCHA
                grecaptcha.reset();
                recaptchaCompleted = false;
                
                // Reset button after delay
                setTimeout(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalButtonText;
                    }
                }, 3000);
                
            } else {
                const errorData = await response.json();
                if (errorData.error === 'recaptcha_failed') {
                    showStatus('❌ reCAPTCHA verification failed. Please try again.', 'error');
                    grecaptcha.reset();
                    recaptchaCompleted = false;
                } else {
                    throw new Error('Formspree error');
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalButtonText;
                }
            }
            
        } catch(error) {
            console.error('Submission error:', error);
            showClipboardFallback();
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalButtonText;
            }
        }
    }
    
    // ============ CLEAR SAVED DATA ============
    window.clearSavedData = function() {
        if (confirm('Clear your saved email and message for this product?')) {
            localStorage.removeItem(`buyerEmail_${productId}`);
            localStorage.removeItem(`message_${productId}`);
            const emailInput = document.getElementById('userEmail');
            const messageInput = document.getElementById('userMessage');
            
            if (emailInput) emailInput.value = '';
            if (messageInput) messageInput.value = '';
            
            updateCharCount();
            showStatus('✅ Saved data cleared.', 'success');
        }
    };
    
    function addClearLink() {
        const form = document.getElementById('emailSellerForm');
        if (!form) return;
        
        // Check if clear link already exists
        if (form.querySelector('.clear-data-link')) return;
        
        const clearLink = document.createElement('div');
        clearLink.className = 'clear-data-link';
        clearLink.style.marginTop = '10px';
        clearLink.style.fontSize = '12px';
        clearLink.style.textAlign = 'center';
        clearLink.innerHTML = '<a href="#" onclick="clearSavedData(); return false;" style="color: var(--text-secondary); text-decoration: none;">🗑️ Clear saved data</a>';
        form.appendChild(clearLink);
    }
    
    // ============ INITIALIZATION ============
    document.addEventListener('DOMContentLoaded', () => {
        initDarkMode();
        loadSavedData();
        addClearLink();
        
        const emailInput = document.getElementById('userEmail');
        const messageInput = document.getElementById('userMessage');
        const form = document.getElementById('emailSellerForm');
        
        if (emailInput) emailInput.addEventListener('input', saveData);
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                saveData();
                updateCharCount();
            });
        }
        if (form) form.addEventListener('submit', handleSubmit);
    });
    
    // Initial char count
    updateCharCount();