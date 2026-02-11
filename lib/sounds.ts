const MUSIC_URL = "/audio/musica.mpeg"
const POP_URL = "/audio/pop.mpeg"
const STAR_URL = "/audio/star.mpeg"
const BOTONES_URL = "/audio/botones.mpeg"
const RONRONEO_URL = "/audio/ronroneo.mpeg"

let backgroundMusic: HTMLAudioElement | null = null

export function startBackgroundMusic() {
  if (typeof window === "undefined") return
  if (!backgroundMusic) {
    backgroundMusic = new Audio(MUSIC_URL)
    backgroundMusic.loop = true
  }
  backgroundMusic.play().catch(() => {})
}

export function pauseBackgroundMusic() {
  backgroundMusic?.pause()
}

export function playPop() {
  if (typeof window === "undefined") return
  const a = new Audio(POP_URL)
  a.volume = 0.6
  a.play().catch(() => {})
}

export function playStar() {
  if (typeof window === "undefined") return
  const a = new Audio(STAR_URL)
  a.volume = 0.6
  a.play().catch(() => {})
}

export function playBotones() {
  if (typeof window === "undefined") return
  const a = new Audio(BOTONES_URL)
  a.volume = 0.6
  a.play().catch(() => {})
}

export function playRonroneo() {
  if (typeof window === "undefined") return
  const a = new Audio(RONRONEO_URL)
<<<<<<< HEAD
  a.volume = 1
=======
  a.volume = 0.6
>>>>>>> 55c21f524c27787fdff62e65bb6f3610c6560f64
  a.play().catch(() => {})
}
