import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aiyocare.app', // Unique ID for your app (replace with your actual ID)
  appName: 'Aiyo Care', // Consistent with your app's branding
  webDir: 'dist', // Vite-based Ionic projects output to 'dist'
  server: {
    url: 'http://localhost:8000/', // Replace with your Flask backend URL
    cleartext: false, // Enforce HTTPS in production
  },
  plugins: {
    Preferences: {
      // Optional: Configure Capacitor Preferences if needed
    },
  },
};

export default config;