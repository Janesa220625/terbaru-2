import { supabase } from "./supabase";

/**
 * Generic API functions for interacting with the database
 */

/**
 * Fetch data from a table with optional filters
 */
export async function fetchData<T>(
  table: string,
  options?: {
    columns?: string;
    filters?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  },
) {
  let query = supabase.from(table).select(options?.columns || "*");

  // Apply filters if provided
  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  // Apply ordering if provided
  if (options?.order) {
    query = query.order(options.order.column, {
      ascending: options.order.ascending ?? true,
    });
  }

  // Apply pagination if provided
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1,
    );
  }

  const { data, error } = await query;
  return { data: data as T[], error };
}

/**
 * Insert data into a table
 */
export async function insertData<T>(
  table: string,
  data: Partial<T> | Partial<T>[],
) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select();
  return { data: result as T[], error };
}

/**
 * Update data in a table
 */
export async function updateData<T>(
  table: string,
  id: string | number,
  data: Partial<T>,
  idColumn = "id",
) {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq(idColumn, id)
    .select();
  return { data: result as T[], error };
}

/**
 * Delete data from a table
 */
export async function deleteData(
  table: string,
  id: string | number,
  idColumn = "id",
) {
  const { error } = await supabase.from(table).delete().eq(idColumn, id);
  return { error };
}

/**
 * Fetch data with complex filters
 */
export async function fetchDataWithFilters<T>(
  table: string,
  filters: {
    eq?: Record<string, any>;
    gt?: Record<string, any>;
    lt?: Record<string, any>;
    gte?: Record<string, any>;
    lte?: Record<string, any>;
    like?: Record<string, any>;
    ilike?: Record<string, any>;
    in?: Record<string, any[]>;
    contains?: Record<string, any>;
  },
  options?: {
    columns?: string;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  },
) {
  let query = supabase.from(table).select(options?.columns || "*");

  // Apply equality filters
  if (filters.eq) {
    Object.entries(filters.eq).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  // Apply greater than filters
  if (filters.gt) {
    Object.entries(filters.gt).forEach(([key, value]) => {
      query = query.gt(key, value);
    });
  }

  // Apply less than filters
  if (filters.lt) {
    Object.entries(filters.lt).forEach(([key, value]) => {
      query = query.lt(key, value);
    });
  }

  // Apply greater than or equal filters
  if (filters.gte) {
    Object.entries(filters.gte).forEach(([key, value]) => {
      query = query.gte(key, value);
    });
  }

  // Apply less than or equal filters
  if (filters.lte) {
    Object.entries(filters.lte).forEach(([key, value]) => {
      query = query.lte(key, value);
    });
  }

  // Apply LIKE filters (case sensitive)
  if (filters.like) {
    Object.entries(filters.like).forEach(([key, value]) => {
      query = query.like(key, value);
    });
  }

  // Apply ILIKE filters (case insensitive)
  if (filters.ilike) {
    Object.entries(filters.ilike).forEach(([key, value]) => {
      query = query.ilike(key, value);
    });
  }

  // Apply IN filters
  if (filters.in) {
    Object.entries(filters.in).forEach(([key, values]) => {
      query = query.in(key, values);
    });
  }

  // Apply contains filters (for arrays and jsonb)
  if (filters.contains) {
    Object.entries(filters.contains).forEach(([key, value]) => {
      query = query.contains(key, value);
    });
  }

  // Apply ordering if provided
  if (options?.order) {
    query = query.order(options.order.column, {
      ascending: options.order.ascending ?? true,
    });
  }

  // Apply pagination if provided
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1,
    );
  }

  const { data, error } = await query;
  return { data: data as T[], error };
}

/**
 * Count records in a table with optional filters
 */
export async function countRecords(
  table: string,
  filters?: Record<string, any>,
) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });

  // Apply filters if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  const { count, error } = await query;
  return { count, error };
}

/**
 * Upsert data (insert if not exists, update if exists)
 */
export async function upsertData<T>(
  table: string,
  data: Partial<T> | Partial<T>[],
  onConflict?: string,
) {
  let query = supabase.from(table).upsert(data);

  if (onConflict) {
    query = query.onConflict(onConflict);
  }

  const { data: result, error } = await query.select();
  return { data: result as T[], error };
}
