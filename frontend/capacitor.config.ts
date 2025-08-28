import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aiyo.app', // Unique ID for your app (replace with your actual ID)
  appName: 'Aiyo Health', // Consistent with your app's branding
  webDir: 'dist', // Vite-based Ionic projects output to 'dist'
  server: {
    url: 'https://aiyo.inspiriasoft.com', // Replace with your Flask backend URL
    cleartext: false, // Enforce HTTPS in production
  },
  plugins: {
    Preferences: {
      // Optional: Configure Capacitor Preferences if needed
    },
  },
};

export default config;