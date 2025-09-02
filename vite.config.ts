import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),

  server: {
    host: "::",
    port: 8080,
  },

  resolve: {
    alias: {
      // This line is the fix. It MUST be here and be correct.
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));