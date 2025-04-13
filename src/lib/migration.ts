import { supabase } from "../services/supabase";
import type { UserProfile } from "@/types/auth";

/**
 * Utility to migrate data from localStorage to Supabase
 */
export const migrateLocalStorageToSupabase = async (): Promise<{
  success: boolean;
  migrated: string[];
  errors: string[];
  details?: Record<string, any>;
}> => {
  const migrated: string[] = [];
  const errors: string[] = [];
  const details: Record<string, any> = {};

  try {
    // Check if Supabase is available
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    // Verify Supabase connection before proceeding
    console.log("Verifying Supabase connection before migration...");
    const { data: healthCheck, error: healthError } = await supabase
      .from("health_check")
      .select("*")
      .limit(1);

    if (healthError) {
      console.error("Supabase connection verification failed:", healthError);
      details.connectionError = healthError.message;
      throw new Error(`Supabase connection failed: ${healthError.message}`);
    }

    console.log("Supabase connection verified successfully", healthCheck);
    details.connectionStatus = "Connected";

    // 1. Migrate mock users
    try {
      console.log("Starting migration of mock users...");
      const mockUsersMigrated = await migrateMockUsers();
      if (mockUsersMigrated) {
        migrated.push("Mock users");
        details.mockUsersMigration = "Success";
      }
    } catch (error) {
      console.error("Error migrating mock users:", error);
      errors.push("Mock users");
      details.mockUsersMigration =
        error instanceof Error ? error.message : String(error);
    }

    // 2. Migrate other data types as needed
    // Add additional migration steps here

    // 3. Clear localStorage after successful migration
    if (errors.length === 0) {
      // Only clear if all migrations were successful
      console.log("All migrations successful, clearing localStorage...");
      localStorage.removeItem("warehouse-mock-users");
      localStorage.removeItem("warehouse-user");
      localStorage.removeItem("warehouse-session-created");
      console.log("Cleared local storage after successful migration");
      details.localStorageCleared = true;
    }

    return {
      success: errors.length === 0,
      migrated,
      errors,
      details,
    };
  } catch (error) {
    console.error("Migration failed:", error);
    return {
      success: false,
      migrated,
      errors: [
        ...errors,
        error instanceof Error
          ? error.message
          : "Unknown error during migration",
      ],
      details,
    };
  }
};

/**
 * Migrate mock users from localStorage to Supabase profiles table
 */
async function migrateMockUsers(): Promise<boolean> {
  try {
    // Get mock users from localStorage
    const storedUsers = localStorage.getItem("warehouse-mock-users");
    if (!storedUsers) {
      console.log("No mock users found in localStorage");
      return true; // Nothing to migrate
    }

    const mockUsers: UserProfile[] = JSON.parse(storedUsers);
    if (!mockUsers.length) {
      console.log("Empty mock users array in localStorage");
      return true; // Nothing to migrate
    }

    console.log(`Found ${mockUsers.length} mock users to migrate`);

    // Test Supabase connection first
    const { data: healthCheck, error: healthError } = await supabase
      .from("health_check")
      .select("*")
      .limit(1);

    if (healthError) {
      console.error("Supabase connection test failed:", healthError);
      throw new Error(`Supabase connection failed: ${healthError.message}`);
    }

    console.log("Supabase connection test successful:", healthCheck);

    // For each mock user, check if they exist in Supabase and create if not
    for (const user of mockUsers) {
      console.log(`Processing user migration for: ${user.email}`);

      // Check if user already exists in profiles table
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking for existing profile:", checkError);
        continue;
      }

      if (existingProfile) {
        console.log(`User ${user.email} already exists in Supabase, skipping`);
        continue;
      }

      // Create user in Supabase Auth (in production this would require admin privileges)
      // For development, we'll just create the profile
      const profileData = {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        warehouse_id: user.warehouseId,
        created_at: user.createdAt || new Date().toISOString(),
        updated_at: user.updatedAt || new Date().toISOString(),
      };

      console.log(`Inserting profile data:`, profileData);

      const { error: insertError, data: insertData } = await supabase
        .from("profiles")
        .insert(profileData)
        .select();

      if (insertError) {
        console.error(`Error migrating user ${user.email}:`, insertError);
      } else {
        console.log(
          `Successfully migrated user ${user.email} to Supabase:`,
          insertData,
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Error in migrateMockUsers:", error);
    throw error;
  }
}

/**
 * Check data consistency between localStorage and Supabase
 */
export const checkDataConsistency = async (): Promise<{
  consistent: boolean;
  inconsistencies: string[];
}> => {
  const inconsistencies: string[] = [];

  try {
    // Check if Supabase is available
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    // 1. Check user data consistency
    try {
      const userConsistency = await checkUserDataConsistency();
      if (!userConsistency.consistent) {
        inconsistencies.push(
          `User data: ${userConsistency.inconsistencies.join(", ")}`,
        );
      }
    } catch (error) {
      console.error("Error checking user data consistency:", error);
      inconsistencies.push("User data check failed");
    }

    return {
      consistent: inconsistencies.length === 0,
      inconsistencies,
    };
  } catch (error) {
    console.error("Consistency check failed:", error);
    return {
      consistent: false,
      inconsistencies: [
        ...inconsistencies,
        "Unknown error during consistency check",
      ],
    };
  }
};

/**
 * Check consistency between localStorage users and Supabase profiles
 */
async function checkUserDataConsistency(): Promise<{
  consistent: boolean;
  inconsistencies: string[];
}> {
  const inconsistencies: string[] = [];

  try {
    // Get mock users from localStorage
    const storedUsers = localStorage.getItem("warehouse-mock-users");
    if (!storedUsers) {
      return { consistent: true, inconsistencies: [] }; // Nothing to check
    }

    const mockUsers: UserProfile[] = JSON.parse(storedUsers);
    if (!mockUsers.length) {
      return { consistent: true, inconsistencies: [] }; // Nothing to check
    }

    // For each mock user, check if they exist in Supabase with matching data
    for (const user of mockUsers) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (error) {
        inconsistencies.push(
          `Error checking profile for ${user.email}: ${error.message}`,
        );
        continue;
      }

      if (!profile) {
        inconsistencies.push(
          `User ${user.email} exists in localStorage but not in Supabase`,
        );
        continue;
      }

      // Check if critical fields match
      if (profile.role !== user.role) {
        inconsistencies.push(
          `Role mismatch for ${user.email}: localStorage=${user.role}, Supabase=${profile.role}`,
        );
      }

      if (profile.first_name !== user.firstName) {
        inconsistencies.push(`First name mismatch for ${user.email}`);
      }

      if (profile.last_name !== user.lastName) {
        inconsistencies.push(`Last name mismatch for ${user.email}`);
      }
    }

    return {
      consistent: inconsistencies.length === 0,
      inconsistencies,
    };
  } catch (error) {
    console.error("Error in checkUserDataConsistency:", error);
    return {
      consistent: false,
      inconsistencies: ["Error during user data consistency check"],
    };
  }
}
