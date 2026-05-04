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
      active_session: {
        Row: {
          device_id: string
          exam_number: number | null
          state: Json
          updated_at: string
        }
        Insert: {
          device_id: string
          exam_number?: number | null
          state: Json
          updated_at?: string
        }
        Update: {
          device_id?: string
          exam_number?: number | null
          state?: Json
          updated_at?: string
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          confidence_summary: Json
          created_at: string
          device_id: string
          domain_breakdown: Json
          duration_seconds: number
          exam_number: number | null
          id: string
          mode: string
          passed: boolean
          question_results: Json
          score_raw: number
          score_scaled: number
          score_total: number
        }
        Insert: {
          confidence_summary?: Json
          created_at?: string
          device_id: string
          domain_breakdown?: Json
          duration_seconds?: number
          exam_number?: number | null
          id?: string
          mode?: string
          passed?: boolean
          question_results?: Json
          score_raw?: number
          score_scaled?: number
          score_total?: number
        }
        Update: {
          confidence_summary?: Json
          created_at?: string
          device_id?: string
          domain_breakdown?: Json
          duration_seconds?: number
          exam_number?: number | null
          id?: string
          mode?: string
          passed?: boolean
          question_results?: Json
          score_raw?: number
          score_scaled?: number
          score_total?: number
        }
        Relationships: []
      }
      question_notes: {
        Row: {
          device_id: string
          id: string
          note: string
          question_id: string
          updated_at: string
        }
        Insert: {
          device_id: string
          id?: string
          note?: string
          question_id: string
          updated_at?: string
        }
        Update: {
          device_id?: string
          id?: string
          note?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_stats: {
        Row: {
          device_id: string
          domain: string | null
          id: string
          last_attempted_at: string
          last_result: string | null
          question_id: string
          question_type: string
          times_attempted: number
          times_correct: number
          times_failed: number
        }
        Insert: {
          device_id: string
          domain?: string | null
          id?: string
          last_attempted_at?: string
          last_result?: string | null
          question_id: string
          question_type: string
          times_attempted?: number
          times_correct?: number
          times_failed?: number
        }
        Update: {
          device_id?: string
          domain?: string | null
          id?: string
          last_attempted_at?: string
          last_result?: string | null
          question_id?: string
          question_type?: string
          times_attempted?: number
          times_correct?: number
          times_failed?: number
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          amber_threshold_seconds: number | null
          confidence_required: string | null
          daily_minutes_goal: number | null
          default_mode: string | null
          device_id: string
          font_size: string | null
          red_threshold_seconds: number | null
          reduce_motion: boolean | null
          target_exam_date: string | null
          updated_at: string
          weekly_question_target: number | null
        }
        Insert: {
          amber_threshold_seconds?: number | null
          confidence_required?: string | null
          daily_minutes_goal?: number | null
          default_mode?: string | null
          device_id: string
          font_size?: string | null
          red_threshold_seconds?: number | null
          reduce_motion?: boolean | null
          target_exam_date?: string | null
          updated_at?: string
          weekly_question_target?: number | null
        }
        Update: {
          amber_threshold_seconds?: number | null
          confidence_required?: string | null
          daily_minutes_goal?: number | null
          default_mode?: string | null
          device_id?: string
          font_size?: string | null
          red_threshold_seconds?: number | null
          reduce_motion?: boolean | null
          target_exam_date?: string | null
          updated_at?: string
          weekly_question_target?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_device_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
