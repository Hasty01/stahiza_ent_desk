import { useState, useRef, ChangeEvent, DragEvent, FormEvent, useEffect } from "react";
import { 
  ShieldAlert, Calendar, Plus, Edit3, Trash2, LogOut, 
  Upload, Sparkles, Terminal, FileImage, ClipboardList, 
  Check, X, Megaphone, MapPin, Music, HelpCircle, Users, UserCheck 
} from "lucide-react";
import { StahizaEvent, Shoutout } from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import ApprovalQueue from "./ApprovalQueue";

interface AdminDashboardProps {
  events: StahizaEvent[];
  shoutouts: Shoutout[];
  adminUser: any;
  onLogout: () => void;
  onCreateEvent: (title: string, date: string, description: string, imageUrl: string) => Promise<boolean>;
  onEditEvent: (id: string, title: string, date: string, description: string, imageUrl: string) => Promise<boolean>;
  onDeleteEvent: (id: string) => Promise<boolean>;
  onDeleteShoutout: (id: string) => Promise<boolean>;
}

export default function AdminDashboardView({
  events,
  shoutouts,
  adminUser,
  onLogout,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onDeleteShoutout
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"events" | "shoutouts" | "approvals">("events");

  // Profile approvals states
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState("");

  const fetchProfiles = async () => {
    setProfilesLoading(true);
    setProfilesError("");
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("committee_profiles")
          .select("*")
          .order("full_name", { ascending: true });

        if (error) throw error;
        setProfiles(data || []);
      } else {
        const token = localStorage.getItem("stahiza_auth_token");
        if (!token) throw new Error("No admin session token stored in active terminal.");

        const response = await fetch("/api/profiles", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Registry terminal rejected transmission query.");
        }
        setProfiles(data);
      }
    } catch (err: any) {
      setProfilesError(err.message || "Failed to inspect database profiles.");
    } finally {
      setProfilesLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (activeTab === "approvals") {
      fetchProfiles();
    }
  }, [activeTab]);

  const handleApproveProfile = async (id: string, name: string) => {
    setFormError("");
    setFormSuccess("");
    try {
      if (isSupabaseConfigured && supabase) {
        // Fetch current role first to clean "Pending Admin Approval" text if any
        const { data: profileRecord, error: fetchErr } = await supabase
          .from("committee_profiles")
          .select("role")
          .eq("id", id)
          .single();

        let updatedRole = undefined;
        if (!fetchErr && profileRecord?.role) {
          updatedRole = profileRecord.role.replace(" (Pending Admin Approval)", "").trim();
        }

        const { error } = await supabase
          .from("committee_profiles")
          .update({ 
            approved: true,
            ...(updatedRole ? { role: updatedRole } : {})
          })
          .eq("id", id);

        if (error) throw error;
        setFormSuccess(`Clearance level verified and approved for ${name}.`);
        setTimeout(() => setFormSuccess(""), 4500);
        fetchProfiles();
      } else {
        const token = localStorage.getItem("stahiza_auth_token");
        if (!token) throw new Error("No active operator session token found.");

        const response = await fetch(`/api/profiles/${id}/approve`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Profile validation node rejected request.");
        }
        setFormSuccess(data.message || `Clearance level verified and approved for ${name}.`);
        setTimeout(() => setFormSuccess(""), 4500);
        fetchProfiles();
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to verify profile registration.");
      setTimeout(() => setFormError(""), 5000);
    }
  };

  const handleRejectProfile = async (id: string, name: string) => {
    setFormError("");
    setFormSuccess("");
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("committee_profiles")
          .delete()
          .eq("id", id);

        if (error) throw error;
        setFormSuccess(`Clearance request from ${name} successfully deleted.`);
        setTimeout(() => setFormSuccess(""), 4500);
        fetchProfiles();
      } else {
        const token = localStorage.getItem("stahiza_auth_token");
        if (!token) throw new Error("No active operator session token found.");

        const response = await fetch(`/api/profiles/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Profile deletion node rejected request.");
        }
        setFormSuccess(data.message || `Clearance request from ${name} successfully deleted.`);
        setTimeout(() => setFormSuccess(""), 4500);
        fetchProfiles();
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to purge profile request.");
      setTimeout(() => setFormError(""), 5000);
    }
  };

  // Event form states
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventImgUrl, setEventImgUrl] = useState("");

  // Upload state
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // General log states
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Unified helper to handle file upload with automatic local sandbox fallback on Supabase error
  const uploadFile = async (file: File) => {
    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFormError("File exceeds 5MB container threshold limit!");
      return;
    }

    setUploadLoading(true);

    const uploadLocally = async () => {
      setUploadProgress("Converting asset to data matrix...");
      const reader = new FileReader();

      return new Promise<void>((resolve, reject) => {
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64Data = reader.result as string;
          setUploadProgress("Beaming file to server buckets...");

          try {
            const token = localStorage.getItem("stahiza_auth_token");
            const response = await fetch("/api/upload", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                base64Data,
                filename: file.name
              })
            });

            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || "Uploader node denied transmission");
            }

            setEventImgUrl(data.url);
            setFormSuccess("Media asset secured! Ready in pool preview.");
            setTimeout(() => setFormSuccess(""), 4000);
            resolve();
          } catch (err: any) {
            setFormError(err.message || "Failed to commit upload sequence");
            setTimeout(() => setFormError(""), 5000);
            reject(err);
          }
        };
        reader.onerror = () => {
          setFormError("FileReader malfunctioned on selected filesystem item");
          reject(new Error("FileReader error"));
        };
      });
    };

    if (isSupabaseConfigured && supabase) {
      setUploadProgress("Beaming file to Supabase storage bucket...");
      try {
        const fileName = `${Date.now()}-${file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("event-images")
          .getPublicUrl(fileName);

        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error("Unable to resolve public URL for resource.");
        }

        setEventImgUrl(publicUrlData.publicUrl);
        setFormSuccess("Media asset secured in Supabase 'event-images' storage!");
        setTimeout(() => setFormSuccess(""), 4000);
      } catch (err: any) {
        console.warn("Supabase upload failed, falling back to local server storage:", err);
        setUploadProgress("Supabase storage restriction. Re-routing locally...");
        try {
          await uploadLocally();
        } catch (localErr: any) {
          setFormError(`Supabase write failed: ${err.message || err}. Sandbox fallback also failed: ${localErr.message || localErr}`);
          setTimeout(() => setFormError(""), 6000);
        }
      } finally {
        setUploadLoading(false);
        setUploadProgress("");
      }
    } else {
      try {
        await uploadLocally();
      } catch (err) {
        // Handled in uploadLocally
      } finally {
        setUploadLoading(false);
        setUploadProgress("");
      }
    }
  };

  // Handle image files selection and convert to Base64/Supabase Storage to upload
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
      await uploadFile(file);
    }
  };

  // Submit form for Create / Edit
  const handleEventFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!eventTitle.trim()) {
      setFormError("Event Title missing in protocol payload");
      return;
    }
    if (!eventDate) {
      setFormError("Target Date must be set");
      return;
    }
    if (!eventDesc.trim()) {
      setFormError("Event description is essential parameter");
      return;
    }

    setSubmitting(true);
    try {
      if (editingEventId) {
        // Edit sequence
        const success = await onEditEvent(editingEventId, eventTitle.trim(), eventDate, eventDesc.trim(), eventImgUrl);
        if (success) {
          setFormSuccess("Event database entry altered successfully.");
          resetEventForm();
        } else {
          setFormError("Server rejected edit command credentials");
        }
      } else {
        // Create sequence
        const success = await onCreateEvent(eventTitle.trim(), eventDate, eventDesc.trim(), eventImgUrl);
        if (success) {
          setFormSuccess("New gathering successfully logged in central database.");
          resetEventForm();
        } else {
          setFormError("Vibe assembly command rejected by storage module");
        }
      }
      setTimeout(() => setFormSuccess(""), 4000);
    } catch (err: any) {
      setFormError(err.message || "Central network error during transaction submission");
    } finally {
      setSubmitting(false);
    }
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEventTitle("");
    setEventDate("");
    setEventDesc("");
    setEventImgUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startEditEvent = (evt: StahizaEvent) => {
    // Standard format for datetime-local input: YYYY-MM-DDTHH:mm
    const dateObj = new Date(evt.date);
    const timezoneOffset = dateObj.getTimezoneOffset() * 60000; // in MS
    const localISOTime = new Date(dateObj.getTime() - timezoneOffset).toISOString().slice(0, 16);

    setEditingEventId(evt.id);
    setEventTitle(evt.title);
    setEventDate(localISOTime);
    setEventDesc(evt.description);
    setEventImgUrl(evt.image_url);
    
    // Smooth scroll to form
    const formElem = document.getElementById("event-form-stage");
    formElem?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="admin-dashboard-view" className="space-y-8 font-sans">
      
      {/* COMS HEADER */}
      <section className="bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden bg-dot-matrix">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-transparent pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-neon-green/10 border border-neon-green/30 text-[10px] font-mono text-neon-green uppercase rounded-md">
              Secure Terminal Online
            </span>
          </div>
          <h2 className="font-display font-black text-3xl text-white tracking-tight flex items-center gap-2">
            STAHIZA CONTROL DESK
          </h2>
          <p className="text-xs text-gray-400">
            Current operator: <span className="text-white font-semibold font-mono">{adminUser.full_name}</span> &bull; Role: <span className="text-neon-purple">{adminUser.role}</span>
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 border border-neon-pink/30 hover:border-neon-pink bg-dark-bg text-neon-pink hover:bg-neon-pink/10 transition-all text-xs font-mono font-bold rounded-xl flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          Terminate Session
        </button>
      </section>

      {/* SUMMARY STATS MATRIX WIDGET */}
      <section id="terminal-stats-widget" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TOTAL GATHERINGS CARD */}
        <div 
          onClick={() => setActiveTab("events")}
          className="group relative bg-dark-card border border-dark-border/70 hover:border-neon-purple/45 rounded-2xl p-5 flex items-center justify-between transition-all duration-300 cursor-pointer overflow-hidden bg-dot-matrix"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 group-hover:text-neon-purple-hover transition-colors">
              Total Gatherings
            </span>
            <div className="text-3xl font-display font-black text-white group-hover:scale-[1.02] origin-left transition-transform">
              {events.length}
            </div>
            <p className="text-[10px] text-gray-400 font-mono">
              Live scheduled activities
            </p>
          </div>
          <div className="p-3 bg-neon-purple/5 group-hover:bg-neon-purple/15 text-neon-purple/90 rounded-xl transition-all duration-300 relative z-10">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* ACTIVE SHOUTOUT STREAM CARD */}
        <div 
          onClick={() => setActiveTab("shoutouts")}
          className="group relative bg-dark-card border border-dark-border/70 hover:border-neon-cyan/45 rounded-2xl p-5 flex items-center justify-between transition-all duration-300 cursor-pointer overflow-hidden bg-dot-matrix"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 group-hover:text-neon-cyan transition-colors">
              Shoutout Stream
            </span>
            <div className="text-3xl font-display font-black text-white group-hover:scale-[1.02] origin-left transition-transform">
              {shoutouts.length}
            </div>
            <p className="text-[10px] text-gray-400 font-mono">
              Unmoderated feed broadcast
            </p>
          </div>
          <div className="p-3 bg-neon-cyan/5 group-hover:bg-neon-cyan/15 text-neon-cyan rounded-xl transition-all duration-300 relative z-10">
            <Megaphone className="w-6 h-6" />
          </div>
        </div>

        {/* PROFILE CLEARANCE DESK CARD */}
        <div 
          onClick={() => setActiveTab("approvals")}
          className="group relative bg-dark-card border border-dark-border/70 hover:border-neon-pink/45 rounded-2xl p-5 flex items-center justify-between transition-all duration-300 cursor-pointer overflow-hidden bg-dot-matrix"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 group-hover:text-neon-pink transition-colors">
              Clearance Gateway
            </span>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-display font-black text-white group-hover:scale-[1.02] origin-left transition-transform">
                {profiles.filter((p) => p.approved === false).length}
              </div>
              {profiles.filter((p) => p.approved === false).length > 0 && (
                <span className="px-1.5 py-0.5 bg-neon-pink/15 border border-neon-pink/35 text-[9px] font-mono font-bold text-neon-pink rounded animate-pulse">
                  ACTION REQ
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-mono">
              Pending crew applicants
            </p>
          </div>
          <div className={`p-3 rounded-xl transition-all duration-300 relative z-10 ${
            profiles.filter((p) => p.approved === false).length > 0
              ? "bg-neon-pink/15 text-neon-pink animate-bounce"
              : "bg-gray-500/5 group-hover:bg-neon-pink/10 text-gray-400 group-hover:text-neon-pink"
          }`}>
            <Users className="w-6 h-6" />
          </div>
        </div>

      </section>

      {/* DASH NAVIGATION TABS */}
      <div className="flex flex-wrap bg-dark-card p-1.5 rounded-2xl border border-dark-border self-start gap-1 sm:gap-0 max-w-2xl">
        <button
          onClick={() => setActiveTab("events")}
          className={`flex-1 py-2.5 px-5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all min-w-[140px] ${
            activeTab === "events"
              ? "bg-neon-purple text-white shadow-md shadow-neon-purple/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Events Manager ({events.length})
        </button>
        <button
          onClick={() => setActiveTab("shoutouts")}
          className={`flex-1 py-2.5 px-5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all min-w-[140px] ${
            activeTab === "shoutouts"
              ? "bg-neon-purple text-white shadow-md shadow-neon-purple/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Shoutout Stream ({shoutouts.length})
        </button>
        <button
          id="approvals-tab-btn"
          onClick={() => setActiveTab("approvals")}
          className={`flex-1 py-2.5 px-5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all min-w-[140px] ${
            activeTab === "approvals"
              ? "bg-neon-purple text-white shadow-md shadow-neon-purple/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Desk Approvals ({profiles.filter((p) => p.approved === false).length})
        </button>
      </div>

      {/* RENDER ACTIVE TAP MODULES */}
      {activeTab === "events" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CREATE/EDIT FORM STAGE (Left-Large) */}
          <div id="event-form-stage" className="lg:col-span-4 bg-dark-card border border-dark-border rounded-3xl p-6 relative space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-lg text-white flex items-center gap-2">
                <Terminal className="w-4.5 h-4.5 text-neon-purple-hover" />
                {editingEventId ? "Modify Event Entry" : "Create Central Event"}
              </h3>
              {editingEventId && (
                <button
                  onClick={resetEventForm}
                  className="p-1 rounded-md bg-dark-bg border border-dark-border text-gray-500 hover:text-white"
                  title="Abandon edit"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleEventFormSubmit} className="space-y-4">
              {/* Event Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block">
                  Event Title / Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. STAHIZA Bass Shock Arena"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                  required
                />
              </div>

              {/* Event Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block">
                  Target Show Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block">
                  vibe deck details / specs
                </label>
                <textarea
                  rows={4}
                  placeholder="Write the dress codes, activities, ticket pricing, and special DJ coordination plans..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all resize-none"
                  required
                />
              </div>

              {/* IMAGE LOOPS (File Uploader with Local storage write + Supabase Storage specs info) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block flex items-center justify-between">
                  <span>Banner Image (Storage Bucket Mock)</span>
                  <span className="text-[9px] text-neon-cyan font-normal uppercase">Automatic</span>
                </label>
                
                {/* Drag zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-dark-border hover:border-neon-purple/40 rounded-xl p-4 text-center cursor-pointer bg-dark-bg/60 space-y-2 transition-all relative overflow-hidden group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-1" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-6 h-6 text-gray-500 group-hover:text-neon-purple-hover animate-pulse transition-colors" />
                    <span className="text-xs text-gray-300 font-medium">Select Image file or Drop</span>
                    <span className="text-[9px] text-gray-500 font-mono text-center">Max 5MB. Writes directly to developer workspace sandbox.</span>
                  </div>

                  {uploadLoading && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-2">
                      <div className="w-5 h-5 border-2 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[11px] font-mono text-neon-purple mt-2 animate-pulse">{uploadProgress}</span>
                    </div>
                  )}
                </div>

                {/* Direct Image URL input if prefer direct link */}
                <div className="space-y-1 pt-1.5">
                  <span className="text-[9px] font-mono text-gray-500">Or assign direct URL manually:</span>
                  <input
                    type="url"
                    placeholder="e.g. https://images.unsplash.com/..."
                    value={eventImgUrl}
                    onChange={(e) => setEventImgUrl(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden"
                  />
                </div>

                {/* Preview Thumbnail */}
                {eventImgUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-dark-border mt-2 group bg-dark-bg">
                    <img
                      src={eventImgUrl}
                      alt="Banner Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEventImgUrl("")}
                      className="absolute top-2 right-2 p-1 bg-black/70 rounded-full border border-white/10 text-neon-pink"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 rounded-md border border-neon-cyan/20 text-[8px] font-mono text-neon-cyan animate-pulse">
                      Status: Ready
                    </div>
                  </div>
                )}
              </div>

              {/* Status errors & successes */}
              {formError && (
                <div className="p-3 bg-neon-pink/10 border border-neon-pink/30 rounded-xl text-xs text-neon-pink font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 animate-bounce" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-neon-green/10 border border-neon-green/30 rounded-xl text-xs text-neon-green font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0 animate-ping" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-2">
                {editingEventId && (
                  <button
                    type="button"
                    onClick={resetEventForm}
                    className="py-2.5 px-4 bg-dark-bg hover:bg-white/5 border border-dark-border text-gray-400 hover:text-white rounded-xl text-xs font-mono font-bold uppercase transition-all"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting || uploadLoading}
                  className="flex-1 py-2.5 bg-neon-purple hover:bg-neon-purple-hover text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-neon-purple/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Processing Transaction..." : (
                    <>
                      {editingEventId ? <Edit3 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      {editingEventId ? "Save Modifications" : "Publish Event Date"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* EVENTS INVENTORY LIST (Right-Large) */}
          <div className="lg:col-span-8 bg-dark-card border border-dark-border rounded-3xl p-6 space-y-6">
            <h3 className="font-display font-extrabold text-lg text-white">
              Events Database Entries ({events.length})
            </h3>

            {events.length === 0 ? (
              <div className="py-12 text-center text-gray-500 font-mono text-xs">
                No active event definitions synced. Publish one to initialize.
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-dark-bg/60 border border-dark-border hover:border-dark-border rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-dark-card border border-dark-border">
                        <img
                          src={evt.image_url}
                          alt={evt.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-extrabold text-sm text-white truncate">{evt.title}</h4>
                        <div className="flex flex-wrap items-center gap-x-2 text-[10px] font-mono text-gray-500 mt-1">
                          <span className="text-neon-purple">{evt.date.split("T")[0]}</span>
                          <span>&bull;</span>
                          <span>Time: {evt.date.split("T")[1]?.slice(0, 5) || "TBD"}</span>
                          <span>&bull;</span>
                          <span className="truncate max-w-[120px]">ID: {evt.id}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5 font-sans line-clamp-1">{evt.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch md:self-center justify-end">
                      <button
                        onClick={() => startEditEvent(evt)}
                        className="p-2 bg-dark-card border border-dark-border hover:border-neon-cyan/40 text-gray-400 hover:text-neon-cyan rounded-lg transition-all"
                        title="Edit entry fields"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Confirm physical deletion of Event: "${evt.title}"?`)) {
                            onDeleteEvent(evt.id);
                          }
                        }}
                        className="p-2 bg-dark-card border border-dark-border hover:border-neon-pink/40 text-gray-400 hover:text-neon-pink rounded-lg transition-all"
                        title="Delete event completely"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : activeTab === "shoutouts" ? (
        /* SHOUTOUTS FEED MODERATION STREAM MODULE */
        <div className="bg-dark-card border border-dark-border rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                Student Shoutouts Moderator Console
              </h3>
              <p className="text-xs text-gray-400 mt-1">Review live student transmissions. Delete details that violate honor codes, contain slurs, or spam.</p>
            </div>
            <div className="px-3 py-1 bg-neon-green/15 border border-neon-green/30 text-neon-green font-mono text-[10px] uppercase rounded-lg animate-pulse">
              Grid Status: Active Transmission Link
            </div>
          </div>

          {shoutouts.length === 0 ? (
            <div className="py-16 text-center text-gray-500 font-mono text-xs">
              No live transmissions caught by grid antenna logs.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shoutouts.map((shout) => (
                <div
                  key={shout.id}
                  className="bg-dark-bg/50 border border-dark-border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between space-y-4 group hover:border-neon-purple/25 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-display font-bold text-white text-sm">{shout.student_name}</h4>
                        <span className="text-[9px] font-mono text-gray-500">{new Date(shout.created_at).toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Moderator Flag: Erase shoutout from "${shout.student_name}"?`)) {
                            onDeleteShoutout(shout.id);
                          }
                        }}
                        className="py-1.5 px-2 bg-neon-pink/10 hover:bg-neon-pink text-neon-pink hover:text-white border border-neon-pink/20 rounded-lg text-[10px] font-mono font-bold uppercase flex items-center gap-1 transition-all"
                        title="Delete / Censor Shoutout"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Moderate / Purge
                      </button>
                    </div>

                    <p className="text-xs text-gray-300 font-sans italic leading-relaxed bg-dark-card p-3 rounded-xl border border-dark-border/40">
                      &ldquo;{shout.message}&rdquo;
                    </p>
                  </div>

                  {shout.song_request && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-cyan/5 border border-neon-cyan/10 rounded-xl font-mono text-[10px] text-neon-cyan truncate">
                      <Music className="w-3.5 h-3.5 animate-bounce" />
                      <span>Request: {shout.song_request}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* DESK APPROVALS MODULE */
        <div id="desk-approvals-console" className="space-y-8">
          
          {/* APPLICANT QUEUE COMPONENT - REDESIGNED MEMBERS PANEL */}
          <ApprovalQueue 
            onRefreshParent={fetchProfiles} 
            adminUserId={adminUser.id} 
          />

        </div>
      )}
    </div>
  );
}
