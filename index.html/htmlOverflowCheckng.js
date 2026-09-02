function checkPriceOverflow() {
    const priceContainers = document.querySelectorAll('.product-container .product .price-container');

    priceContainers.forEach(container => {
        // Remove existing class before recalculating
        container.classList.remove('is-overflowing');

        // Check if content width is larger than the visible container width
        if (container.scrollWidth > container.clientWidth) {
            container.classList.add('is-overflowing');
        }
    });
}

// 1. Run immediately after rendering items
productContainer.innerHTML = items.map(/* your template string */).join('');
checkPriceOverflow();

// 2. Re-check on window resize so it adapts dynamically
window.addEventListener('resize', checkPriceOverflow);