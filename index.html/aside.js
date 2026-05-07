function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  // This one line handles both opening and closing
  sidebar.classList.toggle("open");
}













let currentPage = 1;
const itemsPerPage = 2;

function loadSidebarList() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Calculate which items to show
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = inventory.slice(startIndex, endIndex);
    const totalPages = Math.ceil(inventory.length / itemsPerPage);
    
    // Generate HTML for current page items
    const listHTML = itemsToShow.map((item, idx) => {
        const actualIndex = startIndex + idx;
        const imgSrc  = item.image ? item.image : "https://via.placeholder.com/150?text=No+Image";
        const conditionBadge = item.condition ? `<span class="badge">${item.condition}</span>` : ''; 
        
        return `
            <div class="sidebar-content" onclick="showPreview(${actualIndex})">
                ${conditionBadge} 
                <img src="${imgSrc}" alt="${item.title}">
                <div class="item-label">
                    <h1>${item.title}</h1>
                </div>
            </div>
        `;
    }).join('');

    // Pagination HTML
    const paginationHTML = `
        <div class="pagination-controls">
            <button class="pagination-btn" id="prevBtn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                ← Previous
            </button>
            <span style="padding: 8px 15px;">Page ${currentPage} of ${totalPages}</span>
            <button class="pagination-btn" id="nextBtn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                Next →
            </button>
        </div>
    `;

    // Channel div HTML (moved inside sidebar at bottom)
    const channelHTML = `
        <div id="channel">
            <ul>
                <li><i class="bi bi-whatsapp"></i></li>
                <li><i class="bi bi-telegram"></i></li>
            </ul>
            <p>used channels</p>
        </div>
    `;

    // Combine everything - items, pagination, then channel at bottom
    sidebar.innerHTML = listHTML + paginationHTML + channelHTML;
    sidebar.style.display = "block";
}

// Function to change pages
function changePage(newPage) {
    const totalPages = Math.ceil(inventory.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        loadSidebarList();
    }
}

// Your existing showPreview function (modified to keep channel at bottom)
function showPreview(index) {
    const item = inventory[index];
    const sidebar = document.getElementById('sidebar');
    const encodedMsg = encodeURIComponent(`I'm interested in ${item.title}`);
    const imgSrc = item.image ? item.image : "https://via.placeholder.com/150?text=No+Image";

    // Channel HTML to include in preview view too
    const channelHTML = `
        <div id="channel">
            <ul>
                <li><i class="bi bi-whatsapp"></i></li>
            </ul>
            <ul>
                <li><i class="bi bi-telegram"></i></li>
            </ul>
            <p>used channels</p>
        </div>
    `;

    sidebar.innerHTML = `
        <div class="sidebar-preview-content">
            <button onclick="loadSidebarList()" class="back-btn"">← Back to Shop</button>
            <img src="${imgSrc}" alt="${item.title}" >
            <h2>${item.title}</h2>
            <p><b>Price:</b> UGX ${item.price}</p>
            <p>${item.paragraph}</p>
            <a href="https://wa.me/256750812318?text=${encodedMsg}" target="_blank" class="buy-btn">
                WhatsApp owner
            </a>
        </div>
        ${channelHTML}
    `;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", loadSidebarList);




