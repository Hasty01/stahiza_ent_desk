import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserCheck, UserX, ShieldAlert, Terminal, RefreshCw, 
  Search, Shield, Info, Database, Layers, Sparkles 
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface CommitteeProfile {
  id: string;
  full_name: string;
  username: string;
  role: string;
  email: string;
  approved: boolean;
}

interface ApprovalQueueProps {
  onRefreshParent?: () => void;
  adminUserId?: string;
}

export default function ApprovalQueue({ onRefreshParent, adminUserId }: ApprovalQueueProps) {
  const [pendingProfiles, setPendingProfiles] = useState<CommitteeProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    setError("");
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: supaError } = await supabase
          .from("committee_profiles")
          .select("*")
          .eq("approved", false)
          .order("full_name", { ascending: true });

        if (supaError) throw supaError;
        setPendingProfiles((data as CommitteeProfile[]) || []);
      } else {
        const token = localStorage.getItem("stahiza_auth_token");
        const response = await fetch("/api/profiles", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Endpoint authentication error.");
        }
        const filtered = (data as CommitteeProfile[]).filter((p) => p.approved === false || String(p.approved) === "false" || !p.approved);
        setPendingProfiles(filtered);
      }
    } catch (err: any) {
      setError(err.message || "Failed to establish buffer stream to register database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (profile: CommitteeProfile) => {
    if (actionInProgressId) return;
    setActionInProgressId(profile.id);
    setError("");
    setSuccess("");
    try {
      if (isSupabaseConfigured && supabase) {
        // Clean any "Pending Admin Approval" placeholder subtext inside official roles
        const cleanRole = profile.role.replace(" (Pending Admin Approval)", "").trim();
        
        const { error: supaErr } = await supabase
          .from("committee_profiles")
          .update({ 
            approved: true,
            role: cleanRole 
          })
          .eq("id", profile.id);

        if (supaErr) throw supaErr;
        setSuccess(`Clearance Level Approved: Welcome ${profile.full_name} to the control team.`);
      } else {
        const token = localStorage.getItem("stahiza_auth_token");
        const response = await fetch(`/api/profiles/${profile.id}/approve`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Server node failure during validation clearance.");
        }
        setSuccess(data.message || `Clearance Level Approved: Welcome ${profile.full_name}.`);
      }

      // Refresh list
      await fetchPending();
      if (onRefreshParent) {
        onRefreshParent();
      }
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message || "Approval execution exception.");
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleReject = async (profile: CommitteeProfile) => {
    if (actionInProgressId) return;
    if (!confirm(`Erase clearance request and purging credentials of "${profile.full_name}" (@${profile.username})?`)) {
      return;
    }

    setActionInProgressId(profile.id);
    setError("");
    setSuccess("");
    try {
      if (isSupabaseConfigured && supabase) {
        const { error: supaErr } = await supabase
          .from("committee_profiles")
          .delete()
          .eq("id", profile.id);

        if (supaErr) throw supaErr;
        setSuccess(`Profile clearance request for ${profile.full_name} has been purged.`);
      } else {
        const token = localStorage.getItem("stahiza_auth_token");
        const response = await fetch(`/api/profiles/${profile.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Server node failure during purge execution.");
        }
        setSuccess(data.message || "Profile clearance request successfully purged from database.");
      }

      await fetchPending();
      if (onRefreshParent) {
        onRefreshParent();
      }
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message || "Rejection execution exception.");
    } finally {
      setActionInProgressId(null);
    }
  };

  // Filter queue by search
  const filtered = pendingProfiles.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q)
    );
  });

  return (
    <div id="supabase-approval-queue" className="bg-dark-card border border-dark-border/8xl rounded-3xl p-6 space-y-6 relative overflow-hidden">
      
      {/* Decorative background grid and matrix sparks */}
      <div className="absolute inset-0 bg-dot-matrix opacity-10 pointer-events-none" />
      
      {/* Header section with Supabase vs local status banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 bg-neon-purple/10 border border-neon-purple/20 text-[10px] font-mono text-neon-purple-hover font-black uppercase rounded-lg tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse text-neon-purple" />
              Secured Queue
            </span>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
              <Database className="w-3 h-3" />
              <span>{isSupabaseConfigured ? "Supabase Live" : "Fallback Rest API"}</span>
            </div>
          </div>
          <h3 className="font-display font-extrabold text-xl text-white mt-1.5 flex items-center gap-2">
            Clearance Approval Queue
            <span className="bg-neon-purple/20 border border-neon-purple text-neon-purple-hover font-mono px-2 py-0.5 rounded-lg text-xs font-bold leading-none animate-pulse">
              {pendingProfiles.length} Pending
            </span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Grant dashboard authorization or purge pending gate requests from committee applicants.
          </p>
        </div>

        <button
          onClick={fetchPending}
          disabled={loading}
          className="self-end px-4 py-2 bg-dark-bg/60 border border-dark-border hover:border-neon-purple/40 text-gray-400 hover:text-white transition-all text-xs font-mono rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-neon-purple" : ""}`} />
          Registry Buffer Sync
        </button>
      </div>

      {/* Success/Error displays */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-neon-green/10 border border-neon-green/30 rounded-xl text-xs text-neon-green font-mono flex items-center gap-2.5 relative z-10"
          >
            <UserCheck className="w-4 h-4 flex-shrink-0 animate-bounce" />
            <span>{success}</span>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-xl text-xs text-neon-pink font-mono flex items-center gap-2.5 relative z-10"
          >
            <ShieldAlert className="w-4 h-4 flex-shrink-0 animate-pulse text-neon-pink" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH AND CONTROL ROW */}
      <div className="flex flex-col sm:flex-row gap-3 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Filter gatekeepers by name, email, role, or handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border focus:border-neon-purple rounded-xl text-xs text-white placeholder-gray-500 transition-all font-mono outline-hidden"
          />
        </div>
      </div>

      {loading && pendingProfiles.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 relative z-10">
          <div className="w-10 h-10 border-2 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-gray-500 animate-pulse">Syncing clearance directories with cloud registry...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-14 text-center border border-dashed border-dark-border/40 bg-dark-bg/10 rounded-2xl relative z-10 flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center text-gray-500 mb-3">
            <Shield className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-xs text-gray-400 font-mono">
            {pendingProfiles.length === 0 
              ? "All directories established. No pending applicants are currently waiting in the gate queue." 
              : "No applicants matches filtering search logic."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <AnimatePresence mode="popLayout">
            {filtered.map((profile) => (
              <motion.div
                key={profile.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-dark-bg/30 border border-neon-purple/10 hover:border-neon-purple/35 rounded-2xl p-5 flex flex-col justify-between space-y-4 group transition-all duration-300 relative overflow-hidden"
              >
                {/* Visual glow indicator corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-neon-purple/5 rounded-full blur-2xl pointer-events-none group-hover:bg-neon-purple/10 transition-all" />
                
                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-display font-extrabold text-white text-base">
                        {profile.full_name}
                      </h4>
                      <p className="text-xs font-mono text-neon-purple font-semibold mt-0.5">
                        @{profile.username}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-neon-purple/10 border border-neon-purple/20 text-[9px] font-mono text-neon-purple uppercase rounded-md tracking-wider flex items-center gap-1 shrink-0">
                      <Terminal className="w-2.5 h-2.5" />
                      Applicant
                    </span>
                  </div>

                  <div className="space-y-1.5 font-mono text-[10px] text-gray-400 bg-black/40 p-3 rounded-xl border border-dark-border/40">
                    <div className="flex items-center gap-1 text-[11px] text-gray-300">
                      <Info className="w-3 h-3 text-neon-cyan" />
                      <span>GATE PROTOCOL DETAILS</span>
                    </div>
                    <div className="pt-1.5 border-t border-dark-border/30 space-y-1">
                      <div><strong className="text-gray-500">EMAIL:</strong> {profile.email}</div>
                      <div><strong className="text-gray-500">REQUESTED ROLE:</strong> <span className="text-neon-cyan">{profile.role}</span></div>
                      <div><strong className="text-gray-500">CLIENT ID:</strong> <span className="text-gray-500">{profile.id}</span></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 relative z-10">
                  <button
                    onClick={() => handleApprove(profile)}
                    disabled={actionInProgressId !== null}
                    className="flex-1 py-2.5 bg-neon-green/10 hover:bg-neon-green/90 text-neon-green hover:text-dark-card border border-neon-green/20 hover:border-transparent rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    {actionInProgressId === profile.id ? "Activating..." : "Grant Clearance"}
                  </button>
                  <button
                    onClick={() => handleReject(profile)}
                    disabled={actionInProgressId !== null}
                    className="py-2.5 px-4 bg-neon-pink/10 hover:bg-neon-pink text-neon-pink hover:text-white border border-neon-pink/20 hover:border-transparent rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                    title="Reject Clearance Gateway"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
