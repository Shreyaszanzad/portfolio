'use client'

import dynamic from 'next/dynamic'
import { useRef, useEffect, Component, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import { Canvas, extend } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'

const Band = dynamic(() => import('@/components/three/Band'), { ssr: false })

extend({ MeshLineGeometry, MeshLineMaterial })

// ── Error boundary so a WebGL failure never crashes the page ──────────────────
class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { errored: boolean }
> {
  state = { errored: false }
  static getDerivedStateFromError() { return { errored: true } }
  render() {
    return this.state.errored ? this.props.fallback : this.props.children
  }
}

// Static card placeholder shown when WebGL is unavailable
function CardFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div
        className="relative flex flex-col items-center justify-center rounded-2xl border"
        style={{
          width: 'clamp(180px, 22vw, 260px)',
          aspectRatio: '1.586 / 2.5',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
          borderColor: 'rgba(255,255,255,0.12)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
        }}
      >
        <p
          className="font-black uppercase tracking-[0.1em] text-center"
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'clamp(0.9rem, 1.6vw, 1.1rem)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          SHREYAS<br />ZANZAD
        </p>
        <p
          className="mt-2 text-[9px] uppercase tracking-[0.28em]"
          style={{ color: 'var(--color-text-disabled)' }}
        >
          Full-Stack Developer
        </p>
        {/* clip art */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 h-5 w-5 rounded-full border"
          style={{ background: '#111', borderColor: 'rgba(255,255,255,0.2)' }}
        />
        <div
          className="absolute -top-10 left-1/2 w-px"
          style={{ height: '40px', background: 'rgba(255,255,255,0.15)' }}
        />
      </div>
    </div>
  )
}

// ── Fade-up animation helper ──────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// Module-level — survives re-renders, strict-mode double-invokes, and Lenis
// easing overshoots. Once true it never resets for the lifetime of the page.
let _didBounce = false

// ── Section ───────────────────────────────────────────────────────────────────
export default function About() {
  const bounceRef   = useRef<{ trigger: () => void } | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !_didBounce) {
          _didBounce = true
          observer.disconnect()
          bounceRef.current?.trigger()
        }
      },
      { threshold: 1.0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="about"
      aria-label="About"
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: 'transparent', zIndex: 2, position: 'relative' }}
    >

      <div className="relative flex min-h-screen flex-col md:flex-row">

        {/* ── LEFT: Text column ── */}
        <div className="flex flex-1 flex-col justify-center px-6 py-20 md:px-12 lg:px-16 md:max-w-[55%]">

          <FadeUp delay={0.05}>
            <p
              className="mb-5 text-[10px] uppercase tracking-[0.35em]"
              style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-display)' }}
            >
              02 — About Me
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h2
              className="font-black uppercase leading-none text-white"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(1.8rem, 3.6vw, 3.6rem)',
              }}
            >
              <span style={{ color: '#7B3FE4' }}>Design.</span>{' '}
              <br />
              Build.{' '}
              <br />
              <span style={{ color: 'var(--color-text-tertiary)' }}>
                Ship.
              </span>
            </h2>
          </FadeUp>

          {/* Thin rule */}
          <FadeUp delay={0.22}>
            <div className="mt-8 h-px w-10" style={{ background: 'var(--color-border)' }} />
          </FadeUp>

          {/* Bio */}
          <FadeUp delay={0.28}>
            <p
              className="mt-6 leading-relaxed"
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)',
                fontFamily: 'var(--font-family-display)',
                maxWidth: '52ch',
              }}
            >
              Hi, I&apos;m <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 900 }}>Shreyas</span> — a full-stack developer and designer who
              builds end-to-end digital products. I work across the entire
              stack: architecting backends, building performant frontends, and
              crafting interfaces that are both functional and sharp. I take
              ownership of projects from wireframe to deployment, and I ship
              things that hold up under real-world use. Open to freelance and
              full-time opportunities.
            </p>
          </FadeUp>

          {/* Stats row */}
          <FadeUp delay={0.38}>
            <div className="mt-6 flex gap-10">
              {[
                { value: '1+', label: 'Years Experience' },
                { value: '3+', label: 'Projects Shipped' },
                { value: '∞',  label: 'Coffees Consumed' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p
                    className="font-black leading-none"
                    style={{
                      fontFamily: 'var(--font-family-display)',
                      fontSize: 'clamp(1.6rem, 2.5vw, 2.8rem)',
                      color: 'var(--color-text-tertiary)',
                    }}
                  >
                    {value}
                  </p>
                  <p
                    className="mt-1 text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-display)' }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </FadeUp>

        </div>

        {/* ── RIGHT: Physics card canvas ── */}
        <div className="relative flex-1 min-h-[60vh] md:min-h-screen">
          <CanvasErrorBoundary fallback={<CardFallback />}>
            <Canvas
              camera={{ position: [0, 0, 13], fov: 25 }}
              style={{ background: 'transparent' }}
              gl={{ failIfMajorPerformanceCaveat: false }}
            >
              <ambientLight intensity={Math.PI} />
              <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
                <Band bounceRef={bounceRef} />
              </Physics>
              <Environment background={false}>
                <Lightformer intensity={2}  color="white" position={[0, -1, 5]}   rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                <Lightformer intensity={3}  color="white" position={[-1, -1, 1]}  rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                <Lightformer intensity={3}  color="white" position={[1, 1, 1]}    rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
              </Environment>
            </Canvas>
          </CanvasErrorBoundary>
        </div>
      </div>

      {/* Bounce sentinel — fires when user nears the bottom of this section */}
      <div ref={sentinelRef} className="pointer-events-none absolute bottom-32 left-0 w-full h-px" />

    </section>
  )
}
