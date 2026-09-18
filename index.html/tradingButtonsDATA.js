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
            // { id: "laptop_dell", label: "DELL", filter: "dell" },
            { id: "laptop_hp", label: "HP", filter: "hp" },
            // { id: "laptop_lenovo", label: "LENOVO", filter: "lenovo" },
            { id: "laptop_apple", label: "APPLE MAC", filter: "macbook" },
            // { id: "laptop_acer", label: "ACER", filter: "acer" },
            { id: "laptop_msi", label: "MSI", filter: "msi" },
            // { id: "laptop_huawei", label: "HUAWEI", filter: "huawei" }
        ]
    },
    { 
        id: "phones", 
        label: "PHONES",
        hasDropdown: true,
        dropdownItems: [
            { id: "phone_apple", label: "APPLE IPHONE", filter: "iphone" },
            { id: "phone_huawei", label: "HUAWEI", filter: "huawei" },
            // { id: "phone_samsung", label: "SAMSUNG", filter: "samsung" },
            // { id: "phone_tecno", label: "TECNO", filter: "tecno" },
            // { id: "phone_infinix", label: "INFINIX", filter: "infinix" },
            // { id: "phone_oppo", label: "OPPO", filter: "oppo" },
            // { id: "phone_vivo", label: "VIVO", filter: "vivo" },
            // { id: "phone_google", label: "GOOGLE PIXEL", filter: "pixel" },
            // { id: "phone_nokia", label: "NOKIA", filter: "nokia" }
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
// LOCATION DATABASE
// ============================================
const locationOptions = [
    { value: "", label: "Sort by Location ▼" },
    { value: "all", label: "All Locations" },
    { value: "kampala", label: "Kampala, Uganda" },
    { value: "makindye", label: "Makindye, Uganda" },
    { value: "dubai", label: "Dubai, United Arab Emirates" },
    { value: "sharjah", label: "Sharjah, United Arab Emirates" },
    { value: "nansana", label: "Nansana, Uganda" },
    { value: "kawempe", label: "Kawempe, Uganda" },
    { value: "kireka", label: "Kireka, Uganda" },
    { value: "kibuye", label: "Kibuye, Uganda" },
    { value: "mengo", label: "Mengo, Uganda" },
    { value: "ntebbe", label: "Entebbe, Uganda" },
    { value: "guanzhou", label: "China, Guangzhou" },
    { value: "kiseka", label: "Uganda, Kiseka" }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { categories, locationOptions };
}