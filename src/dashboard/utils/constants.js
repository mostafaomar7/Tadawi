// Import from centralized config
import { API_BASE_URL, API_TIMEOUT } from '../config/environment';

// API Configuration (deprecated - use environment.js instead)
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: API_TIMEOUT,
};

// Dashboard Routes
export const DASHBOARD_ROUTES = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "MdDashboard",
  },
  {
    name: "Medicines",
    path: "/dashboard/medicines",
    icon: "MdMedication",
  },
  {
    name: "Orders",
    path: "/dashboard/orders",
    icon: "MdShoppingCart",
  },
  {
    name: "Users",
    path: "/dashboard/users",
    icon: "MdPeople",
  },
  {
    name: "Prescriptions",
    path: "/dashboard/prescriptions",
    icon: "MdReceipt",
  },
  {
    name: "Donations",
    path: "/dashboard/donations",
    icon: "MdVolunteerActivism",
  },
];

// Chart Colors
export const CHART_COLORS = {
  primary: '#868CFF',
  secondary: '#432C7A',
  success: '#01B574',
  warning: '#FFB547',
  error: '#E53E3E',
  info: '#3182CE',
};

// Table Configuration
export const TABLE_CONFIG = {
  pageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
};

// Date Formats
export const DATE_FORMATS = {
  display: 'DD/MM/YYYY',
  api: 'YYYY-MM-DD',
  datetime: 'DD/MM/YYYY HH:mm',
};
