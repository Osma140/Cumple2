"use client"

import { useState } from "react"
import { startBackgroundMusic } from "@/lib/sounds"
import WelcomeScreen from "@/components/welcome-screen"
import BalloonGame from "@/components/balloon-game"
import CakeReveal from "@/components/cake-reveal"
import SecretLevel from "@/components/secret-level"
import SimbaReveal from "@/components/simba-reveal"

type Screen = "welcome" | "game" | "cake" | "secret" | "simba"

export default function Page() {
  const [screen, setScreen] = useState<Screen>("welcome")

  const handleStart = () => {
    startBackgroundMusic()
    setScreen("game")
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {screen === "welcome" && (
        <WelcomeScreen onStart={handleStart} />
      )}
      {screen === "game" && (
        <BalloonGame onComplete={() => setScreen("cake")} />
      )}
      {screen === "cake" && (
        <CakeReveal onCakeClick={() => setScreen("secret")} />
      )}
      {screen === "secret" && (
        <SecretLevel onComplete={() => setScreen("simba")} />
      )}
      {screen === "simba" && <SimbaReveal onRestart={() => setScreen("welcome")} />}
    </main>
  )
}
