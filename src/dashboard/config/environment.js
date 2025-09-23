// ========================================
// 🚀 TADAWI DASHBOARD CONFIGURATION
// ========================================
// تعديل الإعدادات من هنا فقط - All settings in one place

// 🌐 API Configuration - تغيير الـ URLs من هنا

const API_CONFIG = {
  BASE_URL:
    process.env.REACT_APP_API_URL ||
    "https://tadawi-app-deploy-main-zwrtj5.laravel.cloud/api",
  DASHBOARD_URL:
    process.env.REACT_APP_DASHBOARD_URL ||
    "https://tadawi-app-deploy-main-zwrtj5.laravel.cloud/dashboard",
  TIMEOUT: 10000,
};

// 📱 App Configuration
const APP_CONFIG = {
  NAME: process.env.REACT_APP_NAME || "Tadawi Dashboard",
  VERSION: process.env.REACT_APP_VERSION || "1.0.0",
  DEBUG: process.env.REACT_APP_DEBUG === "true",
};

// ⚙️ Features Configuration
const FEATURES_CONFIG = {
  ENABLE_CHARTS: true,
  ENABLE_SEARCH: true,
  ENABLE_FILE_UPLOAD: true,
  ENABLE_CRUD_OPERATIONS: true,
  ENABLE_GLOBAL_SEARCH: true,
};

// 📊 Pagination Configuration
const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
};

// 📁 File Upload Configuration
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
  ],
  MAX_FILES_PER_UPLOAD: 5,
};

// 🎨 UI Configuration
const UI_CONFIG = {
  SIDEBAR_WIDTH: 250,
  SIDEBAR_COLLAPSED_WIDTH: 80,
  NAVBAR_HEIGHT: 60,
  CHART_COLORS: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"],
};

// 🔐 Security Configuration
const SECURITY_CONFIG = {
  TOKEN_KEY: "auth_token",
  REFRESH_TOKEN_KEY: "refresh_token",
  TOKEN_EXPIRY_CHECK_INTERVAL: 60000, // 1 minute
};

// 📈 Dashboard Configuration
const DASHBOARD_CONFIG = {
  REFRESH_INTERVAL: 30000, // 30 seconds
  CHART_ANIMATION_DURATION: 1000,
  SEARCH_DEBOUNCE_DELAY: 300,
};

// ========================================
// 🎯 MAIN CONFIGURATION OBJECT
// ========================================
export const config = {
  // API Settings
  API_BASE_URL: API_CONFIG.BASE_URL,
  DASHBOARD_BASE_URL: API_CONFIG.DASHBOARD_URL,
  API_TIMEOUT: API_CONFIG.TIMEOUT,

  // App Settings
  APP_NAME: APP_CONFIG.NAME,
  APP_VERSION: APP_CONFIG.VERSION,
  DEBUG: APP_CONFIG.DEBUG,

  // Features
  ...FEATURES_CONFIG,

  // Pagination
  ...PAGINATION_CONFIG,

  // File Upload
  ...UPLOAD_CONFIG,

  // UI
  ...UI_CONFIG,

  // Security
  ...SECURITY_CONFIG,

  // Dashboard
  ...DASHBOARD_CONFIG,
};

// ========================================
// 🚀 QUICK ACCESS EXPORTS
// ========================================
export const API_BASE_URL = config.API_BASE_URL;
export const DASHBOARD_BASE_URL = config.DASHBOARD_BASE_URL;
export const API_TIMEOUT = config.API_TIMEOUT;
export const TOKEN_KEY = config.TOKEN_KEY;
export const APP_NAME = config.APP_NAME;
export const DEBUG = config.DEBUG;

// ========================================
// 📝 CONFIGURATION HELPERS
// ========================================
export const getApiUrl = (endpoint = "") => `${API_BASE_URL}${endpoint}`;
export const getDashboardUrl = (path = "") => `${DASHBOARD_BASE_URL}${path}`;
export const isFeatureEnabled = (feature) =>
  config[`ENABLE_${feature.toUpperCase()}`] || false;

// ========================================
// 🔧 DEVELOPMENT HELPERS
// ========================================
if (DEBUG) {
  console.log("🚀 Tadawi Dashboard Configuration:", {
    API_BASE_URL,
    DASHBOARD_BASE_URL,
    APP_NAME,
    VERSION: config.APP_VERSION,
    FEATURES: FEATURES_CONFIG,
  });
}

export default config;
