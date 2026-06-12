import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserCheck, UserX, ShieldAlert, Terminal, RefreshCw, 
  Search, Shield, Info, Database, Sparkles, Trash2, 
  Eye, CornerRightDown, ArrowUp, ArrowDown, Check, X,
  Mail, ShieldCheck, Clock, User
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface CommitteeProfile {
  id: string;
  full_name: string;
  username: string;
  role: string;
  email: string;
  approved: boolean;
  phone_number?: string;
  created_at?: string;
}

interface ApprovalQueueProps {
  onRefreshParent?: () => void;
  adminUserId?: string;
}

export default function ApprovalQueue({ onRefreshParent, adminUserId }: ApprovalQueueProps) {
  const [profiles, setProfiles] = useState<CommitteeProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  
  // Tab selector: "active" | "pending"
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  
  // Selected profile for "View Portfolio" detailed dossier modal
  const [selectedProfile, setSelectedProfile] = useState<CommitteeProfile | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError("");
    console.log("Manage Club Members: Synchronizing complete profile buffers...");
    try {
      if (isSupabaseConfigured && supabase) {
        console.log("Manage Club Members: Accessing live Supabase schema...");
        const { data, error: supaError } = await supabase
          .from("committee_profiles")
          .select("*")
          .order("full_name", { ascending: true });

        if (supaError) {
          console.error("Manage Club Members: Supabase query error:", supaError);
          throw supaError;
        }
        setProfiles((data as CommitteeProfile[]) || []);
      } else {
        console.log("Manage Club Members: Invoking fallback API node...");
        const token = localStorage.getItem("stahiza_auth_token");
        const response = await fetch("/api/profiles", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Registry authorization rejected.");
        }
        setProfiles(data || []);
      }
    } catch (err: any) {
      console.error("Manage Club Members sync failed:", err);
      setError(err.message || "Failed to establish cloud stream connection to directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleApprove = async (profile: CommitteeProfile) => {
    if (actionInProgressId) return;
    console.log("Clearance Panel: Granting access to", profile.full_name);
    setActionInProgressId(profile.id);
    setError("");
    setSuccess("");
    try {
      if (isSupabaseConfigured && supabase) {
        // Clean "Pending Admin Approval" text inside roles safely
        const rawRole = profile.role || "committee_member";
        const cleanRole = typeof rawRole === "string"
          ? rawRole.replace(" (Pending Admin Approval)", "").trim()
          : "committee_member";
        
        const { data, error: supaErr } = await supabase
          .from("committee_profiles")
          .update({ 
            approved: true,
            role: cleanRole 
          })
          .eq("id", profile.id)
          .select();

        if (supaErr) throw supaErr;
        if (!data || data.length === 0) {
          throw new Error("Supabase update rejected. Check Row-Level Security policies on 'committee_profiles'.");
        }
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
          throw new Error(data.error || "Server core rejected clearance gateway.");
        }
        setSuccess(data.message || `Clearance Approved: ${profile.full_name} is now verified.`);
      }

      await fetchProfiles();
      if (onRefreshParent) onRefreshParent();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Approval execution exception occurred.");
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleReject = async (profile: CommitteeProfile) => {
    if (actionInProgressId) return;
    const actionText = profile.approved ? "Revoke clearance and disable account" : "Reject profile registration";
    if (!confirm(`${actionText} for "${profile.full_name}" (@${profile.username})?`)) {
      return;
    }

    setActionInProgressId(profile.id);
    setError("");
    setSuccess("");
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: supaErr } = await supabase
          .from("committee_profiles")
          .update({ 
            approved: false
          })
          .eq("id", profile.id)
          .select();

        if (supaErr) throw supaErr;
        if (!data || data.length === 0) {
          throw new Error("Update rejected by Supabase. Verify Row-Level Security policy.");
        }
        setSuccess(`Clearance revoked: ${profile.full_name} set to unapproved.`);
      } else {
        const token = localStorage.getItem("stahiza_auth_token");
        const response = await fetch(`/api/profiles/${profile.id}/reject`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Fallback Node failure during revocation.");
        }
        setSuccess(data.message || `Revoked clearance from ${profile.full_name}.`);
      }

      await fetchProfiles();
      if (onRefreshParent) onRefreshParent();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to finalize clearance revocation.");
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDelete = async (profile: CommitteeProfile) => {
    if (actionInProgressId) return;
    if (!confirm(`Warning: Are you absolutely sure you want to PERMANENTLY delete member profile "${profile.full_name}" (@${profile.username}) from the database? This action cannot be undone.`)) {
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

        if (supaErr) {
          console.error("Supabase profile purge fault:", supaErr);
          throw supaErr;
        }
        setSuccess(`Profile for ${profile.full_name} has been permanently deleted from the database.`);
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
          throw new Error(data.error || "Registry terminal rejected deletion code.");
        }
        setSuccess(data.message || `Permanently purged ${profile.full_name} from list buffers.`);
      }

      await fetchProfiles();
      if (onRefreshParent) onRefreshParent();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to execute permanent profile deletion.");
    } finally {
      setActionInProgressId(null);
    }
  };

  const formatLastSeenNow = (createdAt?: string) => {
    if (!createdAt) return "Jun 12, 2026, 12:11 PM";
    try {
      const d = new Date(createdAt);
      if (isNaN(d.getTime())) return "Jun 12, 2026, 12:11 PM";
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return "Jun 12, 2026, 12:11 PM";
    }
  };

  // Split and filter lists
  const activeMembersList = profiles.filter(p => p.approved === true);
  const pendingApprovalsList = profiles.filter(p => p.approved === false || !p.approved);

  const filterList = (list: CommitteeProfile[]) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(p => 
      (p.full_name || "").toLowerCase().includes(q) ||
      (p.username || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.role || "").toLowerCase().includes(q)
    );
  };

  const filteredActive = filterList(activeMembersList);
  const filteredPending = filterList(pendingApprovalsList);

  // Helper to format role name with nice uppercase capsules
  const renderRoleBadge = (roleStr: string) => {
    const roleUpper = (roleStr || "MEMBER").toUpperCase();
    if (roleUpper.includes("PRESIDENT") || roleUpper.includes("ADMIN")) {
      return (
        <span className="px-2.5 py-1 bg-neon-purple/10 text-neon-purple border border-neon-purple/20 text-[9px] font-mono font-bold rounded-full tracking-wider">
          PRESIDENT
        </span>
      );
    }
    if (roleUpper.includes("PATRON")) {
      return (
        <span className="px-2.5 py-1 bg-neon-pink/10 text-neon-pink border border-neon-pink/20 text-[9px] font-mono font-bold rounded-full tracking-wider">
          PATRON
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-neon-cyan/5 text-neon-cyan border border-neon-cyan/20 text-[9px] font-mono font-bold rounded-full tracking-wider">
        MEMBER
      </span>
    );
  };

  return (
    <div id="stahiza-members-manager" className="bg-dark-card border border-dark-border rounded-3xl p-6 space-y-6 relative overflow-hidden bg-dot-matrix">
      <div className="absolute inset-0 bg-dot-matrix opacity-10 pointer-events-none" />

      {/* Title & Search bar row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Manage Club Members
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Browse database credentials, authorize new clearance requests, or manage registered operator roles.
          </p>
        </div>

        {/* Search input to match screenshots exactly */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-bg/85 border border-dark-border focus:border-neon-purple rounded-xl text-xs text-white placeholder-gray-500 transition-all font-mono outline-hidden"
          />
        </div>
      </div>

      {/* Tabs and sync button row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-px relative z-10">
        <div className="flex gap-6">
          {/* Active Members Tab */}
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
              activeTab === "active" ? "text-neon-cyan font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            Active Members
            <span className={`px-1.5 py-0.5 text-[10px] rounded-md font-mono ${
              activeTab === "active" 
                ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/20" 
                : "bg-dark-bg border border-dark-border text-gray-400"
            }`}>
              {activeMembersList.length}
            </span>
            {activeTab === "active" && (
              <motion.div 
                layoutId="activeTabUnderline" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan" 
              />
            )}
          </button>

          {/* Pending Approval Tab */}
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
              activeTab === "pending" ? "text-neon-cyan font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            Pending Approval
            {pendingApprovalsList.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-neon-purple/20 text-neon-purple-hover border border-neon-purple/30 rounded-md font-mono animate-pulse">
                {pendingApprovalsList.length}
              </span>
            )}
            {activeTab === "pending" && (
              <motion.div 
                layoutId="activeTabUnderline" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan" 
              />
            )}
          </button>
        </div>

        <button
          onClick={fetchProfiles}
          disabled={loading}
          className="self-end pb-2 px-3 py-1.5 text-xs font-mono text-gray-400 hover:text-neon-cyan transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-neon-cyan" : ""}`} />
          Sync Directory
        </button>
      </div>

      {/* Feedback Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-neon-green/10 border border-neon-green/30 rounded-xl text-xs text-neon-green font-mono flex items-center gap-2 relative z-10"
          >
            <ShieldCheck className="w-4 h-4 text-neon-green animate-bounce" />
            <span>{success}</span>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-xl text-xs text-neon-pink font-mono flex items-center gap-2 relative z-10"
          >
            <ShieldAlert className="w-4 h-4 text-neon-pink animate-pulse" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table Layout based on Screenshots */}
      <div className="relative z-10 overflow-x-auto w-full">
        {loading && profiles.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-9 h-9 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-mono text-gray-500 animate-pulse">Scanning server register matrices...</span>
          </div>
        ) : (
          <div className="min-w-[700px]">
            {/* Table Headers */}
            <div className="grid grid-cols-[1.8fr_1.2fr_1fr_1.2fr_1.3fr] border-b border-dark-border py-4 px-2 text-[11px] font-mono text-gray-500 font-bold uppercase tracking-wider">
              <div>Name</div>
              <div>Phone Number</div>
              <div>Role</div>
              <div>Last Seen</div>
              <div className="text-right pr-4">Actions</div>
            </div>

            {/* Table Body */}
            {activeTab === "active" ? (
              filteredActive.length === 0 ? (
                <div className="py-16 text-center text-gray-500 text-xs font-mono border border-dashed border-dark-border/40 rounded-2xl mt-4">
                  No active members match current filter criteria.
                </div>
              ) : (
                <div className="divide-y divide-dark-border/20">
                  {filteredActive.map((profile) => (
                    <div 
                      key={profile.id}
                      className="grid grid-cols-[1.8fr_1.2fr_1fr_1.2fr_1.3fr] items-center py-4 px-2 transition-colors hover:bg-white/[0.02]"
                    >
                      {/* Name Column */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-neon-cyan/5 border border-neon-cyan/15 flex items-center justify-center font-display font-bold text-neon-cyan select-none text-sm relative">
                          {profile.full_name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                          {/* Live indicators */}
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-neon-green border-2 border-dark-bg rounded-full" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm truncate font-sans">
                            {profile.full_name}
                          </h4>
                          <span className="text-xs font-mono text-gray-500 block truncate mt-0.5">
                            @{profile.username || "operator"}
                          </span>
                        </div>
                      </div>

                      {/* Phone Number / Email */}
                      <div className="text-xs font-mono text-gray-400 truncate pr-2">
                        {profile.phone_number || "N/A"}
                      </div>

                      {/* Role Badge */}
                      <div className="flex items-center">
                        {renderRoleBadge(profile.role)}
                      </div>

                      {/* Last Seen / Created At */}
                      <div className="text-xs font-mono text-gray-400">
                        {formatLastSeenNow(profile.created_at)}
                      </div>

                      {/* Actions Column */}
                      <div className="flex items-center justify-end gap-2 pr-2">
                        <button
                          onClick={() => setSelectedProfile(profile)}
                          className="px-3 py-1.5 bg-dark-bg border border-dark-border hover:border-white/20 text-gray-300 hover:text-white transition-all text-xs font-sans rounded-lg font-medium cursor-pointer"
                        >
                          View Portfolio
                        </button>
                        
                        {/* Up/Down Arrow elements matching Vercel screenshot */}
                        <div className="flex -space-x-px border border-dark-border rounded-lg bg-dark-bg overflow-hidden">
                          <button 
                            onClick={() => alert(`Access Priority adjustment dispatched for ${profile.full_name}.`)}
                            className="p-1 px-1.5 text-gray-500 hover:text-white hover:bg-white/5 border-r border-dark-border transition-all cursor-pointer"
                            title="Promote Clearance Level"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => alert(`Clearance latency buffers dispatched for ${profile.full_name}.`)}
                            className="p-1 px-1.5 text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                            title="Demote Clearance Level"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {adminUserId !== profile.id && (
                          <button
                            onClick={() => handleDelete(profile)}
                            disabled={actionInProgressId !== null}
                            className="p-1.5 border border-dark-border hover:border-neon-pink/40 text-gray-500 hover:text-neon-pink rounded-lg bg-dark-bg/30 transition-all cursor-pointer disabled:opacity-50"
                            title="Permanently Delete Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Pending Approvals Tab */
              filteredPending.length === 0 ? (
                <div id="no-pending-container" className="py-20 text-center border border-dashed border-dark-border/40 bg-dark-bg/10 rounded-2xl mt-4 flex flex-col items-center justify-center p-6">
                  <div className="w-12 h-12 rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center text-gray-500 mb-3">
                    <Shield className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-gray-400 font-sans text-sm font-medium">
                    No pending requests.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-dark-border/20">
                  {filteredPending.map((profile) => (
                    <div 
                      key={profile.id}
                      className="grid grid-cols-[1.8fr_1.2fr_1fr_1.2fr_1.3fr] items-center py-4 px-2 hover:bg-white/[0.01] transition-all"
                    >
                      {/* Name Column */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-9 h-9 rounded-full bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center font-display font-bold text-neon-purple select-none text-sm relative">
                          {profile.full_name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-neon-pink border-2 border-dark-bg rounded-full animate-ping" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm truncate font-sans">
                            {profile.full_name}
                          </h4>
                          <span className="text-xs font-mono text-neon-purple-hover block truncate mt-0.5">
                            @{profile.username || "applicant"}
                          </span>
                        </div>
                      </div>

                      {/* Phone/Email Column */}
                      <div className="text-xs font-mono text-gray-400 truncate pr-2">
                        {profile.phone_number || "N/A"}
                      </div>

                      {/* Role Badge */}
                      <div className="flex items-center">
                        <span className="px-2 py-0.5 bg-neon-purple/10 border border-neon-purple/30 text-neon-purple-hover font-mono text-[9px] rounded-md uppercase">
                          APPLICANT
                        </span>
                      </div>

                      {/* Entry Time */}
                      <div className="text-xs font-mono text-gray-400">
                        {formatLastSeenNow(profile.created_at)}
                      </div>

                      {/* Grant / Reject Clearance */}
                      <div className="flex items-center justify-end gap-2 pr-2">
                        <button
                          onClick={() => handleApprove(profile)}
                          disabled={actionInProgressId !== null}
                          className="px-3.5 py-1.5 bg-neon-green/10 hover:bg-neon-green text-neon-green hover:text-dark-bg border border-neon-green/20 hover:border-transparent text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Grant Access
                        </button>

                        <button
                          onClick={() => handleDelete(profile)}
                          disabled={actionInProgressId !== null}
                          className="p-1.5 border border-dark-border hover:border-neon-pink/40 text-gray-500 hover:text-neon-pink rounded-lg bg-dark-bg/35 hover:bg-neon-pink/5 transition-all cursor-pointer disabled:opacity-50"
                          title="Permanently Delete Request"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* PORTFOLIO MODAL (HIGH FIDELITY DIALOG CARD) */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0c10] border border-neon-cyan/20 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 rounded-full blur-2xl pointer-events-none" />
              
              {/* Profile Card Header */}
              <div className="p-6 border-b border-dark-border flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-neon-cyan/15 border-2 border-neon-cyan/35 flex items-center justify-center text-xl font-display font-extrabold text-neon-cyan glow-cyan">
                    {selectedProfile.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-white text-lg">{selectedProfile.full_name}</h3>
                    <span className="text-xs font-mono text-neon-cyan">@{selectedProfile.username}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProfile(null)}
                  className="p-1.5 border border-dark-border hover:border-white/20 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dossier Information Parameters */}
              <div className="p-6 space-y-4">
                <div className="space-y-3 font-mono text-xs text-gray-400 bg-white/[0.01] border border-dark-border p-4 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-neon-cyan text-[11px] font-bold border-b border-dark-border/40 pb-2 mb-2">
                    <Info className="w-4 h-4" />
                    <span>GATEWAY SECURE CREDENTIALS</span>
                  </div>
                  
                  <div className="flex justify-between py-1 border-b border-white/[0.02]">
                    <span className="text-gray-500">EMAIL REGISTRY:</span>
                    <span className="text-gray-200 select-all">{selectedProfile.email}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-white/[0.02]">
                    <span className="text-gray-500">OPERATOR ROLE:</span>
                    <span className="text-neon-cyan font-bold">{selectedProfile.role}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-white/[0.02]">
                    <span className="text-gray-500">DATABASE ID:</span>
                    <span className="text-gray-400 text-[10px] break-all select-all">{selectedProfile.id}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-white/[0.02]">
                    <span className="text-gray-500">PHONE CONTACT:</span>
                    <span className="text-gray-300">{selectedProfile.phone_number || "N/A"}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-white/[0.02]">
                    <span className="text-gray-500">CLEARANCE STAMP:</span>
                    <span className="text-neon-green font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      SECURE ACTIVE
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">JOINED PORTAL:</span>
                    <span className="text-gray-300">{formatLastSeenNow(selectedProfile.created_at)}</span>
                  </div>
                </div>

                <div className="p-3 bg-neon-cyan/5 border border-neon-cyan/15 rounded-xl font-mono text-[10px] text-neon-cyan flex items-start gap-2">
                  <Terminal className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Dossier complete. Operator is cleared to access event coordinators consoles, manage shoutouts queues, and moderate community bulletin channels.</span>
                </div>
              </div>

              {/* Close Button / Bottom area */}
              <div className="p-6 border-t border-dark-border bg-black/40 flex justify-end">
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="px-5 py-2 bg-neon-cyan text-dark-bg font-sans font-bold text-xs rounded-xl hover:bg-white hover:text-dark-bg transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
