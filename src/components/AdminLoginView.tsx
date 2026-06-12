import { useState, FormEvent } from "react";
import { Lock, Mail, ShieldAlert, Sparkles, Terminal } from "lucide-react";
import { motion } from "motion/react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface AdminLoginViewProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function AdminLoginView({ onLoginSuccess }: AdminLoginViewProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    if (mode === "signup") {
      if (!email.trim() || !username.trim() || !password || !fullName.trim() || !role.trim()) {
        setErrorText("Registration incomplete. Please fill in all database fields.");
        return;
      }
      if (password.length < 6) {
        setErrorText("Password must be at least 6 characters in length.");
        return;
      }

      setIsSubmitting(true);
      try {
        if (isSupabaseConfigured && supabase) {
          // Sign up user via official Supabase Auth flow
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
          });

          if (authError) throw authError;

          if (!authData?.user) {
            throw new Error("Failed to register credential signal.");
          }

          // Try to insert a pending/unapproved profile record in committee_profiles
          try {
            const { error: profileError } = await supabase
              .from("committee_profiles")
              .insert([
                {
                  id: authData.user.id,
                  full_name: fullName.trim(),
                  username: username.trim().toLowerCase(),
                  role: `${role.trim()} (Pending Admin Approval)`,
                  email: email.trim()
                }
              ]);
            
            if (profileError) {
              console.warn("Could not insert profile automatically:", profileError);
            }
          } catch (profileInsertErr) {
            console.warn("Insert profile catch error:", profileInsertErr);
          }

          setSuccessText("Account request submitted! An Administrator must approve your account by verifying your profile in 'committee_profiles' before you can log in.");
          setEmail("");
          setUsername("");
          setPassword("");
          setFullName("");
          setRole("");
          setTimeout(() => {
            setMode("login");
            setSuccessText("");
          }, 8000);
          
        } else {
          // Connect to real registration backend API endpoint
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email.trim(),
              username: username.trim().toLowerCase(),
              password: password,
              fullName: fullName.trim(),
              role: role.trim()
            })
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Failed to submit registration request to control server.");
          }

          setSuccessText(data.message || "Account request submitted! An Administrator must approve your registration details before you can establish a session.");
          setEmail("");
          setUsername("");
          setPassword("");
          setFullName("");
          setRole("");
          setTimeout(() => {
            setMode("login");
            setSuccessText("");
          }, 8500);
        }
      } catch (err: any) {
        setErrorText(err?.message || "Failed to submit registration request.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // LOGIN MODE
      if (!emailOrUsername.trim() || !password) {
        setErrorText("Credentials incomplete. Please input your official email & passcode phrase.");
        return;
      }

      setIsSubmitting(true);
      try {
        if (isSupabaseConfigured && supabase) {
          let loginEmail = emailOrUsername.trim();

          // If the identifier doesn't contain "@", assume it's a username and look up the email
          if (!loginEmail.includes("@")) {
            const { data: profile, error: lookupError } = await supabase
              .from("committee_profiles")
              .select("email")
              .eq("username", loginEmail.toLowerCase())
              .maybeSingle();

            if (lookupError || !profile?.email) {
              throw new Error(`Clearance rejected: No profile listed for username "${loginEmail}".`);
            }
            loginEmail = profile.email;
          }

          // Authenticate with real Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: password,
          });

          if (authError) {
            throw authError;
          }

          if (!authData?.user) {
            throw new Error("No user session returned from auth.");
          }

          // Real Committee Check (Phase 5)
          const { data: profile, error: profileError } = await supabase
            .from("committee_profiles")
            .select("*")
            .eq("id", authData.user.id)
            .single();

          if (profileError || !profile) {
            // Sign out immediately to clear unprivileged sessions
            await supabase.auth.signOut();
            throw new Error("Clearance rejected: ID not listed or pending approval in Committee Profiles database.");
          }

          onLoginSuccess(authData.session?.access_token || "supabase_session", {
            id: profile.id,
            full_name: profile.full_name || profile.name || authData.user.email,
            role: profile.role || "Committee Member",
            email: profile.email || authData.user.email
          });
        } else {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email: emailOrUsername.trim(), 
              password: password 
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Authentication denied by committee protocol");
          }

          onLoginSuccess(data.token, data.user);
        }
      } catch (e: any) {
        setErrorText(e?.message || "Connection refused: Server offline or rejected keys");
      } finally {
        setIsSubmitting(false);
      }
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
            STAHIZA ENT DESK
          </h2>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
            Authentication
          </p>
        </div>


        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          
          {mode === "signup" && (
            <>
              {/* Full Name */}
              <div className="space-y-1.5 min-w-0">
                <label htmlFor="reg-name" className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="E.g. Nicoletta Ent"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                    required
                  />
                </div>
              </div>

              {/* Proposed Role */}
              <div className="space-y-1.5 min-w-0">
                <label htmlFor="reg-role" className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                  Proposed Desk Role/Purpose
                </label>
                <div className="relative">
                  <input
                    id="reg-role"
                    type="text"
                    placeholder="E.g. Event Coordinator / DJ"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5 min-w-0">
                <label htmlFor="reg-username" className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                  Username (For quick login)
                </label>
                <div className="relative">
                  <input
                    id="reg-username"
                    type="text"
                    placeholder="E.g. nicoletta"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {mode === "login" ? (
            /* Email or Username for Login */
            <div className="space-y-1.5">
              <label htmlFor="login-identity" className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-identity"
                  type="text"
                  placeholder="president or admin@stahiza.edu"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                  required
                />
              </div>
            </div>
          ) : (
            /* Email for Signup */
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="president@stahiza.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                  required
                />
              </div>
            </div>
          )}

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

          {/* Success Notice */}
          {successText && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-2 text-xs text-green-400">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 animate-pulse" />
              <p className="leading-relaxed">{successText}</p>
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
              mode === "signup" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registering Request...
                </>
              ) : (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Unlocking Security Gate...
                </>
              )
            ) : (
              <>
                <Terminal className="w-4 h-4" />
                {mode === "signup" ? "Request Account" : "Login"}
              </>
            )}
          </button>

          {/* Secondary Ghost Button */}
          {mode === "login" ? (
            <button
              id="create-account-btn"
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorText("");
                setSuccessText("");
              }}
              className="w-full py-3 bg-transparent hover:bg-white/5 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Create Account
            </button>
          ) : (
            <button
              id="back-to-login-btn"
              type="button"
              onClick={() => {
                setMode("login");
                setErrorText("");
                setSuccessText("");
              }}
              className="w-full py-3 bg-transparent hover:bg-white/5 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Back to Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
