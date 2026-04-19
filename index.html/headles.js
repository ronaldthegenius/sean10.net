
// START OF OPTION 1 its cool
// document.addEventListener('DOMContentLoaded', () => {
//     const filterButtons = document.querySelectorAll('.filter-btn');
//     const products = document.querySelectorAll('.product');

//     filterButtons.forEach(button => {
//         button.addEventListener('click', () => {
//             const selectedCategory = button.getAttribute('data-category');

//             products.forEach(product => {
//                 // 1. Get the categories from the data attribute
//                 // 2. Split them by space into an array (e.g., ["laptops", "used_items"])
//                 const productCategories = product.dataset.category.split(' ');

//                 // 3. Check if 'all' is selected OR if the array contains the selected category
//                 if (selectedCategory === 'all' || productCategories.includes(selectedCategory)) {
//                     product.classList.remove('hidden');
//                 } else {
//                     product.classList.add('hidden');
//                 }
//             });
//         });
//     });
// });

//END OF OPTION

// i opted for OPTION 2 AS BELOW
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // MOVE THIS INSIDE: Look for products only when the button is clicked
            const products = document.querySelectorAll('.product');
            const selectedCategory = button.getAttribute('data-category');
            
            console.log(`Filtering ${products.length} products for: ${selectedCategory}`);

            products.forEach(product => {
                const categoryString = product.dataset.category || "";
                // Use includes() for a safer check with multi-category strings
                const productCategories = categoryString.trim().split(/\s+/); 

                if (selectedCategory === 'all' || productCategories.includes(selectedCategory)) {
                    product.style.display = 'block'; // Or product.classList.remove('hidden')
                } else {
                    product.style.display = 'none';  // Or product.classList.add('hidden')
                }
            });
        });
    });
});
// START OF MY BEST OPTION

// END OF OPTION 2

//END OF BUTTONS





























// START OF SIDEBAR  AT 600PX WIDTH hidebutton
// Element = document.getElementById("sidebar");
// You can now manipulate 'Element' as needed, for example:
// Element.style.backgroundColor = "#f0f0f0"; // Change background color
const navButton = document.getElementById("navButton");
navButton.style.color = "forestgreen"; // Change button text color
navButton.style.fontWeight = "bold"; // Make button text bold
navButton.style.padding = "5px"; // Add padding to the button
navButton.style.borderRadius = "0px 10px"; // Add border radius to the button
navButton.style.position = "sticky"; // Make button position sticky
navButton.style.top = "500px"; // Set top position
navButton.style.zIndex = 999999 ;
const sidebar = document.getElementById("sidebar");
// You can now manipulate 'sidebar' as needed, for example:
// sidebar.style.padding = "10px"; // Add padding
function toggleSidebar() {
    sidebar.classList.toggle("show");
}


// START OF SIDEBAR LIMITED ITEMS   and show more items  
document.addEventListener('DOMContentLoaded', function() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const allItems = document.querySelectorAll('.sidebar-content.product');
    
    // Number of items per page
    const itemsPerPage = 2;
    let currentPage = 1;
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    
    // Function to show items for current page
    function showCurrentPage() {
        // Hide all items first
        allItems.forEach(item => {
            item.style.display = 'none';
        });
        
        // Calculate range for current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // Show items for current page
        for (let i = startIndex; i < endIndex && i < allItems.length; i++) {
            allItems[i].style.display = 'block';
        }
        
        // Update button states
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        
        // Optional: Show page indicator
        const pageIndicator = document.getElementById('pageIndicator');
        if (pageIndicator) {
            pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        }
    }
    
    // Go to previous page
    function goToPreviousPage() {
        if (currentPage > 1) {
            currentPage--;
            showCurrentPage();
        }
    }
    
    // Go to next page
    function goToNextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            showCurrentPage();
        }
    }
    
    // Initialize
    showCurrentPage();
    
    // Add click events
    prevBtn.addEventListener('click', goToPreviousPage);
    nextBtn.addEventListener('click', goToNextPage);
});

// END OF SIDEVBAR LIMITED ITEMS 

// END OF SIDEBAR






















































// 1. Render the initial grid
function renderProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return; // Safety check

    productList.innerHTML = myProducts.map(product => `
        <div class="product" data-category="${product.category}" onclick="openPreview('${product.id}')">
            <div class="image_BX">
                <img height="100px" width="110px" src="${product.image}" alt="${product.name}">
                ${product.isNew ? '<mark>new</mark>' : ''}
                <h3><span>${product.name}</span></h3>
<p class="price-container">
    <span> <del> ${product.oldPrice}</del> - ${product.newPrice}</span>
</p>
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
             <div class="contact_seller" id="seller">
             <h3>contact seller bellow </h3>
    <ul>
        <li> 
    <a href="https://wa.me/${product.whatsappNumber}"><i class="bi bi-whatsapp"></i></a>
</li>
        <li> 
    <a href="tel:${product.phoneNumber}" ><i class="bi bi-telephone"></i> </a>
</li>
       
    
        <form class="online_chat">
            <input type="text" id="online_chat" placeholder="chat online">
            <button tabindex="submit">send_chat</button>
        </form>
    </ul>
  </div>
            <h3>${product.name}</h3>
            <div class="description">${product.description}</div>
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