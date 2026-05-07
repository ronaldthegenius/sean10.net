



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
        
        <form class="online_chat">
            <input type="text" id="online_chat" placeholder="chat online">
            <button type="submit">send_chat</button>
        </form>
    </ul>
</div>
        <div class="name">
            <h3>${product.name}</h3> 
            <span id="Mybasket">DROP IN basket <i class="bi bi-cart4"></i></span>
        </div>
            <button class="fav-icon" data-id="${product.id}">♡</button> 

  <nav>
  <a href="favorites.html" class="nav-fav">
    ♥️ Favorites (<span class="fav-count">0</span>)
  </a>
</nav>
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

            
     ${product.pcName ? `<div class="laptopsDetails"><b>${product.pcName}</b><span>pcName</span></div>` : ''}
    ${product.processor ? `<div class="laptopsDetails"><b>${product.processor}</b><span>processor/s</span></div>` : ''}
    ${product.ram ? `<div class="laptopsDetails"><b>${product.ram}</b><span>storage</span></div>` : ''}
    ${product.storage ? `<div class="laptopsDetails"><b>${product.storage}</b><span>ram</span></div>` : ''}
    ${product.card ? `<div class="laptopsDetails"><b>${product.card}</b><span>card</span></div>` : ''}

   
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


// START OF FAVOURITE BTN
// 1. Initial Setup: Run this as soon as the page loads
// 1. Helper to get data
const getFavs = () => JSON.parse(localStorage.getItem('sean10_favs') || '[]');

// 2. The function that makes hearts red and updates the count
function updateUI() {
    const favs = getFavs();
    
    // Update the (0) in your nav
    const countElement = document.querySelector('.fav-count');
    if (countElement) countElement.textContent = favs.length;

    // Show/Hide "No favorites yet" message
    const emptyMsg = document.getElementById('empty-msg');
    if (emptyMsg) {
        emptyMsg.style.display = favs.length === 0 ? 'block' : 'none';
    }

    // Sync all icons: This makes them stay red (♥️) even after refresh
    document.querySelectorAll('.fav-icon').forEach(btn => {
        const id = btn.dataset.id.toString();
        if (favs.includes(id)) {
            btn.innerHTML = '♥️';
            btn.classList.add('active');
        } else {
            btn.innerHTML = '♡';
            btn.classList.remove('active');
        }
    });
}

// 3. The Click Logic
document.addEventListener('click', (e) => {
    // Look for the .fav-icon class specifically
    const btn = e.target.closest('.fav-icon');
    if (!btn) return;

    const id = btn.dataset.id.toString();
    let favs = getFavs();

    if (favs.includes(id)) {
        // REMOVE from list
        favs = favs.filter(favId => favId !== id);
        
        // If we are on the favorites page, hide the item immediately
        if (window.location.pathname.includes('favorites')) {
            const card = btn.closest('.product') || btn.closest('.product-card');
            if (card) card.remove();
        }
    } else {
        // ADD to list
        favs.push(id);
    }

    localStorage.setItem('sean10_favs', JSON.stringify(favs));
    updateUI(); // Refresh everything
});

// 4. Run on page load
updateUI();
// END OF FAVOURITE BTN

// START OF FAVOURITE ITEMS
function renderFavoriteItems() {
    const container = document.getElementById('fav-container');
    if (!container) return; // Only run this if we are on the favorites page

    const favIds = JSON.parse(localStorage.getItem('sean10_favs') || '[]');
    container.innerHTML = ''; // Clear it out first

    if (favIds.length === 0) {
        const emptyMsg = document.getElementById('empty-msg');
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    favIds.forEach(id => {
        // Find the product in your master list (myProducts)
        const product = myProducts.find(p => p.id == id);
        
        if (product) {
            const card = document.createElement('div');
            card.className = 'product-card'; // Match your CSS class
            card.innerHTML = `
                <div class="product">
                    <button class="fav-icon active" data-id="${product.id}">♥️</button>
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.newPrice}</p>
                    <div class="condition">Condition: ${product.condition}</div>
                </div>
            `;
            container.appendChild(card);
        }
    });
}

// Call it when the page loads
renderFavoriteItems();
// END OF FAVOURITE ITEMS





