// Environment configuration for different deployment scenarios

export interface EnvironmentConfig {
  apiBaseUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
  googleAppsScriptUrl: string;
  forceRealBackend: boolean;
  forceDemoMode: boolean;
}

// Google Apps Script URL - update this with your own deployment URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwRtSTJjIA9_Hx-SpX95dJ2hRg1SSkEGLlyqjWElWJoiGQWtLzt7pwYeyeycah7KpI/exec';

// Detect environment
const isProduction = import.meta.env.PROD || !window.location.hostname.includes('localhost');
const isDevelopment = !isProduction;

// Detect the current port to determine the correct proxy URL
const currentPort = window.location.port;
const isPort8080 = currentPort === '8080';
const proxyUrl = isPort8080 ? 'http://localhost:3001/api' : 'http://localhost:3001/api';

// Check if we should force real backend in development (set VITE_FORCE_REAL_BACKEND=true)
const forceRealBackend = import.meta.env.VITE_FORCE_REAL_BACKEND === 'true';

// Disable demo mode - use live backend data
const forceDemoMode = false;

// Environment-specific configuration
export const environment: EnvironmentConfig = {
  isProduction,
  isDevelopment,
  googleAppsScriptUrl: GOOGLE_APPS_SCRIPT_URL,
  // Use direct Google Apps Script URL for both development and production for better reliability
  apiBaseUrl: GOOGLE_APPS_SCRIPT_URL,
  forceRealBackend: true,
  forceDemoMode: false
};

// Debug logging in development
if (isDevelopment) {
  console.log('🔧 Development Environment Detected');
  console.log('📡 API Base URL:', environment.apiBaseUrl);
  console.log('🔗 Force Real Backend:', forceRealBackend);
  console.log('🎭 Force Demo Mode:', forceDemoMode);
  console.log('🌐 Window location:', window.location.href);
  console.log('🔍 Environment variables:', {
    VITE_FORCE_REAL_BACKEND: import.meta.env.VITE_FORCE_REAL_BACKEND,
    VITE_FORCE_DEMO_MODE: import.meta.env.VITE_FORCE_DEMO_MODE,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV
  });
  if (!forceRealBackend && !forceDemoMode) {
    console.log('ℹ️  To use real backend in development, set VITE_FORCE_REAL_BACKEND=true');
    console.log('ℹ️  To use demo mode in development, set VITE_FORCE_DEMO_MODE=true');
  }
} else {
  console.log('🚀 Production Environment Detected');
  console.log('📡 API Base URL:', environment.apiBaseUrl);
}

export default environment;