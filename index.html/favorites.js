

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





