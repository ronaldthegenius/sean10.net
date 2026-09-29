/* ============================================================
   Sean10.net · Sell form
   ============================================================ */

const SELLER_WHATSAPP = '256750812318';

/* ------------------------------------------------------------
   Country → default currency
   ------------------------------------------------------------ */
const COUNTRY_CURRENCY = {
  "Uganda": "UGX", "Kenya": "KES", "Tanzania": "TZS", "Rwanda": "RWF",
  "Burundi": "BIF", "Ethiopia": "ETB", "Somalia": "SOS",
  "South Sudan": "SSP", "Sudan": "SDG", "Egypt": "EGP", "Libya": "LYD",
  "Tunisia": "TND", "Algeria": "DZD", "Morocco": "MAD",
  "Nigeria": "NGN", "Ghana": "GHS", "Senegal": "XOF", "Ivory Coast": "XOF",
  "Cameroon": "XAF", "Gabon": "XAF", "South Africa": "ZAR",
  "Zambia": "ZMW", "Malawi": "MWK", "Botswana": "BWP", "Namibia": "NAD",
  "Eswatini": "SZL", "Lesotho": "LSL", "Mozambique": "MZN",
  "Madagascar": "MGA", "Mauritius": "MUR", "Seychelles": "SCR",
  "Cape Verde": "CVE", "Gambia": "GMD", "Guinea": "GNF",
  "Liberia": "LRD", "Sierra Leone": "SLL", "Congo (DRC)": "CDF",
  "Congo (Brazzaville)": "XAF", "Angola": "AOA", "Eritrea": "ERN",
  "Djibouti": "DJF", "Comoros": "KMF", "Sao Tome & Principe": "STN",
  "Mauritania": "MRU", "Mali": "XOF", "Burkina Faso": "XOF",
  "Niger": "XOF", "Togo": "XOF", "Benin": "XOF", "Guinea-Bissau": "XOF",
  "Central African Republic": "XAF", "Chad": "XAF",
  "Equatorial Guinea": "XAF",

  "United Arab Emirates": "AED", "Saudi Arabia": "SAR", "Qatar": "QAR",
  "Kuwait": "KWD", "Bahrain": "BHD", "Oman": "OMR", "Jordan": "JOD",
  "Israel": "ILS", "Turkey": "TRY", "Iran": "IRR", "Iraq": "IQD",
  "Lebanon": "LBP", "Syria": "SYP", "Yemen": "YER", "Palestine": "ILS",

  "India": "INR", "Pakistan": "PKR", "Bangladesh": "BDT",
  "Sri Lanka": "LKR", "Nepal": "NPR", "Afghanistan": "AFN",
  "Maldives": "MVR", "Bhutan": "BTN", "Myanmar": "MMK",
  "Thailand": "THB", "Vietnam": "VND", "Laos": "LAK",
  "Cambodia": "KHR", "Malaysia": "MYR", "Singapore": "SGD",
  "Indonesia": "IDR", "Philippines": "PHP", "Brunei": "BND",
  "South Korea": "KRW", "North Korea": "KPW", "Taiwan": "TWD",
  "Hong Kong": "HKD", "Macau": "MOP", "Mongolia": "MNT",
  "China": "CNY", "Japan": "JPY",
  "Kazakhstan": "KZT", "Kyrgyzstan": "KGS", "Tajikistan": "TJS",
  "Turkmenistan": "TMT", "Uzbekistan": "UZS",
  "Georgia": "GEL", "Armenia": "AMD", "Azerbaijan": "AZN",

  "United States": "USD", "Canada": "CAD", "Mexico": "MXN",
  "Brazil": "BRL", "Argentina": "ARS", "Chile": "CLP",
  "Colombia": "COP", "Peru": "PEN", "Uruguay": "UYU",
  "Bolivia": "BOB", "Paraguay": "PYG", "Venezuela": "VES",
  "Guyana": "GYD", "Suriname": "SRD",
  "Guatemala": "GTQ", "Honduras": "HNL", "Nicaragua": "NIO",
  "Costa Rica": "CRC", "Panama": "PAB", "Cuba": "CUP",
  "Dominican Republic": "DOP", "Haiti": "HTG", "Jamaica": "JMD",
  "Trinidad & Tobago": "TTD", "El Salvador": "USD",

  "United Kingdom": "GBP", "Ireland": "EUR",
  "France": "EUR", "Germany": "EUR", "Italy": "EUR", "Spain": "EUR",
  "Portugal": "EUR", "Netherlands": "EUR", "Belgium": "EUR",
  "Austria": "EUR", "Finland": "EUR", "Greece": "EUR",
  "Slovakia": "EUR", "Slovenia": "EUR", "Estonia": "EUR",
  "Latvia": "EUR", "Lithuania": "EUR", "Luxembourg": "EUR",
  "Malta": "EUR", "Cyprus": "EUR", "Monaco": "EUR",
  "San Marino": "EUR", "Vatican City": "EUR", "Andorra": "EUR",
  "Kosovo": "EUR", "Montenegro": "EUR",

  "Russia": "RUB", "Ukraine": "UAH", "Belarus": "BYN",
  "Poland": "PLN", "Czech Republic": "CZK", "Hungary": "HUF",
  "Romania": "RON", "Bulgaria": "BGN", "Serbia": "RSD",
  "North Macedonia": "MKD", "Albania": "ALL",
  "Bosnia & Herzegovina": "BAM", "Moldova": "MDL",
  "Iceland": "ISK", "Norway": "NOK", "Sweden": "SEK",
  "Denmark": "DKK", "Switzerland": "CHF", "Liechtenstein": "CHF",

  "Australia": "AUD", "New Zealand": "NZD", "Fiji": "FJD",
  "Papua New Guinea": "PGK", "Samoa": "WST", "Tonga": "TOP",
  "Vanuatu": "VUV"
};

