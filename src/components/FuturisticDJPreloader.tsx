import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { 
  Play, Volume2, ShieldAlert, Wifi, Terminal, 
  RotateCw, Activity, Cpu, Sliders, Music, Zap, Clock 
} from "lucide-react";

interface FuturisticDJPreloaderProps {
  onLoaded: () => void;
}

export default function FuturisticDJPreloader({ onLoaded }: FuturisticDJPreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [bootStep, setBootStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [boostLevel, setBoostLevel] = useState(50); // "BASS BOOSTER" / "GAIN GAUNTLET" from 10 to 100
  const [overdrive, setOverdrive] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [shattered, setShattered] = useState(false);

  // Audio status readouts
  const [audioStats, setAudioStats] = useState({
    bpm: 128,
    latency: "0.04ms",
    signal: "DUBPLATE SECURE",
    vibeIndex: 85,
    dbLevel: -3.4
  });

  // Terminal log simulation line items
  const bootLogs = [
    "SYSLOG: Welcome to STAHIZA Ent Desk Platform v4.0",
    "SYSLOG: Initializing frequency grid nodes...",
    "AUDIO: Checking Web Audio oscillator buffers...",
    "AUDIO: Direct connect multi-channel EQ mapped.",
    "DB: Synchronizing club and event memory logs...",
    "SECURE: Verification token decrypted.",
    "BASS: Subwoofer integrity check: OK (30Hz - 120Hz)",
    "VIBE: Synthesizing neon light frequency spectrum [94.5%]",
    "STAHIZA: DJ Desk deck-A & deck-B calibrated successfully.",
    "STAHIZA: ENTER FREQUENCY MATRIX CODE: 'STAHIZA_VIBE_ACTIVE'"
  ];

  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  // Track jog wheel state
  const jogRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const startAngleRef = useRef(0);
  const currentAngleRef = useRef(0);
  const rotationOffsetRef = useRef(0);
  const [jogAngle, setJogAngle] = useState(0);

  // Web Audio Synth trigger for key sound actions
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playCyberSound = (type: "init" | "tick" | "boost" | "loaded") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "tick") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880 + Math.random() * 400, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "boost") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(120 + (boostLevel * 4), ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "loaded") {
        // Futuristic chord sweep!
        const chord = [220, 277.18, 329.63, 440, 554.37];
        chord.forEach((freq) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.type = "sawtooth";
          oscNode.frequency.setValueAtTime(freq, ctx.currentTime);
          oscNode.frequency.linearRampToValueAtTime(freq * 2, ctx.currentTime + 0.8);
          
          // bandpass to sound high-tech
          const filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = 1000;
          filter.Q.value = 2.0;

          oscNode.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
          
          oscNode.start();
          oscNode.stop(ctx.currentTime + 0.9);
        });
      }
    } catch (e) {
      // Audio context might fail on browser autoplay headers, ignore silently
    }
  };

  // Add terminal logs procedurally
  useEffect(() => {
    if (bootStep < bootLogs.length) {
      const intervalTime = 600 - (boostLevel * 4); // Speed up terminal print if bass booster is spiked!
      const timer = setTimeout(() => {
        setTerminalLogs(prev => [...prev, bootLogs[bootStep]]);
        setBootStep(prev => prev + 1);
        playCyberSound("tick");
      }, Math.max(100, intervalTime));
      return () => clearTimeout(timer);
    }
  }, [bootStep, boostLevel]);

  // Audio readout fluctuation loops
  useEffect(() => {
    const statsTimer = setInterval(() => {
      setAudioStats(prev => {
        const deltaBpm = (Math.random() - 0.5) * 0.4;
        const deltaDb = (Math.random() - 0.5) * 0.5;
        const deltaVibe = Math.floor((Math.random() - 0.4) * 3);
        const randLatency = (0.01 + Math.random() * 0.05).toFixed(2);
        return {
          bpm: Number((prev.bpm + deltaBpm).toFixed(1)),
          latency: `${randLatency}ms`,
          signal: prev.bpm > 132 ? "OVERDRIVE HARMONIC" : "STABLE GATEWAY SOURCE",
          vibeIndex: Math.min(100, Math.max(50, prev.vibeIndex + deltaVibe)),
          dbLevel: Number(Math.min(-0.1, Math.max(-12, prev.dbLevel + deltaDb)).toFixed(1))
        };
      });
    }, 1200);

    return () => clearInterval(statsTimer);
  }, []);

  // Main loading progress accumulation
  useEffect(() => {
    if (progress >= 100) {
      if (!isDone) {
        setIsDone(true);
        playCyberSound("loaded");
        // Automatically trigger exit and transition to dashboard after 500ms peak-hold
        const exitTimer = setTimeout(() => {
          triggerExitReveal();
        }, 500);
        return () => clearTimeout(exitTimer);
      }
      return;
    }

    // Base duration of 5000ms. We update every 50ms.
    // 5000ms total with 50ms interval requires an average of 1.0% increment.
    // Adjust based on boostLevel (base 50) and overdrive (scrubbing)
    const baseIncrement = 1.0; 
    const boostFactor = boostLevel / 50; 
    const overrideFactor = overdrive ? 4.0 : 1.0;
    const increment = baseIncrement * boostFactor * overrideFactor;

    const timer = setTimeout(() => {
      setProgress(prev => {
        const next = prev + increment;
        return next >= 100 ? 100 : Number(next.toFixed(1));
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [progress, boostLevel, overdrive, isDone]);

  // Handle Drag / Jog Wheel Scrubbing rotation calculation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDone) return;
    setIsScrubbing(true);
    playCyberSound("boost");
    
    // Set overdrive while scrubbing
    setOverdrive(true);

    if (jogRef.current) {
      const rect = jogRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      startAngleRef.current = angle;
      rotationOffsetRef.current = jogAngle;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isScrubbing || !jogRef.current) return;
    
    // Manual progress injection for scrubbing!
    setProgress(prev => {
      const spike = Math.min(99.9, prev + 0.4);
      return Number(spike.toFixed(1));
    });

    const rect = jogRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    
    // Calculate angle diff in degrees
    const deltaAngle = (angle - startAngleRef.current) * (180 / Math.PI);
    const newAngle = rotationOffsetRef.current + deltaAngle;
    setJogAngle(newAngle);

    // Play randomized fast pitch tick on rotation degrees delta
    if (Math.abs(Math.floor(deltaAngle) % 8) === 0) {
      playCyberSound("tick");
    }
  };

  const handleMouseUp = () => {
    setIsScrubbing(false);
    setOverdrive(false);
  };

  useEffect(() => {
    if (isScrubbing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isScrubbing]);

  // Handle keys/drags on progress bar trigger
  const handleBoostChange = (val: number) => {
    setBoostLevel(val);
    playCyberSound("boost");
  };

  // Exit trigger with high-energy shatter scale and viewport fade
  const triggerExitReveal = () => {
    setShattered(true);
    setTimeout(() => {
      onLoaded();
    }, 800);
  };

  return (
    <AnimatePresence>
      {!shattered && (
        <motion.div
          id="stahiza-immersive-preloader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 2.2,
            filter: "blur(20px)",
            transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[10000] w-full h-screen bg-[#020005] bg-radial-gradient flex items-center justify-center p-4 selection:bg-neon-cyan select-none overflow-hidden font-mono"
          style={{
            backgroundImage: "radial-gradient(circle at center, #09031d 0%, #030009 100%)"
          }}
        >
          {/* Neon Grid Overlay & Laser line */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px] pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_#06b6d4] opacity-40 animate-pulse pointer-events-none" />
          
          {/* Audio Scanlines & Noise overlays */}
          <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-15 pointer-events-none" />
          
          <div className="absolute top-4 left-6 flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-neon-pink rounded-full animate-ping" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a855f7]">Stahiza Core Vibe Online</span>
          </div>

          <div className="absolute top-4 right-6 text-[10px] flex items-center gap-2 text-gray-500">
            <Clock className="w-3.5 h-3.5 text-neon-cyan" />
            <span>UTC LIVE STREAM DIRECT</span>
          </div>

          {/* FLIGHT-CASE CHASSIS OUTER BOARD */}
          <div className="w-full max-w-4xl bg-black/60 border-2 border-white/20 rounded-[32px] p-6 md:p-8 backdrop-blur-xl shadow-2xl relative flex flex-col gap-6 scale-95 md:scale-100 transition-all">
            
            {/* Top DJ Flight Case Rivets & Handles style */}
            <div className="absolute -top-1.5 left-12 w-6 h-3 bg-neutral-800 rounded-t-full border-t border-white/20" />
            <div className="absolute -top-1.5 right-12 w-6 h-3 bg-neutral-800 rounded-t-full border-t border-white/20" />
            <div className="absolute -bottom-1.5 left-12 w-6 h-3 bg-neutral-800 rounded-b-full border-b border-white/20" />
            <div className="absolute -bottom-1.5 right-12 w-6 h-3 bg-neutral-800 rounded-b-full border-b border-white/20" />

            {/* LED Status strip bars */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-neon-purple animate-pulse" />
                <h1 className="font-display font-extrabold text-sm md:text-base text-white tracking-widest uppercase">
                  STAHIZA <span className="text-neon-cyan font-light">Ent Desk Matrix</span>
                </h1>
              </div>

              {/* Deck Indicators */}
              <div className="flex gap-2 text-[9px] font-mono">
                <span className={`px-2 py-0.5 border rounded-sm tracking-wider transition-colors ${progress < 50 ? "border-neon-cyan text-neon-cyan bg-neon-cyan/5 animate-pulse" : "border-white/15 text-gray-600"}`}>
                  DECK_01
                </span>
                <span className={`px-2 py-0.5 border rounded-sm tracking-wider transition-colors ${progress >= 50 && progress < 100 ? "border-neon-purple text-neon-purple bg-neon-purple/5 animate-pulse" : "border-white/15 text-gray-600"}`}>
                  DECK_02
                </span>
                <span className={`px-2 py-0.5 border rounded-sm tracking-wider transition-colors ${progress >= 100 ? "border-[#22c55e] text-[#22c55e] bg-green-500/5 animate-pulse" : "border-white/15 text-gray-600"}`}>
                  MASTER_CLEARED
                </span>
              </div>
            </div>

            {/* MAIN DASHBOARD PANEL GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.7fr] gap-6 items-stretch">
              
              {/* LEFT COLUMN: INTERACTIVE JOG JOG WHEEL & DECK PLATER */}
              <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-between gap-4 relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
                
                {/* Header tag */}
                <div className="w-full flex justify-between items-center text-[9px] text-gray-500 font-bold">
                  <span>JOG WHEEL MODULATOR v1.0</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-ping" />
                    <span>SCRUB SENSOR ACTIVE</span>
                  </div>
                </div>

                {/* THE ROTATING VINYL PLATER JOG WHEEL */}
                <div className="relative my-2">
                  {/* Outer Orbit Light ring */}
                  <div className={`absolute -inset-4 rounded-full border border-dashed transition-all duration-300 ${
                    isScrubbing 
                      ? "border-neon-cyan animate-[spin_8s_linear_infinite] scale-105" 
                      : "border-white/5 animate-[spin_25s_linear_infinite]"
                  }`} />

                  {/* Pulsing glow backstop */}
                  <div className={`absolute -inset-2 rounded-full blur-xl transition-all duration-700 opacity-25 ${
                    isScrubbing ? "bg-neon-cyan" : "bg-neon-purple"
                  }`} />

                  {/* Dynamic Vinyl Deck circle */}
                  <div 
                    ref={jogRef}
                    onMouseDown={handleMouseDown}
                    className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-neutral-900 border-[6px] border-neutral-800 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
                    style={{
                      transform: `rotate(${jogAngle}deg)`,
                      transition: isScrubbing ? "none" : "transform 0.4s cubic-bezier(0.1, 0.8, 0.3, 1)"
                    }}
                  >
                    {/* Vinyl grooves nested svgs */}
                    <svg className="absolute inset-0 w-full h-full text-white/[0.015]" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.8" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 1" />
                      <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="4 2" />
                      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="0.2" />
                    </svg>

                    {/* Angular alignment sector lines */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-[1px] bg-cyan-400/[0.07]" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rotate-90">
                      <div className="w-full h-[1px] bg-cyan-400/[0.07]" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rotate-45">
                      <div className="w-full h-[1px] bg-cyan-400/[0.07]" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                      <div className="w-full h-[1px] bg-cyan-400/[0.07]" />
                    </div>

                    {/* Stahiza Hologram Core inside Platter Center */}
                    <div className="w-16 h-16 rounded-full bg-black border-2 border-white/20 shadow-inner flex flex-col items-center justify-center relative z-20">
                      <div className="absolute inset-0 bg-radial-gradient from-transparent to-neon-purple/20 rounded-full" />
                      {/* Interactive glowing core node */}
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isScrubbing 
                          ? "border-neon-cyan bg-neon-cyan/20 animate-ping" 
                          : "border-neon-purple bg-neon-purple/10"
                      }`}>
                        <Zap className={`w-3 h-3 ${isScrubbing ? "text-neon-cyan" : "text-neon-purple"}`} />
                      </div>
                      <span className="text-[7px] text-gray-500 scale-90 mt-1 uppercase tracking-tighter">STAHIZA</span>
                    </div>

                    {/* Neon tactile slider pin track pointer */}
                    <div className="absolute top-2 w-1.5 h-10 bg-neon-cyan shadow-[0_0_8px_#06b6d4] rounded-full pointer-events-none" />
                  </div>
                </div>

                {/* Info Text Indicator */}
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    <RotateCw className={`w-3 h-3 text-neon-cyan ${isScrubbing ? "animate-spin" : ""}`} />
                    <span>SPIN JOG WHEEL TO SPEED UP BOOT</span>
                  </p>
                  <p className="text-[9px] text-[#a855f7] mt-1 italic">
                    {isScrubbing ? "OVERDRIVE MODE ENGAGED (2X FREQUENCY)" : "SCRUB PLATTER TO SYNC ENGINES"}
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: TERMINAL INTERFACES, DIAGNOSTICS & SLIDERS */}
              <div className="flex flex-col gap-4">
                
                {/* UPPER DYNAMIC SOUND DIAGNOSTICS */}
                <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-3 gap-3 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#22c55e]/30 to-transparent" />
                  
                  {/* Card 1: BPM readout */}
                  <div className="bg-black/40 border border-white/5 rounded-xl p-2 flex flex-col justify-between">
                    <span className="text-[8px] text-gray-500 uppercase font-bold flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5 text-neon-cyan" />
                      TEMPO (BPM)
                    </span>
                    <span className="text-xl md:text-2xl font-extrabold text-neon-cyan tracking-tight font-mono mt-1">
                      {audioStats.bpm}
                    </span>
                    <span className="text-[7px] text-gray-500 uppercase">SYNC_DECK_STABLE</span>
                  </div>

                  {/* Card 2: Gain level */}
                  <div className="bg-black/40 border border-white/5 rounded-xl p-2 flex flex-col justify-between">
                    <span className="text-[8px] text-gray-500 uppercase font-bold flex items-center gap-1">
                      <Sliders className="w-2.5 h-2.5 text-neon-purple" />
                      CORE GAIN
                    </span>
                    <span className="text-xl md:text-2xl font-extrabold text-neon-purple-hover tracking-tight font-mono mt-1">
                      +{boostLevel}%
                    </span>
                    <span className="text-[7px] text-gray-500 uppercase">SIGNAL BOOST CAP</span>
                  </div>

                  {/* Card 3: Ping & Latency */}
                  <div className="col-span-2 md:col-span-1 bg-black/40 border border-white/5 rounded-xl p-2 flex flex-col justify-between">
                    <span className="text-[8px] text-gray-500 uppercase font-bold flex items-center gap-1">
                      <Cpu className="w-2.5 h-2.5 text-neon-pink" />
                      LATENCY RATE
                    </span>
                    <span className="text-xl md:text-2xl font-extrabold text-neon-pink tracking-tight font-mono mt-1">
                      {audioStats.latency}
                    </span>
                    <span className="text-[7px] text-gray-500 uppercase">AUDIO_BUFFER_PULL</span>
                  </div>
                </div>

                {/* DIGITAL EQUALIZER BOUNCING TRACK */}
                <div className="bg-neutral-950/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
                  <span className="text-[8px] text-gray-500 uppercase font-bold">DIGITAL FREQUENCY EQUALIZER</span>
                  
                  {/* EQ Peak Level Bars */}
                  <div className="flex items-end justify-between gap-1 h-14 pt-1 bg-black/20 p-2 border border-white/5 rounded-xl">
                    {Array.from({ length: 24 }).map((_, i) => {
                      // Generate pseudorandom bounce based on loading progress and boost level
                      const val = Math.max(15, Math.ceil(Math.sin((progress * 0.1) + i) * 35) + 35 + (isScrubbing ? 20 : 0));
                      // Mix colors from cyan to pink to green
                      const color = i < 8 ? "bg-neon-cyan" : i < 16 ? "bg-neon-purple" : "bg-[#22c55e]";
                      return (
                        <div 
                          key={i} 
                          className={`w-full ${color} rounded-t-xs transition-all duration-75`}
                          style={{ 
                            height: `${Math.min(100, val)}%`,
                            opacity: isScrubbing ? 1 : 0.85 
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* REAL-TIME SYSTEM LOG TERMINAL */}
                <div className="bg-neutral-950 border border-white/10 rounded-2xl p-3 flex-grow flex flex-col gap-2 h-44 relative overflow-hidden">
                  <div className="flex justify-between items-center text-[8px] text-gray-500 border-b border-white/5 pb-1">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-neon-purple" />
                      STAHIZA SECURE OPERATIVE_CONSOLE
                    </span>
                    <span>ONLINE_BUFF={terminalLogs.length}</span>
                  </div>

                  {/* Scrollable logs list */}
                  <div className="flex-grow overflow-y-auto text-[10px] space-y-1 font-mono text-gray-400 p-1 scrollbar-hide">
                    <AnimatePresence initial={false}>
                      {terminalLogs.map((log, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-start gap-1 ${
                            log.includes("ERROR") || log.includes("FAULT") 
                              ? "text-neon-pink font-semibold" 
                              : log.includes("AUDIO") 
                              ? "text-neon-cyan" 
                              : log.includes("STAHIZA") 
                              ? "text-neon-green" 
                              : "text-gray-400"
                          }`}
                        >
                          <span className="text-[#a855f7] select-none">&gt;</span>
                          <span>{log}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

              </div>

            </div>

            {/* LOWER PORTION: "GAIN GAUNTLET" SLIDER & DIGITAL PROGRESS */}
            <div className="bg-neutral-950/90 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
              
              {/* slider */}
              <div className="w-full sm:w-1/2 space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-neon-cyan" />
                    BASS BOOSTER / GAIN GAUNTLET
                  </span>
                  <span className="text-neon-cyan font-mono">{boostLevel}% LVL</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  value={boostLevel}
                  onChange={(e) => handleBoostChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
                  style={{
                    background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${boostLevel}%, #2d2640 ${boostLevel}%, #2d2640 100%)`
                  }}
                />
              </div>

              {/* Loader percentage metric readout */}
              <div className="w-full sm:w-auto flex items-center justify-end gap-3 text-right">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">TUNING ENGINES</span>
                  <span className="text-2xl font-black text-white font-mono tracking-tight glow-cyan">
                    {progress}%
                  </span>
                </div>
                {/* Visual loading ring animation */}
                <svg className="w-10 h-10 text-neutral-800" viewBox="0 0 36 36">
                  <path
                    className="text-neutral-800"
                    strokeDasharray="100, 100"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-neon-cyan transition-all duration-300"
                    strokeDasharray={`${progress}, 100`}
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>

            {/* MECHANICAL PROGRESS TRACK (CHASSIS ACCENT) */}
            <div className="w-full bg-neutral-950 border border-white/10 rounded-full h-4 overflow-hidden relative p-0.5">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-neon-purple via-neon-cyan to-[#22c55e] relative shadow-[0_0_12px_#06b6d4]"
                style={{ width: `${progress}%` }}
                layout
              >
                {/* Horizontal scanner light effect */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite] w-20" />
              </motion.div>
            </div>

            {/* TRIGGER RESOLUTION ENTER DOOR */}
            <div className="h-16 flex items-center justify-center relative">
              <AnimatePresence>
                {progress >= 100 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <button
                      onClick={triggerExitReveal}
                      className="px-10 py-4 bg-gradient-to-r from-neon-purple via-neon-cyan to-[#22c55e] hover:from-white hover:to-white hover:text-black hover:shadow-[0_0_35px_#06b6d4] text-black font-display font-extrabold text-sm uppercase tracking-widest rounded-xl transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.5)] transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-black text-black" />
                      ENTER THE VIBE
                    </button>
                  </motion.div>
                )}
                
                {progress < 100 && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] text-gray-500 uppercase tracking-widest font-mono text-center"
                  >
                    COORDINATES RE-ROUTING... DRAG TURNTABLE PLATTER FOR HIGH BOOST
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
