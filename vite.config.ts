import preact from "@preact/preset-vite";
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
    preact(),
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
  optimizeDeps: {
    include: ["preact/hooks", "preact/compat", "preact"],
  },
  resolve: {
    alias: [
      { find: "react", replacement: "preact/compat" },
      { find: "react-dom", replacement: "preact/compat" },
      { find: "react/jsx-runtime", replacement: "preact/jsx-runtime" },
    ],
  },
});
