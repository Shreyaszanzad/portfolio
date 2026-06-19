import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import SectionTransition from '@/components/SectionTransition'

export default function Home() {
  return (
    <main>
      <Hero />
      <SectionTransition />
      <About />
    </main>
  )
}
