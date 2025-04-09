import React, { Suspense, lazy, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  useRoutes,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Home from "./components/home";
// @ts-ignore
import routes from "tempo-routes";
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
const TestRegistration = lazy(() => import("./pages/test-registration"));
const TestingGuide = lazy(() => import("./pages/testing-guide"));

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return user ? <>{children}</> : null;
};

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading authentication...</p>;
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <LoginForm />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" /> : <SignupPage />}
          />
          <Route
            path="/test-registration"
            element={
              <Suspense fallback={<p>Loading...</p>}>
                <TestRegistration />
              </Suspense>
            }
          />
          <Route
            path="/testing-guide"
            element={
              <Suspense fallback={<p>Loading...</p>}>
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
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
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
        import("./hooks/useDevAuth").then((module) => {
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
    import("./hooks/useDevAuth").then((module) => {
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
