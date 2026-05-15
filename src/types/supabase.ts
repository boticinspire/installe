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
      avis: {
        Row: {
          auteur_nom: string
          commentaire: string | null
          created_at: string
          id: string
          mission_id: string | null
          note: number
          profile_id: string
          verifie: boolean
        }
        Insert: {
          auteur_nom: string
          commentaire?: string | null
          created_at?: string
          id?: string
          mission_id?: string | null
          note: number
          profile_id: string
          verifie?: boolean
        }
        Update: {
          auteur_nom?: string
          commentaire?: string | null
          created_at?: string
          id?: string
          mission_id?: string | null
          note?: number
          profile_id?: string
          verifie?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "avis_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avis_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          id: string
          label: string
          mission_id: string
          template_id: string | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          id?: string
          label: string
          mission_id: string
          template_id?: string | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          id?: string
          label?: string
          mission_id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          id: string
          label: string
          metier: string
          ordre: number
          required: boolean
        }
        Insert: {
          id?: string
          label: string
          metier: string
          ordre?: number
          required?: boolean
        }
        Update: {
          id?: string
          label?: string
          metier?: string
          ordre?: number
          required?: boolean
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          organization_id: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_slots: {
        Row: {
          actif: boolean
          created_at: string
          debut_at: string
          fin_at: string | null
          id: string
          metier_id: string | null
          position: number
          prix_mensuel: number
          profile_id: string
          zone_label: string | null
        }
        Insert: {
          actif?: boolean
          created_at?: string
          debut_at?: string
          fin_at?: string | null
          id?: string
          metier_id?: string | null
          position?: number
          prix_mensuel: number
          profile_id: string
          zone_label?: string | null
        }
        Update: {
          actif?: boolean
          created_at?: string
          debut_at?: string
          fin_at?: string | null
          id?: string
          metier_id?: string | null
          position?: number
          prix_mensuel?: number
          profile_id?: string
          zone_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_slots_metier_id_fkey"
            columns: ["metier_id"]
            isOneToOne: false
            referencedRelation: "metiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_slots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      intervention_parts: {
        Row: {
          added_by: string | null
          created_at: string
          id: string
          label: string
          mission_id: string
          quantity: number
          reference: string | null
          unit: string | null
          unit_price: number | null
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          id?: string
          label: string
          mission_id: string
          quantity?: number
          reference?: string | null
          unit?: string | null
          unit_price?: number | null
        }
        Update: {
          added_by?: string | null
          created_at?: string
          id?: string
          label?: string
          mission_id?: string
          quantity?: number
          reference?: string | null
          unit?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "intervention_parts_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intervention_parts_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_responses: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          message: string | null
          montant_estime: number | null
          profile_id: string
          statut: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          message?: string | null
          montant_estime?: number | null
          profile_id: string
          statut?: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          message?: string | null
          montant_estime?: number | null
          profile_id?: string
          statut?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_responses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_responses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          adresse: string
          code_postal: string
          contact_email: string
          contact_nom: string
          contact_tel: string | null
          created_at: string
          description: string
          expire_at: string
          id: string
          latitude: number | null
          longitude: number | null
          metier_id: string | null
          statut: string
          urgence: string
          ville: string
        }
        Insert: {
          adresse: string
          code_postal: string
          contact_email: string
          contact_nom: string
          contact_tel?: string | null
          created_at?: string
          description: string
          expire_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metier_id?: string | null
          statut?: string
          urgence?: string
          ville: string
        }
        Update: {
          adresse?: string
          code_postal?: string
          contact_email?: string
          contact_nom?: string
          contact_tel?: string | null
          created_at?: string
          description?: string
          expire_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metier_id?: string | null
          statut?: string
          urgence?: string
          ville?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_metier_id_fkey"
            columns: ["metier_id"]
            isOneToOne: false
            referencedRelation: "metiers"
            referencedColumns: ["id"]
          },
        ]
      }
      metiers: {
        Row: {
          actif: boolean
          icone: string | null
          id: string
          label: string
          slug: string
        }
        Insert: {
          actif?: boolean
          icone?: string | null
          id?: string
          label: string
          slug: string
        }
        Update: {
          actif?: boolean
          icone?: string | null
          id?: string
          label?: string
          slug?: string
        }
        Relationships: []
      }
      mission_logs: {
        Row: {
          changed_by: string | null
          comment: string | null
          created_at: string
          id: string
          mission_id: string
          new_status: string
          old_status: string | null
        }
        Insert: {
          changed_by?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          mission_id: string
          new_status: string
          old_status?: string | null
        }
        Update: {
          changed_by?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          mission_id?: string
          new_status?: string
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_logs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_techniciens: {
        Row: {
          accepted_at: string | null
          assigned_at: string
          id: string
          mission_id: string
          status: string
          technicien_id: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string
          id?: string
          mission_id: string
          status?: string
          technicien_id: string
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string
          id?: string
          mission_id?: string
          status?: string
          technicien_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_techniciens_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_techniciens_technicien_id_fkey"
            columns: ["technicien_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          organization_id: string | null
          priority: string
          scheduled_at: string | null
          site_id: string | null
          status: string
          subscription_id: string | null
          type_travaux: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          priority?: string
          scheduled_at?: string | null
          site_id?: string | null
          status?: string
          subscription_id?: string | null
          type_travaux: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          priority?: string
          scheduled_at?: string | null
          site_id?: string | null
          status?: string
          subscription_id?: string | null
          type_travaux?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          actif: boolean
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          nom: string
          plan_id: string | null
          siret: string | null
          slug: string
          telephone: string | null
          updated_at: string
        }
        Insert: {
          actif?: boolean
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          nom: string
          plan_id?: string | null
          siret?: string | null
          slug: string
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          actif?: boolean
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          nom?: string
          plan_id?: string | null
          siret?: string | null
          slug?: string
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "saas_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      paiements: {
        Row: {
          created_at: string
          devise: string
          id: string
          mission_id: string
          montant: number
          organization_id: string | null
          paid_at: string | null
          qr_code_url: string | null
          rapport_id: string | null
          statut: string
          subscription_id: string | null
          swan_transfer_id: string | null
        }
        Insert: {
          created_at?: string
          devise?: string
          id?: string
          mission_id: string
          montant: number
          organization_id?: string | null
          paid_at?: string | null
          qr_code_url?: string | null
          rapport_id?: string | null
          statut?: string
          subscription_id?: string | null
          swan_transfer_id?: string | null
        }
        Update: {
          created_at?: string
          devise?: string
          id?: string
          mission_id?: string
          montant?: number
          organization_id?: string | null
          paid_at?: string | null
          qr_code_url?: string | null
          rapport_id?: string | null
          statut?: string
          subscription_id?: string | null
          swan_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paiements_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paiements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paiements_rapport_id_fkey"
            columns: ["rapport_id"]
            isOneToOne: false
            referencedRelation: "rapports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paiements_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          mission_id: string
          storage_path: string
          taken_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          mission_id: string
          storage_path: string
          taken_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          mission_id?: string
          storage_path?: string
          taken_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_metiers: {
        Row: {
          metier_id: string
          profile_id: string
        }
        Insert: {
          metier_id: string
          profile_id: string
        }
        Update: {
          metier_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_metiers_metier_id_fkey"
            columns: ["metier_id"]
            isOneToOne: false
            referencedRelation: "metiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_metiers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_publics: {
        Row: {
          actif: boolean
          annee_creation: number | null
          certifications: string[] | null
          created_at: string
          description: string | null
          email_public: string | null
          featured: boolean
          id: string
          nb_avis: number
          nb_missions: number
          nom_affiche: string
          note_moyenne: number | null
          organization_id: string | null
          photo_url: string | null
          site_web: string | null
          slug: string
          telephone_public: string | null
          updated_at: string
          user_id: string | null
          verifie: boolean
        }
        Insert: {
          actif?: boolean
          annee_creation?: number | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          email_public?: string | null
          featured?: boolean
          id?: string
          nb_avis?: number
          nb_missions?: number
          nom_affiche: string
          note_moyenne?: number | null
          organization_id?: string | null
          photo_url?: string | null
          site_web?: string | null
          slug: string
          telephone_public?: string | null
          updated_at?: string
          user_id?: string | null
          verifie?: boolean
        }
        Update: {
          actif?: boolean
          annee_creation?: number | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          email_public?: string | null
          featured?: boolean
          id?: string
          nb_avis?: number
          nb_missions?: number
          nom_affiche?: string
          note_moyenne?: number | null
          organization_id?: string | null
          photo_url?: string | null
          site_web?: string | null
          slug?: string
          telephone_public?: string | null
          updated_at?: string
          user_id?: string | null
          verifie?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_publics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rapports: {
        Row: {
          generated_at: string
          generated_by: string | null
          id: string
          mission_id: string
          organization_id: string | null
          pdf_url: string | null
          signature_url: string | null
          status: string
        }
        Insert: {
          generated_at?: string
          generated_by?: string | null
          id?: string
          mission_id: string
          organization_id?: string | null
          pdf_url?: string | null
          signature_url?: string | null
          status?: string
        }
        Update: {
          generated_at?: string
          generated_by?: string | null
          id?: string
          mission_id?: string
          organization_id?: string | null
          pdf_url?: string | null
          signature_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rapports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapports_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_plans: {
        Row: {
          actif: boolean
          created_at: string
          features: Json
          id: string
          limite_missions_mois: number | null
          limite_techniciens: number | null
          nom: string
          prix_mensuel: number
        }
        Insert: {
          actif?: boolean
          created_at?: string
          features?: Json
          id?: string
          limite_missions_mois?: number | null
          limite_techniciens?: number | null
          nom: string
          prix_mensuel?: number
        }
        Update: {
          actif?: boolean
          created_at?: string
          features?: Json
          id?: string
          limite_missions_mois?: number | null
          limite_techniciens?: number | null
          nom?: string
          prix_mensuel?: number
        }
        Relationships: []
      }
      saas_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string
          plan_id: string
          statut: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id: string
          plan_id: string
          statut?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string
          plan_id?: string
          statut?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "saas_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          address: string
          city: string
          client_id: string
          country: string
          created_at: string
          id: string
          label: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          organization_id: string | null
          postal_code: string | null
        }
        Insert: {
          address: string
          city: string
          client_id: string
          country?: string
          created_at?: string
          id?: string
          label: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          organization_id?: string | null
          postal_code?: string | null
        }
        Update: {
          address?: string
          city?: string
          client_id?: string
          country?: string
          created_at?: string
          id?: string
          label?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          organization_id?: string | null
          postal_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_templates: {
        Row: {
          created_at: string
          description: string | null
          devise: string
          frequency: string
          id: string
          metier: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          devise?: string
          frequency: string
          id?: string
          metier: string
          name: string
          price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          devise?: string
          frequency?: string
          id?: string
          metier?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          devise: string
          ended_at: string | null
          frequency: string
          id: string
          metier: string
          name: string
          next_intervention_at: string | null
          notes: string | null
          organization_id: string | null
          price: number
          site_id: string | null
          started_at: string
          status: string
          template_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          devise?: string
          ended_at?: string | null
          frequency: string
          id?: string
          metier: string
          name: string
          next_intervention_at?: string | null
          notes?: string | null
          organization_id?: string | null
          price: number
          site_id?: string | null
          started_at: string
          status?: string
          template_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          devise?: string
          ended_at?: string | null
          frequency?: string
          id?: string
          metier?: string
          name?: string
          next_intervention_at?: string | null
          notes?: string | null
          organization_id?: string | null
          price?: number
          site_id?: string | null
          started_at?: string
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "subscription_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          role: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      zones_intervention: {
        Row: {
          created_at: string
          id: string
          label: string
          latitude: number | null
          longitude: number | null
          profile_id: string
          rayon_km: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          latitude?: number | null
          longitude?: number | null
          profile_id: string
          rayon_km?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          latitude?: number | null
          longitude?: number | null
          profile_id?: string
          rayon_km?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "zones_intervention_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_publics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      org_role: "owner" | "admin" | "member"
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
      org_role: ["owner", "admin", "member"],
    },
  },
} as const
