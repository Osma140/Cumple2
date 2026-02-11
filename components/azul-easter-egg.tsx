"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { playBotones, playStar } from "@/lib/sounds"

interface AzulEasterEggProps {
  onClose: () => void
}

const TARGET_WORD = "AZUL"

interface StarLetter {
  id: number
  x: number
  y: number
  letter: string
  size: number
  collected: boolean
  collectFrame: number
  rotation: number
  glow: number
}

interface Sparkle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

export default function AzulEasterEgg({ onClose }: AzulEasterEggProps) {
  const [phase, setPhase] = useState<"flying" | "stars" | "done">("flying")
  const flyingCanvasRef = useRef<HTMLCanvasElement>(null)
  const starsCanvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<StarLetter[]>([])
  const sparklesRef = useRef<Sparkle[]>([])
  const collectedRef = useRef<string[]>([])
  const [collected, setCollected] = useState<string[]>([])
  const nextIdRef = useRef(0)
  const animRef = useRef<number>(0)

  // Fase 1: animación de subir al cielo (~2.5s)
  useEffect(() => {
    if (phase !== "flying") return
    const t = setTimeout(() => setPhase("stars"), 2800)
    return () => clearTimeout(t)
  }, [phase])

  // Canvas: estrellas cayendo (efecto de ascender)
  useEffect(() => {
    if (phase !== "flying") return
    const canvas = flyingCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars: { x: number; y: number; r: number; opacity: number; speed: number }[] = []
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1 + Math.random() * 2.5,
        opacity: 0.3 + Math.random() * 0.7,
        speed: 1.5 + Math.random() * 3,
      })
    }

    let start = Date.now()
    const animate = () => {
      const elapsed = (Date.now() - start) / 1000
      ctx.fillStyle = "rgba(12, 20, 69, 0.15)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (const s of stars) {
        s.y += s.speed
        if (s.y > canvas.height + 10) {
          s.y = -5
          s.x = Math.random() * canvas.width
        }
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(147, 197, 253, ${s.opacity})`
        ctx.fill()
      }

      if (phase === "flying") animRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animRef.current)
  }, [phase])

  // Inicializar estrellas con letras para formar AZUL
  const initStars = useCallback((width: number, height: number) => {
    const letters = TARGET_WORD.split("")
    const extraLetters = "BCDEFGHIJKMNOPQRSTVWXY".split("")
    const positions: { x: number; y: number }[] = []
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.28
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 - Math.PI / 2
      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      })
    }
    const stars: StarLetter[] = letters.map((letter, i) => ({
      id: nextIdRef.current++,
      x: positions[i].x,
      y: positions[i].y,
      letter,
      size: 28 + Math.random() * 8,
      collected: false,
      collectFrame: 0,
      rotation: 0,
      glow: 0,
    }))
    for (let j = 0; j < 6; j++) {
      stars.push({
        id: nextIdRef.current++,
        x: centerX + (Math.random() - 0.5) * width * 0.6,
        y: centerY + (Math.random() - 0.5) * height * 0.5,
        letter: extraLetters[Math.floor(Math.random() * extraLetters.length)],
        size: 18 + Math.random() * 12,
        collected: false,
        collectFrame: 0,
        rotation: Math.random() * 360,
        glow: 0,
      })
    }
    starsRef.current = stars.sort(() => Math.random() - 0.5)
  }, [])

  const createSparkles = useCallback((x: number, y: number) => {
    const colors = ["#fbbf24", "#fde68a", "#93c5fd", "#60a5fa", "#ffffff"]
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12
      sparklesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 4,
      })
    }
  }, [])

  const handleStarClick = useCallback(
    (e: MouseEvent) => {
      const canvas = starsCanvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const nextLetter = TARGET_WORD[collectedRef.current.length]

      for (const star of starsRef.current) {
        if (star.collected) continue
        const dx = mx - star.x
        const dy = my - star.y
        if (dx * dx + dy * dy < (star.size + 8) * (star.size + 8)) {
          if (star.letter !== nextLetter) return
          star.collected = true
          playStar()
          createSparkles(star.x, star.y)
          collectedRef.current.push(star.letter)
          setCollected([...collectedRef.current])
          if (collectedRef.current.length >= TARGET_WORD.length) {
            setPhase("done")
          }
          break
        }
      }
    },
    [createSparkles],
  )

  const handleStarTouch = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      const canvas = starsCanvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        const mx = touch.clientX - rect.left
        const my = touch.clientY - rect.top
        const nextLetter = TARGET_WORD[collectedRef.current.length]

        for (const star of starsRef.current) {
          if (star.collected) continue
          const dx = mx - star.x
          const dy = my - star.y
          if (dx * dx + dy * dy < (star.size + 8) * (star.size + 8)) {
            if (star.letter !== nextLetter) return
            star.collected = true
            playStar()
            createSparkles(star.x, star.y)
            collectedRef.current.push(star.letter)
            setCollected([...collectedRef.current])
            if (collectedRef.current.length >= TARGET_WORD.length) {
              setPhase("done")
            }
            break
          }
        }
      }
    },
    [createSparkles],
  )

  // Fase 2: juego de estrellas
  useEffect(() => {
    if (phase !== "stars") return
    const canvas = starsCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    if (starsRef.current.length === 0) initStars(canvas.width, canvas.height)

    const animate = () => {
      if (phase !== "stars") return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const star of starsRef.current) {
        star.glow = Math.sin(Date.now() * 0.003 + star.id) * 0.5 + 0.5
        if (star.collected) {
          star.collectFrame++
          continue
        }

        ctx.save()
        ctx.translate(star.x, star.y)
        ctx.rotate((star.rotation * Math.PI) / 180)
        ctx.shadowColor = "#fbbf24"
        ctx.shadowBlur = 10 + star.glow * 12
        ctx.fillStyle = `rgba(251, 191, 36, ${0.85 + star.glow * 0.15})`
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
          const x = Math.cos(angle) * star.size
          const y = Math.sin(angle) * star.size
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = "#fde68a"
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.fillStyle = "#1e3a5f"
        ctx.font = `bold ${star.size * 0.9}px sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(star.letter, 0, 0)
        ctx.restore()
      }

      for (let i = sparklesRef.current.length - 1; i >= 0; i--) {
        const p = sparklesRef.current[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08
        p.life -= 0.025
        if (p.life <= 0) {
          sparklesRef.current.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.life
        ctx.fill()
        ctx.globalAlpha = 1
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animRef.current)
  }, [phase, initStars])

  useEffect(() => {
    if (phase !== "stars") return
    const canvas = starsCanvasRef.current
    if (!canvas) return
    canvas.addEventListener("click", handleStarClick)
    canvas.addEventListener("touchstart", handleStarTouch, { passive: false })
    return () => {
      canvas.removeEventListener("click", handleStarClick)
      canvas.removeEventListener("touchstart", handleStarTouch)
    }
  }, [phase, handleStarClick, handleStarTouch])

  if (phase === "flying") {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #0c1445 0%, #1e3a5f 40%, #0f172a 100%)",
        }}
      >
        <canvas ref={flyingCanvasRef} className="absolute inset-0" aria-hidden="true" />
        <p
          className="relative z-10 text-lg font-medium sm:text-xl"
          style={{ color: "rgba(147, 197, 253, 0.9)" }}
        >
          Subiendo al cielo...
        </p>
      </div>
    )
  }

  if (phase === "stars") {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{
          background: "linear-gradient(180deg, #0c1445 0%, #1a1a3e 50%, #0c1445 100%)",
        }}
      >
        <canvas ref={starsCanvasRef} className="absolute inset-0" />
        <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-2 p-4 pt-6">
          <p className="text-sm font-semibold" style={{ color: "#fde68a" }}>
            Une las estrellas para formar la palabra
          </p>
          <div className="flex gap-2">
            {TARGET_WORD.split("").map((letter, i) => (
              <span
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold"
                style={{
                  background: collected.includes(letter)
                    ? "linear-gradient(135deg, #f59e0b, #fbbf24)"
                    : "rgba(15, 23, 42, 0.7)",
                  color: collected.includes(letter) ? "#1e3a5f" : "rgba(253, 230, 138, 0.5)",
                  border: `1px solid ${collected.includes(letter) ? "#fbbf24" : "rgba(251, 191, 36, 0.2)"}`,
                }}
              >
                {collected.length > i ? letter : "?"}
              </span>
            ))}
          </div>
        </div>
        <p
          className="absolute inset-x-0 bottom-8 z-10 text-center text-sm"
          style={{ color: "rgba(147, 197, 253, 0.6)" }}
        >
          Toca las estrellas en el orden correcto: A → Z → U → L
        </p>
      </div>
    )
  }

  // phase === "done"
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-4"
      style={{
        background: "linear-gradient(135deg, #0c1445 0%, #1e3a5f 50%, #0c1445 100%)",
      }}
    >
      <h2
        className="text-5xl font-bold md:text-7xl"
        style={{
          background: "linear-gradient(to right, #60a5fa, #fbbf24, #93c5fd)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        ¡AZUL!
      </h2>
      <p className="text-lg" style={{ color: "#bfdbfe" }}>
        Has unido las estrellas
      </p>
      <button
        type="button"
        onClick={() => {
          playBotones()
          onClose()
        }}
        className="cursor-pointer rounded-full px-8 py-3 text-lg font-semibold transition-all hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          color: "#fff",
          boxShadow: "0 0 25px rgba(59, 130, 246, 0.4)",
        }}
      >
        Volver
      </button>
    </div>
  )
}
