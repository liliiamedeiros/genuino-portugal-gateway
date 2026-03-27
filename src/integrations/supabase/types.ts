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
      audit_access_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          record_count: number | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_count?: number | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_count?: number | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      conversion_schedules: {
        Row: {
          apply_watermark: boolean | null
          created_at: string | null
          created_by: string | null
          days_of_week: number[] | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          max_images_per_run: number | null
          next_run_at: string | null
          notify_on_completion: boolean | null
          notify_on_error: boolean | null
          quality: number | null
          schedule_time: string
          stats: Json | null
          target_height: number | null
          target_width: number | null
          updated_at: string | null
          watermark_position: string | null
        }
        Insert: {
          apply_watermark?: boolean | null
          created_at?: string | null
          created_by?: string | null
          days_of_week?: number[] | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          max_images_per_run?: number | null
          next_run_at?: string | null
          notify_on_completion?: boolean | null
          notify_on_error?: boolean | null
          quality?: number | null
          schedule_time?: string
          stats?: Json | null
          target_height?: number | null
          target_width?: number | null
          updated_at?: string | null
          watermark_position?: string | null
        }
        Update: {
          apply_watermark?: boolean | null
          created_at?: string | null
          created_by?: string | null
          days_of_week?: number[] | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          max_images_per_run?: number | null
          next_run_at?: string | null
          notify_on_completion?: boolean | null
          notify_on_error?: boolean | null
          quality?: number | null
          schedule_time?: string
          stats?: Json | null
          target_height?: number | null
          target_width?: number | null
          updated_at?: string | null
          watermark_position?: string | null
        }
        Relationships: []
      }
      conversion_templates: {
        Row: {
          apply_watermark: boolean | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          quality: number
          target_height: number
          target_width: number
          updated_at: string | null
          use_case: string | null
          watermark_position: string | null
        }
        Insert: {
          apply_watermark?: boolean | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          quality?: number
          target_height?: number
          target_width?: number
          updated_at?: string | null
          use_case?: string | null
          watermark_position?: string | null
        }
        Update: {
          apply_watermark?: boolean | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          quality?: number
          target_height?: number
          target_width?: number
          updated_at?: string | null
          use_case?: string | null
          watermark_position?: string | null
        }
        Relationships: []
      }
      geo_entities: {
        Row: {
          created_at: string
          description: string | null
          entity_type: string
          id: string
          is_active: boolean
          name: string
          order_index: number
          properties: Json
          same_as: Json
          schema_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entity_type?: string
          id?: string
          is_active?: boolean
          name: string
          order_index?: number
          properties?: Json
          same_as?: Json
          schema_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entity_type?: string
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
          properties?: Json
          same_as?: Json
          schema_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      geo_faqs: {
        Row: {
          answer: Json
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          order_index: number
          page_reference: string | null
          question: Json
          schema_enabled: boolean
          strategy_id: string | null
          updated_at: string
        }
        Insert: {
          answer?: Json
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          order_index?: number
          page_reference?: string | null
          question?: Json
          schema_enabled?: boolean
          strategy_id?: string | null
          updated_at?: string
        }
        Update: {
          answer?: Json
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          order_index?: number
          page_reference?: string | null
          question?: Json
          schema_enabled?: boolean
          strategy_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geo_faqs_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "geo_semantic_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_semantic_strategies: {
        Row: {
          created_at: string
          description: string | null
          entities: Json
          id: string
          is_active: boolean
          name: string
          order_index: number
          primary_keywords: Json
          response_structure: string | null
          secondary_keywords: Json
          target_intent: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entities?: Json
          id?: string
          is_active?: boolean
          name: string
          order_index?: number
          primary_keywords?: Json
          response_structure?: string | null
          secondary_keywords?: Json
          target_intent?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entities?: Json
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
          primary_keywords?: Json
          response_structure?: string | null
          secondary_keywords?: Json
          target_intent?: string
          updated_at?: string
        }
        Relationships: []
      }
      image_conversions: {
        Row: {
          backup_url: string | null
          converted_at: string | null
          converted_size: number | null
          converted_url: string | null
          created_at: string | null
          error_message: string | null
          id: string
          original_format: string
          original_size: number | null
          original_url: string
          savings_percentage: number | null
          source_id: string
          source_table: string
          status: string | null
        }
        Insert: {
          backup_url?: string | null
          converted_at?: string | null
          converted_size?: number | null
          converted_url?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          original_format: string
          original_size?: number | null
          original_url: string
          savings_percentage?: number | null
          source_id: string
          source_table: string
          status?: string | null
        }
        Update: {
          backup_url?: string | null
          converted_at?: string | null
          converted_size?: number | null
          converted_url?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          original_format?: string
          original_size?: number | null
          original_url?: string
          savings_percentage?: number | null
          source_id?: string
          source_table?: string
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
      navigation_menus: {
        Row: {
          created_at: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          label: Json
          menu_type: string
          order_index: number | null
          parent_id: string | null
          path: string
          target: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          label: Json
          menu_type: string
          order_index?: number | null
          parent_id?: string | null
          path: string
          target?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          label?: Json
          menu_type?: string
          order_index?: number | null
          parent_id?: string | null
          path?: string
          target?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_menus_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_menus"
            referencedColumns: ["id"]
          },
        ]
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
      portfolio_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          order_index: number | null
          portfolio_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          order_index?: number | null
          portfolio_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          order_index?: number | null
          portfolio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
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
          features: Json | null
          id: string
          json_ld: Json | null
          location: string
          main_image: string | null
          map_embed_url: string | null
          map_latitude: number | null
          map_longitude: number | null
          operation_type: string | null
          order_index: number | null
          parking_spaces: number | null
          postal_code: string | null
          price: number | null
          property_type: string | null
          region: string
          status: string | null
          tags: string[] | null
          title_de: string
          title_en: string
          title_fr: string
          title_pt: string
          updated_at: string | null
          video_url: string | null
          virtual_tour_url: string | null
        }
        Insert: {
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
          description_pt: string
          featured?: boolean | null
          features?: Json | null
          id?: string
          json_ld?: Json | null
          location: string
          main_image?: string | null
          map_embed_url?: string | null
          map_latitude?: number | null
          map_longitude?: number | null
          operation_type?: string | null
          order_index?: number | null
          parking_spaces?: number | null
          postal_code?: string | null
          price?: number | null
          property_type?: string | null
          region: string
          status?: string | null
          tags?: string[] | null
          title_de?: string
          title_en?: string
          title_fr?: string
          title_pt: string
          updated_at?: string | null
          video_url?: string | null
          virtual_tour_url?: string | null
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
          features?: Json | null
          id?: string
          json_ld?: Json | null
          location?: string
          main_image?: string | null
          map_embed_url?: string | null
          map_latitude?: number | null
          map_longitude?: number | null
          operation_type?: string | null
          order_index?: number | null
          parking_spaces?: number | null
          postal_code?: string | null
          price?: number | null
          property_type?: string | null
          region?: string
          status?: string | null
          tags?: string[] | null
          title_de?: string
          title_en?: string
          title_fr?: string
          title_pt?: string
          updated_at?: string | null
          video_url?: string | null
          virtual_tour_url?: string | null
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
          features: Json | null
          id: string
          json_ld: Json | null
          location: string
          main_image: string | null
          map_embed_url: string | null
          map_latitude: number | null
          map_longitude: number | null
          operation_type: string | null
          parking_spaces: number | null
          postal_code: string | null
          price: number | null
          property_type: string | null
          region: string
          status: string | null
          tags: string[] | null
          title_de: string
          title_en: string
          title_fr: string
          title_pt: string
          updated_at: string | null
          video_url: string | null
          virtual_tour_url: string | null
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
          features?: Json | null
          id: string
          json_ld?: Json | null
          location: string
          main_image?: string | null
          map_embed_url?: string | null
          map_latitude?: number | null
          map_longitude?: number | null
          operation_type?: string | null
          parking_spaces?: number | null
          postal_code?: string | null
          price?: number | null
          property_type?: string | null
          region: string
          status?: string | null
          tags?: string[] | null
          title_de: string
          title_en: string
          title_fr: string
          title_pt: string
          updated_at?: string | null
          video_url?: string | null
          virtual_tour_url?: string | null
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
          features?: Json | null
          id?: string
          json_ld?: Json | null
          location?: string
          main_image?: string | null
          map_embed_url?: string | null
          map_latitude?: number | null
          map_longitude?: number | null
          operation_type?: string | null
          parking_spaces?: number | null
          postal_code?: string | null
          price?: number | null
          property_type?: string | null
          region?: string
          status?: string | null
          tags?: string[] | null
          title_de?: string
          title_en?: string
          title_fr?: string
          title_pt?: string
          updated_at?: string | null
          video_url?: string | null
          virtual_tour_url?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          language: string | null
          p256dh: string
          topics: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          language?: string | null
          p256dh: string
          topics?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          language?: string | null
          p256dh?: string
          topics?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seo_config: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      seo_history: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          new_value: Json | null
          old_value: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      seo_questions: {
        Row: {
          applies_to: Json | null
          created_at: string
          description: string | null
          error_message: string | null
          field_type: Database["public"]["Enums"]["seo_field_type"]
          id: string
          is_active: boolean
          is_required: boolean
          label: string
          max_chars: number | null
          min_chars: number | null
          order_index: number
          seo_impact: Database["public"]["Enums"]["seo_impact_level"]
          stage_id: string
          success_message: string | null
          updated_at: string
          validation_regex: string | null
          weight: number
        }
        Insert: {
          applies_to?: Json | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          field_type?: Database["public"]["Enums"]["seo_field_type"]
          id?: string
          is_active?: boolean
          is_required?: boolean
          label: string
          max_chars?: number | null
          min_chars?: number | null
          order_index?: number
          seo_impact?: Database["public"]["Enums"]["seo_impact_level"]
          stage_id: string
          success_message?: string | null
          updated_at?: string
          validation_regex?: string | null
          weight?: number
        }
        Update: {
          applies_to?: Json | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          field_type?: Database["public"]["Enums"]["seo_field_type"]
          id?: string
          is_active?: boolean
          is_required?: boolean
          label?: string
          max_chars?: number | null
          min_chars?: number | null
          order_index?: number
          seo_impact?: Database["public"]["Enums"]["seo_impact_level"]
          stage_id?: string
          success_message?: string | null
          updated_at?: string
          validation_regex?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "seo_questions_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "seo_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_responses: {
        Row: {
          created_at: string
          id: string
          page_reference: string
          question_id: string
          status: Database["public"]["Enums"]["seo_response_status"]
          updated_at: string
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_reference?: string
          question_id: string
          status?: Database["public"]["Enums"]["seo_response_status"]
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          page_reference?: string
          question_id?: string
          status?: Database["public"]["Enums"]["seo_response_status"]
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "seo_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_rules: {
        Row: {
          condition_field: string
          condition_operator: Database["public"]["Enums"]["seo_rule_operator"]
          condition_value: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          order_index: number
          result_message: string
          result_status: Database["public"]["Enums"]["seo_rule_result"]
        }
        Insert: {
          condition_field: string
          condition_operator?: Database["public"]["Enums"]["seo_rule_operator"]
          condition_value?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          order_index?: number
          result_message?: string
          result_status?: Database["public"]["Enums"]["seo_rule_result"]
        }
        Update: {
          condition_field?: string
          condition_operator?: Database["public"]["Enums"]["seo_rule_operator"]
          condition_value?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
          result_message?: string
          result_status?: Database["public"]["Enums"]["seo_rule_result"]
        }
        Relationships: []
      }
      seo_stages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          importance_weight: number
          is_active: boolean
          min_completion_pct: number
          name: string
          order_index: number
          requires_previous_complete: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          importance_weight?: number
          is_active?: boolean
          min_completion_pct?: number
          name: string
          order_index?: number
          requires_previous_complete?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          importance_weight?: number
          is_active?: boolean
          min_completion_pct?: number
          name?: string
          order_index?: number
          requires_previous_complete?: boolean
          updated_at?: string
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
      storage_metrics: {
        Row: {
          average_savings_percentage: number | null
          conversions_count: number | null
          created_at: string | null
          id: string
          other_images: number
          other_storage_bytes: number | null
          recorded_at: string
          savings_bytes: number | null
          total_images: number
          total_storage_bytes: number | null
          webp_images: number
          webp_storage_bytes: number | null
        }
        Insert: {
          average_savings_percentage?: number | null
          conversions_count?: number | null
          created_at?: string | null
          id?: string
          other_images?: number
          other_storage_bytes?: number | null
          recorded_at?: string
          savings_bytes?: number | null
          total_images?: number
          total_storage_bytes?: number | null
          webp_images?: number
          webp_storage_bytes?: number | null
        }
        Update: {
          average_savings_percentage?: number | null
          conversions_count?: number | null
          created_at?: string | null
          id?: string
          other_images?: number
          other_storage_bytes?: number | null
          recorded_at?: string
          savings_bytes?: number | null
          total_images?: number
          total_storage_bytes?: number | null
          webp_images?: number
          webp_storage_bytes?: number | null
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
      log_data_access: {
        Args: {
          p_action: string
          p_details?: Json
          p_record_count?: number
          p_record_id?: string
          p_table_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "super_admin"
      seo_field_type:
        | "text"
        | "textarea"
        | "wysiwyg"
        | "toggle"
        | "upload"
        | "html_code"
        | "json_ld"
        | "number"
        | "url"
        | "domain"
        | "api_integration"
      seo_impact_level: "low" | "medium" | "high"
      seo_response_status: "complete" | "incomplete" | "critical"
      seo_rule_operator:
        | "lt"
        | "gt"
        | "eq"
        | "contains"
        | "not_exists"
        | "length_lt"
        | "length_gt"
      seo_rule_result: "needs_improvement" | "critical" | "warning"
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
      seo_field_type: [
        "text",
        "textarea",
        "wysiwyg",
        "toggle",
        "upload",
        "html_code",
        "json_ld",
        "number",
        "url",
        "domain",
        "api_integration",
      ],
      seo_impact_level: ["low", "medium", "high"],
      seo_response_status: ["complete", "incomplete", "critical"],
      seo_rule_operator: [
        "lt",
        "gt",
        "eq",
        "contains",
        "not_exists",
        "length_lt",
        "length_gt",
      ],
      seo_rule_result: ["needs_improvement", "critical", "warning"],
    },
  },
} as const
