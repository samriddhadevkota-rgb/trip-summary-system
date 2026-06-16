import { useEffect, useRef, useState } from "react"

export const PHASE = {
  ENTER: "enter",
  FUEL: "fuel",
  HOLD: "hold",
  EXIT: "exit",
  DONE: "done",
}

const ENTER_MS = 1700
const FUEL_MS = 2200
const EXIT_MS = 1500

// Pure state machine for the loading sequence - no rendering, just phase + progress.
// Always plays the full enter -> fuel sequence even if data resolves instantly,
// so the animation never looks cut off; only exits once both the tank is full
// AND the real `loading` flag has cleared.
export function useTruckSequence(loading, { reducedMotion = false } = {}) {
  const [phase, setPhase] = useState(reducedMotion ? PHASE.HOLD : PHASE.ENTER)
  const [fuelPercent, setFuelPercent] = useState(0)
  const fuelDoneRef = useRef(false)

  useEffect(() => {
    if (reducedMotion || phase !== PHASE.ENTER) return
    const t = setTimeout(() => setPhase(PHASE.FUEL), ENTER_MS)
    return () => clearTimeout(t)
  }, [phase, reducedMotion])

  useEffect(() => {
    if (phase !== PHASE.FUEL) return
    let raf
    const start = performance.now()
    const tick = (now) => {
      const pct = Math.min(100, ((now - start) / FUEL_MS) * 100)
      setFuelPercent(pct)
      if (pct < 100) {
        raf = requestAnimationFrame(tick)
      } else {
        fuelDoneRef.current = true
        setPhase(PHASE.HOLD)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  useEffect(() => {
    if (phase !== PHASE.HOLD) return
    if (reducedMotion) {
      if (!loading) setPhase(PHASE.DONE)
      return
    }
    if (!loading && fuelDoneRef.current) setPhase(PHASE.EXIT)
  }, [phase, loading, reducedMotion])

  useEffect(() => {
    if (phase !== PHASE.EXIT) return
    const t = setTimeout(() => setPhase(PHASE.DONE), EXIT_MS)
    return () => clearTimeout(t)
  }, [phase])

  return { phase, fuelPercent }
}
