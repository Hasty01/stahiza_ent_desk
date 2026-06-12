import { Heart, ShieldCheck, Mail, Database, Github, PartyPopper } from "lucide-react";

interface FooterProps {
  onNavigate: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer id="app-footer" className="bg-dark-card border-t border-dark-border mt-16 px-4 py-12 sm:px-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Info Col */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon-purple/10 border border-neon-purple/40 flex items-center justify-center">
              <PartyPopper className="w-4 h-4 text-neon-purple" />
            </div>
            <h3 className="font-display font-semibold text-white tracking-tight">STAHIZA Ent Desk</h3>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
            The beating pulse of Stahiza Academy’s school entertainment. Empowering student voice, live counting upcoming major gatherings, and secure moderation.
          </p>
        </div>

        {/* Links Col */}
        <div className="flex flex-col gap-3">
          <h4 className="font-mono text-xs text-neon-cyan uppercase tracking-widest">Quick Portals</h4>
          <ul className="text-sm space-y-2 text-gray-400">
            <li>
              <button onClick={() => onNavigate("home")} className="hover:text-neon-cyan text-left hover:underline transition-all">
                Home Base
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate("events")} className="hover:text-neon-cyan text-left hover:underline transition-all">
                Upcoming Events Deck
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate("gallery")} className="hover:text-neon-cyan text-left hover:underline transition-all">
                Vibe Media Gallery
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate("shoutouts")} className="hover:text-neon-cyan text-left hover:underline transition-all">
                Student Shoutouts Form
              </button>
            </li>
          </ul>
        </div>

        {/* Tech Specs Col */}
        <div className="flex flex-col gap-3">
          <h4 className="font-mono text-xs text-neon-green uppercase tracking-widest">System Architecture</h4>
          <p className="text-xs text-gray-500 font-mono leading-relaxed">
            API Platform: React + Express (Port 3000)<br />
            Supabase SDK Connector: Enabled (Schema pre-coded)<br />
            Animations: Motion + Tailwind v4 CSS
          </p>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => onNavigate("admin-login")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-bg hover:bg-neon-purple/10 border border-dark-border hover:border-neon-purple/40 rounded-lg text-[10px] font-mono text-gray-400 hover:text-white transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-neon-purple" />
              Admin Panel
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-dark-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p className="font-mono tracking-wide">
          &copy; 1999-2026 STAHIZA ACADEMY. ALL RIGHTS RESERVED.
        </p>
        <p className="flex items-center gap-1">
          Made for students with <Heart className="w-3 h-3 text-neon-pink fill-neon-pink animate-pulse" /> by standard entertainment committee
        </p>
      </div>
    </footer>
  );
}
