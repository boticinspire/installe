'use client'

export const dynamic = 'force-dynamic'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Mission {
  id: string
  titre: string
  statut: string
  date_planifiee: string | null
  description: string | null
  sites: { adresse: string; ville: string } | null
  clients: { nom: string } | null
  mission_techniciens: { statut_acceptation: string }[]
}

interface EtapeJournee {
  id: string
  titre: string
  horaire: string
  statut: 'termine' | 'en_cours' | 'a_venir'
  detail: string
}

// ─── Composants ───────────────────────────────────────────────────────────────

function IndicateurEtape({ statut }: { statut: EtapeJournee['statut'] }) {
  if (statut === 'termine') return (
    <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-1">
      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
      </svg>
    </div>
  )
  if (statut === 'en_cours') return <div className="w-3 h-3 rounded-full bg-amber-400 shrink-0 mt-1"/>
  return <div className="w-3 h-3 rounded-full bg-slate-200 shrink-0 mt-1"/>
}

function NavItem({ icon, label, actif = false }: { icon: React.ReactNode; label: string; actif?: boolean }) {
  return (
    <button className="flex flex-col items-center gap-1">
      <span className={actif ? 'text-blue-600' : 'text-slate-400'}>{icon}</span>
      <span className={`text-[10px] font-medium ${actif ? 'text-blue-600' : 'text-slate-400'}`}>{label}</span>
    </button>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function TechnicienPage() {
  const [user, setUser] = useState<{ nom: string; prenom: string } | null>(null)
  const [missions, setMissions] = useState<Mission[]>([])
  const [missionActive, setMissionActive] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [reponse, setReponse] = useState<'accepte' | 'refuse' | null>(null)

  const db = createClient() as any

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await db.auth.getUser()
      if (!authUser) return

      // Profil utilisateur
      const { data: profil } = await db
        .from('users')
        .select('nom, prenom')
        .eq('id', authUser.id)
        .single()
      setUser(profil as { nom: string; prenom: string } | null)

      // Missions du jour assignées à ce technicien
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: ms } = await db
        .from('missions')
        .select(`
          id, titre, statut, date_planifiee, description,
          sites(adresse, ville),
          clients(nom),
          mission_techniciens!inner(statut_acceptation)
        `)
        .eq('mission_techniciens.user_id', authUser.id)
        .gte('date_planifiee', today.toISOString())
        .lt('date_planifiee', new Date(today.getTime() + 86400000).toISOString())
        .order('date_planifiee')

      const missionsData = (ms ?? []) as unknown as Mission[]
      setMissions(missionsData)

      // Mission active = la première en statut assigned ou in_progress avec acceptation pending
      const active = missionsData.find((m) =>
        ['assigned', 'in_progress'].includes(m.statut) &&
        m.mission_techniciens[0]?.statut_acceptation === 'pending'
      )
      setMissionActive(active ?? null)
      setLoading(false)
    }
    load()
  }, [])

  async function handleReponse(accepte: boolean) {
    if (!missionActive) return
    setActionLoading(true)

    const { data: { user: authUser } } = await db.auth.getUser()
    if (!authUser) return

    await db
      .from('mission_techniciens')
      .update({ statut_acceptation: accepte ? 'accepte' : 'refuse' })
      .eq('mission_id', missionActive.id)
      .eq('user_id', authUser.id)

    if (accepte) {
      await db
        .from('missions')
        .update({ statut: 'in_progress' })
        .eq('id', missionActive.id)
    }

    setReponse(accepte ? 'accepte' : 'refuse')
    setActionLoading(false)
  }

  // Construire les étapes de la journée
  const etapes: EtapeJournee[] = missions.map((m, i) => {
    const heure = m.date_planifiee
      ? new Date(m.date_planifiee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : '—'
    let statut: EtapeJournee['statut'] = 'a_venir'
    if (m.statut === 'completed') statut = 'termine'
    else if (m.statut === 'in_progress') statut = 'en_cours'
    return {
      id: m.id,
      titre: m.titre,
      horaire: heure,
      statut,
      detail: m.statut === 'completed' ? 'Terminé · Rapport envoyé' : m.statut === 'in_progress' ? 'En cours' : 'À venir',
    }
  })

  const nomAffiche = user ? `${user.prenom} ${user.nom}` : '…'

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-xl">⚡</span>
            <span className="font-bold text-lg tracking-tight">installe.com</span>
          </div>
          <span className="text-slate-300 text-sm font-medium">{nomAffiche}</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4 pb-28">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : (
          <>
            {/* Notification mission active */}
            {missionActive && reponse === null && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
                <span className="text-blue-500 mt-0.5">🔔</span>
                <p className="text-sm text-blue-800 leading-snug">
                  Nouvelle mission assignée — <span className="font-semibold">
                    {missionActive.date_planifiee
                      ? new Date(missionActive.date_planifiee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </span>
                </p>
              </div>
            )}

            {/* Feedback réponse */}
            {reponse === 'accepte' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-center">
                <p className="text-emerald-700 font-semibold text-sm">✅ Mission acceptée — bonne intervention !</p>
              </div>
            )}
            {reponse === 'refuse' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-center">
                <p className="text-red-700 font-semibold text-sm">❌ Indisponibilité signalée au secrétariat</p>
              </div>
            )}

            {/* Carte mission active */}
            {missionActive && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <p className="font-semibold text-slate-900 text-sm">
                        {missionActive.sites ? `${missionActive.sites.adresse}, ${missionActive.sites.ville}` : missionActive.titre}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 shrink-0">Urgent</span>
                  </div>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {[
                    { label: 'Client', val: missionActive.clients?.nom ?? '—' },
                    { label: 'Travaux', val: missionActive.titre },
                    { label: 'Heure', val: missionActive.date_planifiee
                        ? new Date(missionActive.date_planifiee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                        : '—' },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center">
                      <span className="text-xs text-slate-400 w-20 shrink-0">{label}</span>
                      <span className="text-sm text-slate-700 font-medium flex-1 bg-slate-50 rounded-lg px-3 py-1.5">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progression journée */}
            {etapes.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm px-4 pt-4 pb-2">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  Progression de la journée
                </h2>
                {etapes.map((e, i) => (
                  <div key={e.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <IndicateurEtape statut={e.statut}/>
                      {i < etapes.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1"/>}
                    </div>
                    <div className={`pb-4 ${e.statut === 'a_venir' ? 'opacity-50' : ''}`}>
                      <p className="text-sm font-medium text-slate-900">{e.titre}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{e.horaire}{e.detail ? ` — ${e.detail}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <p className="text-slate-400 text-sm">Aucune mission assignée aujourd&apos;hui</p>
                <p className="text-slate-300 text-xs mt-1">Profitez-en pour vous reposer 😄</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Actions flottantes */}
      {missionActive && reponse === null && (
        <div className="fixed bottom-16 left-0 right-0 px-4 space-y-2 max-w-md mx-auto">
          <button onClick={() => handleReponse(true)} disabled={actionLoading}
            className="w-full bg-slate-900 text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition-colors disabled:opacity-50">
            {actionLoading
              ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
            }
            Accepter la mission
          </button>
          <button onClick={() => handleReponse(false)} disabled={actionLoading}
            className="w-full bg-white text-slate-700 border border-slate-200 rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Signaler une indisponibilité
          </button>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 px-6 py-2 flex justify-between items-center">
        <NavItem actif label="Accueil" icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>}/>
        <NavItem label="Missions" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}/>
        <NavItem label="Photos" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}/>
        <NavItem label="Rapports" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}/>
        <NavItem label="Profil" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}/>
      </nav>
    </div>
  )
}
