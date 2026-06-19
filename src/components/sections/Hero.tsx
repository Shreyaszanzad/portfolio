'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useLoaded } from '@/context/LoadedContext'

const ParticleGlobe = dynamic(() => import('@/components/three/ParticleGlobe'), { ssr: false })

// Each line gets its own motion element with an incrementing delay
function Line({
  children,
  delay,
  from = 'bottom',
  className,
  style,
}: {
  children: React.ReactNode
  delay: number
  from?: 'top' | 'bottom' | 'fade'
  className?: string
  style?: React.CSSProperties
}) {
  const loaded = useLoaded()
  const y = from === 'bottom' ? 14 : from === 'top' ? -14 : 0

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function Hero() {
  const devRef = useRef<HTMLSpanElement>(null)
  const lopRef = useRef<HTMLSpanElement>(null)

  // Measure actual rendered positions of DEV and LOP and expose the true
  // horizontal midpoint (0-1 fraction) so the globe canvas can use it.
  useEffect(() => {
    const measure = () => {
      if (!devRef.current || !lopRef.current) return
      const devRect = devRef.current.getBoundingClientRect()
      const lopRect = lopRef.current.getBoundingClientRect()
      ;(window as Window & { __globeCenterX?: number }).__globeCenterX =
        (devRect.right + lopRect.left) / 2 / window.innerWidth
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <section
      aria-label="Hero"
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: 'var(--color-surface-base)' }}
    >
      {/* Cursor glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute h-[560px] w-[560px] rounded-full"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(224,255,0,0.05) 0%, transparent 72%)',
        }}
      />

      {/* Background watermark — DEV … LOP */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          ref={devRef}
          aria-hidden="true"
          className="absolute left-0 top-1/2 hidden -translate-y-1/2 select-none text-[18vw] font-black uppercase leading-none tracking-tight text-white/[0.04] md:block"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          DEV
        </span>
        <span
          ref={lopRef}
          aria-hidden="true"
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 select-none text-[17vw] font-black uppercase leading-none tracking-tight text-white/[0.04] md:block"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          LOP
        </span>
      </div>

      {/* Globe */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block"
        style={{ left: '50%', width: 'clamp(260px, 30vw, 500px)', height: 'clamp(260px, 30vw, 500px)' }}
      >
        <ParticleGlobe />
      </div>

      {/* ── TOP-RIGHT: Developer block — line by line ── */}
      <div className="absolute top-8 right-6 z-10 text-right md:right-12 lg:right-16">

        <Line delay={0.05} from="top">
          <p className="mb-1 text-[10px] uppercase tracking-[0.35em]" style={{ color: 'var(--color-text-secondary)' }}>
            01
          </p>
        </Line>

        <Line delay={0.15} from="top">
          <h1
            className="font-black uppercase leading-[1.0] text-white"
            style={{ fontSize: 'clamp(1.6rem, 3.2vw, 3.2rem)', fontFamily: 'var(--font-family-display)' }}
          >
            Developer
          </h1>
        </Line>

        <Line delay={0.25} from="top">
          <p
            className="mt-1 font-light italic leading-none"
            style={{ fontSize: 'clamp(1rem, 2vw, 2rem)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-family-display)' }}
          >
            & Designer
          </p>
        </Line>

        <Line delay={0.35} from="fade">
          <div className="mt-5 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <Line delay={0.38} from="top">
              <p className="mb-2 text-[10px] uppercase tracking-[0.35em]" style={{ color: 'var(--color-text-disabled)' }}>
                Get In Touch
              </p>
            </Line>
            <Line delay={0.48} from="top">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2.5 font-black uppercase tracking-[0.08em] text-white transition-colors hover:text-[#7B3FE4]"
                style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.3rem)' }}
              >
                Let&apos;s Talk
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-black text-xs transition-all group-hover:bg-[#7B3FE4] group-hover:text-white">↗</span>
              </a>
            </Line>
          </div>
        </Line>
      </div>

      {/* ── BOTTOM-LEFT: Name block — line by line ── */}
      <div className="absolute bottom-20 left-6 z-10 md:left-12 lg:left-16">

        <Line delay={0.3} from="bottom">
          <p className="mb-3 text-[10px] uppercase tracking-[0.35em]" style={{ color: 'var(--color-text-secondary)' }}>
            Hi, my name is
          </p>
        </Line>

        <h2
          className="font-black uppercase leading-none tracking-tight text-white"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          <Line delay={0.42} from="bottom">
            <span
              className="block"
              style={{ color: 'var(--color-text-tertiary)', fontSize: 'clamp(1.6rem, 3.2vw, 3.2rem)' }}
            >
              SHREYAS
            </span>
          </Line>
          <Line delay={0.54} from="bottom">
            <span className="mt-0.5 block" style={{ fontSize: 'clamp(1.6rem, 3.2vw, 3.2rem)' }}>
              ZANZAD
            </span>
          </Line>
        </h2>

        <Line delay={0.68} from="bottom">
          <div role="status" aria-label="Availability: Open to Work" className="badge-open-to-work">
            <span aria-hidden="true" className="badge-open-to-work__dot">
              <span className="badge-open-to-work__ping" />
              <span className="badge-open-to-work__core" />
            </span>
            Open to work
          </div>
        </Line>
      </div>

      {/* ── BOTTOM BAR ── */}
      <Line delay={0.8} from="fade" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em]" style={{ color: 'var(--color-text-disabled)' }}>
        Scroll
      </Line>


      <Line delay={0.9} from="fade" className="absolute bottom-8 left-6 hidden items-center gap-6 md:flex md:left-12 lg:left-16">
        {[
          { label: 'Instagram', href: '#' },
          { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/shreyas-zanzad-056579217/' },
          { label: 'GitHub',    href: 'https://github.com/Shreyaszanzad' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-[0.28em] text-white/40 transition-colors hover:text-white"
          >
            {label}
          </a>
        ))}
        <a
          href="/frontendcv.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-[0.28em] text-white/40 transition-colors hover:text-white"
        >
          Resume
        </a>
      </Line>
    </section>
  )
}
