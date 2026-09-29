/* ============================================================
   Sean10.net · Admin — Product Generator
   ============================================================ */

const $ = (id) => document.getElementById(id);
const v = (id) => $(id) ? $(id).value.trim() : '';

/* ============================================================
   Combine price + currency into one string
   ============================================================ */
function combinePrice(amountId, currencyId) {
  const amount = v(amountId);
  const currency = $(currencyId).value;

  if (!amount) return '';
  const lower = amount.toLowerCase();
  if (lower === 'negotiable' || lower === 'soon coming') return amount;

  // If the user already typed a currency inside the amount, don't double it
  if (/[a-zA-Z]{2,}$/.test(amount)) return amount;

  return `${amount} ${currency}`;
}

/* ============================================================
   Generate product object from form
   ============================================================ */
function generate() {
  // Required check
  const required = ['id', 'name', 'newPrice', 'image', 'location', 'email', 'phone', 'details'];
  for (const field of required) {
    if (!v(field)) {
      setStatus('❌ Please fill in all required fields.', true);
      $(field).focus();
      return;
    }
  }

  // WhatsApp link with your custom branded text
  const waText = 'Hello%20s̸e̸a̸n̸10%21%20I%20need%20your%20item%20please%20can%20we%20negotiate%20%3F.';
  const whatsappNumber = `${v('phone')}?text=${waText}`;

  // Build gallery array from textarea lines
  const gallery = v('gallery')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  // Combine price + currency
  const newPriceCombined = combinePrice('newPrice', 'newPriceCurrency');
  const oldPriceCombined = combinePrice('oldPrice', 'oldPriceCurrency');

  // Build the product object
  const product = {
    id: v('id'),
    class: v('condition'),
    name: v('name'),
    category: v('category'),
    Location: v('location'),       // uppercase — kept for your existing code
    image: v('image'),
    gallery: gallery,
    span: v('span') || 'price per piece',
    h4: v('h4'),
    whatsappNumber: whatsappNumber,
    phoneNumber: v('phone'),
    sellerEmail: v('email'),
    email: v('email'),
    location: v('location'),       // lowercase — kept for your existing code
    mapUrl: v('mapUrl'),
    condition: v('condition'),
    descriptionTitle: v('descriptionTitle') || 'descriptions;',
    details: v('details'),
    noteDetails: v('noteDetails') || 'note',
    note: v('note'),
    oldPrice: oldPriceCombined,
    newPrice: newPriceCombined
  };

  // Clean: remove empty optional fields
  Object.keys(product).forEach(key => {
    const val = product[key];
    if (val === '' || val === undefined || val === null) {
      delete product[key];
    }
  });

  // Always keep gallery as an array
  if (!product.gallery) product.gallery = [];

  // Pretty-format as JS (unquoted keys)
  const formatted = JSON.stringify(product, null, 2)
    .replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1:');

  // Show output
  $('output').textContent = formatted + ',';
  $('outputCard').style.display = 'block';
  $('outputCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setStatus('✅ Generated — scroll down and copy.');
}

/* ============================================================
   Copy output to clipboard
   ============================================================ */
function copyOutput() {
  const text = $('output').textContent;
  navigator.clipboard.writeText(text).then(
    () => setStatus('📄 Copied to clipboard!'),
    () => setStatus('❌ Copy failed — select and copy manually.', true)
  );
}

/* ============================================================
   Demo data
   ============================================================ */
function fillDemo() {
  $('id').value = 'controllers-1';
  $('name').value = 'DS4 Controller';
  $('condition').value = 'used';
  $('category').value = 'game_controllers';
  $('h4').value = '1 piece available';
  $('oldPrice').value = '50,000';
  $('oldPriceCurrency').value = 'UGX';
  $('newPrice').value = '40,000';
  $('newPriceCurrency').value = 'UGX';
  $('span').value = 'price per piece';
  $('note').value = 'Price negotiable';
  $('image').value = '/images/used-pack/sean/ds4.jpeg';
  $('gallery').value =
    '/images/used-pack/sean/ds4.jpeg\n' +
    '/images/used-pack/thumbnails/sean thumbnails/ds4 1.jpeg\n' +
    '/images/used-pack/thumbnails/sean thumbnails/ds4 2.jpeg';
  $('location').value = 'Jebel Ali Industrial Area, Dubai';
  $('mapUrl').value = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28928.808191227257!2d55.104990877735254!3d24.99668297781386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f12a5fc60c251%3A0xcb332e4004272dc9!2sJebel%20Ali%20Industrial%20Area%20-%20Jabal%20Ali%20Industrial%20First%20-%20Dubai!5e0!3m2!1sen!2sae!4v1776783267254!5m2!1sen!2sae';
  $('email').value = 'ronaldthegenius@gmail.com';
  $('phone').value = '256750812318';
  $('country').value = 'United Arab Emirates';
  $('descriptionTitle').value = 'descriptions;';
  $('details').value = 'Slightly used, still in good condition, no refurbs.';
  $('noteDetails').value = 'note';
  setStatus('📋 Demo loaded — click Generate.');
}

/* ============================================================
   Reset form
   ============================================================ */
function resetForm() {
  $('productForm').reset();
  $('outputCard').style.display = 'none';
  setStatus('');
}

/* ============================================================
   Status helper
   ============================================================ */
function setStatus(msg, isError = false) {
  const el = $('status');
  el.textContent = msg;
  el.style.color = isError ? '#a63a3a' : '#1a7a3f';
}

/* ============================================================
   Wire it up
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  $('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    generate();
  });

  $('demoBtn').addEventListener('click', fillDemo);
  $('resetBtn').addEventListener('click', resetForm);
  $('copyBtn').addEventListener('click', copyOutput);
  $('hideBtn').addEventListener('click', () => {
    $('outputCard').style.display = 'none';
  });
});

