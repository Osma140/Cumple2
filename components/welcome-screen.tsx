"use client"

import { useEffect, useRef, useState } from "react"
import { playBotones } from "@/lib/sounds"
import AzulEasterEgg from "@/components/azul-easter-egg"

interface WelcomeScreenProps {
  onStart: () => void
}

function calculateTimeLeft() {
  const now = new Date()
  const currentYear = now.getFullYear()
  let target = new Date(currentYear, 1, 21, 0, 0, 0, 0)

  if (now >= target) {
    target = new Date(currentYear + 1, 1, 21, 0, 0, 0, 0)
  }

  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, arrived: true }
  }

  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    arrived: false,
  }
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)
  const [showContent, setShowContent] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [showAzulEasterEgg, setShowAzulEasterEgg] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300)
    setTimeout(() => setShowTimer(true), 800)
    setTimeout(() => setShowButton(true), 1400)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars: { x: number; y: number; r: number; opacity: number; speed: number }[] = []
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 0.5,
        opacity: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
      })
    }

    // Shooting stars
    const shootingStars: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = []

    let animationId: number
    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      // Twinkling stars
      for (const star of stars) {
        star.opacity += star.speed
        if (star.opacity > 1 || star.opacity < 0) star.speed *= -1
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(147, 197, 253, ${Math.abs(star.opacity)})`
        ctx.fill()
      }

      // Shooting stars
      if (frame % 180 === 0 && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.3,
          vx: 4 + Math.random() * 4,
          vy: 2 + Math.random() * 2,
          life: 1,
          maxLife: 60 + Math.random() * 40,
        })
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i]
        s.x += s.vx
        s.y += s.vy
        s.life -= 1 / s.maxLife
        if (s.life <= 0) {
          shootingStars.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8)
        const gradient = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 8, s.y - s.vy * 8)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${s.life})`)
        gradient.addColorStop(1, "rgba(147, 197, 253, 0)")
        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.stroke()
      }

      animationId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <>
      {showAzulEasterEgg && (
        <AzulEasterEgg onClose={() => setShowAzulEasterEgg(false)} />
      )}
      <div
        className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1445 0%, #1e3a5f 40%, #1a5276 70%, #0c1445 100%)",
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />

      {/* Floating decorative balloons */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {[...Array(8)].map((_, i) => (
          <div
            key={`balloon-${i}`}
            className="absolute"
            style={{
              left: `${5 + i * 12}%`,
              bottom: "-60px",
              animation: `floatUp ${7 + i * 1.5}s ease-in-out infinite`,
              animationDelay: `${i * 1.2}s`,
            }}
          >
            <svg width="36" height="50" viewBox="0 0 40 56" aria-hidden="true">
              <ellipse
                cx="20"
                cy="20"
                rx="18"
                ry="22"
                fill={
                  ["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb", "#1d4ed8", "#38bdf8", "#7dd3fc", "#0ea5e9"][i]
                }
                opacity="0.7"
              />
              <line x1="20" y1="42" x2="20" y2="56" stroke="#93c5fd" strokeWidth="1" />
            </svg>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-6 px-5 text-center">
        {/* Birthday cake icon */}
        <div
          className="transition-all duration-700"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? "translateY(0) scale(1)" : "translateY(-30px) scale(0.8)",
          }}
        >
          <svg
            width="70"
            height="70"
            viewBox="0 0 80 80"
            className="animate-bounce"
            aria-hidden="true"
          >
            <rect x="15" y="40" width="50" height="30" rx="6" fill="#60a5fa" />
            <rect x="10" y="35" width="60" height="12" rx="4" fill="#93c5fd" />
            <rect x="36" y="15" width="8" height="20" rx="2" fill="#fbbf24" />
            <ellipse cx="40" cy="12" rx="5" ry="7" fill="#f97316" opacity="0.9" />
            <ellipse cx="40" cy="10" rx="3" ry="4" fill="#fcd34d" />
            <circle cx="25" cy="50" r="2" fill="#dbeafe" />
            <circle cx="40" cy="52" r="2" fill="#dbeafe" />
            <circle cx="55" cy="50" r="2" fill="#dbeafe" />
          </svg>
        </div>

        {/* Title */}
        <div
          className="flex flex-col items-center gap-2 transition-all duration-700"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p
            className="text-xs font-medium uppercase tracking-[0.3em] sm:text-sm"
            style={{ color: "#93c5fd" }}
          >
            Una sorpresa especial para
          </p>
          <button
            type="button"
            onClick={() => {
              playBotones()
              setShowAzulEasterEgg(true)
            }}
            className="cursor-pointer text-balance text-5xl font-bold tracking-tight transition-transform hover:scale-105 active:scale-95 sm:text-6xl md:text-7xl"
            style={{
              background: "linear-gradient(to right, #60a5fa, #38bdf8, #93c5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s ease-in-out infinite",
              border: "none",
              padding: 0,
            }}
            aria-label="Azul - toca para un easter egg"
          >
            Azul
          </button>
          <div className="flex items-center gap-3" style={{ color: "#60a5fa" }} aria-hidden="true">
            <span className="h-px w-10 bg-current sm:w-12" />
            <svg width="18" height="18" viewBox="0 0 20 20">
              <polygon points="10,0 12,7 20,7 14,12 16,20 10,15 4,20 6,12 0,7 8,7" fill="currentColor" />
            </svg>
            <span className="h-px w-10 bg-current sm:w-12" />
          </div>
          <p className="text-base sm:text-lg md:text-xl" style={{ color: "#bfdbfe" }}>
            {"Hoy es un dia muy especial..."}
          </p>
        </div>

        {/* Countdown timer */}
        <div
          className="w-full max-w-sm transition-all duration-1000"
          style={{
            opacity: showTimer ? 1 : 0,
            transform: showTimer ? "translateY(0) scale(1)" : "translateY(30px) scale(0.9)",
          }}
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(96, 165, 250, 0.2)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#60a5fa" }}
            >
              {timeLeft.arrived ? "Feliz Cumple Azul!" : "Cuenta regresiva - 21 de Febrero"}
            </p>

            {timeLeft.arrived ? (
              <div className="flex flex-col items-center gap-1">
                <p
                  className="text-2xl font-bold sm:text-3xl"
                  style={{
                    background: "linear-gradient(to right, #fbbf24, #f97316)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {"Es hoy! Felicidades!"}
                </p>
                <p className="text-sm" style={{ color: "#93c5fd" }}>
                  {"El dia especial de Azul ha llegado"}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {[
                  { label: "Dias", value: timeLeft.days },
                  { label: "Hrs", value: timeLeft.hours },
                  { label: "Min", value: timeLeft.minutes },
                  { label: "Seg", value: timeLeft.seconds },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold tabular-nums sm:h-14 sm:w-14 sm:text-2xl"
                      style={{
                        background: "rgba(30, 58, 95, 0.8)",
                        color: "#fde68a",
                        border: "1px solid rgba(251, 191, 36, 0.2)",
                        boxShadow: "0 0 12px rgba(251, 191, 36, 0.1)",
                      }}
                    >
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <span className="mt-1 text-[10px] sm:text-xs" style={{ color: "rgba(147, 197, 253, 0.7)" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Festejar button */}
        <div
          className="transition-all duration-700"
          style={{
            opacity: showButton ? 1 : 0,
            transform: showButton ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              playBotones()
              onStart()
            }}
            className="group relative cursor-pointer overflow-hidden rounded-full px-10 py-4 text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95 sm:text-lg"
            style={{
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              color: "#ffffff",
              boxShadow: "0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)",
            }}
            aria-label="Comenzar a festejar"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M5 3v14l12-7z" />
              </svg>
              Festejar
            </span>
            <span
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-110vh) rotate(15deg);
            opacity: 0;
          }
        }
        @keyframes shimmer {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.3);
          }
        }
      `}</style>
      </div>
    </>
  )
}
