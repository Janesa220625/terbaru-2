import React, { Suspense, lazy, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  useRoutes,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Home from "./components/home";
// Import tempo routes safely with error handling
let routes = [];
try {
  // @ts-ignore
  routes = import.meta.env.DEV ? require("tempo-routes").default : [];
} catch (error) {
  console.warn("Tempo routes not available, this is expected in production");
}
import MainLayout from "./components/Layout/MainLayout";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import LoginForm from "./components/Auth/LoginForm";
import SignupPage from "./pages/signup";

// Lazy load pages for better performance
const Products = lazy(() => import("./pages/products"));
const Inventory = lazy(() => import("./pages/inventory"));
const Reports = lazy(() => import("./pages/reports"));
const Settings = lazy(() => import("./pages/settings"));
const PreLaunchReview = lazy(() => import("./pages/pre-launch-review"));
const QualityCheck = lazy(() => import("./pages/quality-check"));
const TestRegistration = lazy(() => import("./pages/test-registration"));
const TestingGuide = lazy(() => import("./pages/testing-guide"));

// Loading component for consistent UI
const LoadingIndicator = () => (
  <div className="flex items-center justify-center min-h-screen">
    <p className="text-lg">Loading...</p>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user && !redirecting) {
      setRedirecting(true);
      console.log("No user found, redirecting to login");
      // Store the attempted URL for redirect after login
      sessionStorage.setItem("redirectAfterLogin", location.pathname);
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, navigate, redirecting, location]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return user ? <>{children}</> : null;
};

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Effect to handle redirects after login
  useEffect(() => {
    if (user && location.pathname === "/login") {
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
      console.log("User logged in, redirecting to", redirectPath);
      sessionStorage.removeItem("redirectAfterLogin");
      // Use window.location to force a full page reload
      window.location.href = redirectPath;
    }
  }, [user, location]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <LoginForm />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" replace /> : <SignupPage />}
          />
          <Route
            path="/test-registration"
            element={
              <Suspense fallback={<LoadingIndicator />}>
                <TestRegistration />
              </Suspense>
            }
          />
          <Route
            path="/testing-guide"
            element={
              <Suspense fallback={<LoadingIndicator />}>
                <TestingGuide />
              </Suspense>
            }
          />
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pre-launch-review"
              element={
                <ProtectedRoute>
                  <PreLaunchReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quality-check"
              element={
                <ProtectedRoute>
                  <QualityCheck />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Add tempobook route to prevent 404 in production */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" element={<div />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {/* Only use tempo routes in development */}
        {import.meta.env.DEV &&
          import.meta.env.VITE_TEMPO === "true" &&
          useRoutes(routes)}
      </>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <DevAuthInitializer />
    </AuthProvider>
  );
}

// Component to initialize dev authentication
function DevAuthInitializer() {
  // Only run in development mode
  if (import.meta.env.DEV) {
    // Create a proper component to use hooks
    const DevAuthComponent = () => {
      const [initialized, setInitialized] = useState(false);
      const navigate = useNavigate();

      useEffect(() => {
        console.log("🔧 DEV MODE: Initializing automatic authentication");
        // Import the module but don't call the hook directly
        import("@/hooks/useDevAuth").then((module) => {
          // Instead of calling the hook here, we'll set a flag
          // The hook will be used properly in the DevAuthHookUser component
          setInitialized(true);
          console.log("✅ DEV MODE: Authentication bypass initialized");
          console.log(
            "💡 TIP: If auto-login fails, visit /tempobook/storyboards/dev-login-bypass to access the bypass tool",
          );
        });
      }, []);

      // Only render the hook user component when initialized
      return initialized ? <DevAuthHookUser /> : null;
    };
    return <DevAuthComponent />;
  }
  return null;
}

// Separate component to use the hook properly
function DevAuthHookUser() {
  // Now we can safely use the hook inside a component body
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    // Dynamically import the hook
    import("@/hooks/useDevAuth").then((module) => {
      // Create a component that uses the hook
      const DevAuthHookComponent = () => {
        module.useDevAuth();
        return null;
      };
      // We're already inside AuthProvider, so we can safely use the hook
      const DevAuthWrapper = () => <DevAuthHookComponent />;
      setLoaded(true);
    });
  }, []);

  return null;
}

export default App;
