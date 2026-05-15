'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

type Priorite = 'Normal' | 'Urgent' | 'Planifié'

interface Client { id: string; nom: string }
interface Site   { id: string; nom: string; adresse: string; ville: string; client_id: string }
interface User   { id: string; nom: string; prenom: string }

const TYPES_TRAVAUX = ['Électricité', 'Plomberie', 'Robotique', 'Second œuvre', 'CVC', 'Serrurerie']
const PRIORITES: Priorite[] = ['Normal', 'Urgent', 'Planifié']
const COULEURS = ['bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initiales(prenom: string, nom: string) {
  return `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase()
}

function BoutonChoix({ label, actif, onClick }: { label: string; actif: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
        actif ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700'
      }`}
    >
      {label}
    </button>
  )
}

function BarreProgression({ etape }: { etape: number }) {
  return (
    <div className="flex gap-1 mt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= etape ? 'bg-blue-500' : 'bg-slate-200'}`} />
      ))}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function NouvelleMissionPage() {
  const router = useRouter()
  const [etape, setEtape] = useState(1)

  // Données du formulaire
  const [type, setType] = useState('')
  const [clientId, setClientId] = useState('')
  const [siteId, setSiteId] = useState('')
  const [priorite, setPriorite] = useState<Priorite>('Normal')
  const [technicienId, setTechnicienId] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')

  // Données Supabase
  const [clients, setClients] = useState<Client[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [techniciens, setTechniciens] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [envoye, setEnvoye] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const [{ data: cls }, { data: techs }] = await Promise.all([
        supabase.from('clients').select('id, nom').order('nom'),
        supabase.from('users').select('id, nom, prenom').eq('role', 'technicien').order('nom'),
      ])
      setClients(cls ?? [])
      setTechniciens(techs ?? [])
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!clientId) { setSites([]); setSiteId(''); return }
    supabase.from('sites').select('id, nom, adresse, ville, client_id').eq('client_id', clientId)
      .then(({ data }) => { setSites(data ?? []); setSiteId('') })
  }, [clientId])

  const clientSelectionne = clients.find((c) => c.id === clientId)
  const siteSelectionne   = sites.find((s) => s.id === siteId)
  const techSelectionne   = techniciens.find((t) => t.id === technicienId)

  async function handleSubmit() {
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: mission, error } = await (supabase.from('missions') as any).insert({
      site_id: siteId || null,
      client_id: clientId || null,
      titre: `${type} — ${siteSelectionne?.adresse ?? ''}`,
      description,
      statut: technicienId ? 'assigned' : 'pending',
      date_planifiee: date || null,
    }).select().single()

    if (error || !mission) { setLoading(false); return }

    if (technicienId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('mission_techniciens') as any).insert({
        mission_id: mission.id,
        user_id: technicienId,
        statut_acceptation: 'pending',
      })
    }

    setEnvoye(true)
    setLoading(false)
  }

  if (envoye) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl">✅</div>
        <h2 className="text-lg font-bold text-slate-900">Mission créée !</h2>
        <p className="text-sm text-slate-500">
          {techSelectionne ? `${techSelectionne.prenom} ${techSelectionne.nom} a été notifié.` : 'La mission est en attente d\'assignation.'}
        </p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => { setEtape(1); setEnvoye(false); setType(''); setClientId(''); setSiteId(''); setTechnicienId(''); setDate('') }}
            className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors">
            Nouvelle mission
          </button>
          <button onClick={() => router.push('/dispatch')}
            className="px-5 py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors">
            Retour dispatch
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-slate-900 text-white px-5 pt-12 pb-5">
        <div className="flex items-center justify-between">
          <button onClick={() => etape > 1 ? setEtape((e) => e - 1) : router.back()}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            <span className="text-sm">Nouvelle mission</span>
          </button>
          <span className="text-slate-400 text-sm">Étape {etape}/3</span>
        </div>
        <BarreProgression etape={etape} />
      </header>

      <main className="flex-1 px-4 py-5">
        {/* ── Étape 1 : Type + Client + Priorité ── */}
        {etape === 1 && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Type de travaux</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {TYPES_TRAVAUX.map((t) => <BoutonChoix key={t} label={t} actif={type === t} onClick={() => setType(t)} />)}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Client</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                <option value="">Sélectionner un client…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>

            {clientId && sites.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Chantier</label>
                <select value={siteId} onChange={(e) => setSiteId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <option value="">Sélectionner un site…</option>
                  {sites.map((s) => <option key={s.id} value={s.id}>{s.adresse}, {s.ville}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Priorité</label>
              <div className="flex gap-2 mt-2">
                {PRIORITES.map((p) => (
                  <BoutonChoix key={p} label={p} actif={priorite === p} onClick={() => setPriorite(p)} />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Description (optionnel)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Détails de l'intervention…"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>

            <button onClick={() => setEtape(2)} disabled={!type || !clientId}
              className={`w-full rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 transition-colors ${
                type && clientId ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}>
              Suivant →
            </button>
          </div>
        )}

        {/* ── Étape 2 : Technicien + Date ── */}
        {etape === 2 && (
          <div className="space-y-5">
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
              {[
                { label: 'Type',    val: type },
                { label: 'Client',  val: clientSelectionne?.nom },
                { label: 'Site',    val: siteSelectionne ? `${siteSelectionne.adresse}, ${siteSelectionne.ville}` : '—' },
                { label: 'Priorité', val: priorite },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400 w-16 shrink-0">{label}</span>
                  <span className={`font-medium ${label === 'Priorité' && priorite === 'Urgent' ? 'text-red-600' : 'text-slate-800'}`}>{val}</span>
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Date / Heure</label>
              <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Assigner un technicien</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {techniciens.map((t, idx) => (
                  <button key={t.id} type="button" onClick={() => setTechnicienId(technicienId === t.id ? '' : t.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                      technicienId === t.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}>
                    <span className={`w-6 h-6 rounded-full ${COULEURS[idx % COULEURS.length]} text-white text-xs flex items-center justify-center`}>
                      {initiales(t.prenom, t.nom)}
                    </span>
                    {t.prenom} {t.nom[0]}.
                  </button>
                ))}
                {techniciens.length === 0 && <p className="text-xs text-slate-400">Aucun technicien disponible</p>}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEtape(1)} className="flex-1 bg-slate-100 text-slate-700 rounded-2xl py-3.5 font-semibold hover:bg-slate-200 transition-colors">← Retour</button>
              <button onClick={() => setEtape(3)} className="flex-1 bg-slate-900 text-white rounded-2xl py-3.5 font-semibold hover:bg-slate-800 transition-colors">Suivant →</button>
            </div>
          </div>
        )}

        {/* ── Étape 3 : Récap + Envoi ── */}
        {etape === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-2">📋 Récapitulatif</h3>
              {[
                { label: 'Type',       val: type },
                { label: 'Client',     val: clientSelectionne?.nom ?? '—' },
                { label: 'Site',       val: siteSelectionne ? `${siteSelectionne.adresse}, ${siteSelectionne.ville}` : '—' },
                { label: 'Date',       val: date ? new Date(date).toLocaleString('fr-FR') : '—' },
                { label: 'Priorité',   val: priorite },
                { label: 'Technicien', val: techSelectionne ? `${techSelectionne.prenom} ${techSelectionne.nom}` : 'Non assigné' },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-start gap-3 text-sm">
                  <span className="text-slate-400 w-24 shrink-0">{label}</span>
                  <span className={`font-medium flex-1 ${label === 'Priorité' && priorite === 'Urgent' ? 'text-red-600' : 'text-slate-800'}`}>{val}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEtape(2)} className="flex-1 bg-slate-100 text-slate-700 rounded-2xl py-3.5 font-semibold hover:bg-slate-200 transition-colors">← Retour</button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-slate-900 text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50">
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                )}
                {loading ? 'Envoi…' : technicienId ? `Envoyer à ${techSelectionne?.prenom}` : 'Créer la mission'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
