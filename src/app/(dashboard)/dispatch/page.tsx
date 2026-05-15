'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type StatutTechnicien = 'en_mission' | 'bloque' | 'en_route' | 'disponible'

interface Technicien {
  id: string
  initiales: string
  nom: string
  adresse: string
  statut: StatutTechnicien
  progression: number
  info: string
  couleur: string
}

interface Alerte {
  id: string
  message: string
  heure: string
}

// ─── Données de démonstration ─────────────────────────────────────────────────

const techniciens: Technicien[] = [
  {
    id: '1',
    initiales: 'ML',
    nom: 'Marc Leroy',
    adresse: 'Rue du Midi, Namur',
    statut: 'en_mission',
    progression: 75,
    info: 'FIN · 11h30',
    couleur: 'bg-blue-600',
  },
  {
    id: '2',
    initiales: 'SB',
    nom: 'Sophie Bastin',
    adresse: 'Av. Reine Astrid, Phil.',
    statut: 'bloque',
    progression: 40,
    info: 'Retard signalé',
    couleur: 'bg-violet-600',
  },
  {
    id: '3',
    initiales: 'KD',
    nom: 'Kevin Dubois',
    adresse: 'Chaussée de Charleroi',
    statut: 'en_route',
    progression: 0,
    info: 'ARR. · 10h15',
    couleur: 'bg-emerald-600',
  },
]

const alertes: Alerte[] = [
  {
    id: '1',
    message: 'Sophie B. signale pièce manquante — chaudière Av. Reine Astrid',
    heure: '09h28',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function badgeStatut(statut: StatutTechnicien) {
  switch (statut) {
    case 'en_mission':
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
          En mission
        </span>
      )
    case 'bloque':
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
          Bloquée
        </span>
      )
    case 'en_route':
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
          En route
        </span>
      )
    case 'disponible':
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          Disponible
        </span>
      )
  }
}

function couleurBarre(statut: StatutTechnicien) {
  switch (statut) {
    case 'en_mission':
      return 'bg-emerald-500'
    case 'bloque':
      return 'bg-orange-400'
    case 'en_route':
      return 'bg-sky-400'
    default:
      return 'bg-slate-300'
  }
}

// ─── Composants ───────────────────────────────────────────────────────────────

function StatCard({
  valeur,
  label,
  accent = false,
}: {
  valeur: number
  label: string
  accent?: boolean
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p
        className={`text-2xl font-bold ${accent ? 'text-orange-500' : 'text-slate-900'}`}
      >
        {valeur}
      </p>
      <p className="text-xs text-slate-500 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}

function CarteTechnicien({ tech }: { tech: Technicien }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full ${tech.couleur} flex items-center justify-center text-white text-sm font-bold shrink-0`}
        >
          {tech.initiales}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-900 text-sm truncate">
              {tech.nom}
            </p>
            {badgeStatut(tech.statut)}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <svg
              className="w-3 h-3 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">{tech.adresse}</span>
          </p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400">{tech.progression}%</span>
          <span className="text-xs font-medium text-slate-600">{tech.info}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${couleurBarre(tech.statut)}`}
            style={{ width: `${tech.progression}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function DispatchPage() {
  const [date] = useState(() => {
    try {
      return new Date().toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
      })
    } catch {
      return new Date().toDateString()
    }
  })

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      {/* ── Header ── */}
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

      {/* ── Contenu ── */}
      <main className="flex-1 px-4 py-5 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard valeur={4} label="Techniciens actifs" />
          <StatCard valeur={2} label="Alertes terrain" accent />
          <StatCard valeur={6} label="Missions en cours" />
          <StatCard valeur={3} label="À planifier" />
        </div>

        {/* Techniciens */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Techniciens sur le terrain
          </h2>
          <div className="space-y-3">
            {techniciens.map((tech) => (
              <CarteTechnicien key={tech.id} tech={tech} />
            ))}
          </div>
        </section>

        {/* Alertes */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Alertes
          </h2>
          <div className="space-y-2">
            {alertes.map((alerte) => (
              <div
                key={alerte.id}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3"
              >
                <span className="text-amber-500 text-lg shrink-0">⚠️</span>
                <div>
                  <p className="text-sm text-slate-800 leading-snug">
                    {alerte.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{alerte.heure}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Actions ── */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-4 space-y-2">
        <button className="w-full bg-slate-900 text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nouvelle mission
        </button>
        <button className="w-full bg-slate-100 text-slate-700 rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Voir le planning semaine
        </button>
      </div>
    </div>
  )
}
