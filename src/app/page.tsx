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
import { Moon, Sun } from "lucide-react"

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
    <div className={`min-h-screen flex flex-col font-sans selection:bg-black/10 selection:dark:bg-white/20 relative overflow-hidden transition-colors duration-500 ${isDark ? "dark bg-[#0a0a0a] text-white" : "bg-white text-black"}`}>

      {/* Elegant Black & White Dance-Inspired Background */}
      {/* Sweeping curves and soft blurred spots representing movement & stage lighting */}
      <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] blur-[150px] rounded-[100%] pointer-events-none animate-float-1 ${isDark ? "bg-white/[0.05]" : "bg-black/[0.03]"}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] blur-[120px] rounded-[100%] pointer-events-none animate-float-2 ${isDark ? "bg-white/[0.05]" : "bg-black/[0.04]"}`} />

      {/* Global Kiosk Interactions */}
      <InactivityTimer onTimeout={handleReset} />
      <VirtualKeyboard />

      {/* SVG Decorative Dance Ribbons */}
      <svg className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 -z-0 ${isDark ? "opacity-10" : "opacity-[0.06]"}`} preserveAspectRatio="none" viewBox="0 0 1000 1000">
        {/* Ribbon 1: The Leap */}
        <path className="animate-ribbon" style={{ animationDelay: '0s' }} fill="none" stroke={isDark ? "white" : "black"} strokeWidth="1.5" strokeLinecap="round" d="M -100,800 C 200,900 400,200 600,300 S 800,-100 1100,100" />
        <path className="animate-ribbon" style={{ animationDelay: '2s' }} fill="none" stroke={isDark ? "white" : "black"} strokeWidth="0.5" strokeLinecap="round" d="M -100,820 C 180,920 420,180 620,320 S 780,-80 1100,120" />

        {/* Ribbon 2: The Pirouette */}
        <path className="animate-ribbon" style={{ animationDelay: '5s' }} fill="none" stroke={isDark ? "white" : "black"} strokeWidth="1" strokeLinecap="round" d="M 1100,700 C 700,800 600,400 300,600 C 100,733 -50,500 -100,400" />

        {/* Ribbon 3: The Flow */}
        <path className="animate-float-2" fill="none" stroke={isDark ? "white" : "black"} strokeWidth="0.2" d="M -100,500 Q 250,200 500,500 T 1100,500" />
      </svg>


      {/* Header Totem */}
      <header className="relative z-10 py-10 px-8 flex flex-col items-center animate-fade-in-up-soft" style={{ animationDelay: '0.1s' }}>

        <button
          onClick={() => setIsDark(!isDark)}
          className={`absolute top-6 right-8 p-3 rounded-full transition-all duration-300 z-50 ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-6 h-6 text-white" /> : <Moon className="w-6 h-6 text-black" />}
        </button>

        <div className="relative inline-block mb-3 text-center group">
          {/* Typographic Dance Elegance */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-playfair font-black tracking-normal uppercase relative z-10 transition-transform duration-700 ease-out group-hover:scale-105">
            Accademia
          </h1>
          <h2 className={`text-3xl md:text-4xl font-playfair font-light italic -mt-2 tracking-[0.2em] relative z-10 ${isDark ? 'text-white/70' : 'text-black/70'}`}>
            di Danza
          </h2>
          <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent to-transparent ${isDark ? 'via-white/40' : 'via-black/40'}`} />
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
        <div className={`w-full max-w-5xl backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 border relative overflow-hidden transition-all duration-700 ${isDark ? "bg-white/5 border-white/10 text-white shadow-[0_20px_60px_-15px_rgba(255,255,255,0.05)] hover:shadow-[0_30px_70px_-15px_rgba(255,255,255,0.08)]" : "bg-white/80 border-black/10 text-black shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.12)]"}`}>
          {/* Subtle inner reflection */}
          <div className={`absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent to-transparent ${isDark ? "via-white/20" : "via-black/20"}`} />

          <div className="relative z-10" key={`step-${step}`}>
            <div className="animate-fade-in-up-soft" style={{ animationDuration: '0.5s' }}>
              {renderStep()}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
