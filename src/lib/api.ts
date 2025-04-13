import { supabase } from "./supabase";
import { TableNames } from "@/types/supabaseTypes";

/**
 * Generic API functions for interacting with the database
 */

/**
 * Fetch data from a table with optional filters
 */
export async function fetchData<T>(
  table: TableNames,
  options?: {
    columns?: string;
    filters?: Record<string, unknown>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  },
) {
  let query = supabase.from(table).select(options?.columns || "*");

  // Apply filters if provided
  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value);
      }
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
  return { data: data as T[] | null, error };
}

/**
 * Insert data into a table
 */
export async function insertData<T>(
  table: TableNames,
  data: any, // Using any temporarily to fix type issues
) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select();
  return { data: result as T[] | null, error };
}

/**
 * Update data in a table
 */
export async function updateData<T>(
  table: TableNames,
  id: string | number,
  data: any, // Using any temporarily to fix type issues
  idColumn = "id",
) {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq(idColumn, id)
    .select();
  return { data: result as T[] | null, error };
}

/**
 * Delete data from a table
 */
export async function deleteData(
  table: TableNames,
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
  table: TableNames,
  filters: {
    eq?: Record<string, unknown>;
    gt?: Record<string, unknown>;
    lt?: Record<string, unknown>;
    gte?: Record<string, unknown>;
    lte?: Record<string, unknown>;
    like?: Record<string, unknown>;
    ilike?: Record<string, unknown>;
    in?: Record<string, unknown[]>;
    contains?: Record<string, unknown>;
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
      query = query.eq(key, value as string);
    });
  }

  // Apply greater than filters
  if (filters.gt) {
    Object.entries(filters.gt).forEach(([key, value]) => {
      query = query.gt(key, value as string);
    });
  }

  // Apply less than filters
  if (filters.lt) {
    Object.entries(filters.lt).forEach(([key, value]) => {
      query = query.lt(key, value as string);
    });
  }

  // Apply greater than or equal filters
  if (filters.gte) {
    Object.entries(filters.gte).forEach(([key, value]) => {
      query = query.gte(key, value as string);
    });
  }

  // Apply less than or equal filters
  if (filters.lte) {
    Object.entries(filters.lte).forEach(([key, value]) => {
      query = query.lte(key, value as string);
    });
  }

  // Apply LIKE filters (case sensitive)
  if (filters.like) {
    Object.entries(filters.like).forEach(([key, value]) => {
      query = query.like(key, value as string);
    });
  }

  // Apply ILIKE filters (case insensitive)
  if (filters.ilike) {
    Object.entries(filters.ilike).forEach(([key, value]) => {
      query = query.ilike(key, value as string);
    });
  }

  // Apply IN filters
  if (filters.in) {
    Object.entries(filters.in).forEach(([key, values]) => {
      query = query.in(key, values as any[]);
    });
  }

  // Apply contains filters (for arrays and jsonb)
  if (filters.contains) {
    Object.entries(filters.contains).forEach(([key, value]) => {
      query = query.contains(key, value as any);
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
  return { data: data as T[] | null, error };
}

/**
 * Count records in a table with optional filters
 */
export async function countRecords(
  table: TableNames,
  filters?: Record<string, unknown>,
) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });

  // Apply filters if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value as string);
      }
    });
  }

  const { count, error } = await query;
  return { count, error };
}

/**
 * Upsert data (insert if not exists, update if exists)
 */
export async function upsertData<T>(
  table: TableNames,
  data: any, // Using any temporarily to fix type issues
  onConflict?: string,
) {
  const query = supabase.from(table).upsert(data);

  // Note: onConflict is handled differently in newer Supabase versions
  // This is a workaround for type issues
  const { data: result, error } = await query.select();
  return { data: result as T[] | null, error };
}
