"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
<<<<<<< HEAD
import { playBotones, playRonroneo } from "@/lib/sounds"
=======
import { playRonroneo } from "@/lib/sounds"
>>>>>>> 55c21f524c27787fdff62e65bb6f3610c6560f64

interface SimbaRevealProps {
  onRestart: () => void
}

export default function SimbaReveal({ onRestart }: SimbaRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showSimba, setShowSimba] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [showOscar, setShowOscar] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [easterEggClicks, setEasterEggClicks] = useState(0)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [simbaWiggle, setSimbaWiggle] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowSimba(true), 400)
    setTimeout(() => setShowMessage(true), 1500)
    setTimeout(() => setShowOscar(true), 2800)
    setTimeout(() => setShowButtons(true), 3800)
  }, [])

  // Easter egg: tap Simba's image 7 times
  const handleSimbaClick = () => {
    setSimbaWiggle(true)
    setTimeout(() => setSimbaWiggle(false), 500)
    const next = easterEggClicks + 1
    setEasterEggClicks(next)
    if (next >= 7 && !showEasterEgg) {
      setShowEasterEgg(true)
      playRonroneo()
    }
  }

  // Heart/confetti canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface FallingParticle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      color: string
      rotation: number
      rotSpeed: number
      type: "heart" | "star" | "confetti"
    }

    const particles: FallingParticle[] = []
    const colors = ["#60a5fa", "#93c5fd", "#fbbf24", "#fde68a", "#f9a8d4", "#ffffff", "#bfdbfe", "#38bdf8"]

    const spawnParticle = () => {
      if (particles.length < 70) {
        const type = Math.random() < 0.4 ? "heart" : Math.random() < 0.6 ? "star" : "confetti"
        particles.push({
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 1 + Math.random() * 2.5,
          size: 4 + Math.random() * 10,
          opacity: 0.5 + Math.random() * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 4,
          type,
        })
      }
    }

    const drawHeart = (
      x: number,
      y: number,
      size: number,
      rotation: number,
      color: string,
      opacity: number,
    ) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.globalAlpha = opacity
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(0, size * 0.3)
      ctx.bezierCurveTo(-size, -size * 0.3, -size * 0.5, -size, 0, -size * 0.5)
      ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.3, 0, size * 0.3)
      ctx.fill()
      ctx.restore()
    }

    const drawStar = (
      x: number,
      y: number,
      size: number,
      rotation: number,
      color: string,
      opacity: number,
    ) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.globalAlpha = opacity
      ctx.fillStyle = color
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
        const outerX = Math.cos(angle) * size
        const outerY = Math.sin(angle) * size
        const innerAngle = angle + Math.PI / 5
        const innerX = Math.cos(innerAngle) * size * 0.4
        const innerY = Math.sin(innerAngle) * size * 0.4
        if (i === 0) ctx.moveTo(outerX, outerY)
        else ctx.lineTo(outerX, outerY)
        ctx.lineTo(innerX, innerY)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const drawConfetti = (
      x: number,
      y: number,
      size: number,
      rotation: number,
      color: string,
      opacity: number,
    ) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.globalAlpha = opacity
      ctx.fillStyle = color
      ctx.fillRect(-size / 2, -size / 4, size, size / 2)
      ctx.restore()
    }

    let frame = 0
    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      if (frame % 8 === 0) spawnParticle()

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx + Math.sin(frame * 0.015 + i) * 0.6
        p.y += p.vy
        p.rotation += p.rotSpeed
        p.opacity -= 0.002

        if (p.y > canvas.height + 20 || p.opacity <= 0) {
          particles.splice(i, 1)
          continue
        }

        if (p.type === "heart") {
          drawHeart(p.x, p.y, p.size, p.rotation, p.color, p.opacity)
        } else if (p.type === "star") {
          drawStar(p.x, p.y, p.size, p.rotation, p.color, p.opacity)
        } else {
          drawConfetti(p.x, p.y, p.size, p.rotation, p.color, p.opacity)
        }
      }

      animId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center overflow-y-auto overflow-x-hidden"
      style={{
        background: "linear-gradient(135deg, #0c1445 0%, #1e3a5f 30%, #1a1a3e 60%, #0c1445 100%)",
      }}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen w-full max-w-lg flex-col items-center justify-center gap-4 px-4 py-8 text-center sm:gap-5 sm:py-10">
        {/* Gift unlock badge */}
        <div
          className="transition-all duration-700"
          style={{
            opacity: showSimba ? 1 : 0,
            transform: showSimba ? "scale(1)" : "scale(0.5)",
          }}
        >
          <div
            className="rounded-full px-4 py-1 text-[10px] font-semibold uppercase tracking-widest sm:text-xs"
            style={{
              background: "rgba(251, 191, 36, 0.15)",
              color: "#fbbf24",
              border: "1px solid rgba(251, 191, 36, 0.3)",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          >
            Regalo Desbloqueado
          </div>
        </div>

        {/* Simba image - clickable for easter egg */}
        <div
          className="transition-all duration-1000"
          style={{
            opacity: showSimba ? 1 : 0,
            transform: showSimba
              ? `scale(1) translateY(0) ${simbaWiggle ? "rotate(5deg)" : "rotate(0deg)"}`
              : "scale(0.3) translateY(60px)",
          }}
        >
          <button
            type="button"
            onClick={handleSimbaClick}
            className="relative cursor-pointer overflow-hidden rounded-3xl border-0 bg-transparent p-0"
            style={{
              boxShadow:
                "0 0 60px rgba(96, 165, 250, 0.3), 0 0 120px rgba(59, 130, 246, 0.15)",
              border: "3px solid rgba(147, 197, 253, 0.3)",
              transition: "transform 0.3s ease",
              animation: "float-gentle 4s ease-in-out infinite",
            }}
            aria-label="Simba - toca varias veces para un easter egg"
          >
            <Image
              src="/images/simba.png"
              alt="Simba, un gatito blanco con manchas grises"
              width={200}
              height={200}
              className="block"
              priority
            />
            {/* Name badge */}
            <div
              className="absolute inset-x-0 bottom-0 py-2 text-center text-xs font-bold tracking-wider sm:text-sm"
              style={{
                background: "linear-gradient(transparent, rgba(12, 20, 69, 0.9))",
                color: "#fbbf24",
              }}
            >
              SIMBA
            </div>
          </button>

          {/* Easter egg progress hint */}
          {easterEggClicks > 0 && easterEggClicks < 7 && (
            <div className="mt-2 flex items-center justify-center gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={`dot-${i}`}
                  className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                  style={{
                    background: i < easterEggClicks ? "#fbbf24" : "rgba(147, 197, 253, 0.3)",
                    transform: i < easterEggClicks ? "scale(1.3)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Main message */}
        <div
          className="flex flex-col items-center gap-1 transition-all duration-1000 sm:gap-2"
          style={{
            opacity: showMessage ? 1 : 0,
            transform: showMessage ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <h2
            className="text-balance text-2xl font-bold sm:text-3xl md:text-5xl"
            style={{
              background: "linear-gradient(to right, #60a5fa, #fbbf24, #93c5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {"Rescataste a Simba!"}
          </h2>
          <p
            className="max-w-xs text-sm leading-relaxed sm:max-w-sm sm:text-base md:text-lg"
            style={{ color: "#bfdbfe" }}
          >
            {"Felicidades"}
          </p>
        </div>

        {/* Oscar's personal message */}
        <div
          className="w-full max-w-md transition-all duration-1000"
          style={{
            opacity: showOscar ? 1 : 0,
            transform: showOscar ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
          }}
        >
          <div
            className="relative rounded-2xl p-4 sm:p-6"
            style={{
              background: "rgba(30, 58, 95, 0.6)",
              border: "1px solid rgba(147, 197, 253, 0.25)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span
              className="absolute -top-3 left-3 text-3xl leading-none sm:left-4 sm:text-4xl"
              style={{ color: "rgba(96, 165, 250, 0.4)" }}
              aria-hidden="true"
            >
              {'"'}
            </span>

            <p
              className="text-center text-sm leading-relaxed sm:text-base md:text-lg"
              style={{ color: "#e0f2fe" }}
            >
              {"Yo "}
              <span className="font-bold" style={{ color: "#60a5fa" }}>
                Oscar
              </span>
              {" te deseo un feliz cumple para ti, pasala bien con Simba"}
            </p>

            <span
              className="absolute -bottom-3 right-3 text-3xl leading-none sm:right-4 sm:text-4xl"
              style={{ color: "rgba(96, 165, 250, 0.4)" }}
              aria-hidden="true"
            >
              {'"'}
            </span>
          </div>

          {/* Signature */}
          <p className="mt-3 text-center text-xs font-medium sm:mt-4 sm:text-sm" style={{ color: "#93c5fd" }}>
            {"Con mucho carino,"}
          </p>
          <p
            className="text-center text-xl font-bold sm:text-2xl"
            style={{
              background: "linear-gradient(to right, #60a5fa, #38bdf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Oscar
          </p>

          {/* Heart decorations */}
          <div className="mt-2 flex items-center justify-center gap-2 sm:mt-3" aria-hidden="true">
            {[14, 10, 18, 10, 14].map((size, i) => (
              <svg
                key={`heart-${i}`}
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill={i === 2 ? "#f9a8d4" : "#60a5fa"}
                opacity={i === 2 ? 0.9 : 0.5}
                style={{
                  animation: `heart-beat ${1.5 + i * 0.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Easter Egg Reveal */}
        {showEasterEgg && (
          <div
            className="w-full max-w-md"
            style={{
              animation: "easter-egg-in 0.8s ease-out forwards",
            }}
          >
            <div
              className="rounded-2xl p-4 sm:p-5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(249, 168, 212, 0.15))",
                border: "1px solid rgba(251, 191, 36, 0.3)",
                backdropFilter: "blur(10px)",
              }}
            >
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#fbbf24" }}
              >
                Easter Egg Secreto
              </p>
              <p className="text-sm leading-relaxed sm:text-base" style={{ color: "#fde68a" }}>
                {"Encontraste el secreto! Simba te manda ronroneos infinitos. Cuida mucho de el, porque el siempre estara ahi para hacerte sonreir."}
              </p>
              <div className="mt-3 flex items-center justify-center gap-1" aria-hidden="true">
                {["#fbbf24", "#f9a8d4", "#60a5fa", "#f9a8d4", "#fbbf24"].map((color, i) => (
                  <svg
                    key={`paw-${i}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={color}
                    opacity="0.7"
                    style={{
                      animation: `paw-bounce 0.6s ease-out forwards`,
                      animationDelay: `${i * 0.1 + 0.3}s`,
                      opacity: 0,
                    }}
                  >
                    <circle cx="7" cy="8" r="2.5" />
                    <circle cx="17" cy="8" r="2.5" />
                    <circle cx="4" cy="14" r="2" />
                    <circle cx="20" cy="14" r="2" />
                    <ellipse cx="12" cy="17" rx="5" ry="4" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Back to start button */}
        <div
          className="mt-2 transition-all duration-700"
          style={{
            opacity: showButtons ? 1 : 0,
            transform: showButtons ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <button
            type="button"
<<<<<<< HEAD
            onClick={() => {
              playBotones()
              onRestart()
            }}
=======
            onClick={onRestart}
>>>>>>> 55c21f524c27787fdff62e65bb6f3610c6560f64
            className="group relative cursor-pointer overflow-hidden rounded-full px-8 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 sm:px-10 sm:py-4 sm:text-base"
            style={{
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              color: "#ffffff",
              boxShadow: "0 0 25px rgba(59, 130, 246, 0.3), 0 0 50px rgba(59, 130, 246, 0.15)",
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Volver al inicio
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
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(251, 191, 36, 0.2); }
          50% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.4); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes heart-beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes easter-egg-in {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          60% { transform: scale(1.05) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes paw-bounce {
          0% { opacity: 0; transform: scale(0) translateY(10px); }
          60% { transform: scale(1.3) translateY(-3px); }
          100% { opacity: 0.7; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
