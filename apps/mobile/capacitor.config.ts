import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schoolcrm.mobile',
  appName: 'School CRM',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    StatusBar: {
      style: 'dark',
    },
  },
};

export default config;
