import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import { VitePWA } from "vite-plugin-pwa";
import ViteRestart from "vite-plugin-restart";

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		port: 7413,
	},
	plugins: [
		VitePWA({
			registerType: "autoUpdate",
			manifest: {
				display: "standalone",
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
			typescript: true,
		}),
	],
});
