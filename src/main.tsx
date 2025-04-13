import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Providers } from "./lib/providers";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL
  ? String(import.meta.env.BASE_URL)
  : "";

// Enhanced Performance measurement
if (import.meta.env.PROD) {
  // Add performance marks for detailed tracking
  performance.mark("app-init-start");

  // Track time to first paint
  const paintObserver = new PerformanceObserver((entries) => {
    for (const entry of entries.getEntries()) {
      if (entry.name === "first-contentful-paint") {
        console.log(`First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
        performance.measure(
          "time-to-fcp",
          "app-init-start",
          "first-contentful-paint",
        );
      }
    }
    paintObserver.disconnect();
  });
  paintObserver.observe({ type: "paint", buffered: true });

  // Track long tasks that might cause jank
  const longTaskObserver = new PerformanceObserver((entries) => {
    for (const entry of entries.getEntries()) {
      console.log(`Long task detected: ${entry.duration.toFixed(2)}ms`);
    }
  });
  longTaskObserver.observe({ type: "longtask", buffered: true });

  // Report comprehensive performance metrics
  window.addEventListener("load", () => {
    performance.mark("app-init-end");
    performance.measure("app-init", "app-init-start", "app-init-end");

    // Log performance metrics in production (these will be dropped by terser)
    console.log(
      "App initialization time:",
      performance.getEntriesByName("app-init")[0].duration.toFixed(2),
      "ms",
    );

    // Report navigation timing metrics
    const navEntries = performance.getEntriesByType("navigation");
    const navEntry =
      navEntries.length > 0
        ? (navEntries[0] as PerformanceNavigationTiming)
        : null;
    if (navEntry) {
      console.log(
        `DOM Content Loaded: ${navEntry.domContentLoadedEventEnd.toFixed(2)}ms`,
      );
      console.log(`Load Event: ${navEntry.loadEventEnd.toFixed(2)}ms`);
    }
  });
}

// Enhanced component prefetching strategy
if (import.meta.env.PROD) {
  // Intelligent prefetching based on user navigation patterns
  const prefetchCriticalComponents = () => {
    // Prefetch main dashboard components immediately
    import("./components/home");
    import("./components/Dashboard/InventoryMetrics");

    // Use requestIdleCallback for lower priority components
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        import("./components/Dashboard/InventoryTrends");
        import("./components/Dashboard/CategoryMatrix");
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        import("./components/Dashboard/InventoryTrends");
        import("./components/Dashboard/CategoryMatrix");
      }, 2000);
    }
  };

  // Prefetch inventory components when user hovers over inventory navigation
  const prefetchInventoryComponents = () => {
    import("./components/Inventory/ModuleNavigation");
    import("./components/Inventory/StockUnits");
    import("./components/Inventory/BoxStock");
  };

  // Execute initial prefetch after first paint
  setTimeout(prefetchCriticalComponents, 1000);

  // Add event listeners for navigation elements after DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    // Find inventory navigation elements and add hover listeners
    const inventoryNavLinks = document.querySelectorAll('a[href*="inventory"]');
    inventoryNavLinks.forEach((link) => {
      link.addEventListener("mouseenter", prefetchInventoryComponents, {
        once: true,
      });
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </Providers>
  </React.StrictMode>,
);
