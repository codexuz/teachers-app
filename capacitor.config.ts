import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'teacher.impulse.uz',
  appName: 'Teachers App',
  webDir: 'dist',
   plugins: {
    EdgeToEdge: {
      backgroundColor: "#ffffff",
    },
  },
};

export default config;
