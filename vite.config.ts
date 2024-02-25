import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import { VitePWA } from "vite-plugin-pwa";
import ViteRestart from "vite-plugin-restart";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 7412,
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        display: "browser",
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern:
              "https://cgjgnshvokexivmuttxh.storage.eu-central-1.nhost.run/*",
            handler: "NetworkFirst",
          },
        ],
      },
    }),
    react(),
    ViteRestart({
      restart: [".eslintrc*", ".prettierrc*", "tsconfig.json"],
    }),
    checker({
      eslint: {
        // for example, lint .ts and .tsx
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
      typescript: true,
    }),
  ],
});
