

// Store pagination HTML in a string variable
const paginationHTML = `
     <div class="pagination-controls">
    <button id="prevBtn" class="pagination-btn">← Previous</button>
    <button id="nextBtn" class="pagination-btn">Next →</button>
</div>
`;
document.getElementById('pagination').innerHTML = paginationHTML;




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
