import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on mode
  const env = loadEnv(mode, process.cwd(), "");

  // Safely access environment variables with fallbacks
  const getEnv = (key: string, defaultValue: string): string => {
    return env[key] || process.env[key] || defaultValue;
  };

  // Safely parse numeric environment variables
  const getNumericEnv = (key: string, defaultValue: number): number => {
    const value = getEnv(key, String(defaultValue));
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Safely parse boolean environment variables
  const getBooleanEnv = (key: string, defaultValue: boolean): boolean => {
    const value = getEnv(key, String(defaultValue));
    return value.toLowerCase() === "true";
  };

  return {
    // Use a consistent base path approach that works across platforms
    base: getEnv("VITE_BASE_PATH", "/"),

    // Define environment variables to be replaced at build time
    define: {
      // Ensure environment variables are properly stringified
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(
        getEnv("VITE_APP_VERSION", "1.0.0"),
      ),
      "import.meta.env.VITE_APP_NAME": JSON.stringify(
        getEnv("VITE_APP_NAME", "Warehouse Management"),
      ),
    },

    // Optimize dependencies during development
    optimizeDeps: {
      // Only include main entry points to speed up startup
      entries: ["src/main.tsx"],
      esbuildOptions: {
        target: "es2020",
        legalComments: "none",
        treeShaking: true,
      },
    },

    // Core plugins
    plugins: [react(), tempo()],

    // Path resolution
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // Server configuration
    server: {
      // Support Tempo platform
      allowedHosts: getBooleanEnv("TEMPO", false) ? true : undefined,
      // Add standard port configuration
      port: getNumericEnv("PORT", 3000),
      // Enable CORS for API development
      cors: true,
      // Add host configuration for network access
      host: getEnv("HOST", "localhost"),
    },

    // Build configuration
    build: {
      // Optimize build output
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: mode === "production",
          pure_funcs:
            mode === "production"
              ? ["console.log", "console.info", "console.debug"]
              : [],
          passes: 2,
          ecma: 2020,
        },
        mangle: {
          safari10: true,
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
          },
          entryFileNames: "assets/[name].[hash].js",
          chunkFileNames: "assets/[name].[hash].js",
          assetFileNames: "assets/[name].[hash].[ext]",
        },
      },

      // Standard build settings
      sourcemap: mode !== "production",
      cssCodeSplit: true,
      cssMinify: true,
      target: "es2020",
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096, // 4kb
      manifest: true,
      outDir: "dist",
    },
  };
});
