function shuffleArray(array) {
  let arr = [...array]; // make a copy so we don't mess up original order
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
  }
  return arr;
}

// START OF MAIN ITEMS
// 1. Render the initial grid
function renderProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return; // Safety check

    productList.innerHTML = myProducts.map(product => `
        <div class="product" data-category="${product.category}" onclick="openPreview('${product.id}')">
            <div class="image_BX">
              <span class="condition">${product.class}</span> 
                <img height="100px" width="110px" src="${product.image}" alt="${product.name}">
                ${product.isNew ? '<mark>new</mark>' : ''}
                <h3><span>${product.name}</span></h3>
                <p class="price-container">
                    <span> <del>${product.oldPrice}</del>${product.newPrice}</span>
                </p>
            </div>
        </div>
    `).join('');
}

// CLOSE THE PREVIEW
function closePreview() {
    const previewContainer = document.getElementById('products-preview-container');
    
    if (previewContainer) {
        previewContainer.style.display = 'none';
        previewContainer.innerHTML = '';
        previewContainer.classList.remove('active');
    }
}

// 2. The Preview Function
function openPreview(productId) {
    const product = myProducts.find(p => p.id == productId);
    const previewContainer = document.getElementById('products-preview-container');
    
    if (!product || !previewContainer) return;

    // Gallery HTML
    const galleryHTML = product.gallery ? product.gallery.map(imgLink => `
        <img src="${imgLink}" class="product-thumbnail" onclick="openFullImage('${imgLink}')">
    `).join('') : '';

    // Start of preview
    previewContainer.innerHTML = `
    <div class="preview active">
        <i class="fas fa-times" onclick="closePreview()"></i>
        <h2>Product Details</h2>
        ${product.name ? `<h3>${product.name}</h3>` : ''}
        <div class="image-gallery">
            <div class="gallery-grid">
                ${galleryHTML} 
                <p class="water-mark">sean10.net</p>
            </div>
          ${product.span && product.h4 ? `<div class="span"><span>${product.span}</span><h4>${product.h4}</h4></div>` : ''}
        </div>
        <div class="price-container">
            <span> <del>${product.oldPrice}</del> - ${product.newPrice}</span>
        </div>
           <div class="name">
            <span id="Mybasket">DROP IN basket <i class="bi bi-cart4"></i></span>
        </div>
            <button class="fav-icon" data-id="${product.id}">♡</button> 

  <nav>
  <a href="favorites.html" class="nav-fav">
    ♥️ Favorites (<span class="fav-count">0</span>)
  </a>
</nav>

  <div class="contact_seller" id="seller">
    <h3>contact seller below</h3>
    <ul>
        <li> 
            <a href="https://wa.me/${product.whatsappNumber}" target="_blank" rel="noopener noreferrer">
                <i class="bi bi-whatsapp"></i>
            </a>
        </li>
        <li> 
            <a href="tel:+${product.phoneNumber}">
                <i class="bi bi-telephone"></i>
            </a>
        </li>
    </ul>
  </div>

  <!-- Global Dark Mode Toggle -->
  <label class="dark-mode-toggle" style="position: fixed; top: 10px; right: 10px; z-index: 9999;">
    <input type="checkbox" id="globalDarkModeToggle">
    <span class="toggle-slider"></span>
    <span style="margin-left: 10px;">Dark Mode</span>
  </label>
           
  <!-- EMAIL SELLER FORM -->
  ${product.sellerEmail ? `<div class="emailSeller" data-product-id="${product.id}">
    <form class="online_chat" id="emailSellerForm_${product.id}" action="https://formspree.io/f/mjgzprel" method="POST">
        <input type="email" name="email" id="userEmail_${product.id}" class="user-email" placeholder="Your email" required autocomplete="email">
        
        <textarea name="message" id="userMessage_${product.id}" class="user-message" placeholder="Your message" rows="4" maxlength="500"></textarea>
        <div id="charCount_${product.id}" class="char-count">0/500 characters</div>
        
        <!-- Google reCAPTCHA -->
        <div class="g-recaptcha" data-sitekey="6LcB4P4sAAAAAIcsZiuKKNCuzctrHcSPTC0mxK0D" data-callback="onRecaptchaSuccess_${product.id}" data-expired-callback="onRecaptchaExpired_${product.id}"></div>
        <div id="recaptchaError_${product.id}" class="recaptcha-error" style="color: var(--error-color); font-size: 12px; display: none;">Please complete the reCAPTCHA</div>
        
        <!-- Honeypot -->
        <input type="text" name="_gotcha" style="display:none !important" tabindex="-1" autocomplete="off">
        
        <input type="hidden" name="_to" value="${product.email}">
        <input type="hidden" name="_subject" value="New inquiry about your product">
        
        <button type="submit" id="submitBtn_${product.id}" class="submit-btn">Email Seller</button>
        <div id="formStatus_${product.id}" class="form-status"></div>
    </form>

    <!-- Clipboard fallback -->
    <div id="clipboardFallback_${product.id}" class="clipboard-fallback" style="display:none; margin-top:10px;">
        <p style="color: var(--warning-color);">⚠️ Email form is unavailable. Copy this message manually:</p>
        <textarea id="fallbackMessage_${product.id}" class="fallback-message" rows="3" readonly style="width:100%; background: var(--input-bg); color: var(--text-primary); border: 1px solid var(--border-color);"></textarea>
        <button onclick="copyToClipboard('${product.id}')" style="margin-top:5px;">📋 Copy to Clipboard</button>
        <a href="mailto:${product.email}" style="display:block; margin-top:5px; color: var(--button-bg);">✉️ Or open Email App</a>
    </div>
  </div>` : ''}

        <div class="condition">condition: <span>${product.condition}</span></div>

        <div class="location">
            Location: <span>${product.location || 'Not specified'}</span>
        </div>

        ${product.mapUrl ? `
            <div class="map-box">
                <iframe 
                    src="${product.mapUrl}" 
                    style="border:0; width: 100%; max-width: 400px; height: 150px;" 
                    allowfullscreen="" 
                    loading="lazy">
                </iframe>
            </div>` : ''
        }

        <div class="pdtdescription">
             ${product.descriptionTitle ? `<div class="descriptionTitle">${product.descriptionTitle}</div>` : ''} 

            ${product.Name ? `<div class="laptopsDetails">${product.PCname}<span><b>${product.PCtitle}</b></span></div>` : ''}
            ${product.processor ? `<div class="laptopsDetails">${product.cpu}<span><b>${product.processor}</b></span></div>` : ''}
            ${product.ram ? `<div class="laptopsDetails">${product.installedRam}<span><b>${product.ram}</b></span></div>` : ''}
            ${product.storage ? `<div class="laptopsDetails">${product.installedStorage}<span><b>${product.storage}</b></span></div>` : ''}
            ${product.gpu ? `<div class="laptopsDetails">${product.gpu}<span><b>${product.graphics}</b></span></div>` : ''}
            ${product.dedicatedGPU ? `<div class="laptopsDetails">${product.dedicatedGPU}<span><b>${product.dedicatedGPUsize}</b></span></div>` : ''}
            ${product.keypad ? `<div class="laptopsDetails">${product.keypad}<span><b>${product.keypadLight}</b></span></div>` : ''}
            ${product.battery ? `<div class="laptopsDetails">${product.battery}<span><b>${product.batteryLIFE}</b></span></div>` : ''}

            ${product.details ? `<div class="paragraph"><b>${product.details}</b></div>` : ''}
            ${product.noteDetails ? `<div class="noteTitle">${product.noteDetails}</div>` : ''} 
            ${product.note ? `<div class="note">${product.note}</div>` : ''}
        </div>
        
        <div class="modal" id="productImageModal" style="display:none;">
            <div class="modal-content">
                <img class="full-image" id="productFullImage" src="" alt="Full view">
                <button class="close-btn" onclick="closeFullImage()">&times;</button>
            </div>
        </div>
    </div>`;
    
    previewContainer.style.display = 'flex';
}

// 3. Modal Logic Functions
function openFullImage(imgSrc) {
    const modal = document.getElementById('productImageModal');
    const fullImg = document.getElementById('productFullImage');
    
    if (modal && fullImg) {
        fullImg.src = imgSrc;
        modal.classList.add('active');
    }
}

function closeFullImage() {
    const modal = document.getElementById('productImageModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Ensure the DOM is loaded before running
document.addEventListener('DOMContentLoaded', renderProducts);

