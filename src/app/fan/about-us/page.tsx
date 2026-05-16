"use client";

import React from 'react';
import Image from 'next/image';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-dark-400 flex flex-col">
      <FanNavbar />

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12 md:py-20 w-full">
        {/* ─── HEADER ─── */}
        <div className="mb-20">
          <h1 className="text-3xl md:text-5xl font-bold font-heading uppercase tracking-tight mb-4">
            About Us
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-2xl leading-relaxed">
            Underrated Athletes Group is a platform dedicated to discovering, supporting, and elevating athletes who haven't yet received the recognition they truly deserve.
          </p>
        </div>

        {/* ─── OUR MISSION ─── */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 mb-24">
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tight mb-6">
              Our Mission
            </h2>
            <div className="text-sm md:text-base text-white/60 leading-relaxed space-y-4">
              <p>
                Our mission is to build a fair, transparent, and powerful platform where true athletic talent can finally be seen, valued, and rewarded. In today's world, countless athletes work relentlessly but remain unnoticed simply because they lack exposure, connections, or the right opportunities. We are here to change that.
              </p>
              <p>
                We aim to create an ecosystem where performance matters more than popularity—where every athlete, regardless of background, location, or resources, has an equal chance to showcase their skills and grow. Through structured profiles, community-driven voting, and real-time rankings, we ensure that hard work is recognized and progress is visible.
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/5">
            <Image 
              src="/assets/athlete_track.png" 
              alt="Our Mission" 
              fill 
              className="object-cover"
            />
          </div>
        </div>

        {/* ─── OUR VISION ─── */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24 mb-32">
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tight mb-6">
              Our Vision
            </h2>
            <div className="text-sm md:text-base text-white/60 leading-relaxed space-y-4">
              <p>
                Our vision is to redefine how talent is discovered and supported in the world of sports. We imagine a future where no athlete is overlooked, and where recognition is driven by performance, dedication, and consistency not by luck or connections.
              </p>
              <p>
                Ultimately, our vision is to create a balanced and inclusive sports ecosystem—one where opportunity is accessible, growth is measurable, and success is earned. A system where talent is never hidden, and every athlete has a fair shot at being recognized on a global stage.
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/5">
            <Image 
              src="/assets/athlete_basketball.png" 
              alt="Our Vision" 
              fill 
              className="object-cover"
            />
          </div>
        </div>

        {/* ─── MEET OUR FOUNDER ─── */}
        <div className="max-w-4xl mx-auto bg-[#1A1A1A] rounded-[2rem] p-8 md:p-16 border border-white/5 text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tight mb-10">
            Meet Our Founder
          </h2>
          
          <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden relative mb-8 border-4 border-dark-400">
            <Image 
              src="/assets/fetured_athlete.png" 
              alt="Founder" 
              fill 
              className="object-cover object-top"
            />
          </div>

          <div className="max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-white/80 italic leading-relaxed mb-10">
              "Driven by a deep passion for sports and technology, John founded Underrated Athletes Group with a clear vision to give talented athletes the recognition they deserve. Having seen countless skilled athletes go unnoticed due to lack of exposure, he set out to build a platform where performance speaks louder than popularity."
            </p>
            
            <div className="flex items-center justify-center gap-4 text-white">
              <div className="w-8 h-px bg-white/50" />
              <span className="font-bold text-lg md:text-xl">Howie, Founder & CEO</span>
            </div>
          </div>
        </div>

      </main>

      <FanFooter />
    </div>
  );
}
