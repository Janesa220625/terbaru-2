export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      box_stock: {
        Row: {
          box_count: number
          category: string
          created_at: string | null
          id: string
          name: string
          pairs_per_box: number
          sku: string
          stock_level: string
          total_pairs: number
          updated_at: string | null
        }
        Insert: {
          box_count: number
          category: string
          created_at?: string | null
          id?: string
          name: string
          pairs_per_box: number
          sku: string
          stock_level: string
          total_pairs: number
          updated_at?: string | null
        }
        Update: {
          box_count?: number
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          pairs_per_box?: number
          sku?: string
          stock_level?: string
          total_pairs?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "box_stock_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      deliveries: {
        Row: {
          box_count: number
          date: string | null
          id: string
          pairs_per_box: number
          product_name: string | null
          sku: string
          total_pairs: number
        }
        Insert: {
          box_count: number
          date?: string | null
          id?: string
          pairs_per_box: number
          product_name?: string | null
          sku: string
          total_pairs: number
        }
        Update: {
          box_count?: number
          date?: string | null
          id?: string
          pairs_per_box?: number
          product_name?: string | null
          sku?: string
          total_pairs?: number
        }
        Relationships: []
      }
      outgoing_documents: {
        Row: {
          created_at: string | null
          date: string | null
          document_number: string
          id: string
          notes: string | null
          recipient: string
          total_items: number
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          document_number: string
          id?: string
          notes?: string | null
          recipient: string
          total_items: number
        }
        Update: {
          created_at?: string | null
          date?: string | null
          document_number?: string
          id?: string
          notes?: string | null
          recipient?: string
          total_items?: number
        }
        Relationships: []
      }
      outgoing_items: {
        Row: {
          color: string
          document_id: string
          id: string
          name: string
          quantity: number
          size: string
          sku: string
        }
        Insert: {
          color: string
          document_id: string
          id?: string
          name: string
          quantity: number
          size: string
          sku: string
        }
        Update: {
          color?: string
          document_id?: string
          id?: string
          name?: string
          quantity?: number
          size?: string
          sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "outgoing_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "outgoing_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          colors: string
          created_at: string | null
          id: string
          name: string
          pairs_per_box: number
          sizes: string
          sku: string
          updated_at: string | null
        }
        Insert: {
          category: string
          colors: string
          created_at?: string | null
          id?: string
          name: string
          pairs_per_box: number
          sizes: string
          sku: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          colors?: string
          created_at?: string | null
          id?: string
          name?: string
          pairs_per_box?: number
          sizes?: string
          sku?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: []
      }
      stock_units: {
        Row: {
          added_by: string | null
          box_id: string | null
          color: string
          date_added: string | null
          id: string
          last_modified: string | null
          modified_by: string | null
          quantity: number
          size: string
          sku: string
        }
        Insert: {
          added_by?: string | null
          box_id?: string | null
          color: string
          date_added?: string | null
          id?: string
          last_modified?: string | null
          modified_by?: string | null
          quantity: number
          size: string
          sku: string
        }
        Update: {
          added_by?: string | null
          box_id?: string | null
          color?: string
          date_added?: string | null
          id?: string
          last_modified?: string | null
          modified_by?: string | null
          quantity?: number
          size?: string
          sku?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
