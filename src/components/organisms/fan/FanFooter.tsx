import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const FanFooter = () => {
  return (
    <footer className="bg-dark-400 border-t border-white/5">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="relative w-40 h-12">
              <Image
                src="/assets/logo.png"
                alt="Underrated"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Empowering the next generation of unrecognized athletic talent.
              <br />
              For those who&apos;ve earned it.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold font-heading uppercase tracking-wide mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'Explore', 'Leaderboard', 'Favorites'].map((link) => (
                <li key={link}>
                  <Link
                    href={`/fan/${link.toLowerCase()}`}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold font-heading uppercase tracking-wide mb-6">Social Media</h3>
            <ul className="space-y-3">
              {['Instagram', 'Twitter', 'Facebook'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
