import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.15),transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        <h1 className="heading-xl bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          The Underrated
        </h1>
        <p className="max-w-md mx-auto text-lg text-white/40 font-medium">
          The ultimate platform for athletes who have earned their spot. 
          Build your legacy, connect with fans, and get discovered.
        </p>
        
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" className="btn-primary w-full sm:w-auto px-12">
            Get Started
          </Link>
          <Link href="/login" className="px-12 py-3 border border-white/10 rounded-full hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest w-full sm:w-auto">
            Explore
          </Link>
        </div>
      </div>
      
      <footer className="absolute bottom-8 left-0 right-0 text-[10px] uppercase tracking-[0.3em] text-white/20">
        Established 2026 • For Those Who've Earned It
      </footer>
    </main>
  );
}
