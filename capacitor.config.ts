import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ordoo.app',
  appName: 'Ordoo',
  webDir: 'docs',
  server: {
    androidScheme: 'https',
    allowNavigation: ['https://ordoo-api.onrender.com']
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0
    },
    StatusBar: {
      style: 'LIGHT_CONTENT',
      backgroundColor: '#2567e8'
    }
  }
};

export default config;
