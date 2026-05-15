'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

type StatutMission = 'draft' | 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'

interface MissionRow {
  id: string
  status: StatutMission
  type_travaux: string
  sites: { address: string; city: string } | null
  mission_techniciens: { technicien_id: string; users: { full_name: string } | null }[]
}

interface TechnicienSurTerrain {
  id: string
  nom: string
  initiales: string
  adresse: string
  statut: 'en_mission' | 'bloque' | 'en_route' | 'disponible'
  progression: number
  info: string
  couleur: string
}

interface StatsDashboard {
  techniciens_actifs: number
  alertes: number
  missions_en_cours: number
  a_planifier: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initiales(fullName: string) {
  return fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const COULEURS = ['bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600']

function badgeStatut(statut: TechnicienSurTerrain['statut']) {
  switch (statut) {
    case 'en_mission':  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">En mission</span>
    case 'bloque':      return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Bloqué</span>
    case 'en_route':    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">En route</span>
    case 'disponible':  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Disponible</span>
  }
}

function couleurBarre(statut: TechnicienSurTerrain['statut']) {
  switch (statut) {
    case 'en_mission': return 'bg-emerald-500'
    case 'bloque':     return 'bg-orange-400'
    case 'en_route':   return 'bg-sky-400'
    default:           return 'bg-slate-300'
  }
}

function statutToTerrain(status: StatutMission): TechnicienSurTerrain['statut'] {
  switch (status) {
    case 'in_progress': return 'en_mission'
    case 'assigned':    return 'en_route'
    default:            return 'disponible'
  }
}

// ─── Composants ───────────────────────────────────────────────────────────────

function StatCard({ valeur, label, accent = false }: { valeur: number; label: string; accent?: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p className={`text-2xl font-bold ${accent ? 'text-orange-500' : 'text-slate-900'}`}>{valeur}</p>
      <p className="text-xs text-slate-500 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}

function CarteTechnicien({ tech }: { tech: TechnicienSurTerrain }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${tech.couleur} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
          {tech.initiales}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-900 text-sm truncate">{tech.nom}</p>
            {badgeStatut(tech.statut)}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {tech.adresse}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400">{tech.progression}%</span>
          <span className="text-xs font-medium text-slate-600">{tech.info}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${couleurBarre(tech.statut)}`} style={{ width: `${tech.progression}%` }} />
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function DispatchPage() {
  const [stats, setStats] = useState<StatsDashboard>({ techniciens_actifs: 0, alertes: 0, missions_en_cours: 0, a_planifier: 0 })
  const [techniciens, setTechniciens] = useState<TechnicienSurTerrain[]>([])
  const [loading, setLoading] = useState(true)

  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { data: rawMissions } = await supabase
          .from('missions')
          .select(`
            id, status, type_travaux,
            sites(address, city),
            mission_techniciens(
              technicien_id,
              users(full_name)
            )
          `)
          .gte('scheduled_at', today.toISOString())
          .lt('scheduled_at', new Date(today.getTime() + 86400000).toISOString())
          .neq('status', 'cancelled')

        const missions = rawMissions as MissionRow[] | null

        if (missions) {
          const enCours    = missions.filter((m) => m.status === 'in_progress').length
          const aPlanifier = missions.filter((m) => m.status === 'draft' || m.status === 'pending').length

          const techMap = new Map<string, TechnicienSurTerrain>()
          missions.forEach((m, idx) => {
            m.mission_techniciens?.forEach((mt) => {
              if (mt.users && !techMap.has(mt.technicien_id)) {
                const nomComplet = mt.users.full_name
                const site = m.sites
                techMap.set(mt.technicien_id, {
                  id: mt.technicien_id,
                  nom: nomComplet,
                  initiales: initiales(nomComplet),
                  adresse: site ? `${site.address}, ${site.city}` : '',
                  statut: statutToTerrain(m.status),
                  progression: m.status === 'in_progress' ? 50 : m.status === 'assigned' ? 0 : 100,
                  info: m.status === 'in_progress' ? 'En cours' : m.status === 'assigned' ? 'En route' : 'Terminé',
                  couleur: COULEURS[idx % COULEURS.length],
                })
              }
            })
          })

          setStats({ techniciens_actifs: techMap.size, alertes: 0, missions_en_cours: enCours, a_planifier: aPlanifier })
          setTechniciens(Array.from(techMap.values()))
        }
      } catch (err) {
        console.error('Erreur chargement dispatch:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-xl">⚡</span>
            <span className="font-bold text-lg tracking-tight">installe.com</span>
          </div>
          <span className="text-slate-400 text-sm capitalize">{date}</span>
        </div>
        <h1 className="text-2xl font-bold mt-4">Dispatch — Aujourd&apos;hui</h1>
      </header>

      <main className="flex-1 px-4 py-5 space-y-6 bg-slate-50">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard valeur={stats.techniciens_actifs} label="Techniciens actifs" />
              <StatCard valeur={stats.alertes} label="Alertes terrain" accent />
              <StatCard valeur={stats.missions_en_cours} label="Missions en cours" />
              <StatCard valeur={stats.a_planifier} label="À planifier" />
            </div>

            {techniciens.length > 0 ? (
              <section>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Techniciens sur le terrain</h2>
                <div className="space-y-3">
                  {techniciens.map((tech) => <CarteTechnicien key={tech.id} tech={tech} />)}
                </div>
              </section>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <p className="text-slate-400 text-sm">Aucune mission planifiée aujourd&apos;hui</p>
                <p className="text-slate-300 text-xs mt-1">Créez une nouvelle mission pour commencer</p>
              </div>
            )}
          </>
        )}
      </main>

      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-4 space-y-2">
        <a href="/nouvelle-mission" className="w-full bg-slate-900 text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle mission
        </a>
        <button className="w-full bg-slate-100 text-slate-700 rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Voir le planning semaine
        </button>
      </div>
    </div>
  )
}
