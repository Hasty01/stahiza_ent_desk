import { useState, FormEvent } from "react";
import { Lock, Mail, ShieldAlert, Sparkles, Terminal } from "lucide-react";
import { motion } from "motion/react";

interface AdminLoginViewProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function AdminLoginView({ onLoginSuccess }: AdminLoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (!email.trim() || !password) {
      setErrorText("Credentials incomplete. Please input your official email & passcode phrase.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication denied by committee protocol");
      }

      onLoginSuccess(data.token, data.user);
    } catch (e: any) {
      setErrorText(e?.message || "Connection refused: Server offline or rejected keys");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="admin-login-view" className="flex items-center justify-center min-h-[60vh] font-sans">
      <div className="w-full max-w-md bg-dark-card border border-dark-border bg-dot-matrix p-8 rounded-3xl relative overflow-hidden shadow-2xl space-y-6">
        <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple/5 via-transparent to-neon-cyan/5 pointer-events-none"></div>

        {/* LOGO TITLE */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-neon-purple/10 border border-neon-purple/40 items-center justify-center mb-2">
            <Lock className="w-5 h-5 text-neon-purple animate-pulse" />
          </div>
          <h2 className="font-display font-black text-2xl tracking-tight text-white uppercase">
            STAHIZA Security Node
          </h2>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
            Authorization Protocol Active
          </p>
        </div>

        {/* INFO NOTICE FOR DEMO / ACCESS */}
        <div className="bg-neon-purple/5 p-4 rounded-xl border border-neon-purple/20 space-y-1 text-xs text-gray-300 font-sans relative z-10">
          <p className="font-semibold text-neon-purple-hover flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Sandbox Credentials Preset:
          </p>
          <p className="text-[11px] text-gray-400 font-mono">
            Email: <span className="text-white font-medium">admin@stahiza.edu</span> or <span className="text-white font-medium">hastyjoel1@gmail.com</span> <br />
            Password: <span className="text-white font-medium">admin</span>
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                placeholder="president@stahiza.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="login-pass" className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
              Secret Passcode Gate
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-pass"
                type="password"
                placeholder="••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                required
              />
            </div>
          </div>

          {/* Error Notice */}
          {errorText && (
            <div className="p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-xl flex items-start gap-2 text-xs text-neon-pink">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 animate-bounce" />
              <p className="leading-relaxed">{errorText}</p>
            </div>
          )}

          {/* Submit */}
          <button
            id="login-auth-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-neon-purple hover:bg-neon-purple-hover text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-neon-purple/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Unlocking Security Gate...
              </>
            ) : (
              <>
                <Terminal className="w-4 h-4" />
                Establish Secure Session
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
