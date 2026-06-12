import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, RotateCw, Music, Zap, Sliders, Volume2, Shield, Activity, Disc, Cpu } from "lucide-react";

interface FuturisticDJPreloaderProps {
  onLoaded: () => void;
}

export default function FuturisticDJPreloader({ onLoaded }: FuturisticDJPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeDeck, setActiveDeck] = useState<"A" | "B">("A");
  const [fxMode, setFxMode] = useState<string>("FILTER");

  const soundPlayedRef = useRef(false);
  const hasUserInteracted = useRef(false);

  // Compute state variables on-the-fly to prevent maximum update depth loop errors
  let systemState = "CALIBRATING JOG PLATTER...";
  let spinSpeed = 3;

  if (progress < 25) {
    systemState = "LOADING AUDIO ENGINE & SAMPLES...";
    spinSpeed = isHovered ? 1.5 : 4;
  } else if (progress < 50) {
    systemState = "MAPPING MIDI CONTROL SURFACES...";
    spinSpeed = isHovered ? 1.0 : 3;
  } else if (progress < 75) {
    systemState = "RENDERING STAHIZA VIRTUAL DECKS...";
    spinSpeed = isHovered ? 0.6 : 2;
  } else if (progress < 100) {
    systemState = "CONNECTING SYNCHRONIZED EQUALIZERS...";
    spinSpeed = isHovered ? 0.4 : 1.2;
  } else {
    systemState = "CONSOLE READY. PRESS MASTER CUE TO INITIALIZE";
    spinSpeed = isHovered ? 0.2 : 0.8;
  }

  // Play a quick, clean synthesised notification sound on completion/load
  const playPulseSound = (frequency = 440, duration = 0.15) => {
    if (!hasUserInteracted.current) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === "suspended") {
        return;
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Ignored if browser blocks autoplay audio until user gesture
    }
  };

  // Run progress smoothly over 5 seconds (6000ms total, ~33ms interval)
  useEffect(() => {
    const totalDuration = 5000; 
    const intervalTime = 40; 
    const increment = (100 / (totalDuration / intervalTime));

    const timer = setInterval(() => {
      setProgress((prev) => {
        // Spin speed accelerates as loading progress fills up!
        const next = prev + increment * (isHovered ? 2.5 : 1);
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Number(next.toFixed(1));
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isHovered]);

  // Handle completion sound trigger safely and auto-transition to the application dashboard
  useEffect(() => {
    if (progress >= 100 && !soundPlayedRef.current) {
      soundPlayedRef.current = true;
      playPulseSound(587.33, 0.45); // Warm completion frequency (D5 note)
      
      // Auto-transition after a brief delay for a polished completion feel
      const autoRedirect = setTimeout(() => {
        onLoaded();
      }, 750);
      
      return () => clearTimeout(autoRedirect);
    }
  }, [progress, onLoaded]);

  return (
    <div 
      className="fixed inset-0 z-[99999] w-full h-full bg-[#03010b] flex flex-col items-center justify-center p-4 select-none overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle at center, #0a041f 0%, #020005 100%)"
      }}
    >
      {/* Background Cyber scanlines overlay */}
      <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px] pointer-events-none" />

      {/* Ambient glowing radial shadows in corners */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-neon-purple/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-neon-cyan/10 blur-3xl pointer-events-none" />

      {/* MAIN CONSOLE SHELL CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-black/60 border-2 border-white/10 p-6 md:p-8 rounded-[36px] backdrop-blur-2xl shadow-2xl relative flex flex-col items-center text-center gap-6"
      >
        {/* Decorative corner brackets of a DJ Flight Case board */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-neon-cyan opacity-40 rounded-tl-xl" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-neon-purple opacity-40 rounded-tr-xl" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-neon-cyan opacity-40 rounded-bl-xl" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[#22c55e] opacity-40 rounded-br-xl" />

        {/* Top Header line */}
        <div className="w-full flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-neon-purple animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-[#a855f7] font-bold">STAHIZA DJ CABIN</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#22c55e]">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
            <span>CORE READY</span>
          </div>
        </div>

        {/* THE SPINNING JOG WHEEL DECK (WITH MORPH EFFECTS BASED ON HOVER OR STATE) */}
        <div 
          className="relative group cursor-pointer my-4"
          onMouseEnter={() => {
            hasUserInteracted.current = true;
            setIsHovered(true);
            playPulseSound(330, 0.1); // Quick feedback tone
          }}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Glowing Aura Ring which expands and morphs when progress fills */}
          <div 
            className="absolute -inset-6 rounded-full blur-2xl transition-all duration-700 opacity-30 mix-blend-screen"
            style={{
              background: `conic-gradient(from 0deg, #a855f7 ${progress}%, #06b6d4 ${progress + 20}%, transparent 100%)`,
              transform: `scale(${isHovered ? 1.15 : 1.0})`
            }}
          />

          {/* Morphing Outer Equalizer Ring using dynamic dashes */}
          <svg 
            className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] text-white/5 transition-all duration-500"
            viewBox="0 0 100 100"
          >
            <circle 
              cx="50" 
              cy="50" 
              r="46" 
              fill="none" 
              className="stroke-neon-cyan/30"
              strokeWidth="1" 
              strokeDasharray={`${progress}, ${140 - progress}`} 
              strokeLinecap="round"
            />
            <circle 
              cx="50" 
              cy="50" 
              r="43" 
              fill="none" 
              className="stroke-neon-purple/20"
              strokeWidth="0.8" 
              strokeDasharray="6 3 9 4" 
              style={{
                transformOrigin: "center",
                transform: `rotate(${isHovered ? progress * 3 : progress * 0.8}deg)`,
                transition: "transform 0.1s linear"
              }}
            />
          </svg>

          {/* THE VINYL JOG PLATER BODY */}
          <div 
            className="w-48 h-48 md:w-52 md:h-52 rounded-full bg-[#0a0614] border-[8px] border-[#1c162a] shadow-[0_0_40px_rgba(0,0,0,0.9)] relative flex items-center justify-center overflow-hidden"
            style={{
              boxShadow: isHovered 
                ? "0 0 45px rgba(6, 182, 212, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.3)" 
                : "0 0 30px rgba(0,0,0,0.9)"
            }}
          >
            {/* Spinning Grooves (Rotated via CSS Variable rotation speed) */}
            <div 
              className="absolute inset-0 w-full h-full rounded-full bg-radial-vinyl"
              style={{
                animation: `spin ${spinSpeed}s linear infinite`,
                backgroundImage: "repeating-radial-gradient(circle, #100a20, #0a0614 2px, #04020a 4px, #100a20 6px)"
              }}
            >
              {/* Reflective shine angle bar mockups that spin with the vinyl */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent rotate-45 transform origin-center" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent -rotate-45 transform origin-center" />
            </div>

            {/* Inner Tactile Target Pointer representing active play points */}
            <div 
              className="absolute top-2 w-1.5 h-8 bg-neon-cyan rounded-full shadow-[0_0_10px_#06b6d4] transition-all"
              style={{
                transform: `rotate(${progress * 3.6}deg) translateY(${isHovered ? "4px" : "0px"})`,
                transformOrigin: "bottom center"
              }}
            />

            {/* CENTER METALLIC DYNAMIC SPINDLE CAP */}
            <div 
              className="w-16 h-16 rounded-full bg-black/90 border-2 border-white/20 shadow-xl flex flex-col items-center justify-center relative z-20 transition-all duration-300"
              style={{
                transform: `scale(${isHovered ? 1.08 : 1})`
              }}
            >
              <Zap className={`w-5 h-5 transition-all duration-300 ${isHovered ? "text-neon-cyan scale-110 drop-shadow-[0_0_8px_#06b6d4]" : "text-neon-purple"}`} />
              <span className="text-[7px] text-gray-400 mt-1 uppercase tracking-wider font-extrabold">DECK {activeDeck}</span>
            </div>
          </div>
        </div>

        {/* DECKS BENTLEY CONTROLS GRAPHIC (MORPHS AS ENGINE BOOTS) */}
        <div className="w-full bg-[#080415]/75 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />
          
          {/* Deck Selector buttons that trigger state changes */}
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex gap-2">
              <button 
                onClick={() => { 
                  hasUserInteracted.current = true;
                  setActiveDeck("A"); 
                  playPulseSound(261.63, 0.15); 
                }}
                className={`px-3 py-1 border rounded-lg font-bold transition-all ${activeDeck === "A" ? "border-neon-cyan text-neon-cyan bg-neon-cyan/5" : "border-white/10 text-gray-500"}`}
              >
                DECK A
              </button>
              <button 
                onClick={() => { 
                  hasUserInteracted.current = true;
                  setActiveDeck("B"); 
                  playPulseSound(329.63, 0.15); 
                }}
                className={`px-3 py-1 border rounded-lg font-bold transition-all ${activeDeck === "B" ? "border-neon-purple text-neon-purple bg-neon-purple/5" : "border-white/10 text-gray-500"}`}
              >
                DECK B
              </button>
            </div>

            {/* Simulated FX Mode toggle selectors */}
            <div className="flex gap-1.5 text-gray-500 text-[9px]">
              {["REVERB", "FILTER", "DELAY"].map((fx) => (
                <span 
                  key={fx}
                  onClick={() => { 
                    hasUserInteracted.current = true;
                    setFxMode(fx); 
                    playPulseSound(440, 0.08); 
                  }}
                  className={`cursor-pointer px-1.5 py-0.5 rounded transition-all ${fxMode === fx ? "text-white font-bold bg-white/10" : "hover:text-gray-300"}`}
                >
                  {fx}
                </span>
              ))}
            </div>
          </div>

          {/* Audio Equalizer bouncing bars */}
          <div className="flex items-end justify-between gap-1 h-10 pt-1 bg-black/40 p-2 border border-white/5 rounded-xl">
            {Array.from({ length: 20 }).map((_, i) => {
              // Create dynamic bounce wave relative to index, progress & hover state
              const randomFactor = Math.sin((progress * 0.15) + i) * 20;
              const hoverBonus = isHovered ? 40 : 10;
              const rawVal = 10 + Math.abs(randomFactor) + (progress * 0.3) + (Math.random() * hoverBonus);
              const heightStr = `${Math.min(100, rawVal)}%`;
              const color = i < 7 ? "bg-neon-cyan" : i < 14 ? "bg-neon-purple" : "bg-[#22c55e]";
              return (
                <div 
                  key={i} 
                  className={`w-full ${color} rounded-t-sm transition-all duration-75`}
                  style={{ height: heightStr }}
                />
              );
            })}
          </div>

          {/* Interactive instruction readout */}
          <div className="flex justify-between items-center text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5 text-neon-cyan animate-spin" />
              <span>SPIN FORCE: {isHovered ? "2.5X BOOST ACTIVE" : "REGULAR MODE"}</span>
            </span>
            <span className="text-neon-cyan font-mono text-[9px]">EFFECT_FX: {fxMode}</span>
          </div>
        </div>

        {/* PROGRESS METRIC TRACK */}
        <div className="w-full space-y-1 text-left">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-gray-500 uppercase tracking-widest">{systemState}</span>
            <span className="font-mono text-white text-xs font-bold">{progress}%</span>
          </div>

          {/* Mechanical segmented LED style bar */}
          <div className="w-full bg-neutral-950 border border-white/10 rounded-full h-3 p-0.5 overflow-hidden flex gap-0.5">
            {Array.from({ length: 30 }).map((_, idx) => {
              const activeCount = Math.floor((progress / 100) * 30);
              const isActive = idx <= activeCount;
              const colorClass = idx < 10 
                ? "bg-neon-cyan" 
                : idx < 20 
                ? "bg-neon-purple" 
                : "bg-neon-green";

              return (
                <div 
                  key={idx}
                  className={`h-full flex-1 rounded-sm transition-all duration-300 ${
                    isActive ? `${colorClass} opacity-100 shadow-[0_0_8px_currentColor]` : "bg-white/5 opacity-10"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* SKIPPABLE TRIGGER ACTION AREA */}
        <div className="w-full mt-2 h-14 flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            {progress >= 100 ? (
              <motion.button
                key="launch"
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.1, opacity: 0 }}
                onClick={() => {
                  hasUserInteracted.current = true;
                  playPulseSound(880, 0.4);
                  onLoaded();
                }}
                className="px-12 py-3 bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-green text-black font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.5)] transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-black text-black" />
                ENTER THE DESK
              </motion.button>
            ) : (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">
                  HOVER OVER JOG WHEEL TO ACCELERATE TURNTABLE
                </span>
                <button
                  onClick={() => {
                    hasUserInteracted.current = true;
                    setProgress(100);
                    playPulseSound(523.25, 0.25);
                  }}
                  className="text-[9px] text-[#a855f7] hover:text-white underline font-bold tracking-wider mt-1 cursor-pointer transition-colors"
                >
                  FAST BOOT & SKIP OVER SYSTEM DIAGNOSTIC
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>

      {/* Embedded Spin Keyframes style to bypass tailwind complexity config */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
