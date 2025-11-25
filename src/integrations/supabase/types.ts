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
      bookings: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          messages_enabled: boolean | null
          sitter_id: string
          status: Database["public"]["Enums"]["booking_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          messages_enabled?: boolean | null
          sitter_id: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          messages_enabled?: boolean | null
          sitter_id?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_sitter_id_fkey"
            columns: ["sitter_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["user_id"]
          },
        ]
      }
      listings: {
        Row: {
          created_at: string | null
          description: string
          end_date: string
          id: string
          location: string
          owner_id: string
          pets: Json | null
          requirements: string | null
          start_date: string
          status: string | null
          tasks: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          end_date: string
          id?: string
          location: string
          owner_id: string
          pets?: Json | null
          requirements?: string | null
          start_date: string
          status?: string | null
          tasks?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          end_date?: string
          id?: string
          location?: string
          owner_id?: string
          pets?: Json | null
          requirements?: string | null
          start_date?: string
          status?: string | null
          tasks?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string
          content: string
          created_at: string | null
          id: string
          sender_id: string
        }
        Insert: {
          booking_id: string
          content: string
          created_at?: string | null
          id?: string
          sender_id: string
        }
        Update: {
          booking_id?: string
          content?: string
          created_at?: string | null
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_admin_requests: {
        Row: {
          id: string
          notes: string | null
          requested_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          animals_cared_for: string[] | null
          availability_end: string | null
          availability_flexible: boolean | null
          availability_start: string | null
          average_rating: number | null
          bedrooms_bathrooms: string | null
          bio: string | null
          certificates: string[] | null
          created_at: string | null
          document_url: string | null
          emergency_contacts: string | null
          exercise_requirements: string | null
          experience: string | null
          house_rules: string | null
          id: string
          is_paid: boolean | null
          is_verified: boolean | null
          location: string | null
          loyalty_badge: Database["public"]["Enums"]["loyalty_badge"] | null
          medication_needs: boolean | null
          name: string
          ndis_certified: boolean | null
          number_of_pets: number | null
          parking_available: boolean | null
          pet_care_instructions: string | null
          phone: string | null
          phone_consent: boolean | null
          photo_url: string | null
          preferred_contact_method: string | null
          property_features: string[] | null
          property_type: string | null
          property_types_cared_for: string[] | null
          skills: string[] | null
          updated_at: string | null
          user_id: string
          verification_date: string | null
          verified_by_admin_id: string | null
          wifi_available: boolean | null
          years_experience: string | null
        }
        Insert: {
          animals_cared_for?: string[] | null
          availability_end?: string | null
          availability_flexible?: boolean | null
          availability_start?: string | null
          average_rating?: number | null
          bedrooms_bathrooms?: string | null
          bio?: string | null
          certificates?: string[] | null
          created_at?: string | null
          document_url?: string | null
          emergency_contacts?: string | null
          exercise_requirements?: string | null
          experience?: string | null
          house_rules?: string | null
          id?: string
          is_paid?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          loyalty_badge?: Database["public"]["Enums"]["loyalty_badge"] | null
          medication_needs?: boolean | null
          name: string
          ndis_certified?: boolean | null
          number_of_pets?: number | null
          parking_available?: boolean | null
          pet_care_instructions?: string | null
          phone?: string | null
          phone_consent?: boolean | null
          photo_url?: string | null
          preferred_contact_method?: string | null
          property_features?: string[] | null
          property_type?: string | null
          property_types_cared_for?: string[] | null
          skills?: string[] | null
          updated_at?: string | null
          user_id: string
          verification_date?: string | null
          verified_by_admin_id?: string | null
          wifi_available?: boolean | null
          years_experience?: string | null
        }
        Update: {
          animals_cared_for?: string[] | null
          availability_end?: string | null
          availability_flexible?: boolean | null
          availability_start?: string | null
          average_rating?: number | null
          bedrooms_bathrooms?: string | null
          bio?: string | null
          certificates?: string[] | null
          created_at?: string | null
          document_url?: string | null
          emergency_contacts?: string | null
          exercise_requirements?: string | null
          experience?: string | null
          house_rules?: string | null
          id?: string
          is_paid?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          loyalty_badge?: Database["public"]["Enums"]["loyalty_badge"] | null
          medication_needs?: boolean | null
          name?: string
          ndis_certified?: boolean | null
          number_of_pets?: number | null
          parking_available?: boolean | null
          pet_care_instructions?: string | null
          phone?: string | null
          phone_consent?: boolean | null
          photo_url?: string | null
          preferred_contact_method?: string | null
          property_features?: string[] | null
          property_type?: string | null
          property_types_cared_for?: string[] | null
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string
          verification_date?: string | null
          verified_by_admin_id?: string | null
          wifi_available?: boolean | null
          years_experience?: string | null
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
      verification_logs: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          method: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public: {
        Row: {
          bio: string | null
          certificates: string[] | null
          created_at: string | null
          experience: string | null
          id: string | null
          is_verified: boolean | null
          loyalty_badge: Database["public"]["Enums"]["loyalty_badge"] | null
          name: string | null
          ndis_certified: boolean | null
          phone: string | null
          photo_url: string | null
          skills: string[] | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          certificates?: string[] | null
          created_at?: string | null
          experience?: string | null
          id?: string | null
          is_verified?: boolean | null
          loyalty_badge?: Database["public"]["Enums"]["loyalty_badge"] | null
          name?: string | null
          ndis_certified?: boolean | null
          phone?: never
          photo_url?: string | null
          skills?: string[] | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          certificates?: string[] | null
          created_at?: string | null
          experience?: string | null
          id?: string | null
          is_verified?: boolean | null
          loyalty_badge?: Database["public"]["Enums"]["loyalty_badge"] | null
          name?: string | null
          ndis_certified?: boolean | null
          phone?: never
          photo_url?: string | null
          skills?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_admin_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      get_profile_with_privacy: {
        Args: { profile_user_id: string }
        Returns: {
          bio: string
          certificates: string[]
          created_at: string
          document_url: string
          emergency_contacts: string
          experience: string
          id: string
          is_paid: boolean
          is_verified: boolean
          location: string
          loyalty_badge: Database["public"]["Enums"]["loyalty_badge"]
          medication_needs: boolean
          name: string
          ndis_certified: boolean
          phone: string
          phone_consent: boolean
          photo_url: string
          skills: string[]
          updated_at: string
          user_id: string
          verification_date: string
          verified_by_admin_id: string
        }[]
      }
      get_safe_profile: {
        Args: { profile_user_id: string }
        Returns: {
          average_rating: number
          bio: string
          certificates: string[]
          experience: string
          id: string
          is_verified: boolean
          loyalty_badge: Database["public"]["Enums"]["loyalty_badge"]
          name: string
          ndis_certified: boolean
          photo_url: string
          skills: string[]
          user_id: string
        }[]
      }
      get_user_roles_with_names: {
        Args: never
        Returns: {
          created_at: string
          id: string
          is_paid: boolean
          is_verified: boolean
          name: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reject_admin_request: {
        Args: { rejection_notes?: string; request_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "homeowner" | "sitter"
      booking_status: "pending" | "accepted" | "completed" | "cancelled"
      loyalty_badge: "bronze" | "silver" | "gold"
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
      app_role: ["admin", "homeowner", "sitter"],
      booking_status: ["pending", "accepted", "completed", "cancelled"],
      loyalty_badge: ["bronze", "silver", "gold"],
    },
  },
} as const
