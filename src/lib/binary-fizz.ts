interface Flight {
  left: number
  top: number
  distance: number
  angle: number
  delay: number
  cycle: number
}

export function createBinaryFizz(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')!
  const bursts = new Map<HTMLElement, ReturnType<typeof makeBurst>>()
  let width = window.innerWidth
  let height = window.innerHeight
  let ratio = window.devicePixelRatio || 1
  let edge = 0
  let frame = 0
  let disposed = false
  let sprites: HTMLCanvasElement[] = []

  function cacheSprites() {
    const style = getComputedStyle(canvas)
    sprites = [0, 1].map((digit) => {
      const sprite = document.createElement('canvas')
      sprite.width = sprite.height = Math.ceil(24 * ratio)
      const ctx = sprite.getContext('2d')!
      ctx.scale(ratio, ratio)
      ctx.font = `7px ${style.fontFamily}`
      ctx.textBaseline = 'top'
      ctx.fillStyle = style.getPropertyValue(digit ? '--bit-purple' : '--bit-green').trim()
      ctx.shadowColor = ctx.fillStyle
      ctx.shadowBlur = 3 * ratio
      ctx.fillText(String(digit), 9, 8)
      return sprite
    })
  }

  function resize() {
    width = window.innerWidth
    height = window.innerHeight
    ratio = window.devicePixelRatio || 1
    canvas.width = Math.ceil(width * ratio)
    canvas.height = Math.ceil(height * ratio)
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    cacheSprites()
  }

  function makeBurst(flight: Flight) {
    const duration = flight.cycle * 0.219
    const radians = flight.angle * Math.PI / 180
    const particles = Array.from({ length: 64 }, (_, index) => ({
      emitted: duration * (0.04 + (index + Math.random()) / 64 * 0.9),
      lifetime: 0.65 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      spread: (Math.random() < 0.5 ? -1 : 1) * (16 + Math.random() * 24),
      wobble: 1 + Math.random() * 3,
      digit: index % 2,
    }))
    return {
      ...flight,
      start: performance.now() + flight.delay * 1000,
      velocity: flight.distance / duration,
      sin: Math.sin(radians),
      cos: Math.cos(radians),
      particles,
      end: Math.max(...particles.map((p) => p.emitted + p.lifetime)),
      timer: 0,
    }
  }

  function render(now: number) {
    frame = 0
    context.clearRect(0, 0, width, height)
    context.save()
    context.beginPath()
    context.rect(0, 0, width, Math.max(0, edge))
    context.clip()
    let active = false
    for (const [track, burst] of bursts) {
      const elapsed = (now - burst.start) / 1000
      if (elapsed > burst.end) {
        bursts.delete(track)
        continue
      }
      if (elapsed < 0) continue
      active = true
      for (const particle of burst.particles) {
        const t = elapsed - particle.emitted
        if (t < 0 || t >= particle.lifetime) continue
        const progress = t / particle.lifetime
        const x = -burst.velocity * particle.emitted - burst.velocity * 0.15 * (1 - Math.exp(-2.5 * t)) / 2.5
        const y = particle.spread * (1 - Math.exp(-2 * t)) + particle.wobble * Math.sin(progress * Math.PI * 4) * Math.sin(progress * Math.PI)
        const screenX = width * burst.left / 100 + x * burst.cos - y * burst.sin
        const screenY = height * burst.top / 100 + x * burst.sin + y * burst.cos
        if (screenY > edge + 12 || screenY < -12 || screenX < -12 || screenX > width + 12) continue
        const fadeIn = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, progress * 12))
        const envelope = fadeIn * (0.5 + 0.5 * Math.cos(Math.PI * progress))
        const flicker = Math.pow(0.5 + 0.5 * Math.sin(progress * Math.PI * 8 + particle.phase), 2)
        const scale = 0.55 + 0.45 * Math.sin(Math.PI * progress)
        context.globalAlpha = envelope * (0.2 + 0.8 * flicker)
        context.drawImage(sprites[particle.digit], screenX - 11 * scale, screenY - 11 * scale, 24 * scale, 24 * scale)
      }
    }
    context.restore()
    if (active) wake()
  }

  function wake() {
    if (!disposed && !frame && edge > 0 && !document.hidden && bursts.size) {
      frame = requestAnimationFrame(render)
    }
  }

  function clear(track: HTMLElement) {
    const burst = bursts.get(track)
    if (burst) window.clearTimeout(burst.timer)
    bursts.delete(track)
    if (!bursts.size) {
      cancelAnimationFrame(frame)
      frame = 0
      context.clearRect(0, 0, width, height)
    }
  }

  const themeObserver = new MutationObserver(cacheSprites)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  document.addEventListener('visibilitychange', wake)
  resize()
  void document.fonts.ready.then(() => { if (!disposed) cacheSprites() })

  return {
    launch(track: HTMLElement, flight: Flight) {
      clear(track)
      const burst = makeBurst(flight)
      bursts.set(track, burst)
      burst.timer = window.setTimeout(wake, flight.delay * 1000)
    },
    clear,
    resize,
    setBoundary(value: number) {
      if (edge === value) return
      edge = value
      if (edge <= 0) {
        cancelAnimationFrame(frame)
        frame = 0
        context.clearRect(0, 0, width, height)
      } else {
        wake()
      }
    },
    destroy() {
      disposed = true
      bursts.forEach((burst) => window.clearTimeout(burst.timer))
      bursts.clear()
      cancelAnimationFrame(frame)
      context.clearRect(0, 0, width, height)
      themeObserver.disconnect()
      document.removeEventListener('visibilitychange', wake)
    },
  }
}
