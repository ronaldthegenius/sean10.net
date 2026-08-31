// show_more function
// Accept 'button' as the second parameter
function show_more(selectedProductName, button) {
  const container = document.getElementById('show_more-container');
  if (!container) return;

  const existingSection = document.getElementById('moreDetails');
  if (existingSection) {
    existingSection.remove();
    if (button) button.innerText = 'read_more'; 
    return; 
  }

  const matchedItem = asideDataMore.find(item => item.name === selectedProductName); 
  
  if (!matchedItem) {
    container.insertAdjacentHTML('beforeend', '<p id="moreDetails">No extra gallery images available.</p>');
    return;
  }

  if (button) button.innerText = 'back home';

  const encodedMsg = encodeURIComponent(`I'm interested in the ${matchedItem.name || 'spare component'}`);

  // FIX: Injected your scale effects, cursor styling, and click preview mechanics cleanly here
  const imagesGridHTML = matchedItem.images.map(imgSrc => `
    <img 
      width="100px" 
      height="100px" 
      src="${imgSrc}" 
      alt="${matchedItem.title || 'Image'}" 
      class="grid-gallery-img"
      onclick="openImagePreview('${imgSrc}', '${matchedItem.title || 'Image'}')"
      onmouseover="this.style.transform='scale(1.02)'"
      onmouseout="this.style.transform='scale(1)'"
      title="Click to view full size"
    >
  `).join('');

  const show_moreHTML = `
    <div id="moreDetails" class="moreDetails_container">
      <h2>${matchedItem.title}</h2>
      <div class="more-images-grid" >
        ${imagesGridHTML}
      </div>
      <div class="fellows">
        <p><b>Price:</b> UGX ${matchedItem.price}</p>
        <p>${matchedItem.paragraph}</p>
        <a href="https://wa.me/${matchedItem.owner}&text=${encodedMsg}" target="_blank" class="buy-btn">
            WhatsApp owner <i class="bi bi-whatsapp"></i>
        </a>
      </div>
    </div>`;
  
  container.insertAdjacentHTML('beforeend', show_moreHTML);

  const newSection = document.getElementById('moreDetails');
  if (newSection) newSection.scrollIntoView({ behavior: "smooth" });
}

// ==========================================
// Function to open full-size image preview
// ==========================================
function openImagePreview(imgSrc, title) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
  modal.style.zIndex = '10000';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.flexDirection = 'column';
  modal.style.cursor = 'pointer';
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '20px';
  closeBtn.style.right = '20px';
  closeBtn.style.color = 'white';
  closeBtn.style.backgroundColor = 'orangered';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '50%';
  closeBtn.style.width = '40px';
  closeBtn.style.height = '40px';
  closeBtn.style.fontSize = '20px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.zIndex = '10001';
  closeBtn.onclick = () => modal.remove();
  
  // Add image
  const img = document.createElement('img');
  img.src = imgSrc;
  img.alt = title;
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.objectFit = 'contain';
  img.style.borderRadius = '10px';
  img.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  
  // Add title
  const caption = document.createElement('p');
  caption.textContent = title;
  caption.style.color = 'green';
  caption.style.marginTop = '20px';
  caption.style.fontSize = '2em';
  
  // Close when clicking background
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  modal.appendChild(closeBtn);
  modal.appendChild(img);
  modal.appendChild(caption);
  document.body.appendChild(modal);
}