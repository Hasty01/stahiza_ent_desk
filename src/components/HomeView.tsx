import { useEffect, useState } from "react";
import { Clock, Calendar, MoveRight, Music, Sparkles, Image as ImageIcon, Flame } from "lucide-react";
import { motion } from "motion/react";
import { StahizaEvent, Shoutout, GalleryImage } from "../types";

interface HomeViewProps {
  events: StahizaEvent[];
  shoutouts: Shoutout[];
  gallery: GalleryImage[];
  onNavigate: (view: string) => void;
}

export default function HomeView({ events, shoutouts, gallery, onNavigate }: HomeViewProps) {
  const [nextEvent, setNextEvent] = useState<StahizaEvent | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  // Find the closest upcoming event
  useEffect(() => {
    if (events.length === 0) return;
    
    const now = Date.now();
    const sortedUpcoming = [...events]
      .filter(e => new Date(e.date).getTime() > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedUpcoming.length > 0) {
      setNextEvent(sortedUpcoming[0]);
    } else {
      // If no upcoming event, default to the latest created event
      setNextEvent(events[0]);
    }
  }, [events]);

  // Countdown timer logic
  useEffect(() => {
    if (!nextEvent) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const targetTime = new Date(nextEvent.date).getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isOver: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextEvent]);

  // Get latest 3 shoutouts
  const recentShoutouts = [...shoutouts].slice(0, 3);
  
  // Get latest 4 gallery images
  const recentGallery = [...gallery].slice(0, 4);

  return (
    <div id="home-view" className="space-y-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/2 backdrop-blur-md py-20 px-6 sm:px-12 bg-dot-matrix">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-transparent to-neon-cyan/5 pointer-events-none"></div>
        
        <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-neon-purple/10 border border-neon-purple/30 rounded-full text-xs font-mono text-neon-purple-hover"
          >
            <Sparkles className="w-3.5 h-3.5 text-neon-purple animate-pulse" />
            STAHIZA Entertainment Protocol v1.4.2
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight leading-none text-white"
          >
            THE SOUNDTRACK OF <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-green glow-cyan">
              OUR ACADEMY
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto"
          >
            Welcome to <span className="text-white font-semibold">STAHIZA Ent Desk</span>. 
            Track live neon nights, send real-time shoutouts to the booth, request custom soundclash remixes, and review the media deck.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() => onNavigate("events")}
              className="px-6 py-3 bg-neon-purple hover:bg-neon-purple-hover text-white rounded-xl font-medium shadow-lg shadow-neon-purple/20 flex items-center gap-2 group transition-all"
            >
              Explore Events Deck
              <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate("shoutouts")}
              className="px-6 py-3 bg-dark-card border border-dark-border hover:border-neon-cyan/40 hover:bg-neon-cyan/5 text-gray-300 hover:text-white rounded-xl font-mono text-sm flex items-center gap-2 transition-all"
            >
              <Music className="w-4 h-4 text-neon-cyan" />
              Send Live Shoutout
            </button>
          </motion.div>
        </div>
      </section>

      {/* EVENT COUNTDOWN */}
      {nextEvent && (
        <section className="bg-white/2 border border-white/5 rounded-3xl p-6 sm:p-10 relative overflow-hidden bg-scanlines backdrop-blur-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 filter blur-3xl rounded-full"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Header / Timer Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2 text-neon-cyan font-mono text-xs uppercase tracking-widest">
                <Clock className="w-4 h-4 animate-spin text-neon-cyan" />
                Live Arena Countdown
              </div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                {timeLeft.isOver ? "PARTY IN MOTION!" : "TIME TO THE NEXT SHOW"}
              </h3>
              
              {/* Actual Timer boxes */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4 font-mono">
                {[
                  { value: timeLeft.days, label: "DAYS" },
                  { value: timeLeft.hours, label: "HRS" },
                  { value: timeLeft.minutes, label: "MINS" },
                  { value: timeLeft.seconds, label: "SECS" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/5 rounded-xl p-3 text-center">
                    <span className="block text-2xl sm:text-4xl font-bold font-mono text-neon-purple glow-purple">
                      {String(item.value).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold block mt-1">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-mono text-neon-green tracking-wider font-bold">Vibe Coordinates</span>
                <p className="text-xs text-gray-400">
                  Target: {new Date(nextEvent.date).toLocaleDateString(undefined, { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Featured Event Card representation */}
            <div className="lg:col-span-7">
              <div className="bg-black/30 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all flex flex-col sm:flex-row shadow-2xl">
                <div className="sm:w-1/2 relative min-h-[220px]">
                  <img
                    src={nextEvent.image_url}
                    alt={nextEvent.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent to-dark-bg/90 sm:to-dark-bg"></div>
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-neon-purple/90 backdrop-blur-md rounded-lg text-[10px] font-mono font-bold text-white uppercase tracking-wider shadow-md">
                    <Flame className="w-3.5 h-3.5 animate-pulse text-neon-green" />
                    Featured Event
                  </span>
                </div>
                <div className="p-6 sm:w-1/2 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="font-mono text-xs text-neon-purple font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(nextEvent.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <h4 className="font-display font-extrabold text-xl text-white tracking-tight line-clamp-1">
                      {nextEvent.title}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-4 leading-relaxed">
                      {nextEvent.description}
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate("events")}
                    className="self-start text-xs font-mono text-neon-cyan hover:text-white hover:underline transition-all flex items-center gap-1.5 group"
                  >
                    View Details
                    <MoveRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RECENT SHOUTOUT PORTAL */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green animate-pulse"></span>
              Live Broadcast Stream
            </h3>
            <p className="text-sm text-gray-400">Recent student shoutouts transmitted live to the head cabin</p>
          </div>
          <button
            onClick={() => onNavigate("shoutouts")}
            className="self-start px-4 py-2 border border-dark-border hover:border-neon-purple/40 bg-dark-card hover:bg-neon-purple/5 text-xs font-mono text-gray-300 hover:text-white rounded-xl transition-all"
          >
            Submit Custom Transmission
          </button>
        </div>

        {recentShoutouts.length === 0 ? (
          <div className="bg-dark-card/40 border border-dark-border rounded-2xl p-8 text-center text-gray-500 font-mono text-xs">
            TRANS-RECEPTOR IDLE. No transmissions received yet. Be the first to shoutout!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentShoutouts.map((shout, idx) => (
              <div 
                key={shout.id}
                className="bg-white/3 border border-white/5 hover:border-white/10 rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden group transition-all duration-300"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-neon-purple/50 group-hover:bg-neon-cyan transition-colors"></div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-white truncate max-w-[150px]">{shout.student_name}</span>
                    <span className="text-[9px] font-mono text-gray-500">
                      {new Date(shout.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed italic bg-black/40 p-3 rounded-lg border border-white/5">
                    &ldquo;{shout.message}&rdquo;
                  </p>
                </div>

                {shout.song_request && (
                  <div className="flex items-center gap-2 bg-neon-cyan/10 border border-white/10 px-2.5 py-1.5 rounded-xl font-mono text-[10px] text-neon-cyan truncate">
                    <Music className="w-3.5 h-3.5 flex-shrink-0 animate-bounce text-neon-cyan" />
                    <span>Req: {shout.song_request}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* LATEST GALLERY HIGHLIGHTS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-purple animate-pulse"></span>
              Highlights Reels
            </h3>
            <p className="text-sm text-gray-400">Fresh visual memories preserved from our dance halls</p>
          </div>
          <button
            onClick={() => onNavigate("gallery")}
            className="self-start px-4 py-2 border border-dark-border hover:border-neon-cyan/40 bg-dark-card hover:bg-neon-cyan/5 text-xs font-mono text-gray-300 hover:text-white rounded-xl transition-all"
          >
            Launch Media Deck
          </button>
        </div>

        {recentGallery.length === 0 ? (
          <div className="bg-dark-card/40 border border-dark-border rounded-2xl p-8 text-center text-gray-500 font-mono text-xs">
            NO CAPTURES PRESENT. Media repository empty.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentGallery.map((img) => (
              <div 
                key={img.id}
                onClick={() => onNavigate("gallery")}
                className="relative group rounded-2xl overflow-hidden aspect-video sm:aspect-square border border-white/5 bg-white/3 cursor-pointer"
              >
                <img
                  src={img.url}
                  alt={img.caption || "STAHIZA vibes"}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 py-4">
                  <p className="text-white text-[11px] font-medium font-display leading-tight truncate w-full">
                    {img.caption || "View image"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
