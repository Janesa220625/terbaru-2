// Data storage utility for persisting data with Supabase as the single source of truth
import { supabase } from "../services/supabase";
import { checkSupabaseConnection } from "../services/supabase";

/**
 * Storage interface for implementing storage operations
 */
export interface StorageStrategy {
  save: <T>(key: string, data: T) => Promise<{ error: Error | null }>;
  load: <T>(
    key: string,
    fallback: T,
  ) => Promise<{ data: T; error: Error | null }>;
}

/**
 * Supabase Storage implementation - the only supported storage strategy
 */
export class SupabaseStorage implements StorageStrategy {
  async save<T>(key: string, data: T): Promise<{ error: Error | null }> {
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      // Verify connection before attempting to save
      const { connected, details } = await checkSupabaseConnection();
      if (!connected) {
        throw new Error(
          `Cannot save data: Supabase connection failed - ${details.error || "Unknown connection error"}`,
        );
      }

      // Split key into bucket and path if it contains a slash
      const [bucketName, ...pathParts] = key.split("/");
      const path = pathParts.join("/");

      if (!path) {
        throw new Error("Invalid storage path: must include bucket and path");
      }

      // Convert data to JSON string
      const jsonData = JSON.stringify(data);

      // Convert string to Blob
      const blob = new Blob([jsonData], { type: "application/json" });

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(path, blob, { upsert: true });

      if (error) throw error;

      console.log(
        `Successfully saved data to Supabase storage: ${bucketName}/${path}`,
      );
      return { error: null };
    } catch (error) {
      console.error(`Error saving to Supabase storage: ${error}`);
      return {
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async load<T>(
    key: string,
    fallback: T,
  ): Promise<{ data: T; error: Error | null }> {
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      // Verify connection before attempting to load
      const { connected, details } = await checkSupabaseConnection();
      if (!connected) {
        console.warn(
          `Cannot load data: Supabase connection failed - ${details.error || "Unknown connection error"}`,
        );
        return {
          data: fallback,
          error: new Error(`Supabase connection failed: ${details.error}`),
        };
      }

      // Split key into bucket and path if it contains a slash
      const [bucketName, ...pathParts] = key.split("/");
      const path = pathParts.join("/");

      if (!path) {
        throw new Error("Invalid storage path: must include bucket and path");
      }

      // Download from Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(path);

      if (error) {
        // If the file doesn't exist, return the fallback without an error
        if (
          error.message.includes("not found") ||
          error.message.includes("does not exist")
        ) {
          console.log(
            `File not found in Supabase storage, using fallback: ${bucketName}/${path}`,
          );
          return { data: fallback, error: null };
        }
        throw error;
      }

      if (!data) {
        return { data: fallback, error: null };
      }

      // Convert Blob to JSON
      const jsonData = await data.text();
      const parsedData = JSON.parse(jsonData) as T;
      console.log(
        `Successfully loaded data from Supabase storage: ${bucketName}/${path}`,
      );

      return { data: parsedData, error: null };
    } catch (error) {
      console.error(`Error loading from Supabase storage: ${error}`);
      return {
        data: fallback,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

// Create the Supabase storage instance - the only supported storage strategy
const supabaseStorage = new SupabaseStorage();

/**
 * Save data to Supabase storage
 */
export const saveToStorage = async <T>(
  key: string,
  data: T,
): Promise<{ error: Error | null }> => {
  return supabaseStorage.save(key, data);
};

/**
 * Load data from Supabase storage
 */
export const loadFromStorage = async <T>(
  key: string,
  fallback: T,
): Promise<{ data: T; error: Error | null }> => {
  return supabaseStorage.load(key, fallback);
};

/**
 * Legacy functions - completely disabled
 * These functions are kept only for backward compatibility with existing code
 * They will log warnings and do nothing
 */

/**
 * @deprecated This function is disabled. Use saveToStorage instead which uses Supabase.
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  console.warn(
    "saveToLocalStorage is disabled - use saveToStorage instead which uses Supabase",
  );
  // Function disabled - does nothing
};

/**
 * @deprecated This function is disabled. Use loadFromStorage instead which uses Supabase.
 */
export const loadFromLocalStorage = <T>(key: string, fallback: T): T => {
  console.warn(
    "loadFromLocalStorage is disabled - use loadFromStorage instead which uses Supabase",
  );
  // Function disabled - always returns fallback
  return fallback;
};

/**
 * @deprecated This function is disabled. Supabase is now the only storage strategy.
 */
export const setDefaultStorage = (strategy: StorageStrategy): void => {
  console.warn(
    "setDefaultStorage is disabled - Supabase is now the only storage strategy",
  );
  // Function disabled - does nothing
};
