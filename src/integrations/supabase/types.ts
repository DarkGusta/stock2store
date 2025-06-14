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
      damage_reports: {
        Row: {
          description: string
          id: string
          item_serial: string
          photo_url: string | null
          reported_at: string | null
          reporter_id: string
          status: Database["public"]["Enums"]["damage_report_status"]
        }
        Insert: {
          description: string
          id?: string
          item_serial: string
          photo_url?: string | null
          reported_at?: string | null
          reporter_id: string
          status?: Database["public"]["Enums"]["damage_report_status"]
        }
        Update: {
          description?: string
          id?: string
          item_serial?: string
          photo_url?: string | null
          reported_at?: string | null
          reporter_id?: string
          status?: Database["public"]["Enums"]["damage_report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "damage_reports_item_serial_fkey"
            columns: ["item_serial"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["serial_id"]
          },
          {
            foreignKeyName: "damage_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          product_type_id: string
          quantity: number
          status: boolean
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          product_type_id: string
          quantity?: number
          status?: boolean
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          product_type_id?: string
          quantity?: number
          status?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          created_at: string | null
          inventory_id: string
          location_id: string | null
          performed_by_user_id: string | null
          price_id: string | null
          serial_id: string
          status: Database["public"]["Enums"]["item_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          inventory_id: string
          location_id?: string | null
          performed_by_user_id?: string | null
          price_id?: string | null
          serial_id: string
          status?: Database["public"]["Enums"]["item_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          inventory_id?: string
          location_id?: string | null
          performed_by_user_id?: string | null
          price_id?: string | null
          serial_id?: string
          status?: Database["public"]["Enums"]["item_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "price"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          capacity: number | null
          id: string
          shelf_number: string
          slot_number: string
          status: boolean
        }
        Insert: {
          capacity?: number | null
          id?: string
          shelf_number: string
          slot_number: string
          status?: boolean
        }
        Update: {
          capacity?: number | null
          id?: string
          shelf_number?: string
          slot_number?: string
          status?: boolean
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          item_serial: string
          order_id: string
          price: number
        }
        Insert: {
          id?: string
          item_serial: string
          order_id: string
          price: number
        }
        Update: {
          id?: string
          item_serial?: string
          order_id?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_serial_fkey"
            columns: ["item_serial"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["serial_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          order_number: string
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_number: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          description: string | null
          id: string
          resource: string
        }
        Insert: {
          action: string
          description?: string | null
          id?: string
          resource: string
        }
        Update: {
          action?: string
          description?: string | null
          id?: string
          resource?: string
        }
        Relationships: []
      }
      price: {
        Row: {
          amount: number
          created_at: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          inventory_id: string
          status: boolean | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          inventory_id: string
          status?: boolean | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          inventory_id?: string
          status?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "price_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      product_types: {
        Row: {
          description: string | null
          id: string
          name: string
          tax_type: number
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          tax_type: number
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          tax_type?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          postal_code: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          state: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          order_id: string
          photo_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["refund_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          order_id: string
          photo_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          order_id?: string
          photo_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          created_at: string | null
          damage_report_id: string | null
          destination_location_id: string | null
          id: string
          item_serial: string
          notes: string | null
          order_id: string | null
          source_location_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          damage_report_id?: string | null
          destination_location_id?: string | null
          id?: string
          item_serial: string
          notes?: string | null
          order_id?: string | null
          source_location_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          damage_report_id?: string | null
          destination_location_id?: string | null
          id?: string
          item_serial?: string
          notes?: string | null
          order_id?: string | null
          source_location_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_damage_report_id_fkey"
            columns: ["damage_report_id"]
            isOneToOne: false
            referencedRelation: "damage_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_item_serial_fkey"
            columns: ["item_serial"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["serial_id"]
          },
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_source_location_id_fkey"
            columns: ["source_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_count_view: {
        Row: {
          total_users: number
        }
    }
    Functions: {
      clear_session_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin_or_warehouse: {
        Args: { user_id: string }
        Returns: boolean
      }
      set_session_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      user_has_permission: {
        Args: { user_id: string; req_resource: string; req_action: string }
        Returns: boolean
      }
      warehouse_can_view_profile: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      damage_report_status: "completed" | "in_progess" | "received"
      item_status:
        | "available"
        | "damaged"
        | "in_repair"
        | "sold"
        | "unavailable"
        | "pending"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "completed"
        | "cancelled"
        | "refunded"
        | "rejected"
      refund_status: "pending" | "approved" | "rejected"
      user_role: "admin" | "warehouse" | "customer" | "analyst"
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
    Enums: {
      damage_report_status: ["completed", "in_progess", "received"],
      item_status: [
        "available",
        "damaged",
        "in_repair",
        "sold",
        "unavailable",
        "pending",
      ],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "completed",
        "cancelled",
        "refunded",
        "rejected",
      ],
      refund_status: ["pending", "approved", "rejected"],
      user_role: ["admin", "warehouse", "customer", "analyst"],
    },
  },
} as const
