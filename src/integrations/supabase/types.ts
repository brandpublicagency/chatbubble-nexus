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
      bonlife_knowledge: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          search_vector: unknown | null
          tags: string[] | null
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          search_vector?: unknown | null
          tags?: string[] | null
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          search_vector?: unknown | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      bot_messages: {
        Row: {
          created_at: string
          id: number
          text: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          text?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          text?: string | null
          type?: string | null
        }
        Relationships: []
      }
      confirmed: {
        Row: {
          agent_full_name: string | null
          agent_name: string | null
          agent_surname: string | null
          arrears_amount: number | null
          beneficiary_id_number: string | null
          beneficiary_mobile: string | null
          beneficiary_name: string | null
          beneficiary_surname: string | null
          contact_number: string | null
          custom_policy_number: string | null
          debitorder_payment_day: number | null
          dob: string | null
          full_name: string | null
          id_number: string | null
          inception_date: string | null
          last_paid_date: string | null
          loyalty_card: string | null
          mobile: string | null
          name: string | null
          payment_method: string | null
          policy_id: number | null
          policy_number: string
          policy_premium: number | null
          product_name: string | null
          status: string | null
          surname: string | null
        }
        Insert: {
          agent_full_name?: string | null
          agent_name?: string | null
          agent_surname?: string | null
          arrears_amount?: number | null
          beneficiary_id_number?: string | null
          beneficiary_mobile?: string | null
          beneficiary_name?: string | null
          beneficiary_surname?: string | null
          contact_number?: string | null
          custom_policy_number?: string | null
          debitorder_payment_day?: number | null
          dob?: string | null
          full_name?: string | null
          id_number?: string | null
          inception_date?: string | null
          last_paid_date?: string | null
          loyalty_card?: string | null
          mobile?: string | null
          name?: string | null
          payment_method?: string | null
          policy_id?: number | null
          policy_number: string
          policy_premium?: number | null
          product_name?: string | null
          status?: string | null
          surname?: string | null
        }
        Update: {
          agent_full_name?: string | null
          agent_name?: string | null
          agent_surname?: string | null
          arrears_amount?: number | null
          beneficiary_id_number?: string | null
          beneficiary_mobile?: string | null
          beneficiary_name?: string | null
          beneficiary_surname?: string | null
          contact_number?: string | null
          custom_policy_number?: string | null
          debitorder_payment_day?: number | null
          dob?: string | null
          full_name?: string | null
          id_number?: string | null
          inception_date?: string | null
          last_paid_date?: string | null
          loyalty_card?: string | null
          mobile?: string | null
          name?: string | null
          payment_method?: string | null
          policy_id?: number | null
          policy_number?: string
          policy_premium?: number | null
          product_name?: string | null
          status?: string | null
          surname?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          wa_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          wa_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          wa_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          contact_id: string | null
          created_at: string
          id: string
          meta_id: string | null
          options: Json | null
          sender_id: number | null
          text: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          id?: string
          meta_id?: string | null
          options?: Json | null
          sender_id?: number | null
          text?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          id?: string
          meta_id?: string | null
          options?: Json | null
          sender_id?: number | null
          text?: string | null
        }
        Relationships: []
      }
      knowledge_base_articles: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          language: string | null
          search_vector: unknown | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          language?: string | null
          search_vector?: unknown | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          language?: string | null
          search_vector?: unknown | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_documents: {
        Row: {
          article_id: string | null
          content_type: string
          created_at: string | null
          extracted_text: string | null
          file_path: string
          filename: string
          id: string
          updated_at: string | null
        }
        Insert: {
          article_id?: string | null
          content_type: string
          created_at?: string | null
          extracted_text?: string | null
          file_path: string
          filename: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          article_id?: string | null
          content_type?: string
          created_at?: string | null
          extracted_text?: string | null
          file_path?: string
          filename?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          contact_id: string | null
          created_at: string | null
          id: string
          text: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          text?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      support_agents: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string
          metadata: Json | null
          sender_type: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type: string
          metadata?: Json | null
          sender_type: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          sender_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "support_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_sessions: {
        Row: {
          assigned_agent_id: string | null
          contact_id: string
          ended_at: string | null
          id: string
          resolution_notes: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          assigned_agent_id?: string | null
          contact_id: string
          ended_at?: string | null
          id?: string
          resolution_notes?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          assigned_agent_id?: string | null
          contact_id?: string
          ended_at?: string | null
          id?: string
          resolution_notes?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_sessions_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "support_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_sessions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          answer: string | null
          contact_id: string
          created_at: string
          entity: string
          id: string
          question: string
          question_key: string | null
          session_id: number
        }
        Insert: {
          answer?: string | null
          contact_id: string
          created_at?: string
          entity: string
          id?: string
          question: string
          question_key?: string | null
          session_id: number
        }
        Update: {
          answer?: string | null
          contact_id?: string
          created_at?: string
          entity?: string
          id?: string
          question?: string
          question_key?: string | null
          session_id?: number
        }
        Relationships: []
      }
      whatsapp_flows: {
        Row: {
          connections: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          nodes: Json
          updated_at: string | null
        }
        Insert: {
          connections?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          nodes?: Json
          updated_at?: string | null
        }
        Update: {
          connections?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          nodes?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_form_responses: {
        Row: {
          completed: boolean | null
          contact_id: string | null
          created_at: string | null
          flow_id: string | null
          id: string
          responses: Json
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          contact_id?: string | null
          created_at?: string | null
          flow_id?: string | null
          id?: string
          responses?: Json
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          contact_id?: string | null
          created_at?: string | null
          flow_id?: string | null
          id?: string
          responses?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_form_responses_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_form_responses_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          category: string
          components: Json
          created_at: string | null
          id: string
          language: string
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          category: string
          components: Json
          created_at?: string | null
          id?: string
          language?: string
          name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          components?: Json
          created_at?: string | null
          id?: string
          language?: string
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_latest_messages: {
        Args: Record<PropertyKey, never>
        Returns: {
          contact_id: string
          latest_message: string
          created_at: string
        }[]
      }
      search_bonlife_knowledge: {
        Args: {
          search_query: string
        }
        Returns: {
          id: string
          title: string
          content: string
          category: string
          tags: string[]
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
