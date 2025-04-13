import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { UserProfile } from "../../types/auth";
import { Loader2, ShieldAlert } from "lucide-react";

interface AuthWrapperProps {
  children: ReactNode;
  requiredPermission?: keyof UserProfile["permissions"];
  fallback?: ReactNode;
  redirectTo?: string;
  loadingComponent?: ReactNode;
}

const AuthWrapper = ({
  children,
  requiredPermission,
  fallback,
  redirectTo = "/login",
  loadingComponent,
}: AuthWrapperProps) => {
  const { user, isLoading, checkPermission } = useAuth();
  const navigate = useNavigate();
  const [hasRequiredPermission, setHasRequiredPermission] = useState<
    boolean | null
  >(null);
  const [permissionChecking, setPermissionChecking] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // If no user is logged in and we're done loading, redirect
      if (!isLoading && !user) {
        navigate(redirectTo);
        return;
      }

      // If a specific permission is required, check it
      if (!isLoading && user && requiredPermission) {
        setPermissionChecking(true);
        try {
          const hasPermission = await checkPermission(requiredPermission);
          setHasRequiredPermission(hasPermission);
        } catch (error) {
          console.error("Permission check error:", error);
          setHasRequiredPermission(false);
        } finally {
          setPermissionChecking(false);
        }
      } else if (!isLoading && user) {
        // User is logged in and no specific permission is required
        setHasRequiredPermission(true);
      }
    };

    checkAuth();
  }, [
    user,
    isLoading,
    requiredPermission,
    navigate,
    redirectTo,
    checkPermission,
  ]);

  // Default loading component
  const defaultLoadingComponent = (
    <div className="flex flex-col justify-center items-center h-40 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );

  if (isLoading || permissionChecking) {
    return loadingComponent || defaultLoadingComponent;
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  if (requiredPermission && hasRequiredPermission === false) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md shadow-sm">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-medium text-yellow-800">
            Access Restricted
          </h3>
        </div>
        <p className="mt-2 text-yellow-700">
          You don't have permission to access this feature. Please contact your
          administrator if you believe this is an error.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
