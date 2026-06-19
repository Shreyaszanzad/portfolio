'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type Project = {
  name: string
  description: string
  link: string
  accent: string
}

const PROJECTS: Project[] = [
  {
    name: 'PROJECT ALPHA',
    description:
      'An end-to-end web platform built with Next.js and PostgreSQL — authentication, real-time updates, and a responsive dashboard deployed in production.',
    link: '#',
    accent: '#7B3FE4',
  },
  {
    name: 'PROJECT BETA',
    description:
      'A design system and component library with 40+ primitives, full dark-mode token support, and Storybook documentation used across multiple products.',
    link: '#',
    accent: '#e0ff00',
  },
  {
    name: 'PROJECT GAMMA',
    description:
      'A REST + WebSocket backend powering a real-time analytics dashboard. Query optimisation cut average response times by 60%.',
    link: '#',
    accent: '#ffffff',
  },
]

const SCROLL_PER_SLIDE = 700

export default function Projects() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const titleRef    = useRef<HTMLParagraphElement>(null)
  const mockupRef   = useRef<HTMLDivElement>(null)
  const descRef     = useRef<HTMLParagraphElement>(null)
  const linkRef     = useRef<HTMLAnchorElement>(null)
  const slideRefs   = useRef<(HTMLParagraphElement | null)[]>([])
  const currentIdx  = useRef(0)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    function animateTitle(name: string, accent: string) {
      const el = titleRef.current
      if (!el) return
      gsap.killTweensOf(el.querySelectorAll('span'))
      el.innerHTML = name
        .split('')
        .map((c) =>
          c === ' '
            ? '<span style="display:inline-block">&nbsp;</span>'
            : `<span style="display:inline-block;will-change:transform">${c}</span>`,
        )
        .join('')
      el.style.color = accent
      gsap.fromTo(
        el.querySelectorAll('span'),
        { opacity: 0, scaleY: 2.2, scaleX: 0.5, y: 70, filter: 'blur(8px)' },
        {
          opacity: 1, scaleY: 1, scaleX: 1, y: 0, filter: 'blur(0px)',
          duration: 0.55, stagger: 0.022, ease: 'elastic.out(1, 0.75)',
        },
      )
    }

    function switchProject(idx: number) {
      const p      = PROJECTS[idx]
      const mockup = mockupRef.current
      const desc   = descRef.current
      const link   = linkRef.current
      if (!mockup || !desc || !link) return

      gsap.to(mockup, {
        opacity: 0, scale: 0.93, filter: 'blur(14px)', duration: 0.15, ease: 'power2.in',
        onComplete() {
          mockup.style.background =
            `radial-gradient(ellipse at 30% 40%, ${p.accent}28 0%, transparent 65%), #0a0a0a`
          gsap.to(mockup, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.45, ease: 'expo.out' })
        },
      })

      gsap.fromTo(desc,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 },
      )
      desc.textContent = p.description
      link.href        = p.link

      animateTitle(p.name, p.accent)
    }

    function updateSlideNumbers(progress: number) {
      const total = PROJECTS.length
      const raw   = progress * (total - 1) * 40

      slideRefs.current.forEach((el, i) => {
        if (!el) return
        const dist = i * 40 - raw
        const absD = Math.abs(dist)
        gsap.set(el, {
          rotationX:  -dist,
          z:          -absD * 2.5,
          opacity:    Math.max(0, 1 - absD / 80),
          filter:     `blur(${Math.min(3, absD / 14)}px)`,
        })
      })
    }

    // Initial render
    const first = PROJECTS[0]
    animateTitle(first.name, first.accent)
    if (mockupRef.current)
      mockupRef.current.style.background =
        `radial-gradient(ellipse at 30% 40%, ${first.accent}28 0%, transparent 65%), #0a0a0a`
    if (descRef.current) descRef.current.textContent = first.description
    if (linkRef.current) linkRef.current.href = first.link
    updateSlideNumbers(0)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger:   scroller,
        start:     'top top',
        end:       `+=${SCROLL_PER_SLIDE * (PROJECTS.length - 1)}`,
        pin:       true,
        scrub:     0.3,
        snap: {
          snapTo:   1 / (PROJECTS.length - 1),
          duration: { min: 0.2, max: 0.5 },
          delay:    0.05,
          ease:     'power1.inOut',
        },
        onUpdate(self) {
          updateSlideNumbers(self.progress)
          const idx = Math.round(self.progress * (PROJECTS.length - 1))
          if (idx !== currentIdx.current) {
            currentIdx.current = idx
            switchProject(idx)
          }
        },
      })
    }, scroller)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="projects"
      aria-label="Projects"
      style={{ background: 'var(--color-surface-base)' }}
    >

      {/* Mobile-only heading — hidden on desktop (heading lives inside the pinned panel) */}
      <div className="px-6 pt-16 pb-6 md:px-12 min-[1030px]:hidden">
        <p className="mb-4 text-[10px] uppercase tracking-[0.35em]" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-display)' }}>
          03 — Projects
        </p>
        <h2 className="font-black uppercase leading-none text-white" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(1.8rem, 3.8vw, 3.75rem)' }}>
          <span style={{ color: 'var(--color-text-tertiary)' }}>THE</span>{' '}ARTWORKS.
        </h2>
      </div>

      {/* ── Desktop pinned scroller ── */}
      <div
        ref={scrollerRef}
        className="relative hidden h-screen w-full overflow-hidden min-[1030px]:block"
        style={{ perspective: '1200px' }}
      >

        {/* Heading — top left inside the panel */}
        <div className="absolute top-10 left-16 z-10 pointer-events-none">
          <p className="mb-2 text-[10px] uppercase tracking-[0.35em]" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-display)' }}>
            03 — Projects
          </p>
          <h2 className="font-black uppercase leading-none text-white" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(1.8rem, 3.8vw, 3.75rem)' }}>
            <span style={{ color: 'var(--color-text-tertiary)' }}>THE</span>{' '}ARTWORKS.
          </h2>
        </div>

        {/* Visit Site — top right */}
        <a
          ref={linkRef}
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-10 right-16 z-10 text-[10px] font-bold uppercase tracking-[0.28em] transition-colors duration-300 hover:text-white"
          style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-family-display)' }}
        >
          Visit Site
        </a>

        {/* Large project title — behind mockup (z-1) */}
        <p
          ref={titleRef}
          className="pointer-events-none absolute z-1 font-black uppercase leading-none tracking-[-0.03em] whitespace-nowrap"
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize:   'clamp(3.5rem, 5.5vw, 5.5rem)',
            left:       '64px',
            top:        '50%',
            transform:  'translateY(-50%)',
          }}
        />

        {/* Browser mockup — overlaps title on right, sits in front (z-2) */}
        <div
          className="absolute z-2 top-0 bottom-0 flex items-center"
          style={{ left: '36%', right: '24%' }}
        >
          <div
            ref={mockupRef}
            className="w-full rounded-2xl overflow-hidden"
            style={{ height: '62vh', maxHeight: '540px', background: '#0a0a0a' }}
          >
            <div
              className="flex items-center gap-1.5 px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="h-3 w-3 rounded-full" style={{ background: '#ff5f57' }} />
              <span className="h-3 w-3 rounded-full" style={{ background: '#ffbd2e' }} />
              <span className="h-3 w-3 rounded-full" style={{ background: '#28c840' }} />
              <div
                className="ml-4 flex-1 rounded-full h-5 px-3 flex items-center"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                <span className="text-[9px] tracking-wide" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-family-display)' }}>
                  shreyas.dev / project
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description — right column (z-3) */}
        <div
          className="absolute z-10 top-0 bottom-0 flex items-center"
          style={{ right: '64px', width: '20%' }}
        >
          <p
            ref={descRef}
            className="italic leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-family-display)', fontSize: '0.875rem' }}
          />
        </div>

        {/* 3D drum counter */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
          style={{ transformStyle: 'preserve-3d', perspective: '800px', height: '2rem' }}
        >
          {PROJECTS.map((_p, i) => (
            <p
              key={i}
              ref={(el) => { slideRefs.current[i] = el }}
              className="absolute left-1/2 -translate-x-1/2 font-black uppercase whitespace-nowrap text-white"
              style={{
                fontFamily:         'var(--font-family-display)',
                fontSize:           '1.25rem',
                transformStyle:     'preserve-3d',
                willChange:         'transform, opacity, filter',
                backfaceVisibility: 'hidden',
                opacity:            i === 0 ? 1 : 0,
              }}
            >
              Project #{i + 1}
            </p>
          ))}
        </div>

      </div>

      {/* ── Mobile — vertical stack ── */}
      <div className="flex flex-col gap-20 px-6 py-12 min-[1030px]:hidden">
        {PROJECTS.map((p, i) => (
          <div key={i}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: p.accent, boxShadow: `0 0 8px ${p.accent}` }}
                />
                <span
                  className="text-xl font-bold uppercase tracking-tight italic text-white"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  Project #{i + 1}
                </span>
              </div>
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-[0.28em] border-b pb-0.5 transition-colors hover:text-white"
                style={{ borderColor: p.accent, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-family-display)' }}
              >
                Visit Site
              </a>
            </div>

            <div
              className="w-full rounded-xl overflow-hidden mb-5"
              style={{ height: '200px', background: `radial-gradient(ellipse at 30% 40%, ${p.accent}28 0%, transparent 65%), #080808` }}
            >
              <div
                className="flex items-center gap-1.5 px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ffbd2e' }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#28c840' }} />
              </div>
            </div>

            <p
              className="mb-3 font-black uppercase leading-none"
              style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(1.6rem, 6vw, 2.4rem)', color: p.accent }}
            >
              {p.name}
            </p>
            <p
              className="italic leading-relaxed"
              style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontFamily: 'var(--font-family-display)' }}
            >
              {p.description}
            </p>
          </div>
        ))}
      </div>

    </section>
  )
}
