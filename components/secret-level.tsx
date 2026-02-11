"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { playBotones, playStar } from "@/lib/sounds"

interface SecretLevelProps {
  onComplete: () => void
}

interface Star {
  id: number
  x: number
  y: number
  size: number
  speed: number
  rotation: number
  rotationSpeed: number
  collected: boolean
  collectFrame: number
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

const STARS_NEEDED = 12

export default function SecretLevel({ onComplete }: SecretLevelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const sparklesRef = useRef<Sparkle[]>([])
  const [starsCollected, setStarsCollected] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const animFrameRef = useRef<number>(0)
  const nextIdRef = useRef(0)
  const collectedCountRef = useRef(0)

  const spawnStar = useCallback((canvasWidth: number, canvasHeight: number) => {
    const star: Star = {
      id: nextIdRef.current++,
      x: Math.random() * (canvasWidth - 80) + 40,
      y: -40,
      size: 18 + Math.random() * 14,
      speed: 1 + Math.random() * 1.8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4,
      collected: false,
      collectFrame: 0,
      glow: 0,
    }
    starsRef.current.push(star)
  }, [])

  const createSparkles = useCallback((x: number, y: number) => {
    const colors = ["#fbbf24", "#fde68a", "#f59e0b", "#fcd34d", "#ffffff"]
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10
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

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      for (const star of starsRef.current) {
        if (star.collected) continue
        const dx = mx - star.x
        const dy = my - star.y
        if (dx * dx + dy * dy < (star.size + 10) * (star.size + 10)) {
          star.collected = true
          playStar()
          createSparkles(star.x, star.y)
          collectedCountRef.current++
          setStarsCollected(collectedCountRef.current)
          break
        }
      }
    },
    [createSparkles],
  )

  const handleTouch = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      for (let t = 0; t < e.touches.length; t++) {
        const touch = e.touches[t]
        const mx = touch.clientX - rect.left
        const my = touch.clientY - rect.top

        for (const star of starsRef.current) {
          if (star.collected) continue
          const dx = mx - star.x
          const dy = my - star.y
          if (dx * dx + dy * dy < (star.size + 10) * (star.size + 10)) {
            star.collected = true
            playStar()
            createSparkles(star.x, star.y)
            collectedCountRef.current++
            setStarsCollected(collectedCountRef.current)
            break
          }
        }
      }
    },
    [createSparkles],
  )

  useEffect(() => {
    if (!gameStarted) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let spawnTimer = 0
    const spawnInterval = 50

    const drawStar = (cx: number, cy: number, size: number, rotation: number, glow: number) => {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate((rotation * Math.PI) / 180)

      // Glow
      ctx.shadowColor = "#fbbf24"
      ctx.shadowBlur = 15 + glow * 10

      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const x = Math.cos(angle) * size
        const y = Math.sin(angle) * size
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fillStyle = `rgba(251, 191, 36, ${0.9 + glow * 0.1})`
      ctx.fill()
      ctx.strokeStyle = "#fde68a"
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Inner glow
      ctx.shadowBlur = 0
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const x = Math.cos(angle) * size * 0.5
        const y = Math.sin(angle) * size * 0.5
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fillStyle = "rgba(253, 230, 138, 0.6)"
      ctx.fill()

      ctx.restore()
    }

    const animate = () => {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      spawnTimer++
      if (spawnTimer >= spawnInterval && starsRef.current.filter((s) => !s.collected).length < 8) {
        spawnStar(canvas.width, canvas.height)
        spawnTimer = 0
      }

      // Draw stars
      for (let i = starsRef.current.length - 1; i >= 0; i--) {
        const s = starsRef.current[i]
        if (s.collected) {
          s.collectFrame++
          if (s.collectFrame > 15) {
            starsRef.current.splice(i, 1)
          }
          continue
        }

        s.y += s.speed
        s.rotation += s.rotationSpeed
        s.glow = Math.sin(Date.now() * 0.003 + s.id) * 0.5 + 0.5

        if (s.y > canvas.height + 40) {
          starsRef.current.splice(i, 1)
          continue
        }

        drawStar(s.x, s.y, s.size, s.rotation, s.glow)
      }

      // Draw sparkles
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

      // Check win
      if (collectedCountRef.current >= STARS_NEEDED) {
        cancelAnimationFrame(animFrameRef.current)
        setTimeout(onComplete, 600)
        return
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    canvas.addEventListener("click", handleClick)
    canvas.addEventListener("touchstart", handleTouch, { passive: false })

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      canvas.removeEventListener("click", handleClick)
      canvas.removeEventListener("touchstart", handleTouch)
      window.removeEventListener("resize", handleResize)
    }
  }, [gameStarted, spawnStar, handleClick, handleTouch, onComplete])

  if (!gameStarted) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center gap-8 px-4"
        style={{ background: "linear-gradient(135deg, #0c1445 0%, #1a1a3e 50%, #0c1445 100%)" }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(251, 191, 36, 0.15)",
              color: "#fbbf24",
              border: "1px solid rgba(251, 191, 36, 0.3)",
            }}
          >
            Nivel Secreto
          </div>
          <h2 className="text-3xl font-bold md:text-5xl" style={{ color: "#fde68a" }}>
            Atrapa las Estrellas
          </h2>
          <p className="max-w-md text-lg leading-relaxed" style={{ color: "#bfdbfe" }}>
            {"Atrapa "}
            <span style={{ color: "#fbbf24" }}>{STARS_NEEDED} estrellas</span>
            {" magicas para desbloquear un regalo muy especial..."}
          </p>

          {/* Preview star */}
          <svg width="60" height="60" viewBox="0 0 60 60" className="my-2 animate-spin" style={{ animationDuration: "8s" }}>
            <polygon
              points="30,5 35,22 53,22 38,33 43,50 30,40 17,50 22,33 7,22 25,22"
              fill="#fbbf24"
              stroke="#fde68a"
              strokeWidth="1"
            />
            <polygon
              points="30,14 33,24 43,24 35,30 37,40 30,34 23,40 25,30 17,24 27,24"
              fill="rgba(253, 230, 138, 0.6)"
            />
          </svg>
        </div>
        <button
<<<<<<< HEAD
          onClick={() => {
            playBotones()
            setGameStarted(true)
          }}
=======
          onClick={() => setGameStarted(true)}
>>>>>>> 55c21f524c27787fdff62e65bb6f3610c6560f64
          className="cursor-pointer rounded-full px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #b45309, #d97706, #f59e0b)",
            color: "#ffffff",
            boxShadow: "0 0 25px rgba(245, 158, 11, 0.4)",
          }}
        >
          Comenzar
        </button>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0"
      style={{ background: "linear-gradient(180deg, #0c1445 0%, #1a1a3e 50%, #1e3a5f 100%)" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* HUD */}
      <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-3 p-4 pt-6">
        <div
          className="rounded-full px-5 py-2 text-sm font-semibold"
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            color: "#fde68a",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
          }}
        >
          Estrellas: {starsCollected} / {STARS_NEEDED}
        </div>

        {/* Progress bar */}
        <div
          className="h-3 w-48 overflow-hidden rounded-full"
          style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(251, 191, 36, 0.2)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(starsCollected / STARS_NEEDED) * 100}%`,
              background: "linear-gradient(90deg, #b45309, #f59e0b, #fbbf24)",
              boxShadow: "0 0 10px rgba(251, 191, 36, 0.5)",
            }}
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-10 text-center text-sm" style={{ color: "rgba(253, 230, 138, 0.5)" }}>
        {"Toca las estrellas doradas para atraparlas"}
      </div>
    </div>
  )
}
