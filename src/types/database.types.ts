export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          sku: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          sku: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          sku?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      stock_units: {
        Row: {
          id: string;
          sku: string;
          size: string;
          color: string;
          quantity: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          sku: string;
          size: string;
          color: string;
          quantity: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          sku?: string;
          size?: string;
          color?: string;
          quantity?: number;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}