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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cupons: {
        Row: {
          codigo: string
          comprovante_url: string | null
          created_at: string
          id: string
          max_usos: number
          nome_titular: string | null
          status: string
          usos_atuais: number
        }
        Insert: {
          codigo: string
          comprovante_url?: string | null
          created_at?: string
          id?: string
          max_usos?: number
          nome_titular?: string | null
          status?: string
          usos_atuais?: number
        }
        Update: {
          codigo?: string
          comprovante_url?: string | null
          created_at?: string
          id?: string
          max_usos?: number
          nome_titular?: string | null
          status?: string
          usos_atuais?: number
        }
        Relationships: []
      }
      eventos: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          local: string | null
          nome: string
          status: string
          tem_lote: boolean
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          local?: string | null
          nome: string
          status?: string
          tem_lote?: boolean
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          local?: string | null
          nome?: string
          status?: string
          tem_lote?: boolean
        }
        Relationships: []
      }
      inscricoes: {
        Row: {
          cidade_estado: string
          como_conheceu: string
          como_conheceu_outro: string | null
          comprovante_url: string | null
          comunidade: string
          created_at: string
          data_nascimento: string
          endereco_completo: string
          evento_id: string | null
          expectativa_oikos: string | null
          fez_retiro: string
          fez_retiro_outro: string | null
          grau_parentesco_emergencia: string
          id: string
          instagram: string
          is_catolico: string
          is_catolico_outro: string | null
          lote_especial: boolean
          lote_id: number
          nome: string
          nome_mae: string
          nome_pai: string
          nome_pessoa_emergencia: string
          numero_emergencia: string
          numero_mae: string
          numero_pai: string
          numero_responsavel_proximo: string | null
          participa_movimento: string
          status: string
          tamanho_camisa: string
          telefone: string
          titular_especial: string | null
        }
        Insert: {
          cidade_estado: string
          como_conheceu: string
          como_conheceu_outro?: string | null
          comprovante_url?: string | null
          comunidade: string
          created_at?: string
          data_nascimento: string
          endereco_completo: string
          evento_id?: string | null
          expectativa_oikos?: string | null
          fez_retiro: string
          fez_retiro_outro?: string | null
          grau_parentesco_emergencia: string
          id?: string
          instagram: string
          is_catolico: string
          is_catolico_outro?: string | null
          lote_especial?: boolean
          lote_id: number
          nome: string
          nome_mae: string
          nome_pai: string
          nome_pessoa_emergencia: string
          numero_emergencia: string
          numero_mae: string
          numero_pai: string
          numero_responsavel_proximo?: string | null
          participa_movimento: string
          status?: string
          tamanho_camisa: string
          telefone: string
          titular_especial?: string | null
        }
        Update: {
          cidade_estado?: string
          como_conheceu?: string
          como_conheceu_outro?: string | null
          comprovante_url?: string | null
          comunidade?: string
          created_at?: string
          data_nascimento?: string
          endereco_completo?: string
          evento_id?: string | null
          expectativa_oikos?: string | null
          fez_retiro?: string
          fez_retiro_outro?: string | null
          grau_parentesco_emergencia?: string
          id?: string
          instagram?: string
          is_catolico?: string
          is_catolico_outro?: string | null
          lote_especial?: boolean
          lote_id?: number
          nome?: string
          nome_mae?: string
          nome_pai?: string
          nome_pessoa_emergencia?: string
          numero_emergencia?: string
          numero_mae?: string
          numero_pai?: string
          numero_responsavel_proximo?: string | null
          participa_movimento?: string
          status?: string
          tamanho_camisa?: string
          telefone?: string
          titular_especial?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes: {
        Row: {
          created_at: string
          evento_id: string | null
          id: number
          nome: string
          ordem: number
          preco: string
          status: string
        }
        Insert: {
          created_at?: string
          evento_id?: string | null
          id?: number
          nome: string
          ordem?: number
          preco: string
          status?: string
        }
        Update: {
          created_at?: string
          evento_id?: string | null
          id?: number
          nome?: string
          ordem?: number
          preco?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lotes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
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
      validar_cupom: { Args: { _codigo: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
