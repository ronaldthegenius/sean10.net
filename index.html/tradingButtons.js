

//start OF BUTTONS

// 2. Optimized Render Function
function renderFilterButtons() {
    const container = document.getElementById('tradingButtons');
    if (!container) return;

    container.innerHTML = categories.map(cat => {
        const content = cat.color 
            ? `<span style="color: ${cat.color}; pointer-events: none;">${cat.label}</span>` 
            : cat.label;

        return `
            <button class="filter-btn ${cat.id === 'all' ? 'active' : ''}" data-category="${cat.id}">
                ${content}
            </button>
        `;
    }).join('');
}

// 3. Main Logic Controller
document.addEventListener('DOMContentLoaded', () => {
    renderFilterButtons();
    // loadSidebarList(); // Ensure this function is defined elsewhere

    const tradingButtonsContainer = document.getElementById('tradingButtons');

    tradingButtonsContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.filter-btn');
        if (!button) return;

        // UI Update: Toggle active class
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const selectedCategory = button.getAttribute('data-category');
        const products = document.querySelectorAll('.product'); 

        products.forEach(product => {
            const categoryString = product.dataset.category || "";
            // Split by space to handle multiple categories (e.g., "jersey new_items")
            const productCategories = categoryString.trim().split(/\s+/); 

            const isMatch = selectedCategory === 'all' || productCategories.includes(selectedCategory);
            product.style.display = isMatch ? 'block' : 'none';
        });
    });
});
//END OF BUTTONS







