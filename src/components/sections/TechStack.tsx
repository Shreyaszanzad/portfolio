'use client'

import React from 'react'
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiPostgresql,
  SiMongodb,
  SiGithub,
} from 'react-icons/si'

const BRAND: Record<string, string> = {
  React:      '#61DAFB',
  'Next.js':  '#ffffff',
  TypeScript: '#3178C6',
  Tailwind:   '#06B6D4',
  PostgreSQL: '#4169E1',
  MongoDB:    '#47A248',
  GitHub:     '#ffffff',
}

type IconItem = { icon: React.ComponentType<object>; title: string }

function BrandIcon({ icon: Icon, title }: IconItem) {
  const [hovered, setHovered] = React.useState(false)
  const color = BRAND[title] ?? '#ffffff'

  return (
    <div
      title={title}
      className="flex flex-col items-center gap-3 cursor-default select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          fontSize: '52px',
          lineHeight: 1,
          color: hovered ? color : 'rgba(255,255,255,0.25)',
          transition: 'color 300ms ease',
        }}
      >
        <Icon />
      </span>
      <span
        style={{
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: hovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
          transition: 'color 300ms ease',
        }}
      >
        {title}
      </span>
    </div>
  )
}

const icons: IconItem[] = [
  { icon: SiReact,       title: 'React' },
  { icon: SiNextdotjs,   title: 'Next.js' },
  { icon: SiTypescript,  title: 'TypeScript' },
  { icon: SiTailwindcss, title: 'Tailwind' },
  { icon: SiPostgresql,  title: 'PostgreSQL' },
  { icon: SiMongodb,     title: 'MongoDB' },
  { icon: SiGithub,      title: 'GitHub' },
]

const GAP = 80 // px — gap between icons

export default function TechStack() {
  return (
    <section
      id="stack"
      aria-label="Tech Stack"
      className="relative w-full overflow-hidden py-16"
      style={{ background: 'var(--color-surface-base)' }}
    >
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-black to-transparent" />

      {/*
        Two copies sit inside one flex row.
        Each copy has pr equal to the gap so the space after the last icon
        of copy 1 = the space between every other icon → -50% is exact.
      */}
      <div
        className="flex items-center w-max animate-marquee-left hover:[animation-play-state:paused]"
        style={{ '--duration': '32s' } as React.CSSProperties}
      >
        {Array.from({ length: 8 }, (_, copy) => (
          <div
            key={copy}
            className="flex items-center"
            style={{ gap: `${GAP}px`, paddingRight: `${GAP}px` }}
            aria-hidden={copy > 0 ? true : undefined}
          >
            {icons.map(item => (
              <BrandIcon key={item.title} icon={item.icon} title={item.title} />
            ))}
          </div>
        ))}
      </div>

      <div
        className="mx-6 mt-16 h-px md:mx-12 lg:mx-16"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      />
    </section>
  )
}
