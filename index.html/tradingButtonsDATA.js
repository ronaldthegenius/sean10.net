// ============================================
// CATEGORIES DATABASE - categories-data.js
// ============================================

const categories = [
    { id: "all", label: "HOME/ALL", fixed: true },
    { id: "evisa", label: "EVISAs" },
    {
        id: "laptops",
        label: "LAPTOPS",
        hasDropdown: true,
        dropdownItems: [
            { id: "laptop_hp", label: "HP", filter: "hp" },
            { id: "laptop_apple", label: "APPLE MAC", filter: "macbook" },
            { id: "laptop_msi", label: "MSI", filter: "msi" }
        ]
    },
    {
        id: "phones",
        label: "PHONES",
        hasDropdown: true,
        dropdownItems: [
            { id: "phone_apple", label: "APPLE IPHONE", filter: "iphone" },
            { id: "phone_huawei", label: "HUAWEI", filter: "huawei" }
        ]
    },
    { id: "rides", label: "RIDES" },
    { id: "used_items", label: "USED ITEMS", color: "red" },
    { id: "new_items", label: "NEW ITEMS", color: "green" },
    { id: "game_controllers", label: "GAME CONTROLLERS" },
    { id: "gaming_pc", label: "GAMING PC" },
    { id: "batteries", label: "BATTERIES" },
    { id: "consoles", label: "GAMING CONSOLES" },
    { id: "chargers", label: "CHARGERS" },
    { id: "gaming", label: "GAMING" },
    { id: "autommotives", label: "AUTOMOTIVES" },
    { id: "workshop_tools", label: "WORKSHOP" },
    { id: "personal_care", label: "PERSONAL CARE", color: "orangered" },
    { id: "electronics", label: "ELECTRONICS" }
];

// ============================================
// LOCATION DATABASE — hierarchical
// Country → Regions → (optional) Subregions
// ============================================

const locationOptions = {
    // ---------- UGANDA ----------
    uganda: {
        label: "🇺🇬 Uganda",
        regions: {
            kampala:  { label: "Kampala" },
            wakiso:   { label: "Wakiso", subregions: {
                nansana: "Nansana",
                kireka:  "Kireka",
                entebbe: "Entebbe"
            }},
            makindye: { label: "Makindye" },
            kawempe:  { label: "Kawempe" },
            mengo:    { label: "Mengo" },
            kibuye:   { label: "Kibuye" },
            kiseka:   { label: "Kiseka" }
        }
    },

    // ---------- UNITED ARAB EMIRATES ----------
    uae: {
        label: "🇦🇪 United Arab Emirates",
        regions: {
            dubai:    { label: "Dubai" },
            sharjah:  { label: "Sharjah" },
            abudhabi: { label: "Abu Dhabi" },
            ajman:    { label: "Ajman" },
            fujairah: { label: "Fujairah" },
            ras:      { label: "Ras Al Khaimah" },
            umm:      { label: "Umm Al Quwain" }
        }
    },

    // ---------- ETHIOPIA ----------
    ethiopia: {
        label: "🇪🇹 Ethiopia",
        regions: {
            addis:  { label: "Addis Ababa" },
            oromia: { label: "Oromia" },
            amhara: { label: "Amhara" },
            tigray: { label: "Tigray" },
            somali: { label: "Somali" },
            afar:   { label: "Afar" },
            sidama: { label: "Sidama" }
        }
    },

    // ---------- SOUTH AFRICA ----------
    southafrica: {
        label: "🇿🇦 South Africa",
        regions: {
            gauteng: { label: "Gauteng", subregions: {
                joburg:     "Johannesburg",
                pretoria:   "Pretoria",
                ekurhuleni: "Ekurhuleni"
            }},
            westerncape: { label: "Western Cape", subregions: {
                capetown:     "Cape Town",
                stellenbosch: "Stellenbosch"
            }},
            kwazulu: { label: "KwaZulu-Natal", subregions: {
                durban: "Durban"
            }},
            easterncape: { label: "Eastern Cape" },
            freestate:   { label: "Free State" },
            limpopo:     { label: "Limpopo" },
            mpumalanga:  { label: "Mpumalanga" },
            northw:      { label: "North West" },
            northern:    { label: "Northern Cape" }
        }
    },

    // ---------- CHINA ----------
    china: {
        label: "🇨🇳 China",
        regions: {
            guangzhou: { label: "Guangzhou" },
            shenzhen:  { label: "Shenzhen" },
            beijing:   { label: "Beijing" },
            shanghai:  { label: "Shanghai" },
            yiwu:      { label: "Yiwu" }
        }
    },

    // ---------- KENYA ----------
    kenya: {
        label: "🇰🇪 Kenya",
        regions: {
            nairobi: { label: "Nairobi" },
            mombasa: { label: "Mombasa" },
            kisumu:  { label: "Kisumu" },
            nakuru:  { label: "Nakuru" }
        }
    },

    // ---------- TANZANIA ----------
    tanzania: {
        label: "🇹🇿 Tanzania",
        regions: {
            dar:    { label: "Dar es Salaam" },
            arusha: { label: "Arusha" },
            mwanza: { label: "Mwanza" },
            dodoma: { label: "Dodoma" }
        }
    },

    // ---------- NIGERIA ----------
    nigeria: {
        label: "🇳🇬 Nigeria",
        regions: {
            lagos:  { label: "Lagos" },
            abuja:  { label: "Abuja" },
            kano:   { label: "Kano" },
            ibadan: { label: "Ibadan" }
        }
    }
};

// Simple flat list (kept for backward compatibility)
const locationOptionsFlat = [
    { value: "all", label: "All Locations" }
];

// Export for Node / module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { categories, locationOptions, locationOptionsFlat };
}

