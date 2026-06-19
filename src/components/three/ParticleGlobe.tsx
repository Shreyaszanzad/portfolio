'use client'

import { useEffect } from 'react'

const GLOBE_COUNT = 3800
const STAR_COUNT  = 160

function buildSphere(n: number) {
  const x = new Float32Array(n), y = new Float32Array(n)
  const z = new Float32Array(n), s = new Float32Array(n)
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const yv = 1 - (i / (n - 1)) * 2
    const r  = Math.sqrt(1 - yv * yv)
    const th = phi * i
    x[i] = Math.cos(th) * r
    y[i] = yv
    z[i] = Math.sin(th) * r
    s[i] = 0.4 + Math.random() * 0.9
  }
  return { x, y, z, s }
}

function buildStars(n: number) {
  const ax = new Float32Array(n), ay = new Float32Array(n), ab = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist  = 1.18 + Math.random() * 0.7
    ax[i] = Math.cos(angle) * dist
    ay[i] = Math.sin(angle) * dist
    ab[i] = 0.12 + Math.random() * 0.32
  }
  return { ax, ay, ab }
}

function buildDisperse(n: number) {
  const fx = new Float32Array(n), fy = new Float32Array(n), delay = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    fx[i]    = Math.random()
    fy[i]    = Math.random()
    delay[i] = Math.random() * 0.4
  }
  return { fx, fy, delay }
}

const sphere   = buildSphere(GLOBE_COUNT)
const stars    = buildStars(STAR_COUNT)
const disperse = buildDisperse(GLOBE_COUNT)
const smooth   = (t: number) => t * t * (3 - 2 * t)

export default function ParticleGlobe() {
  useEffect(() => {
    // Attach canvas directly to body — bypasses Lenis transform & Hero overflow:hidden
    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    Object.assign(canvas.style, {
      position:      'fixed',
      inset:         '0',
      width:         '100vw',
      height:        '100vh',
      pointerEvents: 'none',
      zIndex:        '1',
    })
    document.body.appendChild(canvas)

    const ctx = canvas.getContext('2d')!

    let rotY = 0, rotX = 0, velY = 0.003
    let targetX = 0, targetY = 0.003
    let scrollProgress = 0, targetSP = 0

    const onScroll = () => {
      const raw = (window.scrollY - window.innerHeight * 0.05) / (window.innerHeight * 0.7)
      targetSP = Math.min(1, Math.max(0, raw))
    }

    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      targetY = 0.003 + nx * 0.012
      targetX = ny * 0.45
    }
    const onMouseLeave = () => { targetY = 0.003; targetX = 0 }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width  = window.innerWidth  * dpr
      canvas.height = window.innerHeight * dpr
    }

    window.addEventListener('scroll',     onScroll,    { passive: true })
    window.addEventListener('mousemove',  onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('resize',     resize)

    let raf: number

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const W   = canvas.width
      const H   = canvas.height

      // Globe sits between DEV and LOP — use the measured midpoint from Hero refs,
      // falling back to 50% when the measurement hasn't landed yet.
      const containerPx = Math.min(Math.max(260, window.innerWidth * 0.30), 500)
      const cxFrac = (window as Window & { __globeCenterX?: number }).__globeCenterX ?? 0.5
      const cx = W * cxFrac
      const cy = H * 0.5
      const R  = containerPx * 0.45 * dpr

      ctx.clearRect(0, 0, W, H)

      scrollProgress += (targetSP - scrollProgress) * 0.05
      const sp = scrollProgress

      // Easing — slightly snappier than before (0.08 instead of 0.06)
      velY += (targetY - velY) * 0.08
      rotY += velY * (1 - sp * 0.9)
      rotX += (targetX - rotX) * 0.06

      const sinY = Math.sin(rotY), cosY = Math.cos(rotY)
      const sinX = Math.sin(rotX), cosX = Math.cos(rotX)

      // Stars
      const sm = 1 - sp
      if (sm > 0.01) {
        for (let i = 0; i < STAR_COUNT; i++) {
          ctx.beginPath()
          ctx.arc(cx + stars.ax[i] * R, cy + stars.ay[i] * R, 0.4 * dpr, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(224,255,0,${(stars.ab[i] * sm).toFixed(3)})`
          ctx.fill()
        }
      }

      // Globe particles
      for (let i = 0; i < GLOBE_COUNT; i++) {
        const x1 = sphere.x[i] * cosY - sphere.z[i] * sinY
        const z1 = sphere.x[i] * sinY + sphere.z[i] * cosY
        const y2 = sphere.y[i] * cosX - z1 * sinX
        const z2 = sphere.y[i] * sinX + z1 * cosX

        const sphereX = cx + x1 * R
        const sphereY = cy - y2 * R

        const depth  = (z2 + 1) * 0.5
        const alpha  = Math.pow(depth, 1.7) * 0.92 + 0.05
        const radius = sphere.s[i] * (0.35 + depth * 1.0) * dpr

        // Dispersion (only computed when scrolling)
        let finalX = sphereX, finalY = sphereY, finalAlpha = alpha
        if (sp > 0.01) {
          const raw = (sp - disperse.delay[i]) / 0.55
          const p   = smooth(Math.max(0, Math.min(1, raw)))
          finalX = sphereX + (disperse.fx[i] * W - sphereX) * p
          finalY = sphereY + (disperse.fy[i] * H - sphereY) * p
          finalAlpha = alpha * (1 - p) + 0.22 * p
        }

        if (finalAlpha < 0.002) continue

        ctx.beginPath()
        ctx.arc(finalX, finalY, Math.max(radius, 0.22 * dpr), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(224,255,0,${finalAlpha.toFixed(3)})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()

    return () => {
      cancelAnimationFrame(raf)
      canvas.remove()
      window.removeEventListener('scroll',     onScroll)
      window.removeEventListener('mousemove',  onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize',     resize)
    }
  }, [])

  // Canvas is appended to body directly — nothing to render here
  return null
}