/* ------------------------------------------------------------
   Helpers
   ------------------------------------------------------------ */
const $ = (id) => document.getElementById(id);
const v = (id) => $ (id) ? $(id).value.trim() : '';
const checked = (id) => $ (id) ? $(id).checked : false;
const radioVal = (name) => {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : '';
};

/* ------------------------------------------------------------
   Auto-select currency based on country
   ------------------------------------------------------------ */
function autoSelectCurrency() {
  const country = $('country').value;
  const cur = COUNTRY_CURRENCY[country];
  if (!cur) return;

  const priceSel = $('priceCurrency');
  const oldSel = $('oldPriceCurrency');

  if (Array.from(priceSel.options).some(o => o.value === cur)) {
    priceSel.value = cur;
  }
  if (Array.from(oldSel.options).some(o => o.value === cur)) {
    oldSel.value = cur;
  }
}

/* ------------------------------------------------------------
   Show correct spec section based on category
   ------------------------------------------------------------ */
function toggleSpecSections() {
  const cat = $('category').value;

  $('phoneSection').classList.toggle('active', cat === 'phones');
  $('laptopSection').classList.toggle('active',
    cat === 'laptops' || cat === 'gaming_pc');
  $('generalSection').classList.toggle('active',
    ['electronics', 'gaming_consoles', 'game_controllers',
     'gaming', 'chargers', 'batteries'].includes(cat));
}

/* ------------------------------------------------------------
   GPS location
   ------------------------------------------------------------ */
