'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type StatutEtape = 'termine' | 'en_cours' | 'a_venir'

interface EtapeJournee {
  id: string
  titre: string
  horaire: string
  statut: StatutEtape
  detail: string
}

// ─── Données de démonstration ─────────────────────────────────────────────────

const etapes: EtapeJournee[] = [
  {
    id: '1',
    titre: 'Tableau Rue du Midi',
    horaire: '08h30',
    statut: 'termine',
    detail: 'Terminé · Rapport envoyé',
  },
  {
    id: '2',
    titre: 'Pause déjeuner',
    horaire: '12h00 — 13h30',
    statut: 'en_cours',
    detail: '',
  },
  {
    id: '3',
    titre: 'Tableau des Tilleuls',
    horaire: '14h00',
    statut: 'a_venir',
    detail: 'À venir · Nouvelle assignation',
  },
]

// ─── Composants ───────────────────────────────────────────────────────────────

function IndicateurEtape({ statut }: { statut: StatutEtape }) {
  if (statut === 'termine') {
    return (
      <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-1">
        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    )
  }
  if (statut === 'en_cours') {
    return <div className="w-3 h-3 rounded-full bg-amber-400 shrink-0 mt-1" />
  }
  return <div className="w-3 h-3 rounded-full bg-slate-200 shrink-0 mt-1" />
}

function LigneEtape({ etape, derniere }: { etape: EtapeJournee; derniere: boolean }) {
  const estAttenuation = etape.statut === 'a_venir'
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <IndicateurEtape statut={etape.statut} />
        {!derniere && <div className="w-px flex-1 bg-slate-200 mt-1" />}
      </div>
      <div className={`pb-4 ${estAttenuation ? 'opacity-50' : ''}`}>
        <p className={`text-sm font-medium ${etape.statut === 'termine' ? 'text-slate-900' : 'text-slate-700'}`}>
          {etape.titre}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {etape.horaire}
          {etape.detail && ` — ${etape.detail}`}
        </p>
      </div>
    </div>
  )
}

function NavItem({
  icon,
  label,
  actif = false,
}: {
  icon: React.ReactNode
  label: string
  actif?: boolean
}) {
  return (
    <button className="flex flex-col items-center gap-1">
      <span className={actif ? 'text-blue-600' : 'text-slate-400'}>{icon}</span>
      <span className={`text-[10px] font-medium ${actif ? 'text-blue-600' : 'text-slate-400'}`}>
        {label}
      </span>
    </button>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function TechnicienPage() {
  const [missionAcceptee, setMissionAcceptee] = useState<boolean | null>(null)

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-slate-900 text-white px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-xl">⚡</span>
            <span className="font-bold text-lg tracking-tight">installe.com</span>
          </div>
          <span className="text-slate-300 text-sm font-medium">Marc Leroy</span>
        </div>
      </header>

      {/* ── Contenu ── */}
      <main className="flex-1 px-4 py-4 space-y-4 pb-28">

        {/* Notification nouvelle mission */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="text-blue-500 mt-0.5">🔔</span>
          <p className="text-sm text-blue-800 leading-snug">
            Nouvelle mission assignée par <span className="font-semibold">Marie (secrétariat)</span> — 14h00
          </p>
        </div>

        {/* Carte mission */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* En-tête mission */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-100">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="font-semibold text-slate-900 text-sm">12 rue des Tilleuls, Namur</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 shrink-0">
                Urgent
              </span>
            </div>
          </div>

          {/* Détails */}
          <div className="px-4 py-3 space-y-2">
            {[
              { label: 'Client', valeur: 'M. Fontaine' },
              { label: 'Travaux', valeur: 'Tableau électrique' },
              { label: 'Heure', valeur: '14h00 — durée estimée 2h' },
            ].map(({ label, valeur }) => (
              <div key={label} className="flex items-center">
                <span className="text-xs text-slate-400 w-20 shrink-0">{label}</span>
                <span className="text-sm text-slate-700 font-medium flex-1 bg-slate-50 rounded-lg px-3 py-1.5">
                  {valeur}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progression journée */}
        <div className="bg-white rounded-2xl shadow-sm px-4 pt-4 pb-2">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Progression de la journée
          </h2>
          <div>
            {etapes.map((etape, i) => (
              <LigneEtape
                key={etape.id}
                etape={etape}
                derniere={i === etapes.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Feedback acceptation */}
        {missionAcceptee === true && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-center">
            <p className="text-emerald-700 font-semibold text-sm">✅ Mission acceptée — à tout à l&apos;heure !</p>
          </div>
        )}
        {missionAcceptee === false && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-center">
            <p className="text-red-700 font-semibold text-sm">❌ Indisponibilité signalée au secrétariat</p>
          </div>
        )}
      </main>

      {/* ── Actions flottantes ── */}
      {missionAcceptee === null && (
        <div className="fixed bottom-16 left-0 right-0 px-4 space-y-2 max-w-md mx-auto">
          <button
            onClick={() => setMissionAcceptee(true)}
            className="w-full bg-slate-900 text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Accepter la mission
          </button>
          <button
            onClick={() => setMissionAcceptee(false)}
            className="w-full bg-white text-slate-700 border border-slate-200 rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Signaler une indisponibilité
          </button>
        </div>
      )}

      {/* ── Bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 px-6 py-2 flex justify-between items-center">
        <NavItem actif label="Accueil" icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        } />
        <NavItem label="Missions" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        } />
        <NavItem label="Photos" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        } />
        <NavItem label="Rapports" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        } />
        <NavItem label="Profil" icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        } />
      </nav>
    </div>
  )
}
