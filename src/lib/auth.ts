import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";
import type { UserProfile, UserRole, UserPermissions } from "@/types/auth";
import { DEFAULT_PERMISSIONS } from "@/types/auth";

/**
 * Utility function to handle Supabase errors consistently
 */
export const handleSupabaseError = (error: Error, context: string) => {
  console.error(`Supabase error in ${context}:`, error.message);
  // In production, you might want to log to a service like Sentry
  return error;
};

/**
 * Check if the Supabase connection is working
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("health_check")
      .select("*")
      .limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to connect to Supabase:", error);
    return false;
  }
};

/**
 * Get the current authenticated user with profile data
 */
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    // Get the actual Supabase user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If no user found
    if (!user) return null;

    // Fetch user profile from profiles table
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error.message);
      return null;
    }

    if (!profile) {
      console.warn("User profile not found, attempting to create one");

      // Try to create a default profile
      const defaultRole: UserRole = "viewer";
      const { error: createError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        role: defaultRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (createError) {
        console.error("Failed to create default profile:", createError.message);
        return null;
      }

      // Return a basic profile
      return {
        id: user.id,
        email: user.email || "",
        role: defaultRole,
        permissions: DEFAULT_PERMISSIONS[defaultRole],
        createdAt: user.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Combine auth user and profile data
    return {
      id: user.id,
      email: user.email || "",
      role: (profile.role as UserRole) || "viewer",
      firstName: profile.first_name,
      lastName: profile.last_name,
      warehouseId: profile.warehouse_id,
      permissions: DEFAULT_PERMISSIONS[(profile.role as UserRole) || "viewer"],
      createdAt:
        profile.created_at || user.created_at || new Date().toISOString(),
      updatedAt: profile.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    handleSupabaseError(error as Error, "getCurrentUser");
    return null;
  }
};

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    // Validate inputs
    if (!email?.trim() || !password?.trim()) {
      throw new Error("Email and password are required");
    }

    // Use Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error as Error, "signInWithEmail");
    return { error };
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  userData: {
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    warehouseId?: string;
  },
) {
  try {
    // Create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("User creation failed");

    // Check if email confirmation is required
    if (data.session === null) {
      // Email confirmation is required
      return {
        ...data,
        confirmationRequired: true,
      };
    }

    // Create a profile record for the user
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role || "staff",
      warehouse_id: userData.warehouseId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Error creating user profile:", profileError.message);
      throw profileError;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error as Error, "signUpWithEmail");
    throw error;
  }
}

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  userData: {
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    warehouseId?: string;
  },
) => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        warehouse_id: userData.warehouseId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    handleSupabaseError(error as Error, "updateUserProfile");
    throw error;
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    // Check if current user is admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized access to user list");
    }

    // Get all users from profiles table
    const { data, error } = await supabase.from("profiles").select("*");

    if (error) throw error;

    // Map to UserProfile format
    return (data || []).map((profile) => ({
      id: profile.id,
      email: profile.email || "",
      role: (profile.role as UserRole) || "viewer",
      firstName: profile.first_name,
      lastName: profile.last_name,
      warehouseId: profile.warehouse_id,
      permissions: DEFAULT_PERMISSIONS[(profile.role as UserRole) || "viewer"],
      createdAt: profile.created_at || new Date().toISOString(),
      updatedAt: profile.updated_at || new Date().toISOString(),
    }));
  } catch (error) {
    handleSupabaseError(error as Error, "getAllUsers");
    return [];
  }
};

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    // Attempt to sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn(
        "Error during Supabase signOut, continuing with local cleanup",
        error,
      );
    }

    // Clear any auth-related cookies
    document.cookie.split(";").forEach(function (c) {
      if (c.trim().startsWith("sb-")) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      }
    });

    return { success: true };
  } catch (error) {
    handleSupabaseError(error as Error, "signOut");
    return { success: false, error };
  }
}

/**
 * Check if user has a specific permission
 */
export const hasPermission = async (
  permission: keyof UserPermissions,
): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    return user.permissions[permission] || false;
  } catch (error) {
    handleSupabaseError(error as Error, "hasPermission");
    return false;
  }
};

/**
 * Get the current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

/**
 * Get the current user
 */
export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Set up auth state change listener
 */
export function onAuthStateChange(
  callback: (user: User | null, session: Session | null) => void,
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, session);
  });
}
