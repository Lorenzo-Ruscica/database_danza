"use client"

import { useState, useEffect } from "react"
import { useKioskStore } from "@/store/kiosk-store"
import Step1Anagrafica from "@/components/kiosk/steps/step1-anagrafica"
import Step2Residenza from "@/components/kiosk/steps/step2-residenza"
import Step3Contatti from "@/components/kiosk/steps/step3-contatti"
import Step4Corsi from "@/components/kiosk/steps/step4-corsi"
import Step5Firma from "@/components/kiosk/steps/step5-firma"
import Step6Certificato from "@/components/kiosk/steps/step6-certificato"
import { SuccessTotem } from "@/components/kiosk/success-totem"
import { InactivityTimer } from "@/components/kiosk/inactivity-timer"
import { VirtualKeyboard } from "@/components/kiosk/virtual-keyboard"
import { Moon, Sun, Lock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function KioskPage() {
  const { step, anagrafica, resetForm } = useKioskStore()
  const [success, setSuccess] = useState(false)
  const [mockId, setMockId] = useState("sd-xyz-12345") // ID allievo db
  const [mockNum, setMockNum] = useState("TS-2024-004") // Numero tessera auto-calc
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Riceve i dati finali di avvenuta registrazione (da Step 6)
  const handleEnrollmentComplete = (data: { id: string, tessera_numero: string }) => {
    setMockId(data.id)
    setMockNum(data.tessera_numero)
    setSuccess(true)
    setIsDark(false)
  }

  const handleReset = () => {
    resetForm()
    setSuccess(false)
    setIsDark(false)
  }

  const renderStep = () => {
    if (success) {
      return (
        <SuccessTotem
          allievoId={mockId}
          nome={`${anagrafica.nome} ${anagrafica.cognome}`}
          tesseraNumero={mockNum}
          onReset={handleReset}
        />
      )
    }

    // Nota: Ho aggiunto la prop fittizia onComplete o passato la logica a step 6.
    // Nello step6 attuale la fine è gestita da handleSubmitEnrollment.
    switch (step) {
      case 1: return <Step1Anagrafica />
      case 2: return <Step2Residenza />
      case 3: return <Step3Contatti />
      case 4: return <Step4Corsi />
      case 5: return <Step5Firma />
      // Nel file step6.tsx lo useremo per notificare la pagina principale
      case 6: return <Step6Certificato onComplete={handleEnrollmentComplete} />
      default: return <Step1Anagrafica />
    }
  }

  if (!mounted) {
    return null; // Resolve hydration mismatch
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-primary/20 relative overflow-hidden transition-colors duration-500 bg-background text-foreground ${isDark ? "dark" : ""}`}>

      {/* Elegant Dynamic Minimalist Background */}
      <div className={`absolute inset-0 transition-opacity duration-1000 -z-10 animate-gradient-slow ${isDark ? 'bg-gradient-to-br from-slate-950 via-blue-950/60 to-slate-950' : 'bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-sky-100/60'}`} />

      {/* Floating Soft Ambient Lights */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] blur-[120px] rounded-[100%] pointer-events-none animate-float-1 mix-blend-screen opacity-60 ${isDark ? "bg-blue-500/[0.06]" : "bg-blue-600/[0.05]"}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] blur-[140px] rounded-[100%] pointer-events-none animate-float-2 mix-blend-screen opacity-60 ${isDark ? "bg-indigo-500/[0.05]" : "bg-sky-500/[0.06]"}`} />
      <div className={`absolute top-[30%] left-[60%] w-[35vw] h-[35vw] blur-[100px] rounded-full pointer-events-none animate-float-1 opacity-50 ${isDark ? "bg-blue-800/[0.2]" : "bg-indigo-300/[0.2]"}`} style={{ animationDelay: '-8s', animationDuration: '25s' }} />

      {/* Global Kiosk Interactions */}
      <InactivityTimer onTimeout={handleReset} isActive={step > 1 || anagrafica.nome !== '' || anagrafica.cognome !== ''} />
      <VirtualKeyboard />


      {/* Header Totem */}
      <header className="relative z-10 py-10 px-8 flex flex-col items-center animate-fade-in-up-soft" style={{ animationDelay: '0.1s' }}>

        {/* Admin Access Button (Top Left) */}
        <Link
          href="/admin"
          className={`absolute top-6 left-8 p-3 rounded-full transition-all duration-300 z-50 hover:scale-110 active:scale-95 ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-black/50 hover:text-black'}`}
          title="Area Riservata Admin"
        >
          <Lock className="w-5 h-5" />
        </Link>

        <button
          onClick={() => setIsDark(!isDark)}
          className={`absolute top-6 right-8 p-3 rounded-full transition-all duration-300 z-50 ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-6 h-6 text-white" /> : <Moon className="w-6 h-6 text-black" />}
        </button>

        <div className="relative inline-block mb-3 text-center group">
          <Image 
            src="/logo_Bigdance.png" 
            alt="BigDance Logo" 
            width={320} 
            height={140} 
            priority
            className="object-contain relative z-10 transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className={`w-16 h-1.5 rounded-full transition-all duration-700 ease-in-out ${idx === step
                  ? (isDark ? 'bg-white scale-y-150 shadow-[0_4px_10px_rgba(255,255,255,0.2)]' : 'bg-black scale-y-150 shadow-[0_4px_10px_rgba(0,0,0,0.1)]')
                  : idx < step
                    ? (isDark ? 'bg-white/40' : 'bg-black/40')
                    : (isDark ? 'bg-white/10' : 'bg-black/10')
                  }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area (ottimizzato Touch) */}
      <main className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start pb-24 relative z-10 animate-fade-in-up-soft" style={{ animationDelay: '0.3s' }}>
        <div className={`w-full max-w-5xl backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 border relative overflow-hidden transition-all duration-1000 transform hover:scale-[1.005] ${isDark ? "bg-white/5 border-white/10 text-white shadow-[0_20px_60px_-15px_rgba(255,255,255,0.05)]" : "bg-white/80 border-black/10 text-black shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]"}`}>
          {/* Subtle inner reflection */}
          <div className={`absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent to-transparent ${isDark ? "via-white/20" : "via-black/20"}`} />

          <div className="relative z-10 transition-transform duration-500 ease-out" key={`step-${step}`}>
            <div className="animate-fade-in-up-soft" style={{ animationDuration: '0.6s' }}>
              {renderStep()}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
