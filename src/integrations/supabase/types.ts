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
  public: {
    Tables: {
      app_modules: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          enabled: boolean
          key: string
          name: string
          name_ar: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          enabled?: boolean
          key: string
          name: string
          name_ar: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          enabled?: boolean
          key?: string
          name?: string
          name_ar?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          ip: string | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          city: string | null
          code: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          name_ar: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          name_ar?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          name_ar?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          min_order: number
          updated_at: string
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          min_order?: number
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          min_order?: number
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          phone: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          phone: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          phone?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fabrics_db: {
        Row: {
          brand: string
          category: string
          colors: string[] | null
          coming_soon: boolean | null
          composition: string | null
          created_at: string
          features: string[] | null
          gsm: number | null
          has_offer: boolean
          id: string
          image_url: string | null
          in_all_branches: boolean
          is_featured: boolean | null
          is_new: boolean | null
          is_popular: boolean | null
          name: string
          name_en: string | null
          offer_text: string | null
          origin: string | null
          price: string | null
          type: string
          updated_at: string
          usage_suggestions: string[] | null
        }
        Insert: {
          brand: string
          category: string
          colors?: string[] | null
          coming_soon?: boolean | null
          composition?: string | null
          created_at?: string
          features?: string[] | null
          gsm?: number | null
          has_offer?: boolean
          id?: string
          image_url?: string | null
          in_all_branches?: boolean
          is_featured?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          name: string
          name_en?: string | null
          offer_text?: string | null
          origin?: string | null
          price?: string | null
          type: string
          updated_at?: string
          usage_suggestions?: string[] | null
        }
        Update: {
          brand?: string
          category?: string
          colors?: string[] | null
          coming_soon?: boolean | null
          composition?: string | null
          created_at?: string
          features?: string[] | null
          gsm?: number | null
          has_offer?: boolean
          id?: string
          image_url?: string | null
          in_all_branches?: boolean
          is_featured?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          name?: string
          name_en?: string | null
          offer_text?: string | null
          origin?: string | null
          price?: string | null
          type?: string
          updated_at?: string
          usage_suggestions?: string[] | null
        }
        Relationships: []
      }
      loyalty_rules: {
        Row: {
          award_on_status: string
          enabled: boolean
          id: string
          min_redeem_points: number
          point_value: number
          points_expiry_days: number
          points_per_currency: number
          updated_at: string
        }
        Insert: {
          award_on_status?: string
          enabled?: boolean
          id?: string
          min_redeem_points?: number
          point_value?: number
          points_expiry_days?: number
          points_per_currency?: number
          updated_at?: string
        }
        Update: {
          award_on_status?: string
          enabled?: boolean
          id?: string
          min_redeem_points?: number
          point_value?: number
          points_expiry_days?: number
          points_per_currency?: number
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          id: string
          points: number
          reason: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          reason?: string | null
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          reason?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      membership_levels: {
        Row: {
          color: string
          created_at: string
          discount_percent: number
          id: string
          key: string
          min_points: number
          name: string
          name_ar: string
          sort_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          discount_percent?: number
          id?: string
          key: string
          min_points?: number
          name: string
          name_ar?: string
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          discount_percent?: number
          id?: string
          key?: string
          min_points?: number
          name?: string
          name_ar?: string
          sort_order?: number
        }
        Relationships: []
      }
      message_replies: {
        Row: {
          created_at: string
          id: string
          message_id: string
          replied_by: string | null
          reply_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          replied_by?: string | null
          reply_text: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          replied_by?: string | null
          reply_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_replies_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          branch_id: string | null
          coupon_code: string | null
          created_at: string
          customer_address: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_amount: number
          id: string
          items: Json
          loyalty_settled: boolean
          notes: string | null
          points_earned: number
          points_redeemed: number
          shipping_amount: number
          status: string
          stripe_session_id: string | null
          subtotal: number | null
          total_amount: number
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_address?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number
          id?: string
          items?: Json
          loyalty_settled?: boolean
          notes?: string | null
          points_earned?: number
          points_redeemed?: number
          shipping_amount?: number
          status?: string
          stripe_session_id?: string | null
          subtotal?: number | null
          total_amount?: number
          user_id: string
        }
        Update: {
          branch_id?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_address?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number
          id?: string
          items?: Json
          loyalty_settled?: boolean
          notes?: string | null
          points_earned?: number
          points_redeemed?: number
          shipping_amount?: number
          status?: string
          stripe_session_id?: string | null
          subtotal?: number | null
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          key: string
          name: string
          name_ar: string
        }
        Insert: {
          category?: string
          key: string
          name: string
          name_ar?: string
        }
        Update: {
          category?: string
          key?: string
          name?: string
          name_ar?: string
        }
        Relationships: []
      }
      pos_sales: {
        Row: {
          branch_id: string | null
          cashier_id: string | null
          created_at: string
          customer_id: string | null
          discount: number
          id: string
          items: Json
          note: string | null
          payment_method: string
          payments: Json
          points_earned: number
          points_redeemed: number
          receipt_no: string | null
          related_sale_id: string | null
          subtotal: number
          total: number
          type: string
        }
        Insert: {
          branch_id?: string | null
          cashier_id?: string | null
          created_at?: string
          customer_id?: string | null
          discount?: number
          id?: string
          items?: Json
          note?: string | null
          payment_method?: string
          payments?: Json
          points_earned?: number
          points_redeemed?: number
          receipt_no?: string | null
          related_sale_id?: string | null
          subtotal?: number
          total?: number
          type?: string
        }
        Update: {
          branch_id?: string | null
          cashier_id?: string | null
          created_at?: string
          customer_id?: string | null
          discount?: number
          id?: string
          items?: Json
          note?: string | null
          payment_method?: string
          payments?: Json
          points_earned?: number
          points_redeemed?: number
          receipt_no?: string | null
          related_sale_id?: string | null
          subtotal?: number
          total?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_sales_related_sale_id_fkey"
            columns: ["related_sale_id"]
            isOneToOne: false
            referencedRelation: "pos_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch_id: string | null
          created_at: string
          full_name: string
          id: string
          loyalty_card_token: string
          loyalty_points: number
          membership_level: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          full_name?: string
          id: string
          loyalty_card_token?: string
          loyalty_points?: number
          membership_level?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          loyalty_card_token?: string
          loyalty_points?: number
          membership_level?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          fabric_id: string
          id: string
          rating: number
          updated_at: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          fabric_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          fabric_id?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_fabric_id_fkey"
            columns: ["fabric_id"]
            isOneToOne: false
            referencedRelation: "fabrics_db"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: string
          permission_key: string
          role_key: string
        }
        Insert: {
          id?: string
          permission_key: string
          role_key: string
        }
        Update: {
          id?: string
          permission_key?: string
          role_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "role_permissions_role_key_fkey"
            columns: ["role_key"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["key"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          is_system: boolean
          key: string
          name: string
          name_ar: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_system?: boolean
          key: string
          name: string
          name_ar?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          is_system?: boolean
          key?: string
          name?: string
          name_ar?: string
        }
        Relationships: []
      }
      shipping_settings: {
        Row: {
          free_shipping_enabled: boolean
          free_shipping_threshold: number
          id: string
          shipping_fee: number
          updated_at: string
        }
        Insert: {
          free_shipping_enabled?: boolean
          free_shipping_threshold?: number
          id?: string
          shipping_fee?: number
          updated_at?: string
        }
        Update: {
          free_shipping_enabled?: boolean
          free_shipping_threshold?: number
          id?: string
          shipping_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          platform: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          updated_at?: string
          url?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      staff_assignments: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          role_key: string
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          role_key: string
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          role_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_assignments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_assignments_role_key_fkey"
            columns: ["role_key"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["key"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          fabric_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fabric_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fabric_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_membership_level: { Args: { _points: number }; Returns: string }
      has_permission: {
        Args: { _perm: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_coupon: {
        Args: { _code: string; _subtotal: number }
        Returns: {
          discount: number
          message: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin"
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
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
