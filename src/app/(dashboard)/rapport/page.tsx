'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckItem {
  id: string
  label: string
  fait: boolean
  item_id?: string
}

interface MissionInfo {
  id: string
  titre: string
  description: string | null
  statut: string
  client: { nom: string } | null
  site: { adresse: string; ville: string } | null
}

interface TechnicienInfo {
  id: string
  nom: string
  prenom: string
}

// ─── Composants ───────────────────────────────────────────────────────────────

function LigneCheck({ item, onToggle }: { item: CheckItem; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0"
    >
      <span className={`text-sm ${item.fait ? 'text-slate-800' : 'text-slate-400'}`}>
        {item.label}
      </span>
      <span className={`text-xs font-bold ml-3 shrink-0 ${item.fait ? 'text-emerald-500' : 'text-slate-300'}`}>
        {item.fait ? '✓ OK' : '—'}
      </span>
    </button>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function RapportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const missionId = searchParams.get('mission_id')

  const db = createClient() as any

  const [mission, setMission] = useState<MissionInfo | null>(null)
  const [technicien, setTechnicien] = useState<TechnicienInfo | null>(null)
  const [checklist, setChecklist] = useState<CheckItem[]>([])
  const [notes, setNotes] = useState('')
  const [signe, setSigne] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [valide, setValide] = useState(false)
  const [rapportId, setRapportId] = useState<string | null>(null)

  const montantHT = 294.5
  const tva = montantHT * 0.21
  const montantTTC = montantHT + tva

  // ── Chargement ──────────────────────────────────────────────────────────────

  useEffect(() => {
    async function loadData() {
      const { data: { user: authUser } } = await db.auth.getUser()
      if (!authUser) { router.push('/login'); return }

      const { data: profile } = await db
        .from('users')
        .select('id, nom, prenom')
        .eq('auth_id', authUser.id)
        .single()

      const tech = profile as TechnicienInfo | null
      if (tech) setTechnicien(tech)

      let targetMissionId = missionId
      if (!targetMissionId && tech) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const { data: mt } = await db
          .from('mission_techniciens')
          .select('mission_id')
          .eq('user_id', tech.id)
          .eq('statut_acceptation', 'accepte')
          .limit(1)
          .single()
        if (mt) targetMissionId = (mt as { mission_id: string }).mission_id
      }

      if (!targetMissionId) { setLoading(false); return }

      // Mission
      const { data: missionRaw } = await db
        .from('missions')
        .select('id, titre, description, statut, clients(nom), sites(adresse, ville)')
        .eq('id', targetMissionId)
        .single()

      if (missionRaw) {
        const m = missionRaw as {
          id: string; titre: string; description: string | null; statut: string
          clients: { nom: string } | null
          sites: { adresse: string; ville: string } | null
        }
        setMission({ id: m.id, titre: m.titre, description: m.description, statut: m.statut, client: m.clients, site: m.sites })
        if (m.description) setNotes(m.description)
      }

      // Rapport existant
      const { data: existingRapport } = await db
        .from('rapports')
        .select('id, notes, statut')
        .eq('mission_id', targetMissionId)
        .single()

      if (existingRapport) {
        const r = existingRapport as { id: string; notes: string | null; statut: string }
        setRapportId(r.id)
        if (r.notes) setNotes(r.notes)
        if (r.statut === 'signed' || r.statut === 'validated') setSigne(true)
      }

      // Checklist
      const { data: items } = await db
        .from('checklist_items')
        .select('id, label, fait')
        .eq('mission_id', targetMissionId)
        .order('created_at')

      if (items && (items as any[]).length > 0) {
        setChecklist((items as any[]).map((i) => ({ id: i.id, label: i.label, fait: i.fait ?? false, item_id: i.id })))
      } else {
        setChecklist([
          { id: '1', label: 'Sécurité vérifiée avant intervention', fait: false },
          { id: '2', label: 'Travaux réalisés conformément au devis', fait: false },
          { id: '3', label: 'Tests de bon fonctionnement effectués', fait: false },
          { id: '4', label: 'Zone de travail nettoyée', fait: false },
          { id: '5', label: 'Client informé des travaux réalisés', fait: false },
        ])
      }

      setLoading(false)
    }

    loadData()
  }, [missionId])

  // ── Toggle checklist ────────────────────────────────────────────────────────

  const toggleCheck = async (id: string) => {
    const item = checklist.find((i) => i.id === id)
    setChecklist((prev) => prev.map((i) => (i.id === id ? { ...i, fait: !i.fait } : i)))
    if (item?.item_id) {
      await db.from('checklist_items').update({ fait: !item.fait }).eq('id', item.item_id)
    }
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  async function handleValider() {
    if (!signe || !mission) return
    setSaving(true)
    try {
      let rId = rapportId
      if (!rId) {
        const { data: newRapport } = await db.from('rapports').insert({
          mission_id: mission.id,
          technicien_id: technicien?.id ?? null,
          notes,
          statut: 'signed',
          montant_ht: montantHT,
          montant_ttc: montantTTC,
        }).select('id').single()
        rId = (newRapport as { id: string } | null)?.id ?? null
        if (rId) setRapportId(rId)
      } else {
        await db.from('rapports').update({ notes, statut: 'signed', montant_ht: montantHT, montant_ttc: montantTTC }).eq('id', rId)
      }

      const itemsSansId = checklist.filter((i) => !i.item_id)
      if (itemsSansId.length > 0) {
        await db.from('checklist_items').insert(
          itemsSansId.map((i) => ({ mission_id: mission.id, label: i.label, fait: i.fait }))
        )
      }

      await db.from('missions').update({ statut: 'completed' }).eq('id', mission.id)
      setValide(true)
    } catch (err) {
      console.error('Erreur validation rapport:', err)
    }
    setSaving(false)
  }

  // ── États ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center bg-slate-50">
        <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    )
  }

  if (valide) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl">✅</div>
        <h2 className="text-lg font-bold text-slate-900">Rapport validé !</h2>
        <p className="text-sm text-slate-500">Le rapport a été enregistré et la mission est terminée.</p>
        <p className="text-2xl font-bold text-slate-900 mt-2">{montantTTC.toFixed(2)} €</p>
        <p className="text-xs text-slate-400">En attente de paiement</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => router.push('/technicien')}
            className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors">
            Mes missions
          </button>
          <button onClick={() => router.push(`/paiement${mission ? `?mission_id=${mission.id}` : ''}`)}
            className="px-5 py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors">
            Paiement →
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
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-xl">⚡</span>
            <span className="font-bold text-lg tracking-tight">installe.com</span>
          </div>
          <button onClick={() => router.back()} className="text-slate-400 text-xs hover:text-white">← Retour</button>
        </div>
        {mission && (
          <div className="mt-3">
            <p className="text-sm font-semibold text-white">{mission.titre}</p>
            {mission.site && <p className="text-xs text-slate-400 mt-0.5">{mission.site.adresse}, {mission.site.ville}</p>}
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-4 space-y-4 pb-6">

        {/* Prestataire / client */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              {technicien ? (
                <>
                  <p className="font-bold text-slate-900">{technicien.prenom} {technicien.nom}</p>
                  <p className="text-slate-500 text-xs">Technicien · installe.com</p>
                </>
              ) : <p className="text-slate-400 text-xs">—</p>}
            </div>
            <div className="text-right">
              {mission?.client
                ? <p className="font-bold text-slate-900">{mission.client.nom}</p>
                : <p className="text-slate-400 text-xs">Client non renseigné</p>}
              {mission?.site && (
                <>
                  <p className="text-slate-500 text-xs">{mission.site.adresse}</p>
                  <p className="text-slate-500 text-xs">{mission.site.ville}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Travaux réalisés */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Travaux réalisés</h2>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            placeholder="Décrivez les travaux effectués…"
            className="w-full text-sm text-slate-800 bg-slate-50 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 leading-relaxed placeholder-slate-300" />
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-2">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest py-2">Check-list d&apos;exécution</h2>
          {checklist.map((item) => (
            <LigneCheck key={item.id} item={item} onToggle={() => toggleCheck(item.id)} />
          ))}
        </div>

        {/* Photos */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Photos horodatées</h2>
          <div className="grid grid-cols-3 gap-2">
            <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl aspect-square flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-400 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Montant */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Montant</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: "Main d'œuvre (3h × 65€)", montant: 195.0 },
              { label: 'Matériel fourni', montant: 87.5 },
              { label: 'Déplacement', montant: 12.0 },
            ].map(({ label, montant }) => (
              <div key={label} className="flex justify-between text-slate-600">
                <span>{label}</span><span>{montant.toFixed(2)} €</span>
              </div>
            ))}
            <div className="flex justify-between text-slate-600">
              <span>TVA 21%</span><span>{tva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2 mt-1">
              <span>Total TTC</span><span className="text-blue-600">{montantTTC.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Signatures</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className={`border-2 rounded-xl h-20 flex flex-col items-center justify-center text-xs gap-1 ${
              technicien ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-dashed border-slate-200 text-slate-400'
            }`}>
              {technicien ? (
                <><span className="text-2xl">✅</span><span className="font-medium">{technicien.prenom}</span></>
              ) : (
                <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>Technicien</>
              )}
            </div>
            <button onClick={() => setSigne(!signe)}
              className={`border-2 rounded-xl h-20 flex flex-col items-center justify-center text-xs gap-1 transition-colors ${
                signe ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-dashed border-slate-200 text-slate-400'
              }`}>
              {signe ? (
                <><span className="text-2xl">✅</span><span className="font-medium">Client signé</span></>
              ) : (
                <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>Client</>
              )}
            </button>
          </div>
        </div>

        {/* Valider */}
        <button onClick={handleValider} disabled={!signe || saving}
          className={`w-full rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 transition-colors ${
            signe && !saving ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}>
          {saving ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {saving ? 'Enregistrement…' : signe ? 'Valider et envoyer le rapport' : 'Signature client requise'}
        </button>
      </main>
    </div>
  )
}
