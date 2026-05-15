'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckItem {
  id: string
  label: string
  fait: boolean
}

// ─── Données de démonstration ─────────────────────────────────────────────────

const checklistInitiale: CheckItem[] = [
  { id: '1', label: 'Coupure générale vérifiée', fait: true },
  { id: '2', label: 'Câblage phase/neutre conforme', fait: true },
  { id: '3', label: 'Disjoncteurs installés', fait: true },
  { id: '4', label: 'Test différentiel 30mA', fait: true },
  { id: '5', label: 'Photo tableau final + étiquette', fait: true },
]

const photosMock = [
  { id: '1', date: '14/05', heure: '08h47' },
  { id: '2', date: '14/05', heure: '10h12' },
  { id: '3', date: '14/05', heure: '11h28' },
]

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

function CartePhoto({ photo }: { photo: { id: string; date: string; heure: string } }) {
  return (
    <div className="bg-slate-100 rounded-xl aspect-square flex flex-col items-center justify-center gap-1 relative overflow-hidden">
      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <div className="text-center">
        <p className="text-xs font-semibold text-slate-600">{photo.date}</p>
        <p className="text-xs text-slate-400">{photo.heure}</p>
        <p className="text-xs text-emerald-500 font-medium">GPS ✓</p>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function RapportPage() {
  const [checklist, setChecklist] = useState(checklistInitiale)
  const [notes, setNotes] = useState(
    'Remplacement tableau électrique principal — 3×16A + différentiel 30mA. Mise en conformité RGIE. Test complet effectué.'
  )
  const [signe, setSigne] = useState(false)
  const [valide, setValide] = useState(false)

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, fait: !item.fait } : item))
    )
  }

  const montantHT = 195 + 87.5 + 12
  const tva = montantHT * 0.21
  const montantTTC = montantHT + tva

  if (valide) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl">✅</div>
        <h2 className="text-lg font-bold text-slate-900">Rapport validé !</h2>
        <p className="text-sm text-slate-500">Le rapport a été envoyé au client et au secrétariat.</p>
        <p className="text-2xl font-bold text-slate-900 mt-2">{montantTTC.toFixed(2)} €</p>
        <p className="text-xs text-slate-400">En attente de paiement</p>
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
          <span className="text-slate-400 text-xs">Forfait Free · Mettre à niveau ✕</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4 pb-6">

        {/* Infos prestataire / client */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-bold text-slate-900">Marc Leroy</p>
              <p className="text-slate-500 text-xs">Électricien cert.</p>
              <p className="text-slate-500 text-xs">installe.com</p>
              <p className="text-slate-500 text-xs mt-1">BE 0123.456.789</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">M. Fontaine</p>
              <p className="text-slate-500 text-xs">12 rue des Tilleuls</p>
              <p className="text-slate-500 text-xs">5000 Namur</p>
              <p className="text-slate-500 text-xs mt-1">+32 476 00 11 22</p>
            </div>
          </div>
        </div>

        {/* Travaux réalisés */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Travaux réalisés
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full text-sm text-slate-800 bg-slate-50 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 leading-relaxed"
          />
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-2">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest py-2">
            Check-list d&apos;exécution
          </h2>
          {checklist.map((item) => (
            <LigneCheck key={item.id} item={item} onToggle={() => toggleCheck(item.id)} />
          ))}
        </div>

        {/* Photos */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Photos horodatées ({photosMock.length})
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {photosMock.map((photo) => (
              <CartePhoto key={photo.id} photo={photo} />
            ))}
            <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl aspect-square flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-400 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Montant */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Montant
          </h2>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Main d\'œuvre (3h × 65€)', montant: 195.0 },
              { label: 'Matériel fourni', montant: 87.5 },
              { label: 'Déplacement', montant: 12.0 },
            ].map(({ label, montant }) => (
              <div key={label} className="flex justify-between text-slate-600">
                <span>{label}</span>
                <span>{montant.toFixed(2)} €</span>
              </div>
            ))}
            <div className="flex justify-between text-slate-600">
              <span>TVA 21%</span>
              <span>{tva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2 mt-1">
              <span>Total TTC</span>
              <span className="text-blue-600">{montantTTC.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Signatures
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="border-2 border-dashed border-slate-200 rounded-xl h-20 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Technicien
            </div>
            <button
              onClick={() => setSigne(!signe)}
              className={`border-2 rounded-xl h-20 flex flex-col items-center justify-center text-xs gap-1 transition-colors ${
                signe
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                  : 'border-dashed border-slate-200 text-slate-400'
              }`}
            >
              {signe ? (
                <>
                  <span className="text-2xl">✅</span>
                  <span className="font-medium">Client signé</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Client
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bouton valider */}
        <button
          onClick={() => signe && setValide(true)}
          className={`w-full rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 transition-colors ${
            signe
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {signe ? 'Valider et envoyer le rapport' : 'Signature client requise'}
        </button>
      </main>
    </div>
  )
}
