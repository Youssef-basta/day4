export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addons: {
        Row: {
          description: string | null
          duration_min: number
          id: string
          name: string
          price_kwd: number
          sort_order: number
        }
        Insert: {
          description?: string | null
          duration_min: number
          id: string
          name: string
          price_kwd: number
          sort_order?: number
        }
        Update: {
          description?: string | null
          duration_min?: number
          id?: string
          name?: string
          price_kwd?: number
          sort_order?: number
        }
        Relationships: []
      }
      bookings: {
        Row: {
          addon_ids: string[]
          cancellation_reason: string | null
          card_last4: string | null
          created_at: string
          customer_name: string
          drink_orders: { id: string; qty: number }[]
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          ref: string
          service_id: string
          slot_id: string
          status: Database["public"]["Enums"]["booking_status"]
        }
        Insert: {
          addon_ids?: string[]
          cancellation_reason?: string | null
          card_last4?: string | null
          created_at?: string
          customer_name: string
          drink_orders?: { id: string; qty: number }[]
          id?: string
          notes?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          ref: string
          service_id: string
          slot_id: string
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Update: {
          addon_ids?: string[]
          cancellation_reason?: string | null
          card_last4?: string | null
          created_at?: string
          customer_name?: string
          drink_orders?: { id: string; qty: number }[]
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string
          ref?: string
          service_id?: string
          slot_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          description: string | null
          duration_min: number
          id: string
          name: string
          price_kwd: number
          sort_order: number
          tier: Database["public"]["Enums"]["service_tier"] | null
        }
        Insert: {
          description?: string | null
          duration_min: number
          id: string
          name: string
          price_kwd: number
          sort_order?: number
          tier?: Database["public"]["Enums"]["service_tier"] | null
        }
        Update: {
          description?: string | null
          duration_min?: number
          id?: string
          name?: string
          price_kwd?: number
          sort_order?: number
          tier?: Database["public"]["Enums"]["service_tier"] | null
        }
        Relationships: []
      }
      drinks: {
        Row: {
          id: string
          name: string
          description: string | null
          price_kwd: number
          temperature: Database["public"]["Enums"]["drink_temperature"]
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          price_kwd: number
          temperature: Database["public"]["Enums"]["drink_temperature"]
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_kwd?: number
          temperature?: Database["public"]["Enums"]["drink_temperature"]
          sort_order?: number
          is_active?: boolean
        }
        Relationships: []
      }
      slots: {
        Row: {
          date: string
          id: string
          is_open: boolean
          time: string
        }
        Insert: {
          date: string
          id: string
          is_open?: boolean
          time: string
        }
        Update: {
          date?: string
          id?: string
          is_open?: boolean
          time?: string
        }
        Relationships: []
      }
      studio_settings: {
        Row: {
          id: number
          brand_name: string
          hero_kicker: string | null
          hero_headline_1: string | null
          hero_headline_2: string | null
          hero_subheading: string | null
          feature_1_title: string | null
          feature_1_hint: string | null
          feature_2_title: string | null
          feature_2_hint: string | null
          feature_3_title: string | null
          feature_3_hint: string | null
          address_line_1: string | null
          address_line_2: string | null
          hours_line_1: string | null
          hours_line_2: string | null
          phone: string | null
          phone_hint: string | null
          phone_placeholder: string | null
          grace_min: number
          updated_at: string
        }
        Insert: {
          id?: number
          brand_name: string
          hero_kicker?: string | null
          hero_headline_1?: string | null
          hero_headline_2?: string | null
          hero_subheading?: string | null
          feature_1_title?: string | null
          feature_1_hint?: string | null
          feature_2_title?: string | null
          feature_2_hint?: string | null
          feature_3_title?: string | null
          feature_3_hint?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          hours_line_1?: string | null
          hours_line_2?: string | null
          phone?: string | null
          phone_hint?: string | null
          phone_placeholder?: string | null
          grace_min?: number
          updated_at?: string
        }
        Update: {
          id?: number
          brand_name?: string
          hero_kicker?: string | null
          hero_headline_1?: string | null
          hero_headline_2?: string | null
          hero_subheading?: string | null
          feature_1_title?: string | null
          feature_1_hint?: string | null
          feature_2_title?: string | null
          feature_2_hint?: string | null
          feature_3_title?: string | null
          feature_3_hint?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          hours_line_1?: string | null
          hours_line_2?: string | null
          phone?: string | null
          phone_hint?: string | null
          phone_placeholder?: string | null
          grace_min?: number
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          quote: string
          author: string
          rating: number
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id?: string
          quote: string
          author: string
          rating?: number
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          quote?: string
          author?: string
          rating?: number
          sort_order?: number
          is_active?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_booking: {
        Args: {
          p_addon_ids: string[]
          p_card_last4: string
          p_customer_name: string
          p_drink_orders?: { id: string; qty: number }[]
          p_notes: string
          p_payment_method: Database["public"]["Enums"]["payment_method"]
          p_phone: string
          p_service_id: string
          p_slot_id: string
        }
        Returns: {
          addon_ids: string[]
          card_last4: string | null
          created_at: string
          customer_name: string
          drink_orders: { id: string; qty: number }[]
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          ref: string
          service_id: string
          slot_id: string
          status: Database["public"]["Enums"]["booking_status"]
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ensure_slots: { Args: { p_days?: number }; Returns: undefined }
    }
    Enums: {
      booking_status: "pending" | "done" | "cancelled"
      drink_temperature: "hot" | "cold"
      payment_method: "visa" | "knet" | "cash"
      payment_status: "paid" | "unpaid"
      service_tier: "standard" | "premium" | "signature"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      booking_status: ["pending", "done", "cancelled"],
      payment_method: ["visa", "knet", "cash"],
      payment_status: ["paid", "unpaid"],
      service_tier: ["standard", "premium", "signature"],
    },
  },
} as const
