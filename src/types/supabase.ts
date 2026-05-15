// Types auto-générés depuis Supabase
// Pour régénérer : npx supabase gen types typescript --project-id zfurzynkwouenfcmgnos > src/types/supabase.ts

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
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'dispatcher' | 'technicien' | 'client'
          nom: string | null
          prenom: string | null
          telephone: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      clients: {
        Row: {
          id: string
          nom: string
          email: string | null
          telephone: string | null
          siret: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      sites: {
        Row: {
          id: string
          client_id: string
          nom: string
          adresse: string
          ville: string
          code_postal: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sites']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sites']['Insert']>
      }
      missions: {
        Row: {
          id: string
          site_id: string
          client_id: string
          subscription_id: string | null
          titre: string
          description: string | null
          statut: 'draft' | 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
          date_planifiee: string | null
          date_debut: string | null
          date_fin: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['missions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['missions']['Insert']>
      }
      rapports: {
        Row: {
          id: string
          mission_id: string
          technicien_id: string
          statut: 'draft' | 'submitted' | 'signed' | 'validated'
          notes: string | null
          signature_client: string | null
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['rapports']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['rapports']['Insert']>
      }
      paiements: {
        Row: {
          id: string
          mission_id: string
          client_id: string
          montant: number
          statut: 'pending' | 'paid' | 'failed' | 'refunded'
          type: 'ponctuel' | 'recurrent'
          swan_payment_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['paiements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['paiements']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          client_id: string
          site_id: string
          template_id: string | null
          nom: string
          frequence: 'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel'
          next_intervention_at: string | null
          actif: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'admin' | 'dispatcher' | 'technicien' | 'client'
      mission_statut: 'draft' | 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
    }
  }
}
