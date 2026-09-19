import { useEffect, useId, useRef, useState } from 'react'
import { d10Labels, projectD10 } from '../utils/diceGeometry'

const DICE_ANIMATION_MS = 1600

function VectorDie({ face, animate, tone }: { face: string; animate: boolean; tone: 'ruby' | 'ivory' }) {
  const id = useId()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [progress, setProgress] = useState(animate && !reducedMotion ? 0 : 1)

  useEffect(() => {
    if (!animate || reducedMotion) return
    const start = Date.now()
    let frame = 0
    const tick = () => {
      const next = Math.min(1, Math.max(0, (Date.now() - start) / DICE_ANIMATION_MS))
      setProgress(next)
      if (next < 1) frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [animate, reducedMotion])

  const labels = d10Labels(face)
  const ivory = tone === 'ivory'
  const gold = `url(#${id}-gold)`
  const shadeColor = (rgb: number[], shade: number) => `rgb(${rgb.map((value) => Math.round(value * shade)).join(' ')})`

  return (
    <svg className="vector-die vector-die--d10" viewBox="0 0 80 88" aria-hidden="true" focusable="false" data-rolling={progress < 1} data-tone={tone}>
      <defs>
        <linearGradient id={`${id}-gold`} gradientUnits="userSpaceOnUse" x1="0" y1="-18" x2="0" y2="18">
          <stop offset="0" stopColor="#fff3bd" /><stop offset="0.42" stopColor="#e9c66e" /><stop offset="0.62" stopColor="#b98527" /><stop offset="1" stopColor="#f4d889" />
        </linearGradient>
        <pattern id={`${id}-resin`} patternUnits="userSpaceOnUse" width="53" height="47">
          {ivory ? <>
            <path d="M-8 12C8 3 17 22 29 13S45 4 59 18M9-7C22 9 6 23 17 34S34 41 29 54" fill="none" stroke="#fffefa" strokeWidth="7" opacity="0.45" />
            <path d="M-8 12C8 3 17 22 29 13S45 4 59 18M9-7C22 9 6 23 17 34S34 41 29 54" fill="none" stroke="#c29b50" strokeWidth="0.75" opacity="0.27" />
            <path d="M-5 39Q15 22 36 37T58 32" fill="none" stroke="#dfcba3" strokeWidth="2.5" opacity="0.3" />
          </> : <>
            <path d="M-4 29Q15 12 31 25T58 15M5 50Q38 18 21-5" fill="none" stroke="#f55762" strokeWidth="5" opacity="0.1" />
            {[[4,8],[18,3],[37,11],[9,24],[27,20],[45,28],[16,39],[35,42],[49,5]].map(([x,y], i) => <path key={i} d={`M${x} ${y}l0.6 -0.8 0.6 0.8 -0.6 0.8Z`} fill={i % 3 === 0 ? '#ffc67d' : '#ff7381'} opacity={i % 2 === 0 ? 0.6 : 0.3} />)}
          </>}
        </pattern>
      </defs>
      <ellipse cx="40" cy="79" rx={19 - Math.sin(Math.PI * progress) * 4} ry="3" fill="#000" opacity="0.16" />
      {projectD10(progress).map((surface) => <g key={surface.index} data-face-index={surface.index} data-result-face={surface.index === 0 || undefined}>
        <defs>
          <clipPath id={`${id}-${surface.index}`}><polygon points={surface.points} /></clipPath>
          <linearGradient id={`${id}-body-${surface.index}`} x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor={shadeColor(ivory ? [255,255,252] : [252,89,107], surface.shade)} />
            <stop offset="0.12" stopColor={shadeColor(ivory ? [254,249,237] : [161,5,26], surface.shade)} />
            <stop offset="0.55" stopColor={shadeColor(ivory ? [244,235,216] : [198,13,39], surface.shade)} />
            <stop offset="1" stopColor={shadeColor(ivory ? [214,197,169] : [91,0,17], surface.shade)} />
          </linearGradient>
        </defs>
        <polygon points={surface.points} fill={`url(#${id}-body-${surface.index})`} stroke={ivory ? '#b9a68b' : '#510719'} strokeWidth="0.8" strokeLinejoin="round" />
        <g clipPath={`url(#${id}-${surface.index})`}><g transform={surface.marking}><rect x="-100" y="-100" width="200" height="200" fill={`url(#${id}-resin)`} /></g></g>
        <polygon points={surface.insetPoints} fill="none" stroke={ivory ? '#fffdf3' : '#ffacaf'} strokeWidth="0.7" strokeLinejoin="round" opacity={surface.shade * 0.55} />
        {labels[surface.index] && <g clipPath={`url(#${id}-${surface.index})`} opacity={surface.index === 0 ? 1 : progress < 1 ? 0.8 : 0.45}>
          <g transform={surface.marking} data-result-marking={surface.index === 0 || undefined}>
            <text className="vector-die__number" x="0" y="0" style={{ fill: gold, fontSize: surface.index === 0 ? 29 : 22 }}>{labels[surface.index]}</text>
          </g>
        </g>}
      </g>)}
    </svg>
  )
}

function makeOpenRoll() {
  const results: number[] = []
  do results.push(Math.floor(Math.random() * 100) + 1)
  while (results.at(-1)! >= 96 && results.length < 20)
  return results
}

export function OpenRoll() {
  const [rolls, setRolls] = useState([20])
  const [pending, setPending] = useState<number[] | null>(null)
  const [rollKey, setRollKey] = useState(0)
  const timeout = useRef<number>(undefined)
  const shown = (pending ?? rolls).at(-1) ?? 20
  const digits = [String(Math.floor((shown % 100) / 10)), String(shown % 10)]
  const rolling = pending !== null

  useEffect(() => () => window.clearTimeout(timeout.current), [])

  function roll() {
    if (rolling) return
    const next = makeOpenRoll()
    setPending(next)
    setRollKey((key) => key + 1)
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : DICE_ANIMATION_MS
    timeout.current = window.setTimeout(() => {
      setRolls(next)
      setPending(null)
    }, duration)
  }

  return (
    <div className="open-roll">
      <button className="dice-button" onClick={roll} disabled={rolling} aria-label="Heitä avoin heitto">
        <VectorDie key={`ruby-${rollKey}`} face={digits[0]} tone="ruby" animate={rolling} />
        <VectorDie key={`ivory-${rollKey}`} face={digits[1]} tone="ivory" animate={rolling} />
      </button>
    </div>
  )
}
