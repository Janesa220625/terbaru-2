// Data storage utility for persisting data
// Temporarily using localStorage for development

/**
 * Save data to localStorage
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
  }
};

/**
 * Load data from localStorage
 */
export const loadFromLocalStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error loading from localStorage: ${error}`);
    return fallback;
  }
};

// Supabase storage functions (currently not used)
export const saveToStorage = async <T>(
  tableName: string,
  data: T | T[],
): Promise<void> => {
  console.warn(
    "saveToStorage is not implemented yet. Using localStorage instead.",
  );
  saveToLocalStorage(tableName, data);
};

export const loadFromStorage = async <T>(
  tableName: string,
  fallback: T,
): Promise<T> => {
  console.warn(
    "loadFromStorage is not implemented yet. Using localStorage instead.",
  );
  return loadFromLocalStorage(tableName, fallback);
};
