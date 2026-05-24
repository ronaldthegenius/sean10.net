



//START OF MAIN ITEMS
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
    <span> <del> ${product.oldPrice}</del>${product.newPrice}</span>
</p>
    
            </div>
        </div>
    `).join('');
}

//   CLOSE THE PREVIEW
function closePreview() {
    const previewContainer = document.getElementById('products-preview-container');
    
    if (previewContainer) {
        // 1. Hide it immediately from the user's view
        previewContainer.style.display = 'none';
        
        // 2. Clear the HTML to free up memory and reset the scroll position
        previewContainer.innerHTML = '';
        
        // Optional: If you use a class to show/hide (like .active), remove it too
        previewContainer.classList.remove('active');
    }
}
// PREVIEW CLOSED
// Ensure the DOM is loaded before running
// document.addEventListener('DOMContentLoaded', renderProducts);



// 2. The Preview Function
function openPreview(productId) {
    const product = myProducts.find(p => p.id == productId);
    const previewContainer = document.getElementById('products-preview-container');
    
    if (!product || !previewContainer) return;

    // We use imgLink here so every image in the array gets displayed
    const galleryHTML = product.gallery.map(imgLink => `
        <img src="${imgLink}" class="product-thumbnail" onclick="openFullImage('${imgLink}')">
    `).join(''); 

    

//start of preview

// 1. Prepare the encoded message and clean number
// const sellerMsg = encodeURIComponent("Hello s̸e̸a̸n̸10.! I need your item please, can we negotiate?");
// const cleanWhatsApp = product.whatsappNumber.replace(/\D/g, ''); 


// 2. Inject into the HTML
previewContainer.innerHTML = `
    <div class="preview active">
        <i class="fas fa-times" onclick="closePreview()"></i>
        <h2>Product Details</h2>
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
  <div class="contact_seller" id="seller">
    <h3>contact seller below</h3>
    <ul>
        <li> 
            <a href="https://wa.me/${product.whatsappNumber}" target="_blank" rel="noopener noreferrer">
                <i class="bi bi-whatsapp"></i>
            </a>
        </li> <!-- Added closing li -->

        <li> 
            <a href="tel:+${product.phoneNumber}">
                <i class="bi bi-telephone"></i>
            </a>
        </li>
      
    </ul>
</div>
      
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
    `;
    previewContainer.style.display = 'flex';
}

//end of preview

// 3. Modal Logic Functions
function openFullImage(imgSrc) {
    const modal = document.getElementById('productImageModal');
    const fullImg = document.getElementById('productFullImage');
    
    if (modal && fullImg) {
        fullImg.src = imgSrc;
        modal.classList.add('active'); // This matches your .modal.active CSS
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

// PEVIEW FULL IMG ENDS
