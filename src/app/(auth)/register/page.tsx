'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Role = 'admin' | 'dispatcher' | 'technicien'

const roles: { value: Role; label: string; desc: string }[] = [
  { value: 'admin',       label: 'Admin',       desc: 'Accès complet' },
  { value: 'dispatcher',  label: 'Dispatcher',  desc: 'Crée et assigne les missions' },
  { value: 'technicien',  label: 'Technicien',  desc: 'Réalise les interventions' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [role, setRole] = useState<Role>('technicien')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nom, prenom, role, full_name: `${prenom} ${nom}` },
        },
      })

      if (signUpError) {
        setError(signUpError.message === 'User already registered'
          ? 'Un compte existe déjà avec cet email.'
          : signUpError.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      console.error('Erreur inscription:', err)
      setError('Une erreur est survenue. Vérifiez votre connexion et réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-3xl mb-6">✅</div>
        <h2 className="text-white text-xl font-bold mb-2">Compte créé !</h2>
        <p className="text-slate-400 text-sm mb-8 max-w-xs">
          Un email de confirmation a été envoyé à <strong className="text-white">{email}</strong>. Cliquez sur le lien pour activer votre compte.
        </p>
        <a href="/login" className="bg-white text-slate-900 rounded-xl px-6 py-3 font-semibold text-sm hover:bg-slate-100 transition-colors">
          Retour à la connexion
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <span className="text-blue-400 text-3xl">⚡</span>
        <span className="text-white font-bold text-2xl tracking-tight">installe.com</span>
      </div>

      {/* Carte */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-slate-900">Créer un compte</h1>
          <span className="text-xs text-slate-400">{step}/2</span>
        </div>
        <div className="flex gap-1 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-blue-500' : 'bg-slate-200'}`} />
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleRegister} className="space-y-4">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prénom</label>
                  <input
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Marc"
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom</label>
                  <input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Leroy"
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</label>
                <div className="mt-1.5 space-y-2">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-colors ${
                        role === r.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-semibold">{r.label}</span>
                      <span className="text-xs opacity-70">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!prenom || !nom}
                className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-semibold hover:bg-slate-800 transition-colors disabled:opacity-40 mt-2"
              >
                Suivant →
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères minimum"
                  minLength={8}
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-100 text-slate-700 rounded-xl py-3.5 font-semibold hover:bg-slate-200 transition-colors"
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-slate-900 text-white rounded-xl py-3.5 font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Création…' : 'Créer le compte'}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Déjà un compte ?{' '}
          <a href="/login" className="text-blue-600 font-semibold hover:text-blue-700">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  )
}
