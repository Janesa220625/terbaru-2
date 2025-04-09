import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base:
    process.env.NODE_ENV === "development"
      ? "/"
      : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
    esbuildOptions: {
      target: "es2020",
      // Optimize dependencies during development for faster startup
      legalComments: "none",
      treeShaking: true,
    },
  },
  plugins: [react(), tempo()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  build: {
    // Optimize build output
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
        passes: 2,
        ecma: 2020,
        collapse_vars: true,
        reduce_vars: true,
        booleans_as_integers: true,
      },
      mangle: {
        safari10: true,
        toplevel: true,
        properties: {
          regex: /^_/,
        },
      },
      format: {
        comments: false,
        ecma: 2020,
      },
    },
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            "@supabase/supabase-js",
          ],
          ui: [
            "lucide-react",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tabs",
          ],
          charts: ["recharts"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          date: ["date-fns", "react-day-picker"],
          utils: ["clsx", "tailwind-merge", "class-variance-authority"],
          // Additional chunks for better code splitting
          auth: ["./src/hooks/useAuth.ts", "./src/services/supabase.ts"],
          inventory: ["./src/components/Inventory"],
          dashboard: ["./src/components/Dashboard"],
          settings: ["./src/components/settings", "./src/pages/settings.tsx"],
        },
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
        // Improve chunk loading by reducing the number of requests
        hoistTransitiveImports: true,
        // Minimize chunk size to improve loading performance
        minifyInternalExports: true,
        // Compact format for smaller file sizes
        compact: true,
      },
      // Optimize external dependencies
      external: [],
    },
    // Improve sourcemap generation
    sourcemap: false,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Enable CSS minification
    cssMinify: true,
    // Target modern browsers for smaller bundles
    target: "es2020",
    // Reduce chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Ensure assets are optimized
    assetsInlineLimit: 4096, // 4kb
    // Emit manifest for better asset management
    manifest: true,
    // Improve module preloading
    modulePreload: {
      polyfill: true,
    },
    // Ensure compatibility with older browsers if needed
    outDir: "dist",
  },
});
