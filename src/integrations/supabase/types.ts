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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      certificate_verifications: {
        Row: {
          browser: string | null
          certificate_number: string
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          ip: string | null
          os: string | null
          region: string | null
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          certificate_number: string
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip?: string | null
          os?: string | null
          region?: string | null
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          certificate_number?: string
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip?: string | null
          os?: string | null
          region?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          birth_country: string
          birth_date: string
          certificate_number: string
          completed: boolean
          created_at: string
          email: string | null
          email_send_count: number | null
          email_sent: boolean
          exam_date: string
          exam_level: string
          examiner_1: string | null
          examiner_2: string | null
          first_name: string
          id: string
          last_name: string
          owner_id: string | null
          points_hoeren_lesen: number | null
          points_schreiben: number | null
          points_sprechen: number | null
          points_werte: number | null
          result: string
          signed_at: string | null
          updated_at: string
        }
        Insert: {
          birth_country: string
          birth_date: string
          certificate_number: string
          completed?: boolean
          created_at?: string
          email?: string | null
          email_send_count?: number | null
          email_sent?: boolean
          exam_date: string
          exam_level?: string
          examiner_1?: string | null
          examiner_2?: string | null
          first_name: string
          id?: string
          last_name: string
          owner_id?: string | null
          points_hoeren_lesen?: number | null
          points_schreiben?: number | null
          points_sprechen?: number | null
          points_werte?: number | null
          result?: string
          signed_at?: string | null
          updated_at?: string
        }
        Update: {
          birth_country?: string
          birth_date?: string
          certificate_number?: string
          completed?: boolean
          created_at?: string
          email?: string | null
          email_send_count?: number | null
          email_sent?: boolean
          exam_date?: string
          exam_level?: string
          examiner_1?: string | null
          examiner_2?: string | null
          first_name?: string
          id?: string
          last_name?: string
          owner_id?: string | null
          points_hoeren_lesen?: number | null
          points_schreiben?: number | null
          points_sprechen?: number | null
          points_werte?: number | null
          result?: string
          signed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          maintenance_enabled: boolean
          maintenance_message: string
          maintenance_title: string
          updated_at: string
        }
        Insert: {
          id?: number
          maintenance_enabled?: boolean
          maintenance_message?: string
          maintenance_title?: string
          updated_at?: string
        }
        Update: {
          id?: number
          maintenance_enabled?: boolean
          maintenance_message?: string
          maintenance_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      get_certificate_by_number: {
        Args: { _number: string }
        Returns: {
          birth_country: string
          birth_date: string
          certificate_number: string
          completed: boolean
          created_at: string
          email: string | null
          email_send_count: number | null
          email_sent: boolean
          exam_date: string
          exam_level: string
          examiner_1: string | null
          examiner_2: string | null
          first_name: string
          id: string
          last_name: string
          owner_id: string | null
          points_hoeren_lesen: number | null
          points_schreiben: number | null
          points_sprechen: number | null
          points_werte: number | null
          result: string
          signed_at: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "certificates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
