


// ============ DARK MODE ============
function initDarkMode() {
    const toggle = document.getElementById('globalDarkModeToggle');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (toggle) toggle.checked = true;
    }
    
    if (toggle) {
        toggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }
}

// ============ CHARACTER COUNTER ============
function initCharCounter(productId) {
    const messageInput = document.getElementById(`userMessage_${productId}`);
    const charCountDiv = document.getElementById(`charCount_${productId}`);
    
    if (!messageInput || !charCountDiv) return;
    
    function updateCharCount() {
        const length = messageInput.value.length;
        const maxLength = 500;
        charCountDiv.innerHTML = `${length}/${maxLength} characters`;
        
        if (length > maxLength) {
            charCountDiv.style.color = '#f44336';
            messageInput.value = messageInput.value.substring(0, maxLength);
        } else if (length > 450) {
            charCountDiv.style.color = '#ff9800';
        } else {
            charCountDiv.style.color = '#25D366';
        }
    }
    
    messageInput.addEventListener('input', updateCharCount);
    updateCharCount();
}

// ============ RECAPTCHA STATE ============
const recaptchaState = {};

function setupRecaptcha(productId) {
    window[`onRecaptchaSuccess_${productId}`] = function() {
        recaptchaState[productId] = true;
        const errorDiv = document.getElementById(`recaptchaError_${productId}`);
        if (errorDiv) errorDiv.style.display = 'none';
    };
    
    window[`onRecaptchaExpired_${productId}`] = function() {
        recaptchaState[productId] = false;
        const errorDiv = document.getElementById(`recaptchaError_${productId}`);
        if (errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'reCAPTCHA expired. Please verify again.';
        }
    };
}

// ============ LOCALSTORAGE ============
function loadSavedData(productId) {
    const savedEmail = localStorage.getItem(`buyerEmail_${productId}`);
    const savedMessage = localStorage.getItem(`message_${productId}`);
    
    const emailInput = document.getElementById(`userEmail_${productId}`);
    const messageInput = document.getElementById(`userMessage_${productId}`);
    
    if (savedEmail && emailInput) emailInput.value = savedEmail;
    if (savedMessage && messageInput) messageInput.value = savedMessage;
    
    if (messageInput) {
        const event = new Event('input');
        messageInput.dispatchEvent(event);
    }
}

function saveData(productId) {
    const email = document.getElementById(`userEmail_${productId}`)?.value;
    const message = document.getElementById(`userMessage_${productId}`)?.value;
    
    if (email) localStorage.setItem(`buyerEmail_${productId}`, email);
    if (message) localStorage.setItem(`message_${productId}`, message);
}

// ============ RATE LIMITING ============
function isRateLimited(productId) {
    const lastSent = localStorage.getItem(`lastEmailSentTime_${productId}`);
    if (!lastSent) return false;
    const minutesSinceLast = (Date.now() - parseInt(lastSent)) / 1000 / 60;
    return minutesSinceLast < 2;
}

// ============ UI FUNCTIONS ============
function showStatus(productId, message, type) {
    const statusDiv = document.getElementById(`formStatus_${productId}`);
    if (!statusDiv) return;
    statusDiv.innerHTML = `<div class="status-${type}">${message}</div>`;
    setTimeout(() => { statusDiv.innerHTML = ''; }, 5000);
}

function showClipboardFallback(productId, sellerEmail) {
    const email = document.getElementById(`userEmail_${productId}`)?.value || '';
    const message = document.getElementById(`userMessage_${productId}`)?.value || '';
    const fallbackText = `To: ${sellerEmail}\nFrom: ${email}\n\nMessage:\n${message}`;
    
    const fallbackMessage = document.getElementById(`fallbackMessage_${productId}`);
    const clipboardFallback = document.getElementById(`clipboardFallback_${productId}`);
    
    if (fallbackMessage) fallbackMessage.value = fallbackText;
    if (clipboardFallback) clipboardFallback.style.display = 'block';
    showStatus(productId, '⚠️ Form failed. Use fallback below.', 'warning');
}

window.copyToClipboard = function(productId) {
    const textarea = document.getElementById(`fallbackMessage_${productId}`);
    if (!textarea) return;
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showStatus(productId, '✅ Copied to clipboard!', 'success');
    } catch(err) {
        showStatus(productId, '❌ Failed to copy.', 'error');
    }
};

