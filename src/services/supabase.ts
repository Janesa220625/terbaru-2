import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { UserProfile, UserRole, DEFAULT_PERMISSIONS } from "@/types/auth";

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
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "Supabase credentials are missing. Cannot check connection.",
      );
      return false;
    }

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

// Store mock users in localStorage for persistence
const getMockUsers = (): UserProfile[] => {
  try {
    const storedUsers = localStorage.getItem("warehouse-mock-users");
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
  } catch (e) {
    console.error("Failed to parse stored mock users", e);
  }
  return [];
};

const saveMockUsers = (users: UserProfile[]) => {
  try {
    localStorage.setItem("warehouse-mock-users", JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save mock users", e);
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

    // Check for dev mode mock user first
    if (import.meta.env.DEV) {
      const storedUser = localStorage.getItem("warehouse-user");
      if (storedUser) {
        try {
          const mockUser = JSON.parse(storedUser);
          console.log("DEV MODE: Using stored mock user", mockUser);
          return mockUser;
        } catch (e) {
          console.error("Failed to parse stored mock user", e);
          // Continue with normal auth flow
        }
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

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
export const signInWithEmail = async (email: string, password: string) => {
  try {
    // Validate inputs
    if (!email?.trim() || !password?.trim()) {
      throw new Error("Email and password are required");
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      // In development mode, create a mock successful response
      if (import.meta.env.DEV) {
        console.log("DEV MODE: Creating mock authentication session");

        // Check for predefined test users in dev mode
        const testUsers = {
          "admin@example.com": {
            password: "password123",
            role: "admin",
            firstName: "Admin",
            lastName: "User",
          },
          "staff@example.com": {
            password: "password123",
            role: "staff",
            firstName: "Staff",
            lastName: "User",
          },
          "viewer@example.com": {
            password: "password123",
            role: "viewer",
            firstName: "View",
            lastName: "Only",
          },
        };

        // Check if this is a test user
        const testUser = testUsers[email.toLowerCase()];
        if (testUser && testUser.password === password) {
          // Create a fake user for development with timestamp for tracking
          const mockUser: UserProfile = {
            id: `dev-user-${Date.now()}`,
            email: email,
            role: testUser.role as UserRole,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            permissions: DEFAULT_PERMISSIONS[testUser.role as UserRole],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Store the mock user in localStorage to simulate a session
          localStorage.setItem("warehouse-user", JSON.stringify(mockUser));
          localStorage.setItem(
            "warehouse-session-created",
            new Date().toISOString(),
          );

          return { user: mockUser, session: { access_token: "mock-token" } };
        } else {
          // Check if the email exists in mock users
          const mockUsers = getMockUsers();
          const existingUser = mockUsers.find(
            (u) => u.email.toLowerCase() === email.toLowerCase(),
          );

          if (existingUser) {
            // In a real system we'd verify the password, but for mock we'll just check if it exists
            if (password.length >= 6) {
              // Store the mock user in localStorage
              localStorage.setItem(
                "warehouse-user",
                JSON.stringify(existingUser),
              );
              localStorage.setItem(
                "warehouse-session-created",
                new Date().toISOString(),
              );
              return {
                user: existingUser,
                session: { access_token: "mock-token" },
              };
            } else {
              throw new Error("Invalid password");
            }
          } else {
            // Create a default mock user if not found
            const mockUser: UserProfile = {
              id: `dev-user-${Date.now()}`,
              email: email,
              role: "admin",
              firstName: "Dev",
              lastName: "User",
              permissions: DEFAULT_PERMISSIONS["admin"],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            // Store in mock users for future logins
            mockUsers.push(mockUser);
            saveMockUsers(mockUsers);

            // Store the mock user in localStorage
            localStorage.setItem("warehouse-user", JSON.stringify(mockUser));
            localStorage.setItem(
              "warehouse-session-created",
              new Date().toISOString(),
            );

            return { user: mockUser, session: { access_token: "mock-token" } };
          }
        }
      }

      const error = new Error(
        "Supabase credentials are missing. Cannot sign in.",
      );
      handleSupabaseError(error, "signInWithEmail");
      throw error;
    }

    // For development mode, try real auth first but fall back to mock if needed
    if (import.meta.env.DEV) {
      try {
        // Try actual auth first
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error) {
          console.log("DEV MODE: Real auth succeeded");
          // Clear any mock user data
          localStorage.removeItem("warehouse-user");
          localStorage.removeItem("warehouse-session-created");
          return data;
        }

        // If real auth fails in dev mode, check for test users
        const testUsers = {
          "admin@example.com": {
            password: "password123",
            role: "admin",
            firstName: "Admin",
            lastName: "User",
          },
          "staff@example.com": {
            password: "password123",
            role: "staff",
            firstName: "Staff",
            lastName: "User",
          },
          "viewer@example.com": {
            password: "password123",
            role: "viewer",
            firstName: "View",
            lastName: "Only",
          },
        };

        // Check if this is a test user
        const testUser = testUsers[email.toLowerCase()];
        if (testUser && testUser.password === password) {
          console.log("DEV MODE: Using test user", email);
          const mockUser: UserProfile = {
            id: `dev-user-${Date.now()}`,
            email: email,
            role: testUser.role as UserRole,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            permissions: DEFAULT_PERMISSIONS[testUser.role as UserRole],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Store the mock user in localStorage
          localStorage.setItem("warehouse-user", JSON.stringify(mockUser));
          localStorage.setItem(
            "warehouse-session-created",
            new Date().toISOString(),
          );

          return { user: mockUser, session: { access_token: "mock-token" } };
        }

        // Check if the email exists in mock users
        const mockUsers = getMockUsers();
        const existingUser = mockUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );

        if (existingUser) {
          console.log("DEV MODE: Using existing mock user", email);
          // In a real system we'd verify the password, but for mock we'll just check if it exists
          if (password.length >= 6) {
            // Store the mock user in localStorage
            localStorage.setItem(
              "warehouse-user",
              JSON.stringify(existingUser),
            );
            localStorage.setItem(
              "warehouse-session-created",
              new Date().toISOString(),
            );
            return {
              user: existingUser,
              session: { access_token: "mock-token" },
            };
          } else {
            throw new Error("Invalid password");
          }
        }

        // If real auth fails and no test user matches, create a mock session
        console.log(
          "DEV MODE: Real auth failed, creating mock session",
          error.message,
        );
        const mockUser: UserProfile = {
          id: `dev-user-${Date.now()}`,
          email: email,
          role: "admin",
          firstName: "Dev",
          lastName: "User",
          permissions: DEFAULT_PERMISSIONS["admin"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to mock users for future logins
        mockUsers.push(mockUser);
        saveMockUsers(mockUsers);

        // Store the mock user in localStorage
        localStorage.setItem("warehouse-user", JSON.stringify(mockUser));
        localStorage.setItem(
          "warehouse-session-created",
          new Date().toISOString(),
        );

        return { user: mockUser, session: { access_token: "mock-token" } };
      } catch (e) {
        // If real auth throws an error in dev mode, create a mock session
        console.log(
          "DEV MODE: Real auth threw an error, creating mock session",
          e,
        );
        const mockUser: UserProfile = {
          id: `dev-user-${Date.now()}`,
          email: email,
          role: "admin",
          firstName: "Dev",
          lastName: "User",
          permissions: DEFAULT_PERMISSIONS["admin"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to mock users
        const mockUsers = getMockUsers();
        mockUsers.push(mockUser);
        saveMockUsers(mockUsers);

        // Store the mock user in localStorage
        localStorage.setItem("warehouse-user", JSON.stringify(mockUser));
        localStorage.setItem(
          "warehouse-session-created",
          new Date().toISOString(),
        );

        return { user: mockUser, session: { access_token: "mock-token" } };
      }
    }

    // Normal authentication flow for production
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error as Error, "signInWithEmail");
    throw error;
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
    // For development mode, create a mock user if needed
    if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
      console.log("DEV MODE: Creating mock signup response");

      // Get existing mock users
      const mockUsers = getMockUsers();

      // Check if user with this email already exists
      if (mockUsers.some((user) => user.email === email)) {
        throw new Error("User with this email already exists");
      }

      // Create a mock user
      const mockUser: UserProfile = {
        id: `dev-user-${Date.now()}`,
        email: email,
        role: userData.role || "staff",
        firstName: userData.firstName,
        lastName: userData.lastName,
        warehouseId: userData.warehouseId,
        permissions: DEFAULT_PERMISSIONS[userData.role || "staff"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to mock users and save
      mockUsers.push(mockUser);
      saveMockUsers(mockUsers);

      // Store in localStorage
      localStorage.setItem("warehouse-user", JSON.stringify(mockUser));
      localStorage.setItem(
        "warehouse-session-created",
        new Date().toISOString(),
      );

      return { user: mockUser, session: { access_token: "mock-token" } };
    }

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
      // Consider deleting the auth user if profile creation fails
      throw profileError;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error as Error, "signUpWithEmail");
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
    // For development mode, update mock user if needed
    if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
      console.log("DEV MODE: Updating mock user", userId);

      // Get existing mock users
      const mockUsers = getMockUsers();

      // Find the user to update
      const userIndex = mockUsers.findIndex((user) => user.id === userId);
      if (userIndex === -1) {
        throw new Error("User not found");
      }

      // Update the user
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        firstName: userData.firstName || mockUsers[userIndex].firstName,
        lastName: userData.lastName || mockUsers[userIndex].lastName,
        role: userData.role || mockUsers[userIndex].role,
        warehouseId: userData.warehouseId || mockUsers[userIndex].warehouseId,
        updatedAt: new Date().toISOString(),
      };

      // Save updated users
      saveMockUsers(mockUsers);

      return true;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      const error = new Error(
        "Supabase credentials are missing. Cannot update profile.",
      );
      handleSupabaseError(error, "updateUserProfile");
      throw error;
    }

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
    // For development mode, return mock users
    if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
      console.log("DEV MODE: Returning mock users");
      return getMockUsers();
    }

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
export const signOut = async () => {
  try {
    // Clear any dev mode mock user data
    if (import.meta.env.DEV) {
      localStorage.removeItem("warehouse-user");
      localStorage.removeItem("warehouse-session-created");
      localStorage.removeItem("warehouse-mock-users");
      console.log("DEV MODE: Cleared mock user session");
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      if (import.meta.env.DEV) {
        console.log("DEV MODE: Simulating successful logout");
        // Clear all session storage and local storage data
        localStorage.removeItem("warehouse-user-cache");
        sessionStorage.removeItem("warehouse-user-session");
        sessionStorage.removeItem("warehouse-login-timestamp");
        return true;
      }

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

    // Clear all cached user data regardless of server response
    localStorage.removeItem("warehouse-user-cache");
    sessionStorage.removeItem("warehouse-user-session");
    sessionStorage.removeItem("warehouse-login-timestamp");

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
    handleSupabaseError(error as Error, "signOut");

    // Even if there's an error, try to clear local data
    try {
      localStorage.removeItem("warehouse-user-cache");
      sessionStorage.removeItem("warehouse-user-session");
      sessionStorage.removeItem("warehouse-login-timestamp");
    } catch (e) {
      console.warn("Failed to clear local storage during error recovery", e);
    }

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
    // Check for cached permissions first to improve performance
    const cachedUser = sessionStorage.getItem("warehouse-user-session");
    if (cachedUser) {
      try {
        const user = JSON.parse(cachedUser) as UserProfile;
        return user.permissions[permission] || false;
      } catch (e) {
        console.warn("Failed to parse cached user permissions", e);
        // Continue with normal flow
      }
    }

    const user = await getCurrentUser();
    if (!user) return false;

    // Cache the user for future permission checks
    try {
      sessionStorage.setItem("warehouse-user-session", JSON.stringify(user));
    } catch (e) {
      console.warn("Failed to cache user permissions", e);
    }

    return user.permissions[permission] || false;
  } catch (error) {
    handleSupabaseError(error as Error, "hasPermission");
    return false;
  }
};
