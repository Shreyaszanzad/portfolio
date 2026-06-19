'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const cardRef       = useRef<HTMLDivElement>(null)
  const textRef       = useRef<HTMLHeadingElement>(null)
  const scanRef       = useRef<HTMLDivElement>(null)
  const progressRef   = useRef<HTMLDivElement>(null)
  const counterRef    = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      // ── initial states ──────────────────────────────────────
      gsap.set(cardRef.current,    { opacity: 0, y: 50, scale: 0.94 })
      gsap.set(textRef.current,    { clipPath: 'inset(100% 0% 0% 0%)', y: 10 })
      gsap.set(scanRef.current,    { scaleX: 0, transformOrigin: 'left center' })
      gsap.set(counterRef.current, { opacity: 0 })

      // ── 1. card rises in ────────────────────────────────────
      tl.to(cardRef.current, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.75,
        ease: 'power4.out',
      })

      // ── 2. text wipes up from bottom ────────────────────────
      tl.to(textRef.current, {
        clipPath: 'inset(0% 0% 0% 0%)', y: 0,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.3')

      // ── 3. counter fades in ──────────────────────────────────
      tl.to(counterRef.current, { opacity: 1, duration: 0.3 }, '-=0.2')

      // ── 4. scan line sweeps across once ─────────────────────
      tl.to(scanRef.current, {
        scaleX: 1,
        duration: 0.9,
        ease: 'power2.inOut',
      }, '-=0.2')

      // ── 5. progress + counter ────────────────────────────────
      const obj = { val: 0 }
      tl.to(obj, {
        val: 100,
        duration: 2.0,
        ease: 'power1.inOut',
        onUpdate() {
          const v = Math.floor(obj.val)
          setCount(v)
          if (progressRef.current) progressRef.current.style.width = `${obj.val}%`
        },
        onComplete() {
          setCount(100)
          if (progressRef.current) progressRef.current.style.width = '100%'
        },
      }, '-=0.6')

      // ── 6. hold ──────────────────────────────────────────────
      tl.to({}, { duration: 0.2 })

      // ── 7. text disappears ───────────────────────────────────
      tl.to(textRef.current, {
        clipPath: 'inset(0% 0% 100% 0%)',
        y: -10,
        duration: 0.35,
        ease: 'power3.in',
      })

      tl.to(counterRef.current, { opacity: 0, duration: 0.2 }, '-=0.35')

      // ── 8. EXPLOSION — card scales to fill entire screen ─────
      tl.add(() => {
        if (!cardRef.current || !containerRef.current) return
        const card = cardRef.current.getBoundingClientRect()
        const vw   = window.innerWidth
        const vh   = window.innerHeight
        // Scale large enough that the card covers every corner of the viewport
        const scaleX = (vw  / card.width)  * 1.1
        const scaleY = (vh  / card.height) * 1.1
        const scale  = Math.max(scaleX, scaleY)

        gsap.timeline()
          .to(cardRef.current, {
            scale,
            borderRadius: 0,
            duration: 0.7,
            ease: 'power4.in',
          })
          .to(containerRef.current, {
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: 0.6,
            ease: 'power4.inOut',
            onComplete,
          }, '-=0.15')
      })

    }, containerRef)

    return () => ctx.revert()
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      role="progressbar"
      aria-valuenow={count}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading portfolio"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#ececec', clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      {/* The box */}
      <div
        ref={cardRef}
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl"
        style={{ height: 'clamp(240px, 25vh, 320px)' }}
      >
        {/* Scan line */}
        <div
          ref={scanRef}
          className="absolute inset-x-0 top-0 h-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(224,255,0,0.04) 50%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Text */}
        <div className="flex h-full flex-col items-center justify-center gap-4 px-8">
          <h1
            ref={textRef}
            className="text-center font-black uppercase leading-none tracking-tight text-white"
            style={{
              fontSize: 'clamp(1.4rem, 3.2vw, 2.6rem)',
              fontFamily: 'var(--font-family-display)',
            }}
          >
            Loading&nbsp;&nbsp;Portfolio
          </h1>

          {/* Counter inside card */}
          <span
            ref={counterRef}
            className="tabular-nums text-xs uppercase tracking-[0.4em]"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {String(count).padStart(2, '0')} %
          </span>
        </div>

        {/* Progress bar inside card */}
        <div
          className="absolute bottom-0 left-0 h-[2px] w-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <div
            ref={progressRef}
            style={{
              height: '100%',
              width: '0%',
              background: '#e0ff00',
              boxShadow: '0 0 8px rgba(224,255,0,0.6)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