function useMyLocation() {
  const btn = $('geoBtn');
  const input = $('location');

  if (!navigator.geolocation) {
    setStatus('❌ Your browser does not support GPS.', true);
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Locating...';
  setStatus('📡 Getting your location...');

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude.toFixed(5);
      const lng = pos.coords.longitude.toFixed(5);
      const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      input.value = `GPS: ${lat}, ${lng}`;
      input.dataset.gpsLink = mapsLink;

      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-geo-alt-fill"></i> Update GPS';
      setStatus('✅ Location captured!');

      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.display_name) {
            input.value = data.display_name;
            input.dataset.gpsLink = mapsLink;
          }
        })
        .catch(() => {});
    },
    (err) => {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-geo-alt"></i> Use GPS';
      let msg = '❌ Could not get location. ';
      if (err.code === 1) msg += 'Please allow location access.';
      else if (err.code === 2) msg += 'Location unavailable.';
      else if (err.code === 3) msg += 'Request timed out.';
      setStatus(msg, true);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

/* ------------------------------------------------------------
   Price builders
   ------------------------------------------------------------ */
function buildPrice() {
  const amount = v('price');
  const currency = $('priceCurrency').value;
  const negotiable = checked('priceNegotiable');
  const soon = checked('priceSoon');

  if (soon) return 'soon coming';
  if (negotiable && !amount) return 'negotiable';
  if (negotiable && amount) return `${amount} ${currency} (negotiable)`;
  if (!amount) return 'price on request';
  return `${amount} ${currency}`;
}

function buildOldPrice() {
  const amount = v('oldPrice');
  const currency = $('oldPriceCurrency').value;
  return amount ? `${amount} ${currency}` : '';
}

/* ------------------------------------------------------------
   Spec builders — return arrays of lines
   ------------------------------------------------------------ */
function buildPhoneSpecs() {
  if (!$('phoneSection').classList.contains('active')) return [];

  const lines = ['📱 *PHONE SPECS:*'];

  if (radioVal('phoneOs'))   lines.push(`• OS: ${radioVal('phoneOs')}`);
  if (v('phoneBrand'))       lines.push(`• Brand: ${v('phoneBrand')}`);
  if (v('phoneModel'))       lines.push(`• Model: ${v('phoneModel')}`);
  if (v('phoneStorage'))     lines.push(`• Storage: ${v('phoneStorage')}`);
  if (v('phoneRam'))         lines.push(`• RAM: ${v('phoneRam')}`);

  const bat = [v('phoneBatteryHealth'), v('phoneBatteryNote')].filter(Boolean);
  if (bat.length) lines.push(`• Battery: ${bat.join(' — ')}`);

  if (radioVal('phoneScreen')) lines.push(`• Screen: ${radioVal('phoneScreen')}`);
  if (radioVal('phoneBody'))   lines.push(`• Body: ${radioVal('phoneBody')}`);

  const sb = [];
  if (checked('phoneBatteryReplaced')) sb.push('battery replaced');
  if (checked('phoneFastCharging'))    sb.push('fast charging');
  if (checked('phoneScreenTouch'))     sb.push('touch works');
  if (checked('phoneScreenDeadSpots')) sb.push('no dead spots');
  if (checked('phoneScreenBurn'))      sb.push('no burn-in');
  if (checked('phoneScreenOriginal'))  sb.push('original screen');
  if (sb.length) lines.push(`• Screen/battery: ${sb.join(', ')}`);

  const feats = [];
  if (checked('phoneFaceId'))            feats.push('Face ID / Touch ID');
  if (checked('phoneCameras'))           feats.push('cameras');
  if (checked('phoneSpeakers'))          feats.push('speakers');
  if (checked('phoneMic'))               feats.push('mic');
  if (checked('phoneWifi'))              feats.push('Wi-Fi/BT');
  if (checked('phoneSim'))               feats.push('SIM');
  if (checked('phoneCellular'))          feats.push('cellular');
  if (checked('phoneGps'))               feats.push('GPS');
  if (checked('phoneButtons'))           feats.push('buttons');
  if (checked('phoneChargingPort'))      feats.push('charging port');
  if (checked('phoneHeadphone'))         feats.push('headphone jack');
  if (checked('phoneWirelessCharging'))  feats.push('wireless charging');
  if (feats.length) lines.push(`• ✅ Working: ${feats.join(', ')}`);

  const unlock = [];
  if (checked('phoneUnlocked'))       unlock.push('carrier unlocked');
  if (checked('phoneIcloudRemoved'))  unlock.push('iCloud/Google removed');
  if (checked('phoneFindMyOff'))      unlock.push('Find My off');
  if (checked('phoneNoBlacklist'))    unlock.push('not blacklisted');
  if (unlock.length) lines.push(`• 🔓 ${unlock.join(', ')}`);

  const accs = [];
  if (checked('phoneBox'))              accs.push('box');
  if (checked('phoneCharger'))          accs.push('charger');
  if (checked('phoneCable'))            accs.push('cable');
  if (checked('phoneCase'))             accs.push('case');
  if (checked('phoneScreenProtector'))  accs.push('screen protector');
  if (checked('phoneEarphones'))        accs.push('earphones');
  if (accs.length) lines.push(`• 📦 Included: ${accs.join(', ')}`);

  const hist = [];
  if (checked('phoneWarranty'))               hist.push('still under warranty');
  if (checked('phoneNeverRepaired'))          hist.push('never repaired');
  if (checked('phoneScreenReplaced'))         hist.push('screen replaced');
  if (checked('phoneBatteryReplacedHistory')) hist.push('battery replaced');
  if (hist.length) lines.push(`• 📋 ${hist.join(', ')}`);

  if (v('phoneExtraNotes')) lines.push(`• 📝 ${v('phoneExtraNotes')}`);

  return lines.length > 1 ? lines : [];
}

function buildLaptopSpecs() {
  if (!$('laptopSection').classList.contains('active')) return [];

  const lines = ['💻 *LAPTOP / PC SPECS:*'];

  if (v('laptopBrand'))         lines.push(`• Brand: ${v('laptopBrand')}`);
  if (v('laptopModel'))         lines.push(`• Model: ${v('laptopModel')}`);
  if (v('laptopProcessor'))     lines.push(`• Processor: ${v('laptopProcessor')}`);
  if (v('laptopRam'))           lines.push(`• RAM: ${v('laptopRam')}`);
  if (v('laptopStorage'))       lines.push(`• Storage: ${v('laptopStorage')}`);
  if (v('laptopGpu'))           lines.push(`• GPU: ${v('laptopGpu')}`);
  if (v('laptopScreenSize'))    lines.push(`• Screen size: ${v('laptopScreenSize')}`);
  if (v('laptopOs'))            lines.push(`• OS: ${v('laptopOs')}`);
  if (v('laptopBatteryHealth')) lines.push(`• Battery: ${v('laptopBatteryHealth')}`);
  if (v('laptopScreenCondition')) lines.push(`• Screen: ${v('laptopScreenCondition')}`);

  const feats = [];
  if (checked('laptopTouchscreen')) feats.push('touchscreen');
  if (checked('laptopBacklit'))     feats.push('backlit keyboard');
  if (checked('laptopFingerprint')) feats.push('fingerprint');
  if (checked('laptopWebcam'))      feats.push('webcam');
  if (checked('laptopBluetooth'))   feats.push('Bluetooth');
  if (checked('laptopHdmi'))        feats.push('HDMI');
  if (checked('laptopUsbC'))        feats.push('USB-C');
  if (checked('laptopSdCard'))      feats.push('SD slot');
  if (checked('laptopDvdDrive'))    feats.push('DVD drive');
  if (feats.length) lines.push(`• Features: ${feats.join(', ')}`);

  const work = [];
  if (checked('laptopKeyboardOk'))      work.push('keyboard');
  if (checked('laptopTrackpadOk'))      work.push('trackpad');
  if (checked('laptopSpeakersOk'))      work.push('speakers');
  if (checked('laptopPortsOk'))         work.push('all ports');
  if (checked('laptopNoOverheat'))      work.push('no overheating');
  if (checked('laptopOriginalCharger')) work.push('original charger');
  if (work.length) lines.push(`• ✅ ${work.join(', ')}`);

  if (v('laptopExtraNotes')) lines.push(`• 📝 ${v('laptopExtraNotes')}`);

  return lines.length > 1 ? lines : [];
}

function buildGeneralSpecs() {
  if (!$('generalSection').classList.contains('active')) return [];

  const lines = ['⚙️ *DETAILS:*'];

  if (v('generalBrand')) lines.push(`• Brand: ${v('generalBrand')}`);
  if (v('generalModel')) lines.push(`• Model: ${v('generalModel')}`);
  if (radioVal('generalCond')) lines.push(`• Condition: ${radioVal('generalCond')}`);

  const inc = [];
  if (checked('generalBox'))       inc.push('box');
  if (checked('generalCharger'))   inc.push('charger');
  if (checked('generalManual'))    inc.push('manual');
  if (checked('generalWarranty'))  inc.push('warranty');
  if (checked('generalReceipt'))   inc.push('receipt');
  if (checked('generalTested'))    inc.push('tested & working');
  if (inc.length) lines.push(`• 📦 Included: ${inc.join(', ')}`);

  if (v('generalExtraNotes')) lines.push(`• 📝 ${v('generalExtraNotes')}`);

  return lines.length > 1 ? lines : [];
}

/* ------------------------------------------------------------
   Submit
   ------------------------------------------------------------ */
function submitToWhatsApp() {
  const required = ['name', 'whatsapp', 'email', 'country', 'productName',
                    'condition', 'category', 'price', 'location', 'details'];
  for (const field of required) {
    if (!v(field)) {
      setStatus('❌ Please fill in all required fields.', true);
      $(field).focus();
      return;
    }
  }

  const phoneLines   = buildPhoneSpecs();
  const laptopLines  = buildLaptopSpecs();
  const generalLines = buildGeneralSpecs();

  const gpsLink = $('location').dataset.gpsLink || '';
  const locationLine = gpsLink
    ? `📍 *Location:* ${v('location')}\n🗺 *Map:* ${gpsLink}`
    : `📍 *Location:* ${v('location')}`;

  const priceLine    = `💰 *Price:* ${buildPrice()}`;
  const oldPriceLine = buildOldPrice() ? `↩️ *Was:* ${buildOldPrice()}` : '';

  const parts = [
    `🛒 *NEW ITEM SUBMISSION*`,
    ``,
    `👤 *Seller:* ${v('name')}`,
    `📧 *Email:* ${v('email')}`,
    `📱 *WhatsApp:* ${v('whatsapp')}`,
    `🌍 *Country:* ${v('country')}`,
    ``,
    `📦 *Product:* ${v('productName')}`,
    `🏷 *Condition:* ${v('condition')}`,
    `📂 *Category:* ${v('category')}`,
    `🔢 *Availability:* ${v('availability') || 'not specified'}`,
    ``,
    priceLine,
    oldPriceLine,
    ``
  ];

  if (phoneLines.length)   parts.push(...phoneLines, '');
  if (laptopLines.length)  parts.push(...laptopLines, '');
  if (generalLines.length) parts.push(...generalLines, '');

  parts.push(
    locationLine,
    ``,
    v('photos') ? `🖼 *Photos:*\n${v('photos')}` : `🖼 *Photos:* will send on WhatsApp`,
    ``,
    `📝 *Details:*`,
    v('details'),
    v('notes') ? `\n📌 *Note:* ${v('notes')}` : ''
  );

  const message = parts.filter(line => line !== '').join('\n');
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${SELLER_WHATSAPP}?text=${encoded}`;

  setStatus('✅ Opening WhatsApp...');
  window.open(url, '_blank');

  setTimeout(() => {
    setStatus('📤 WhatsApp opened. Hit Send to submit your item!');
  }, 800);
}

/* ------------------------------------------------------------
   Status helper
   ------------------------------------------------------------ */
function setStatus(msg, isError = false) {
  const el = $('status');
  el.textContent = msg;
  el.style.color = isError ? '#a63a3a' : '#1a7a3f';
}

/* ------------------------------------------------------------
   Wire it up
   ------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  // Form submit
  $('sellForm').addEventListener('submit', (e) => {
    e.preventDefault();
    submitToWhatsApp();
  });

  // Country → currency
  $('country').addEventListener('change', autoSelectCurrency);

  // Category → spec sections
  $('category').addEventListener('change', toggleSpecSections);

  // GPS button
  $('geoBtn').addEventListener('click', useMyLocation);

  // On load, if Uganda is preselected, make sure UGX is set
  autoSelectCurrency();
});

