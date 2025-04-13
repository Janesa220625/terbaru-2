/**
 * Type definitions for Supabase tables
 * This helps ensure type safety when interacting with the database
 */

// Define the allowed table names in Supabase
export type TableNames =
  | "products"
  | "outgoing_documents"
  | "box_stock"
  | "deliveries"
  | "outgoing_items"
  | "profiles"
  | "stock_units"
  | "health_check";

// Define the structure for stock unit items
export interface StockUnitRecord {
  id: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  box_id: string | null;
  date_added: string | null;
  added_by?: string | null;
  last_modified?: string | null;
  modified_by?: string | null;
  manufacture_date?: string | null;
}

// Define the structure for box stock items
export interface BoxStockRecord {
  id: string;
  sku: string;
  name: string;
  category: string;
  box_count: number;
  pairs_per_box: number;
  total_pairs: number;
  stock_level: string;
  created_at: string | null;
  updated_at: string | null;
}

// Define the structure for profiles
export interface ProfileRecord {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  warehouse_id: string | null;
  created_at: string;
  updated_at: string;
}

// Define the structure for health check
export interface HealthCheckRecord {
  id: string;
  status: string;
  timestamp: string;
}
