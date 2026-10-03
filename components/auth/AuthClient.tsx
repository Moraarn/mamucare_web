'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, LockKeyhole } from 'lucide-react'
import LoginForm from './LoginForm'
import SignupStepper from './SignupStepper'

export default function AuthClient() {
  const [isLogin, setIsLogin] = useState(true)
  const handleSuccess = () => window.location.replace('/home')

  return (
    <main className={`auth-layout ${isLogin ? 'auth-signin' : 'auth-signup'}`}>
      <div className="auth-card">
        <section className="auth-form-region" aria-labelledby="auth-title">
          <div className="auth-brand">
            <span className="auth-brand-mark"><Heart size={22} aria-hidden="true" /></span>
            <span>CystaNiva</span>
          </div>

          <div className="auth-form-content">
            <header className="auth-form-heading">
              <h1 id="auth-title" className="text-2xl font-semibold tracking-tight">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {isLogin ? 'Sign in to continue your health journey.' : 'Start your maternal health journey with CystaNiva.'}
              </p>
            </header>
            {isLogin ? (
              <LoginForm onSwitchToSignup={() => setIsLogin(false)} onSuccess={handleSuccess} />
            ) : (
              <SignupStepper onSwitchToLogin={() => setIsLogin(true)} onSuccess={handleSuccess} />
            )}
          </div>

          <footer className="auth-footer">
            <Heart size={13} aria-hidden="true" />
            <span>With you, every step of the way.</span>
            <LockKeyhole className="ml-auto" size={13} aria-hidden="true" />
          </footer>
        </section>

        <aside className="auth-visual" aria-label="Maternal health support">
          <Image
            src="/images/signup.png"
            alt="Artwork of a mother carrying her baby on her back."
            fill
            sizes="(max-width: 767px) 1px, (max-width: 1279px) 50vw, 630px"
            className="object-cover object-center"
          />
          <div className="auth-visual-shade" />
          <div className="auth-visual-label"><Heart size={15} aria-hidden="true" /> Maternal health, together</div>
          <div className="auth-visual-copy">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-white/80">Care for every chapter</p>
            <h2 className="text-3xl font-medium leading-tight tracking-tight lg:text-4xl">Support throughout your maternal journey</h2>
            <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-white/90">Health checks, guidance and connection to care when you need it.</p>
            <div className="mt-8 flex items-center justify-center gap-3 text-xs text-white/80">
              <span>Support</span><span aria-hidden="true">&bull;</span><span>Check</span><span aria-hidden="true">&bull;</span><span>Connect</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
