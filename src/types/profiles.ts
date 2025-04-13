/**
 * Type definitions for the profiles table
 * This helps ensure type safety when interacting with the profiles table
 */

import { UserRole } from "./auth";

export interface ProfileRecord {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  warehouse_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  warehouse_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  warehouse_id?: string;
  updated_at: string;
}
