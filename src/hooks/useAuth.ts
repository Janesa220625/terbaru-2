import React, { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "../lib/supabase";
import {
  getCurrentUser,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  hasPermission,
  updateUserProfile,
} from "../lib/auth";
import type { UserProfile, UserRole, UserPermissions } from "../types/auth";
import { saveToStorage, loadFromStorage } from "../lib/storage";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: any }>;
  signup: (
    email: string,
    password: string,
    userData: {
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      warehouseId?: string;
    },
  ) => Promise<void>;
  logout: () => Promise<{ success: boolean; error?: any }>;
  checkPermission: (permission: keyof UserPermissions) => Promise<boolean>;
  updateProfile: (userData: Partial<UserProfile>) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        try {
          const currentUser = await getCurrentUser();
          console.log("Current user after auth change:", currentUser);
          setUser(currentUser);
        } catch (err) {
          console.error("Error fetching user after auth change:", err);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);

        // Check for a mock user in Supabase storage (for development)
        if (import.meta.env.DEV) {
          const { data: mockUser, error: loadError } = await loadFromStorage(
            "dev-storage/mock-user.json",
            null,
          );

          if (mockUser && !loadError) {
            console.log(
              "DEV MODE: Using mock user from Supabase storage",
              mockUser,
            );
            setUser(mockUser);
            setIsLoading(false);
            return;
          }
        }

        const currentUser = await getCurrentUser();
        console.log("Fetched current user:", currentUser);
        setUser(currentUser);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user data");

        // In development mode, create a mock user if fetch fails
        if (import.meta.env.DEV) {
          console.log("DEV MODE: Creating default mock user after fetch error");
          const mockUser: UserProfile = {
            id: "dev-user-id",
            email: "dev@example.com",
            role: "admin" as UserRole,
            firstName: "Dev",
            lastName: "User",
            permissions: {
              canViewDashboard: true,
              canManageProducts: true,
              canViewProducts: true,
              canManageInventory: true,
              canViewInventory: true,
              canPerformStockOpname: true,
              canViewReports: true,
              canExportData: true,
              canManageUsers: true,
              canManageSettings: true,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUser(mockUser);
          // Save mock user to Supabase storage instead of localStorage
          await saveToStorage("dev-storage/mock-user.json", mockUser);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const clearError = () => {
    setError(null);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!email.trim() || !password.trim()) {
        setError("Email and password are required");
        return { success: false, error: "Email and password are required" };
      }

      const result = await signInWithEmail(email, password);
      if ("error" in result && result.error) {
        throw result.error;
      }

      // Ensure we have the latest user data
      const currentUser = await getCurrentUser();
      console.log("Login successful, setting user:", currentUser);
      setUser(currentUser);

      // Store login timestamp for session tracking
      sessionStorage.setItem(
        "warehouse-login-timestamp",
        new Date().toISOString(),
      );

      return { success: true };
    } catch (err: any) {
      console.error("Login error:", err);

      // More specific error messages based on error type
      if (
        err?.message?.includes("Invalid login") ||
        err?.message?.includes("Invalid email")
      ) {
        setError("Invalid email or password");
      } else if (err?.message?.includes("rate limit")) {
        setError("Too many login attempts. Please try again later.");
      } else if (
        err?.message?.includes("network") ||
        err?.message?.includes("connection")
      ) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(err?.message || "Failed to log in. Please try again.");
      }

      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    userData: {
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      warehouseId?: string;
    },
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      await signUpWithEmail(email, password, userData);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err?.message || "Failed to create account");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear session data first
      sessionStorage.removeItem("warehouse-user-session");
      sessionStorage.removeItem("warehouse-login-timestamp");
      // Remove user cache from Supabase storage instead of localStorage
      await saveToStorage("user-cache/user-data.json", null);

      await signOut();
      setUser(null);

      return { success: true };
    } catch (err: any) {
      console.error("Logout error:", err);

      // Still clear local user state even if server logout fails
      setUser(null);

      // More specific error message
      setError(
        err?.message ||
          "Failed to log out completely. Some session data may remain.",
      );
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const checkPermission = async (permission: keyof UserPermissions) => {
    return await hasPermission(permission);
  };

  const updateProfile = async (userData: Partial<UserProfile>) => {
    if (!user) return false;

    try {
      setIsLoading(true);
      setError(null);

      const updateData: {
        firstName?: string;
        lastName?: string;
        role?: UserRole;
        warehouseId?: string;
      } = {};

      if (userData.firstName !== undefined)
        updateData.firstName = userData.firstName;
      if (userData.lastName !== undefined)
        updateData.lastName = userData.lastName;
      if (userData.role !== undefined) updateData.role = userData.role;
      if (userData.warehouseId !== undefined)
        updateData.warehouseId = userData.warehouseId;

      await updateUserProfile(user.id, updateData);

      // Update local user state
      const updatedUser = await getCurrentUser();
      setUser(updatedUser);
      return true;
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Failed to update profile");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    checkPermission,
    updateProfile,
    clearError,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
