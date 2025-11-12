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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_type: string | null
          assigned_to: string | null
          client_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          notes: string | null
          property_id: string | null
          reminder_sent: boolean | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_type?: string | null
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          property_id?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_type?: string | null
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          property_id?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          assigned_to: string | null
          city: string | null
          client_type: string | null
          country: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          notes: Json | null
          phone: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          client_type?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          notes?: Json | null
          phone?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          client_type?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          notes?: Json | null
          phone?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          phone: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          phone?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          phone?: string | null
          status?: string | null
        }
        Relationships: []
      }
      json_ld_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          template: Json
          template_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template: Json
          template_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template?: Json
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          clicked_count: number | null
          content: Json
          created_at: string | null
          created_by: string | null
          id: string
          opened_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: Json
          total_recipients: number | null
        }
        Insert: {
          clicked_count?: number | null
          content: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          opened_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject: Json
          total_recipients?: number | null
        }
        Update: {
          clicked_count?: number | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          opened_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: Json
          total_recipients?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          full_name: string | null
          id: string
          language: string | null
          metadata: Json | null
          source: string | null
          status: string | null
          subscribed_at: string | null
          tags: string[] | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          full_name?: string | null
          id?: string
          language?: string | null
          metadata?: Json | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          full_name?: string | null
          id?: string
          language?: string | null
          metadata?: Json | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          images: Json | null
          is_active: boolean | null
          order_index: number | null
          page_name: string
          section_key: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          order_index?: number | null
          page_name: string
          section_key: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          order_index?: number | null
          page_name?: string
          section_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          order_index: number | null
          project_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          order_index?: number | null
          project_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          order_index?: number | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string | null
          created_by: string | null
          description_de: string
          description_en: string
          description_fr: string
          description_pt: string
          featured: boolean | null
          id: string
          json_ld: Json | null
          location: string
          main_image: string | null
          operation_type: string | null
          parking_spaces: number | null
          postal_code: string | null
          price: number | null
          property_type: string | null
          region: string
          status: string | null
          title_de: string
          title_en: string
          title_fr: string
          title_pt: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          description_de: string
          description_en: string
          description_fr: string
          description_pt: string
          featured?: boolean | null
          id: string
          json_ld?: Json | null
          location: string
          main_image?: string | null
          operation_type?: string | null
          parking_spaces?: number | null
          postal_code?: string | null
          price?: number | null
          property_type?: string | null
          region: string
          status?: string | null
          title_de: string
          title_en: string
          title_fr: string
          title_pt: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          description_de?: string
          description_en?: string
          description_fr?: string
          description_pt?: string
          featured?: boolean | null
          id?: string
          json_ld?: Json | null
          location?: string
          main_image?: string | null
          operation_type?: string | null
          parking_spaces?: number | null
          postal_code?: string | null
          price?: number | null
          property_type?: string | null
          region?: string
          status?: string | null
          title_de?: string
          title_en?: string
          title_fr?: string
          title_pt?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          description: Json
          icon_name: string
          id: string
          is_active: boolean | null
          order_index: number | null
          title: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: Json
          icon_name: string
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: Json
          icon_name?: string
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      statistics: {
        Row: {
          created_at: string | null
          icon_name: string
          id: string
          is_active: boolean | null
          key: string
          label: Json
          order_index: number | null
          updated_at: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          icon_name: string
          id?: string
          is_active?: boolean | null
          key: string
          label: Json
          order_index?: number | null
          updated_at?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          key?: string
          label?: Json
          order_index?: number | null
          updated_at?: string | null
          value?: number
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          order_index: number | null
          role: string
          text: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          order_index?: number | null
          role: string
          text: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          role?: string
          text?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "super_admin"
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
      app_role: ["admin", "editor", "super_admin"],
    },
  },
} as const
