'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Priorite = 'Normal' | 'Urgent' | 'Planifié'
type TypeTravaux = 'Électricité' | 'Plomberie' | 'Robotique' | 'Second œuvre'

interface Technicien {
  id: string
  initiales: string
  nom: string
  disponible: boolean
  note?: string
}

// ─── Données de démonstration ─────────────────────────────────────────────────

const typesTravaux: TypeTravaux[] = ['Électricité', 'Plomberie', 'Robotique', 'Second œuvre']
const priorites: Priorite[] = ['Normal', 'Urgent', 'Planifié']

const techniciens: Technicien[] = [
  { id: '1', initiales: 'ML', nom: 'Marc L.', disponible: true },
  { id: '2', initiales: 'KD', nom: 'Kevin D.', disponible: true },
  { id: '3', initiales: 'PM', nom: 'Paul M.', disponible: true },
  { id: '4', initiales: 'SB', nom: 'Sophie B.', disponible: false, note: 'indisponible — retard chantier actuel' },
]

// ─── Composants ───────────────────────────────────────────────────────────────

function BarreProgression({ etape }: { etape: number }) {
  return (
    <div className="flex gap-1 mt-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i <= etape ? 'bg-blue-500' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  )
}

function BoutonChoix({
  label,
  actif,
  onClick,
  couleur = 'normal',
}: {
  label: string
  actif: boolean
  onClick: () => void
  couleur?: 'normal' | 'urgent' | 'planifie'
}) {
  const couleurs = {
    normal: actif ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700',
    urgent: actif ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-700',
    planifie: actif ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700',
  }
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${couleurs[couleur]}`}
    >
      {label}
    </button>
  )
}

// ─── Étape 1 ──────────────────────────────────────────────────────────────────

function Etape1({
  type, setType,
  client, setClient,
  adresse, setAdresse,
  priorite, setPriorite,
  onSuivant,
}: {
  type: TypeTravaux | null
  setType: (t: TypeTravaux) => void
  client: string
  setClient: (v: string) => void
  adresse: string
  setAdresse: (v: string) => void
  priorite: Priorite
  setPriorite: (p: Priorite) => void
  onSuivant: () => void
}) {
  const pret = type && client && adresse
  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Type de travaux
        </label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {typesTravaux.map((t) => (
            <BoutonChoix key={t} label={t} actif={type === t} onClick={() => setType(t)} />
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Client
        </label>
        <input
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Nom du client"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Adresse du chantier
        </label>
        <input
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          placeholder="Rue, ville"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Priorité
        </label>
        <div className="flex gap-2 mt-2">
          {priorites.map((p) => (
            <BoutonChoix
              key={p}
              label={p}
              actif={priorite === p}
              onClick={() => setPriorite(p)}
              couleur={p === 'Urgent' ? 'urgent' : 'normal'}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onSuivant}
        disabled={!pret}
        className={`w-full rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 transition-colors ${
          pret
            ? 'bg-slate-900 text-white hover:bg-slate-800'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        Suivant →
      </button>
    </div>
  )
}

// ─── Étape 2 ──────────────────────────────────────────────────────────────────

function Etape2({
  type, client, adresse, priorite,
  technicienId, setTechnicienId,
  date, setDate,
  onSuivant, onRetour,
}: {
  type: TypeTravaux | null
  client: string
  adresse: string
  priorite: Priorite
  technicienId: string | null
  setTechnicienId: (id: string) => void
  date: string
  setDate: (d: string) => void
  onSuivant: () => void
  onRetour: () => void
}) {
  const pret = technicienId && date

  return (
    <div className="space-y-5">
      {/* Récap */}
      <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <span className="text-slate-400 text-xs uppercase font-semibold w-16">Type</span>
          <span className="font-medium">{type} — tableau</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <span className="text-slate-400 text-xs uppercase font-semibold w-16">Client</span>
          <span className="font-medium">{client || 'M. Fontaine'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <span className="text-slate-400 text-xs uppercase font-semibold w-16">Adresse</span>
          <span className="font-medium">{adresse}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400 text-xs uppercase font-semibold w-16">Priorité</span>
          <span className={`font-semibold ${priorite === 'Urgent' ? 'text-red-600' : 'text-slate-700'}`}>
            {priorite}
          </span>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Date / Heure
        </label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Techniciens */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Assigner un technicien
        </label>
        <p className="text-xs text-slate-400 mt-1">Disponibles cet après-midi :</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {techniciens.filter((t) => t.disponible).map((t) => (
            <button
              key={t.id}
              onClick={() => setTechnicienId(t.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                technicienId === t.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.nom}
            </button>
          ))}
        </div>
        {techniciens.filter((t) => !t.disponible).map((t) => (
          <p key={t.id} className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-slate-300">ⓘ</span>
            {t.nom} {t.note}
          </p>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetour}
          className="flex-1 bg-slate-100 text-slate-700 rounded-2xl py-3.5 font-semibold hover:bg-slate-200 transition-colors"
        >
          ← Retour
        </button>
        <button
          onClick={onSuivant}
          disabled={!pret}
          className={`flex-2 flex-1 rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 transition-colors ${
            pret
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Suivant →
        </button>
      </div>
    </div>
  )
}

// ─── Étape 3 ──────────────────────────────────────────────────────────────────

function Etape3({
  type, client, adresse, priorite, technicienId, date,
  onRetour,
}: {
  type: TypeTravaux | null
  client: string
  adresse: string
  priorite: Priorite
  technicienId: string | null
  date: string
  onRetour: () => void
}) {
  const [envoye, setEnvoye] = useState(false)
  const tech = techniciens.find((t) => t.id === technicienId)

  if (envoye) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl">
          ✅
        </div>
        <h2 className="text-lg font-bold text-slate-900">Mission envoyée !</h2>
        <p className="text-sm text-slate-500">
          {tech?.nom} a été notifié pour la mission du {date ? new Date(date).toLocaleDateString('fr-FR') : ''}.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Récap final */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="text-blue-500 text-lg">📋</span>
          <h3 className="font-semibold text-slate-900 text-sm">Détails de l&apos;intervention</h3>
        </div>
        {[
          { label: 'Type', valeur: `${type} — tableau` },
          { label: 'Client', valeur: client },
          { label: 'Adresse', valeur: adresse },
          { label: 'Date / heure', valeur: date ? new Date(date).toLocaleString('fr-FR') : '' },
          { label: 'Priorité', valeur: priorite },
        ].map(({ label, valeur }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="text-xs text-slate-400 w-24 shrink-0 pt-0.5">{label}</span>
            <span className={`text-sm font-medium flex-1 ${label === 'Priorité' && priorite === 'Urgent' ? 'text-red-600' : 'text-slate-800'}`}>
              {valeur}
            </span>
          </div>
        ))}
      </div>

      {/* Technicien */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
          <span className="text-blue-500 text-lg">👤</span>
          <h3 className="font-semibold text-slate-900 text-sm">Technicien assigné</h3>
        </div>
        {tech && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {tech.initiales}
            </div>
            <span className="font-semibold text-slate-800">{tech.nom}</span>
            <span className="ml-auto text-xs text-emerald-600 font-medium">Disponible</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetour}
          className="flex-1 bg-slate-100 text-slate-700 rounded-2xl py-3.5 font-semibold hover:bg-slate-200 transition-colors"
        >
          ← Retour
        </button>
        <button
          onClick={() => setEnvoye(true)}
          className="flex-1 bg-slate-900 text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Envoyer la mission
        </button>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function NouvelleMissionPage() {
  const [etape, setEtape] = useState(1)
  const [type, setType] = useState<TypeTravaux | null>(null)
  const [client, setClient] = useState('')
  const [adresse, setAdresse] = useState('')
  const [priorite, setPriorite] = useState<Priorite>('Normal')
  const [technicienId, setTechnicienId] = useState<string | null>(null)
  const [date, setDate] = useState('')

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-slate-900 text-white px-5 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => etape > 1 ? setEtape(e => e - 1) : undefined}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Nouvelle mission</span>
          </button>
          <span className="text-slate-400 text-sm">Étape {etape}/3</span>
        </div>
        <BarreProgression etape={etape} />
      </header>

      {/* ── Contenu ── */}
      <main className="flex-1 px-4 py-5">
        {etape === 1 && (
          <Etape1
            type={type} setType={setType}
            client={client} setClient={setClient}
            adresse={adresse} setAdresse={setAdresse}
            priorite={priorite} setPriorite={setPriorite}
            onSuivant={() => setEtape(2)}
          />
        )}
        {etape === 2 && (
          <Etape2
            type={type} client={client} adresse={adresse} priorite={priorite}
            technicienId={technicienId} setTechnicienId={setTechnicienId}
            date={date} setDate={setDate}
            onSuivant={() => setEtape(3)}
            onRetour={() => setEtape(1)}
          />
        )}
        {etape === 3 && (
          <Etape3
            type={type} client={client} adresse={adresse} priorite={priorite}
            technicienId={technicienId} date={date}
            onRetour={() => setEtape(2)}
          />
        )}
      </main>
    </div>
  )
}
