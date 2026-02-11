"use client"

import { useEffect, useRef, useState } from "react"
import { playBotones } from "@/lib/sounds"

interface Confetti {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  rotation: number
  rotationSpeed: number
  width: number
  height: number
  life: number
}

interface CakeRevealProps {
  onCakeClick?: () => void
}

export default function CakeReveal({ onCakeClick }: CakeRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showMessage, setShowMessage] = useState(false)
  const [showCake, setShowCake] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowCake(true), 300)
    setTimeout(() => setShowMessage(true), 1200)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const confetti: Confetti[] = []
    const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#38bdf8", "#ffffff", "#7dd3fc", "#bfdbfe"]

    const spawnBurst = () => {
      for (let i = 0; i < 100; i++) {
        confetti.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 200,
          y: canvas.height * 0.4,
          vx: (Math.random() - 0.5) * 12,
          vy: -Math.random() * 10 - 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          width: 6 + Math.random() * 6,
          height: 3 + Math.random() * 3,
          life: 1,
        })
      }
    }

    // Continuous gentle confetti from top
    const spawnGentleConfetti = () => {
      if (confetti.length < 200) {
        confetti.push({
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 2,
          vy: 1 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 5,
          width: 5 + Math.random() * 5,
          height: 3 + Math.random() * 3,
          life: 1,
        })
      }
    }

    spawnBurst()
    setTimeout(spawnBurst, 500)
    setTimeout(spawnBurst, 1000)

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      if (frame % 8 === 0) spawnGentleConfetti()

      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i]
        c.x += c.vx
        c.y += c.vy
        c.vy += 0.08
        c.vx *= 0.99
        c.rotation += c.rotationSpeed

        if (c.y > canvas.height + 20) {
          confetti.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.rotate((c.rotation * Math.PI) / 180)
        ctx.fillStyle = c.color
        ctx.globalAlpha = Math.min(1, c.life)
        ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height)
        ctx.restore()
      }

      requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0c1445 0%, #1e3a5f 40%, #1a5276 70%, #0c1445 100%)" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        {/* Birthday Cake SVG */}
        <div
          className="transition-all duration-1000"
          style={{
            opacity: showCake ? 1 : 0,
            transform: showCake ? "scale(1) translateY(0)" : "scale(0.5) translateY(40px)",
          }}
        >
          <svg
            width="220"
            height="260"
            viewBox="0 0 220 260"
            className="drop-shadow-2xl cursor-pointer transition-transform duration-300 hover:scale-110"
            role="button"
            tabIndex={0}
            aria-label="Haz clic en el pastel para un nivel secreto"
            onClick={() => {
              playBotones()
              onCakeClick?.()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                playBotones()
                onCakeClick?.()
              }
            }}
          >
            {/* Plate */}
            <ellipse cx="110" cy="240" rx="105" ry="15" fill="#1e3a5f" opacity="0.5" />

            {/* Bottom tier */}
            <rect x="30" y="170" width="160" height="60" rx="10" fill="#2563eb" />
            <rect x="30" y="170" width="160" height="15" rx="7" fill="#3b82f6" />
            {/* Frosting drips */}
            <ellipse cx="55" cy="185" rx="8" ry="12" fill="#60a5fa" />
            <ellipse cx="90" cy="188" rx="6" ry="10" fill="#60a5fa" />
            <ellipse cx="130" cy="186" rx="7" ry="11" fill="#60a5fa" />
            <ellipse cx="165" cy="185" rx="8" ry="13" fill="#60a5fa" />
            {/* Dots decoration */}
            <circle cx="55" cy="205" r="3" fill="#93c5fd" />
            <circle cx="80" cy="210" r="3" fill="#93c5fd" />
            <circle cx="110" cy="207" r="3" fill="#93c5fd" />
            <circle cx="140" cy="210" r="3" fill="#93c5fd" />
            <circle cx="165" cy="205" r="3" fill="#93c5fd" />

            {/* Middle tier */}
            <rect x="50" y="115" width="120" height="55" rx="8" fill="#3b82f6" />
            <rect x="50" y="115" width="120" height="12" rx="6" fill="#60a5fa" />
            {/* Frosting drips */}
            <ellipse cx="70" cy="127" rx="6" ry="10" fill="#93c5fd" />
            <ellipse cx="110" cy="129" rx="7" ry="11" fill="#93c5fd" />
            <ellipse cx="150" cy="127" rx="6" ry="9" fill="#93c5fd" />
            {/* Star decorations */}
            <polygon points="75,140 77,146 83,146 78,150 80,156 75,152 70,156 72,150 67,146 73,146" fill="#bfdbfe" />
            <polygon points="145,140 147,146 153,146 148,150 150,156 145,152 140,156 142,150 137,146 143,146" fill="#bfdbfe" />

            {/* Top tier */}
            <rect x="70" y="65" width="80" height="50" rx="8" fill="#60a5fa" />
            <rect x="70" y="65" width="80" height="10" rx="5" fill="#93c5fd" />
            {/* Heart decoration */}
            <path d="M105,85 C105,82 100,78 96,82 C92,78 87,82 87,85 C87,92 96,98 96,98 C96,98 105,92 105,85Z" fill="#bfdbfe" />
            <path d="M133,85 C133,82 128,78 124,82 C120,78 115,82 115,85 C115,92 124,98 124,98 C124,98 133,92 133,85Z" fill="#bfdbfe" />

            {/* Candles */}
            <rect x="88" y="30" width="6" height="35" rx="2" fill="#38bdf8" />
            <rect x="107" y="25" width="6" height="40" rx="2" fill="#7dd3fc" />
            <rect x="126" y="30" width="6" height="35" rx="2" fill="#38bdf8" />

            {/* Flames */}
            <g>
              <ellipse cx="91" cy="24" rx="5" ry="8" fill="#fbbf24" opacity="0.9">
                <animate attributeName="ry" values="8;10;8" dur="0.6s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="91" cy="22" rx="3" ry="5" fill="#fef3c7">
                <animate attributeName="ry" values="5;7;5" dur="0.5s" repeatCount="indefinite" />
              </ellipse>
            </g>
            <g>
              <ellipse cx="110" cy="19" rx="5" ry="8" fill="#f97316" opacity="0.9">
                <animate attributeName="ry" values="8;10;8" dur="0.7s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="110" cy="17" rx="3" ry="5" fill="#fde68a">
                <animate attributeName="ry" values="5;6;5" dur="0.4s" repeatCount="indefinite" />
              </ellipse>
            </g>
            <g>
              <ellipse cx="129" cy="24" rx="5" ry="8" fill="#fbbf24" opacity="0.9">
                <animate attributeName="ry" values="8;9;8" dur="0.55s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="129" cy="22" rx="3" ry="5" fill="#fef3c7">
                <animate attributeName="ry" values="5;7;5" dur="0.65s" repeatCount="indefinite" />
              </ellipse>
            </g>

            {/* Sparkles */}
            <circle cx="40" cy="150" r="2" fill="#93c5fd" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="180" cy="130" r="2" fill="#93c5fd" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="25" cy="100" r="1.5" fill="#bfdbfe" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="195" cy="90" r="1.5" fill="#bfdbfe" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* Message */}
        <div
          className="flex flex-col items-center gap-3 transition-all duration-1000"
          style={{
            opacity: showMessage ? 1 : 0,
            transform: showMessage ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <h1
            className="text-4xl font-bold md:text-6xl text-balance"
            style={{
              background: "linear-gradient(to right, #60a5fa, #38bdf8, #93c5fd, #60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {"Feliz Cumple, Azul!"}
          </h1>
          <p className="max-w-lg text-lg leading-relaxed md:text-xl" style={{ color: "#bfdbfe" }}>
            {"Que este dia este lleno de alegria, amor y muchas sorpresas hermosas. Te mereces todo lo mejor del mundo."}
          </p>

          {onCakeClick && (
            <p
              className="mt-2 animate-pulse text-sm"
              style={{ color: "rgba(147, 197, 253, 0.7)" }}
            >
              {"Haz clic en el pastel para una sorpresa secreta..."}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3" style={{ color: "#60a5fa" }} aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,0 14.4,8.4 24,8.4 16.8,14.4 19.2,24 12,18 4.8,24 7.2,14.4 0,8.4 9.6,8.4" />
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
              <polygon points="12,0 14.4,8.4 24,8.4 16.8,14.4 19.2,24 12,18 4.8,24 7.2,14.4 0,8.4 9.6,8.4" />
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
              <polygon points="12,0 14.4,8.4 24,8.4 16.8,14.4 19.2,24 12,18 4.8,24 7.2,14.4 0,8.4 9.6,8.4" />
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,0 14.4,8.4 24,8.4 16.8,14.4 19.2,24 12,18 4.8,24 7.2,14.4 0,8.4 9.6,8.4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
