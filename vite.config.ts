import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  appType: 'spa',
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: ['app.futuroemrede.com'],
    hmr: {
      host: 'app.futuroemrede.com',
      protocol: 'wss',
      clientPort: 443,
    }
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
}));
