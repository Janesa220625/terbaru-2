import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { UserProfile, UserRole, DEFAULT_PERMISSIONS } from "@/types/auth";
import { ProfileInsert, ProfileUpdate } from "@/types/profiles";

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase credentials are missing. Please check your environment variables.",
  );
}

// Only create the client if both URL and key are available
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : (null as unknown as ReturnType<typeof createClient<Database>>);

/**
 * Utility function to handle Supabase errors consistently
 */
export const handleSupabaseError = (error: unknown, context: string) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`Supabase error in ${context}:`, errorMessage);
  // In production, you might want to log to a service like Sentry
  return error;
};

/**
 * Check if the Supabase connection is working
 * @returns Detailed connection status information
 */
export const checkSupabaseConnection = async (): Promise<{
  connected: boolean;
  details: {
    credentialsPresent: boolean;
    healthCheckTableExists: boolean;
    tablesAvailable?: string[];
    error?: string;
    timestamp: string;
  };
}> => {
  const details: {
    credentialsPresent: boolean;
    healthCheckTableExists: boolean;
    timestamp: string;
    error?: string;
    tablesAvailable?: string[];
  } = {
    credentialsPresent: false,
    healthCheckTableExists: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check if credentials are available
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "Supabase credentials are missing. Cannot check connection.",
      );
      details.error = "Supabase credentials are missing";
      return { connected: false, details };
    }

    details.credentialsPresent = true;
    console.log("Checking Supabase connection...");
    console.log("Supabase URL:", supabaseUrl);
    console.log(
      "Supabase Anon Key:",
      supabaseAnonKey ? "[PRESENT]" : "[MISSING]",
    );

    // Try to access the health_check table
    // Use explicit typing for the health_check table
    const { data: healthData, error: healthError } = await supabase
      .from("health_check" as any)
      .select("*")
      .limit(1);

    if (healthError) {
      console.error("Supabase health check error:", healthError);
      details.error = `Health check failed: ${healthError.message}`;

      // Check if the error is due to the table not existing
      if (healthError.message.includes("does not exist")) {
        details.error =
          "Health check table does not exist. Run migrations first.";
      }

      return { connected: false, details };
    }

    details.healthCheckTableExists = true;
    console.log("Supabase health check successful, data:", healthData);

    // Try to get a list of available tables
    try {
      // Explicitly type the RPC function call
      const { data: tablesData, error: tablesError } = await supabase.rpc(
        "get_tables" as any,
        {} as any,
      );

      if (tablesError) {
        console.warn("Could not retrieve table list:", tablesError);
      } else if (tablesData) {
        details.tablesAvailable = tablesData as any;
        console.log("Available tables:", tablesData);
      }
    } catch (tablesError) {
      console.warn("Error calling get_tables function:", tablesError);
    }

    return { connected: true, details };
  } catch (error) {
    console.error("Failed to connect to Supabase:", error);
    details.error = error instanceof Error ? error.message : String(error);
    return { connected: false, details };
  }
};

/**
 * Get the current authenticated user with profile data
 */
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "Supabase credentials are missing. Cannot get current user.",
      );
      return null;
    }

    // Get the actual Supabase user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If no user found
    if (!user) return null;

    // Fetch user profile from profiles table
    // Use explicit type for the profiles table
    const { data: profile, error } = await supabase
      .from("profiles" as any)
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
      // Use the ProfileInsert type to ensure type safety
      const profileData: ProfileInsert = {
        id: user.id,
        email: user.email || "",
        role: defaultRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error: createError } = await supabase
        .from("profiles" as any)
        .insert(profileData);

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
      firstName: profile.first_name || undefined,
      lastName: profile.last_name || undefined,
      warehouseId: profile.warehouse_id || undefined,
      permissions: DEFAULT_PERMISSIONS[(profile.role as UserRole) || "viewer"],
      createdAt:
        profile.created_at || user.created_at || new Date().toISOString(),
      updatedAt: profile.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    handleSupabaseError(error, "getCurrentUser");
    return null;
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    // Validate inputs
    if (!email?.trim() || !password?.trim()) {
      throw new Error("Email and password are required");
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      const error = new Error(
        "Supabase credentials are missing. Cannot sign in.",
      );
      handleSupabaseError(error, "signInWithEmail");
      throw error;
    }

    // Authentication flow using Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error, "signInWithEmail");
    return { error };
  }
};

/**
 * Sign up a new user
 */
export const signUpWithEmail = async (
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
    if (!supabaseUrl || !supabaseAnonKey) {
      const error = new Error(
        "Supabase credentials are missing. Cannot sign up.",
      );
      handleSupabaseError(error, "signUpWithEmail");
      throw error;
    }

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
    // Use the ProfileInsert type to ensure type safety
    const profileData: ProfileInsert = {
      id: data.user.id,
      email: email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role || "staff",
      warehouse_id: userData.warehouseId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error: profileError } = await supabase
      .from("profiles" as any)
      .insert(profileData);

    if (profileError) {
      console.error("Error creating user profile:", profileError.message);
      // Consider deleting the auth user if profile creation fails
      throw profileError;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, "signUpWithEmail");
    throw error;
  }
};

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
    if (!supabaseUrl || !supabaseAnonKey) {
      const error = new Error(
        "Supabase credentials are missing. Cannot update profile.",
      );
      handleSupabaseError(error, "updateUserProfile");
      throw error;
    }

    // Use the ProfileUpdate type to ensure type safety
    const profileUpdate: ProfileUpdate = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
      warehouse_id: userData.warehouseId,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("profiles" as any)
      .update(profileUpdate)
      .eq("id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    handleSupabaseError(error, "updateUserProfile");
    throw error;
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase credentials are missing. Cannot get users.");
      return [];
    }

    // Check if current user is admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized access to user list");
    }

    // Get all users from profiles table
    const { data, error } = await supabase.from("profiles" as any).select("*");

    if (error) throw error;

    // Map to UserProfile format
    return (data || []).map((profile) => ({
      id: profile.id,
      email: profile.email || "",
      role: (profile.role as UserRole) || "viewer",
      firstName: profile.first_name || undefined,
      lastName: profile.last_name || undefined,
      warehouseId: profile.warehouse_id || undefined,
      permissions: DEFAULT_PERMISSIONS[(profile.role as UserRole) || "viewer"],
      createdAt: profile.created_at || new Date().toISOString(),
      updatedAt: profile.updated_at || new Date().toISOString(),
    }));
  } catch (error) {
    handleSupabaseError(error, "getAllUsers");
    return [];
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      const error = new Error(
        "Supabase credentials are missing. Cannot sign out.",
      );
      handleSupabaseError(error, "signOut");
      throw error;
    }

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

    return true;
  } catch (error) {
    handleSupabaseError(error, "signOut");
    throw error;
  }
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = async (
  permission: keyof UserProfile["permissions"],
): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    return user.permissions[permission] || false;
  } catch (error) {
    handleSupabaseError(error, "hasPermission");
    return false;
  }
};
