
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
    const products = document.querySelectorAll('.product');

    console.log("System Ready: Found " + filterButtons.length + " buttons and " + products.length + " products.");

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedCategory = button.getAttribute('data-category');
            console.log("Button clicked! Looking for category: " + selectedCategory);

            products.forEach(product => {
                // This part handles the extra spaces by splitting correctly
                const categoryString = product.dataset.category || "";
                const productCategories = categoryString.trim().split(/\s+/); 

                if (selectedCategory === 'all' || productCategories.includes(selectedCategory)) {
                    product.classList.remove('hidden');
                } else {
                    product.classList.add('hidden');
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
    const itemsPerPage = 3;
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
                    <del>${product.oldPrice}</del> 
                    <strong>${product.newPrice}</strong>
                </p>
            </div>
        </div>
    `).join('');
}

// 2. The Preview Function
function openPreview(productId) {
    // Use == instead of === to match even if one is a string and one is a number
    const product = myProducts.find(p => p.id == productId);
    const previewContainer = document.getElementById('products-preview-container');
    
    if (!product || !previewContainer) return;

    // Use bracket notation ['data-full'] for keys with hyphens
    const fullImgPath = product['data-full'] || product.image; 

    // ... inside openPreview function ...
    previewContainer.innerHTML = `
        <div class="preview active">
            <i class="fas fa-times" onclick="closePreview()"></i>
            <h2>Product Details</h2>
            <div class="image-gallery">
                <div class="gallery-grid">
                    <img src="${product.image}" class="product-thumbnail" onclick="openFullImage('${fullImgPath}')"> 
                    <img src="${product.image2 || product.image}" class="product-thumbnail" onclick="openFullImage('${fullImgPath}')"> 
                    <img src="${product.image3 || product.image}" class="product-thumbnail" onclick="openFullImage('${fullImgPath}')"> 
                    <img src="${product.image4 || product.image}" class="product-thumbnail" onclick="openFullImage('${fullImgPath}')"> 
                    
                    <p class="water-mark">headles.com</p>
                </div>
            </div>
            <h3>${product.name}</h3>
            <p class="special-price"><strong>Special Price:</strong> ${product.newPrice}</p>
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

// 3. Modal Logic Functions
function openFullImage(imgSrc) {
    const modal = document.getElementById('productImageModal');
    const fullImg = document.getElementById('productFullImage');
    if (modal && fullImg) {
        fullImg.src = imgSrc;
        modal.style.display = 'flex';
    }
}

function closeFullImage() {
    const modal = document.getElementById('productImageModal');
    if (modal) modal.style.display = 'none';
}

function closePreview() {
    const previewContainer = document.getElementById('products-preview-container');
    if (previewContainer) previewContainer.style.display = 'none';
}

// Ensure the DOM is loaded before running
document.addEventListener('DOMContentLoaded', renderProducts);