"use client"

import { useCallback, useEffect, useRef, useState } from "react"
<<<<<<< HEAD
import { playBotones, playPop } from "@/lib/sounds"
=======
import { playPop } from "@/lib/sounds"
>>>>>>> 55c21f524c27787fdff62e65bb6f3610c6560f64

interface Balloon {
  id: number
  x: number
  y: number
  radius: number
  color: string
  speed: number
  wobble: number
  wobbleSpeed: number
  popped: boolean
  popFrame: number
  letter: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
  size: number
}

interface BalloonGameProps {
  onComplete: () => void
}

const TARGET_WORD = "FELIZ CUMPLE"
const BALLOON_COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#1d4ed8", "#38bdf8", "#0ea5e9", "#1e40af", "#7dd3fc"]

export default function BalloonGame({ onComplete }: BalloonGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const balloonsRef = useRef<Balloon[]>([])
  const particlesRef = useRef<Particle[]>([])
  const collectedRef = useRef<string[]>([])
  const [collected, setCollected] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const animFrameRef = useRef<number>(0)
  const nextIdRef = useRef(0)

  const targetLetters = TARGET_WORD.split("")

  const spawnBalloon = useCallback((canvasWidth: number, canvasHeight: number) => {
    const remaining = targetLetters.filter(
      (l, i) => !collectedRef.current.includes(`${l}-${i}`)
    )
    const extras = "ABCDEGHIJKNOPQRSTUVWXYZ".split("")
    const allLetters = [...remaining.map((l) => l), ...extras.slice(0, 5)]
    const letter = allLetters[Math.floor(Math.random() * allLetters.length)]

    const balloon: Balloon = {
      id: nextIdRef.current++,
      x: Math.random() * (canvasWidth - 80) + 40,
      y: canvasHeight + 50,
      radius: 30 + Math.random() * 15,
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      speed: 1.2 + Math.random() * 1.5,
      wobble: 0,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      popped: false,
      popFrame: 0,
      letter: letter === " " ? " " : letter,
    }
    balloonsRef.current.push(balloon)
  }, [targetLetters])

  const createPopParticles = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        color,
        life: 1,
        size: 3 + Math.random() * 4,
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

      for (const balloon of balloonsRef.current) {
        if (balloon.popped) continue
        const dx = mx - balloon.x
        const dy = my - balloon.y
        if (dx * dx + dy * dy < balloon.radius * balloon.radius) {
          balloon.popped = true
          playPop()
          createPopParticles(balloon.x, balloon.y, balloon.color)

          // Check if this letter is needed
          const letter = balloon.letter
          for (let i = 0; i < targetLetters.length; i++) {
            const key = `${targetLetters[i]}-${i}`
            if (targetLetters[i] === letter && !collectedRef.current.includes(key)) {
              collectedRef.current.push(key)
              setCollected([...collectedRef.current])
              setScore((s) => s + 10)
              break
            }
          }
          break
        }
      }
    },
    [createPopParticles, targetLetters]
  )

  const handleTouch = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i]
        const mx = touch.clientX - rect.left
        const my = touch.clientY - rect.top

        for (const balloon of balloonsRef.current) {
          if (balloon.popped) continue
          const dx = mx - balloon.x
          const dy = my - balloon.y
          if (dx * dx + dy * dy < balloon.radius * balloon.radius) {
            balloon.popped = true
            playPop()
            createPopParticles(balloon.x, balloon.y, balloon.color)
            const letter = balloon.letter
            for (let j = 0; j < targetLetters.length; j++) {
              const key = `${targetLetters[j]}-${j}`
              if (targetLetters[j] === letter && !collectedRef.current.includes(key)) {
                collectedRef.current.push(key)
                setCollected([...collectedRef.current])
                setScore((s) => s + 10)
                break
              }
            }
            break
          }
        }
      }
    },
    [createPopParticles, targetLetters]
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
    const spawnInterval = 40

    const animate = () => {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn balloons
      spawnTimer++
      if (spawnTimer >= spawnInterval && balloonsRef.current.length < 15) {
        spawnBalloon(canvas.width, canvas.height)
        spawnTimer = 0
      }

      // Draw and update balloons
      for (let i = balloonsRef.current.length - 1; i >= 0; i--) {
        const b = balloonsRef.current[i]
        if (b.popped) {
          b.popFrame++
          if (b.popFrame > 15) {
            balloonsRef.current.splice(i, 1)
          }
          continue
        }

        b.y -= b.speed
        b.wobble += b.wobbleSpeed
        const offsetX = Math.sin(b.wobble) * 15

        // Remove off-screen
        if (b.y < -60) {
          balloonsRef.current.splice(i, 1)
          continue
        }

        // Balloon body
        ctx.save()
        ctx.translate(b.x + offsetX, b.y)

        // Glow effect
        ctx.shadowColor = b.color
        ctx.shadowBlur = 20

        // Main balloon
        ctx.beginPath()
        ctx.ellipse(0, 0, b.radius, b.radius * 1.2, 0, 0, Math.PI * 2)
        ctx.fillStyle = b.color
        ctx.fill()

        // Shine
        ctx.beginPath()
        ctx.ellipse(-b.radius * 0.3, -b.radius * 0.4, b.radius * 0.2, b.radius * 0.35, -0.3, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255,255,255,0.3)"
        ctx.fill()

        ctx.shadowBlur = 0

        // Knot
        ctx.beginPath()
        ctx.moveTo(-4, b.radius * 1.15)
        ctx.lineTo(0, b.radius * 1.3)
        ctx.lineTo(4, b.radius * 1.15)
        ctx.fillStyle = b.color
        ctx.fill()

        // String
        ctx.beginPath()
        ctx.moveTo(0, b.radius * 1.3)
        ctx.quadraticCurveTo(5, b.radius * 1.6, -3, b.radius * 1.9)
        ctx.strokeStyle = "rgba(147, 197, 253, 0.6)"
        ctx.lineWidth = 1
        ctx.stroke()

        // Letter
        ctx.fillStyle = "#ffffff"
        ctx.font = `bold ${b.radius * 0.8}px sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(b.letter, 0, 0)

        ctx.restore()
      }

      // Draw and update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.1
        p.life -= 0.02

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.life
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Check completion
      if (collectedRef.current.length >= targetLetters.length) {
        cancelAnimationFrame(animFrameRef.current)
        setTimeout(onComplete, 800)
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
  }, [gameStarted, spawnBalloon, handleClick, handleTouch, onComplete, targetLetters])

  if (!gameStarted) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center gap-8 px-4"
        style={{ background: "linear-gradient(135deg, #0c1445 0%, #1e3a5f 50%, #0c1445 100%)" }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <h2
            className="text-3xl font-bold md:text-5xl"
            style={{ color: "#93c5fd" }}
          >
            Juego de Globos
          </h2>
          <p className="max-w-md text-lg" style={{ color: "#bfdbfe" }}>
            {"Revienta los globos con las letras correctas para deletrear"}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {TARGET_WORD.split("").map((letter, i) => (
              <span
                key={`target-${i}-${letter}`}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold"
                style={{
                  background: "rgba(37, 99, 235, 0.3)",
                  color: "#93c5fd",
                  border: "1px solid rgba(147, 197, 253, 0.3)",
                }}
              >
                {letter === " " ? "" : letter}
              </span>
            ))}
          </div>
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
            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
            color: "#ffffff",
            boxShadow: "0 0 25px rgba(59, 130, 246, 0.4)",
          }}
        >
          Jugar
        </button>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0"
      style={{ background: "linear-gradient(180deg, #0c1445 0%, #1e3a5f 60%, #1a5276 100%)" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* HUD */}
      <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-3 p-4 pt-6">
        <div
          className="rounded-full px-5 py-2 text-sm font-semibold"
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            color: "#93c5fd",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(147, 197, 253, 0.2)",
          }}
        >
          Puntos: {score}
        </div>

        {/* Letter progress */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {targetLetters.map((letter, i) => {
            const key = `${letter}-${i}`
            const isCollected = collected.includes(key)
            return (
              <span
                key={`progress-${key}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-all duration-300"
                style={{
                  background: isCollected
                    ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                    : "rgba(15, 23, 42, 0.6)",
                  color: isCollected ? "#ffffff" : "rgba(147, 197, 253, 0.4)",
                  border: `1px solid ${isCollected ? "#3b82f6" : "rgba(147, 197, 253, 0.15)"}`,
                  transform: isCollected ? "scale(1.1)" : "scale(1)",
                  boxShadow: isCollected ? "0 0 15px rgba(59, 130, 246, 0.4)" : "none",
                }}
              >
                {letter === " " ? "" : isCollected ? letter : "?"}
              </span>
            )
          })}
        </div>
      </div>

      {/* Instructions */}
      <div
        className="absolute inset-x-0 bottom-6 z-10 text-center text-sm"
        style={{ color: "rgba(147, 197, 253, 0.6)" }}
      >
        {"Toca o haz clic en los globos para reventarlos"}
      </div>
    </div>
  )
}
