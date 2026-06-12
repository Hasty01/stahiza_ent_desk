import { useState, FormEvent } from "react";
import { Send, Music, Sparkles, AlertCircle, Heart, CheckCircle2, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Shoutout } from "../types";

interface ShoutoutsViewProps {
  shoutouts: Shoutout[];
  onAddShoutout: (studentName: string, message: string, songRequest?: string) => Promise<boolean>;
}

export default function ShoutoutsView({ shoutouts, onAddShoutout }: ShoutoutsViewProps) {
  const [studentName, setStudentName] = useState("");
  const [message, setMessage] = useState("");
  const [songRequest, setSongRequest] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setStatusText("");

    if (!studentName.trim()) {
      setErrorText("Transmitter ID required! Let us know your name or handle.");
      return;
    }
    if (!message.trim()) {
      setErrorText("Null transmission payload. Please write an actual shoutout message!");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onAddShoutout(studentName, message, songRequest);
      if (success) {
        setStatusText("Transmission beamed successfully into active committee screens!");
        setStudentName("");
        setMessage("");
        setSongRequest("");
        // Clear message after timer
        setTimeout(() => setStatusText(""), 4000);
      } else {
        setErrorText("Beaming failed: Committee filters returned transmission error");
      }
    } catch (e: any) {
      setErrorText(e?.message || "Signal lost: Check your local container connection");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="shoutouts-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
      
      {/* SHOUTOUTS FEED BLOCK (Left/Top) */}
      <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
        <div className="space-y-1">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight flex items-center gap-2">
            The Broadcast Wall
          </h2>
          <p className="text-sm text-gray-400">Live student logs broadcasted directly. Admin keeps things safe, happy, and legal.</p>
        </div>

        {shoutouts.length === 0 ? (
          <div className="bg-white/2 border border-white/5 rounded-2xl py-16 text-center space-y-3">
            <Terminal className="w-10 h-10 text-gray-600 mx-auto animate-pulse" />
            <p className="text-sm text-gray-500 font-mono">BROADCAST GRID EMPTY. Assemble the first transmission!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {shoutouts.map((shout, idx) => (
                <motion.div
                  key={shout.id}
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.2) }}
                  layout
                  className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-white/10 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 filter blur-xl rounded-full pointer-events-none"></div>
                  
                  {/* Decorative corner tag */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-600 to-cyan-500 group-hover:from-cyan-400 group-hover:to-green-400 transition-all" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10">
                          <span className="text-[10px] font-mono font-bold text-cyan-400">TX</span>
                        </div>
                        <h4 className="font-display font-medium text-white truncate max-w-[160px]">
                          {shout.student_name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">
                        {new Date(shout.created_at).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric'
                        })} • {new Date(shout.created_at).toLocaleTimeString(undefined, {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 font-sans leading-relaxed italic bg-black/40 p-3 rounded-xl border border-white/5">
                      &ldquo;{shout.message}&rdquo;
                    </p>
                  </div>

                  {/* Optional song request card */}
                  {shout.song_request ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-white/10 rounded-xl font-mono text-[10px] text-cyan-400 truncate">
                      <Music className="w-3.5 h-3.5 flex-shrink-0 animate-bounce" />
                      <span>Request: {shout.song_request}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                      <Heart className="w-3.5 h-3.5 text-purple-400" />
                      Standard student frequency
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* SUBMISSION FORM BLOCK (Right/Bottom) */}
      <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
        <div className="p-6 bg-white/2 border border-white/5 bg-dot-matrix rounded-3xl relative overflow-hidden backdrop-blur-md shadow-xl sticky top-24">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 to-transparent pointer-events-none"></div>
          
          <div className="space-y-2 mb-6 relative z-10">
            <h3 className="font-display font-extrabold text-xl text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              STAHIZA Transmitter
            </h3>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              Log into the public stream. Messages are visible to the entire school immediately upon safety evaluation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10 font-sans">
            {/* Student name */}
            <div className="space-y-1.5">
              <label htmlFor="student-name" className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 block">
                Student Handle / Name
              </label>
              <input
                id="student-name"
                type="text"
                maxLength={40}
                placeholder="e.g. DJ Sparky / Tevin Gr"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                required
              />
            </div>

            {/* Shoutout Message */}
            <div className="space-y-1.5">
              <label htmlFor="student-msg" className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 block">
                Transmission Message
              </label>
              <textarea
                id="student-msg"
                rows={3}
                maxLength={250}
                placeholder="Write your event hype, dedications, or friendly shouts..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
                required
              />
              <div className="text-right text-[10px] text-gray-500 font-mono">
                {message.length} / 250 Octets
              </div>
            </div>

            {/* Optional Song Request */}
            <div className="space-y-1.5">
              <label htmlFor="student-song" className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 block flex items-center justify-between">
                <span>Optional Song Request</span>
                <span className="text-[9px] text-cyan-400 font-normal capitalize">Plays at DJ booth</span>
              </label>
              <div className="relative">
                <Music className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                   id="student-song"
                   type="text"
                   maxLength={60}
                   placeholder="e.g. Strobe - Deadmau5"
                   value={songRequest}
                   onChange={(e) => setSongRequest(e.target.value)}
                   className="w-full bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            {/* Error state */}
            {errorText && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{errorText}</p>
              </div>
            )}

            {/* Success state */}
            {statusText && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-2 text-xs text-green-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 animate-bounce" />
                <p>{statusText}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              id="submit-transmission"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Beaming Signal...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Beam Transmission
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
