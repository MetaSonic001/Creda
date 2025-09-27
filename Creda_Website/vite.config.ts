import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Import or define componentTagger if it's a plugin you want to use
// Example placeholder implementation (replace with actual import if available)
function componentTagger() {
  return {
    name: 'component-tagger',
    // plugin hooks here
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
