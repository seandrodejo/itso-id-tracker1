// API Configuration
// This file manages the base URL for different environments

// Development configuration
const DEV_CONFIG = {
  API_BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000,
};

// Production configuration (update this when deploying)
const PROD_CONFIG = {
  API_BASE_URL: 'https://your-production-server.com/api',
  TIMEOUT: 15000,
};

// Staging configuration (if needed)
const STAGING_CONFIG = {
  API_BASE_URL: 'https://your-staging-server.com/api',
  TIMEOUT: 12000,
};

// Local network configuration (for testing on physical devices)
const LOCAL_NETWORK_CONFIG = {
  API_BASE_URL: 'http://192.168.1.20:5000/api', // Update this IP as needed
  TIMEOUT: 10000,
};

// Environment detection
const isDevelopment = __DEV__; // Expo's built-in development flag
const isStaging = false; // Set to true when deploying to staging
const useLocalNetwork = true; // Set to true when testing on physical devices

// Select configuration based on environment
let config;
if (useLocalNetwork && isDevelopment) {
  config = LOCAL_NETWORK_CONFIG;
} else if (isStaging) {
  config = STAGING_CONFIG;
} else if (isDevelopment) {
  config = DEV_CONFIG;
} else {
  config = PROD_CONFIG;
}

// Export configuration
export const API_CONFIG = {
  BASE_URL: config.API_BASE_URL,
  TIMEOUT: config.TIMEOUT,
  // Additional config options
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// For easy access to just the base URL
export const API_BASE_URL = API_CONFIG.BASE_URL;

// Log current configuration (only in development)
if (isDevelopment) {
  console.log('🔧 API Configuration:', {
    environment: useLocalNetwork ? 'local-network' : 'development',
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
  });
}