// ============ FORM SUBMISSION ============
async function handleSubmit(event, productId, sellerEmail) {
    event.preventDefault();
    
    const email = document.getElementById(`userEmail_${productId}`)?.value;
    const message = document.getElementById(`userMessage_${productId}`)?.value;
    const submitBtn = document.getElementById(`submitBtn_${productId}`);
    const originalText = submitBtn?.innerHTML || 'Email Seller';
    
    if (!email || !email.includes('@')) {
        showStatus(productId, '❌ Please enter a valid email address.', 'error');
        return;
    }
    
    if (!message || !message.trim()) {
        showStatus(productId, '❌ Please enter a message.', 'error');
        return;
    }
    
    if (!recaptchaState[productId]) {
        showStatus(productId, '❌ Please complete the reCAPTCHA.', 'error');
        return;
    }
    
    if (isRateLimited(productId)) {
        showStatus(productId, '⏳ Please wait 2 minutes before sending again.', 'warning');
        return;
    }
    
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
        showStatus(productId, '❌ Please complete the reCAPTCHA.', 'error');
        return;
    }
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span>Sending...';
    }
    
    try {
        const form = document.getElementById(`emailSellerForm_${productId}`);
        const formData = new FormData(form);
        formData.append('g-recaptcha-response', recaptchaResponse);
        
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            showStatus(productId, '✅ Message sent successfully!', 'success');
            localStorage.setItem(`lastEmailSentTime_${productId}`, Date.now().toString());
            localStorage.removeItem(`message_${productId}`);
            
            const messageInput = document.getElementById(`userMessage_${productId}`);
            if (messageInput) {
                messageInput.value = '';
                const event = new Event('input');
                messageInput.dispatchEvent(event);
            }
            grecaptcha.reset();
            recaptchaState[productId] = false;
        } else {
            throw new Error('Failed');
        }
    } catch(error) {
        showClipboardFallback(productId, sellerEmail);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

// ============ CLEAR DATA ============
window.clearSavedData = function(productId) {
    if (confirm('Clear saved data for this product?')) {
        localStorage.removeItem(`buyerEmail_${productId}`);
        localStorage.removeItem(`message_${productId}`);
        document.getElementById(`userEmail_${productId}`).value = '';
        document.getElementById(`userMessage_${productId}`).value = '';
        showStatus(productId, '✅ Saved data cleared.', 'success');
    }
};

function addClearLink(productId) {
    const form = document.getElementById(`emailSellerForm_${productId}`);
    if (!form || form.querySelector('.clear-link')) return;
    
    const clearLink = document.createElement('div');
    clearLink.className = 'clear-link';
    clearLink.style.marginTop = '10px';
    clearLink.style.textAlign = 'center';
    clearLink.innerHTML = `<a href="#" onclick="clearSavedData('${productId}'); return false;" style="color: var(--text-secondary);">🗑️ Clear saved data</a>`;
    form.appendChild(clearLink);
}

// ============ INITIALIZE PRODUCT ============
function initProduct(productId, sellerEmail) {
    setupRecaptcha(productId);
    initCharCounter(productId);
    loadSavedData(productId);
    addClearLink(productId);
    
    const emailInput = document.getElementById(`userEmail_${productId}`);
    const messageInput = document.getElementById(`userMessage_${productId}`);
    const form = document.getElementById(`emailSellerForm_${productId}`);
    
    if (emailInput) emailInput.addEventListener('input', () => saveData(productId));
    if (messageInput) messageInput.addEventListener('input', () => saveData(productId));
    if (form) form.addEventListener('submit', (e) => handleSubmit(e, productId, sellerEmail));
}

// ============ INITIALIZE ALL ============
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    
    const sellers = document.querySelectorAll('.emailSeller');
    sellers.forEach(seller => {
        const productId = seller.dataset.productId;
        const sellerEmailInput = seller.querySelector('input[name="_to"]');
        const sellerEmail = sellerEmailInput ? sellerEmailInput.value : '';
        
        if (productId && sellerEmail) {
            initProduct(productId, sellerEmail);
        }
    });
});
