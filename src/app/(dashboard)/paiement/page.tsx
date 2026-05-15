'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ModePaiement = 'sepa' | 'payconiq'

// ─── Composants ───────────────────────────────────────────────────────────────

function QRCode() {
  // QR code en SVG géométrique (visuel uniquement)
  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40" xmlns="http://www.w3.org/2000/svg">
      {/* Coin haut gauche */}
      <rect x="10" y="10" width="60" height="60" rx="4" fill="none" stroke="#1e293b" strokeWidth="8"/>
      <rect x="25" y="25" width="30" height="30" rx="2" fill="#1e293b"/>
      {/* Coin haut droit */}
      <rect x="130" y="10" width="60" height="60" rx="4" fill="none" stroke="#1e293b" strokeWidth="8"/>
      <rect x="145" y="25" width="30" height="30" rx="2" fill="#1e293b"/>
      {/* Coin bas gauche */}
      <rect x="10" y="130" width="60" height="60" rx="4" fill="none" stroke="#1e293b" strokeWidth="8"/>
      <rect x="25" y="145" width="30" height="30" rx="2" fill="#1e293b"/>
      {/* Données centre */}
      {[
        [90, 10], [110, 10], [130, 30], [90, 50], [110, 50],
        [90, 90], [130, 90], [150, 90], [170, 90],
        [90, 110], [110, 110], [130, 110],
        [90, 130], [150, 130], [170, 130],
        [110, 150], [130, 150], [170, 150],
        [90, 170], [110, 170], [130, 170], [150, 170],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="16" height="16" rx="2" fill="#1e293b"/>
      ))}
    </svg>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function PaiementPage() {
  const [mode, setMode] = useState<ModePaiement>('sepa')
  const [paye, setPaye] = useState(false)

  const montant = 356.41
  const ref = 'INT-2026-0047'
  const client = 'Marc Leroy'

  if (paye) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl">✅</div>
        <h2 className="text-xl font-bold text-slate-900">Paiement confirmé !</h2>
        <p className="text-2xl font-bold text-blue-600">{montant.toFixed(2)} €</p>
        <p className="text-sm text-slate-500">Réf. {ref} · {client}</p>
        <p className="text-xs text-emerald-600 font-medium mt-2">Virement reçu · Instantané</p>
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
        </div>
      </header>

      <main className="flex-1 px-4 py-6 flex flex-col gap-5">

        {/* Montant */}
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Montant à régler</p>
          <p className="text-4xl font-bold text-slate-900 mt-2">{montant.toFixed(2)} €</p>
          <p className="text-xs text-slate-400 mt-1">Réf. {ref} · {client}</p>
        </div>

        {/* QR Code (SEPA / Payconiq) */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-3">
          {mode === 'payconiq' ? (
            <>
              <QRCode />
              <p className="text-xs text-slate-400">Scanner pour payer</p>
            </>
          ) : (
            <div className="py-6 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-sm text-slate-600 text-center font-medium">Virement SEPA instantané</p>
              <div className="bg-slate-50 rounded-xl p-3 w-full text-center">
                <p className="text-xs text-slate-400">IBAN</p>
                <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">BE68 5390 0754 7034</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 w-full text-center">
                <p className="text-xs text-slate-400">Communication structurée</p>
                <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">+++{ref.replace('INT-', '').replace('-', '/')}+++</p>
              </div>
            </div>
          )}
        </div>

        {/* Détails */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
          {[
            { icon: '👤', label: 'Prestataire', valeur: 'Marc Leroy' },
            { icon: '📍', label: 'Chantier', valeur: 'Rue des Tilleuls, Namur' },
            { icon: '🔧', label: 'Travaux', valeur: 'Tableau électrique' },
            { icon: '📅', label: 'Date', valeur: '14 mai 2026' },
          ].map(({ icon, label, valeur }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <span>{icon}</span>{label}
              </span>
              <span className="text-sm font-semibold text-slate-800">{valeur}</span>
            </div>
          ))}
        </div>

        {/* Choix mode paiement */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Choisir un mode de paiement
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('sepa')}
              className={`rounded-2xl p-4 flex flex-col items-center gap-2 border-2 transition-colors ${
                mode === 'sepa'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className={`text-xs font-semibold ${mode === 'sepa' ? 'text-blue-700' : 'text-slate-600'}`}>
                Virement SEPA instantané
              </span>
            </button>
            <button
              onClick={() => setMode('payconiq')}
              className={`rounded-2xl p-4 flex flex-col items-center gap-2 border-2 transition-colors ${
                mode === 'payconiq'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H2a2 2 0 00-2 2v10a2 2 0 002 2h3" />
              </svg>
              <span className={`text-xs font-semibold ${mode === 'payconiq' ? 'text-blue-700' : 'text-slate-600'}`}>
                Payconiq / QR Code
              </span>
            </button>
          </div>
        </div>

        {/* Info SEPA */}
        {mode === 'sepa' && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="text-blue-500 shrink-0 mt-0.5">ℹ️</span>
            <p className="text-xs text-blue-700 leading-relaxed">
              Votre banque sera ouverte pour confirmer le virement. Instantané sous 10 secondes.
            </p>
          </div>
        )}

        {/* Bouton payer */}
        <button
          onClick={() => setPaye(true)}
          className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Payer {montant.toFixed(2)} € maintenant
        </button>

        <p className="text-center text-xs text-slate-400">🔒 Sécurisé · Conforme DSP2 · Aucun frais</p>
      </main>
    </div>
  )
}
