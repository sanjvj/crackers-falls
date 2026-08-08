import React from 'react'
import { EnquiryProvider } from '../context/EnquiryContext'
import { AnnouncementBar } from '../components/AnnouncementBar'
import { Navbar } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { Ticker } from '../components/Ticker'
import { WhyUs } from '../components/WhyUs'
import { FuseDivider } from '../components/FuseDivider'
import { Catalog } from '../components/Catalog'
import { HowItWorks } from '../components/HowItWorks'
import { Testimonials } from '../components/Testimonials'
import { CtaBanner } from '../components/CtaBanner'
import { Footer } from '../components/Footer'
import { EnquiryDock } from '../components/EnquiryDock'
import { RocketToTop } from '../components/RocketToTop'

export function Home() {
  return (
    <EnquiryProvider>
      <div className="min-h-screen w-full bg-ink-950 font-sans text-paper-50 antialiased selection:bg-gold-400 selection:text-ink-950">
        <AnnouncementBar />
        <Navbar />
        <main>
          <Hero />
          <Ticker />
          <WhyUs />
          <FuseDivider label="Light the fuse · catalog ahead" />
          <Catalog />
          <FuseDivider label="Four steps to your doorstep" />
          <HowItWorks />
          <Testimonials />
          <CtaBanner />
        </main>
        <Footer />
        <EnquiryDock />
        <RocketToTop />
      </div>
    </EnquiryProvider>
  )
}

export default Home;
