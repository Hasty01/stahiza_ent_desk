import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import EventsView from "./components/EventsView";
import GalleryView from "./components/GalleryView";
import ShoutoutsView from "./components/ShoutoutsView";
import AdminLoginView from "./components/AdminLoginView";
import AdminDashboardView from "./components/AdminDashboardView";
import Toast, { ToastMessage } from "./components/Toast";
import { StahizaEvent, Shoutout, GalleryImage } from "./types";
import { Terminal, ShieldCheck, Mail, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import FuturisticDJPreloader from "./components/FuturisticDJPreloader";

export default function App() {
  const [currentView, setCurrentView] = useState<string>("home");
  
  // Data States
  const [events, setEvents] = useState<StahizaEvent[]>([]);
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [adminUser, setAdminUser] = useState<any | null>(null);

  // Layout Loading State
  const [loading, setLoading] = useState<boolean>(true);

  // Preloader active on initial load
  const [preloaderActive, setPreloaderActive] = useState<boolean>(true);

  // Toast System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add a Toast Notification helper
  const addToast = (text: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Fetch loops
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        let eventsRes: StahizaEvent[] = [];
        let shoutsRes: Shoutout[] = [];
        let galRes: GalleryImage[] = [];

        // Fetch Events safely
        try {
          if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true });
            if (error) throw error;
            eventsRes = data || [];
          } else {
            throw new Error("Supabase is not configured yet");
          }
        } catch (err) {
          console.warn("Using local events sandbox database fallback:", err);
          eventsRes = await fetch("/api/events").then(r => r.json()).catch(() => []);
        }

        // Fetch Shoutouts safely
        try {
          if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase.from("shoutouts").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            shoutsRes = data || [];
          } else {
            throw new Error("Supabase is not configured yet");
          }
        } catch (err) {
          console.warn("Using local shoutouts sandbox database fallback:", err);
          shoutsRes = await fetch("/api/shoutouts").then(r => r.json()).catch(() => []);
        }

        // Fetch Gallery safely
        try {
          if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            const rawGal = data || [];
            galRes = rawGal.map((img: any) => ({
              ...img,
              url: img.url || img.image_url
            }));
          } else {
            throw new Error("Supabase is not configured yet");
          }
        } catch (err) {
          console.warn("Using local gallery sandbox database fallback:", err);
          const rawLocalGal = await fetch("/api/gallery").then(r => r.json()).catch(() => []);
          galRes = rawLocalGal.map((img: any) => ({
            ...img,
            url: img.url || img.image_url
          }));
        }

        setEvents(eventsRes);
        setShoutouts(shoutsRes);
        setGallery(galRes);
      } catch (err) {
        console.error("Failed to fetch initial application files: ", err);
        addToast("Error contacting STAHIZA server. Using cached memories.", "error");
      } finally {
        setLoading(false);
      }
    };

    // Session recovery from localStorage
    const savedToken = localStorage.getItem("stahiza_auth_token");
    const savedUser = localStorage.getItem("stahiza_auth_user");
    if (savedToken && savedUser) {
      try {
        setAdminUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("stahiza_auth_token");
        localStorage.removeItem("stahiza_auth_user");
      }
    }

    initializeData();
  }, []);

  // Sync hash state changes with view navigation (enables forward-backward button inside browser)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["home", "events", "gallery", "shoutouts", "admin-login", "admin-dashboard"].includes(hash)) {
        setCurrentView(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    // Trigger on initial mount
    if (window.location.hash) {
      handleHashChange();
    }
    
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateTo = (view: string) => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 1. Auth Success Trigger
  const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem("stahiza_auth_token", token);
    localStorage.setItem("stahiza_auth_user", JSON.stringify(user));
    setAdminUser(user);
    addToast(`Security Clearance Granted. Welcome ${user.full_name}!`, "success");
    navigateTo("admin-dashboard");
  };

  // 2. Clear Session (Logout)
  const handleLogout = () => {
    localStorage.removeItem("stahiza_auth_token");
    localStorage.removeItem("stahiza_auth_user");
    setAdminUser(null);
    addToast("Session closed. Security clearances revoked.", "success");
    navigateTo("home");
  };

  // 3. Public Submit Shoutout function
  const handleAddShoutout = async (studentName: string, message: string, songRequest?: string): Promise<boolean> => {
    const payload = {
      student_name: studentName,
      message,
      song_request: songRequest || "",
      created_at: new Date().toISOString()
    };

    const saveShoutoutLocally = async () => {
      const res = await fetch("/api/shoutouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_name: studentName, message, song_request: songRequest }),
      });

      if (!res.ok) {
        throw new Error();
      }

      const newShoutout = await res.json();
      setShoutouts((prevshout) => [newShoutout, ...prevshout]);
    };

    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("shoutouts")
            .insert([payload])
            .select()
            .single();

          if (error) throw error;
          const newShoutout = data || payload;
          setShoutouts((prevshout) => [newShoutout, ...prevshout]);
        } catch (supaErr) {
          console.warn("Supabase shoutouts insert failed, falling back to local server:", supaErr);
          await saveShoutoutLocally();
        }
      } else {
        await saveShoutoutLocally();
      }

      addToast("Signal broadcasted successfully!", "success");
      return true;
    } catch (err) {
      addToast("Failed to deliver transmission.", "error");
      return false;
    }
  };

  // 4. Admin Database Operations: CREATE Event
  const handleCreateEvent = async (title: string, date: string, description: string, imageUrl: string): Promise<boolean> => {
    const payload = {
      title,
      date,
      description,
      image_url: imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800"
    };

    let newEvent;

    const saveEventLocally = async () => {
      const token = localStorage.getItem("stahiza_auth_token");
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error();
      }

      newEvent = await res.json();
      setEvents((prev) => [newEvent, ...prev]);
      
      // Sync gallery fallback
      if (imageUrl) {
        try {
          const galRes = await fetch("/api/gallery", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ url: imageUrl, caption: `Flyer: ${title}` })
          });
          if (galRes.ok) {
            const newImg = await galRes.ok ? await galRes.json() : null;
            if (newImg) {
              setGallery((prev) => [newImg, ...prev]);
            }
          }
        } catch (e) {
          console.error("Gallery sync ignored", e);
        }
      }
    };

    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("events")
            .insert([payload])
            .select()
            .single();

          if (error) throw error;
          newEvent = data || payload;
          setEvents((prev) => [newEvent, ...prev]);

          // Sync image to gallery if configured
          if (imageUrl) {
            try {
              const { data: galData, error: galErr } = await supabase
                .from("gallery")
                .insert([{ url: imageUrl, caption: `Flyer: ${title}`, created_at: new Date().toISOString() }])
                .select()
                .single();
              if (galErr) throw galErr;
              if (galData) {
                setGallery((prev) => [galData, ...prev]);
              }
            } catch (e) {
              console.warn("Supabase gallery sync failed, falling back to local storage:", e);
              // Fallback gallery sync
              const token = localStorage.getItem("stahiza_auth_token");
              const galRes = await fetch("/api/gallery", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ url: imageUrl, caption: `Flyer: ${title}` })
              });
              if (galRes.ok) {
                const newImg = await galRes.json();
                setGallery((prev) => [newImg, ...prev]);
              }
            }
          }
        } catch (supaErr) {
          console.warn("Supabase event creation failed, falling back to local server:", supaErr);
          await saveEventLocally();
        }
      } else {
        await saveEventLocally();
      }

      addToast("Gathering published & broadcast live!", "success");
      return true;
    } catch (err) {
      addToast("Unauthorized or database denied action.", "error");
      return false;
    }
  };

  // 5. Admin Database Operations: EDIT Event
  const handleEditEvent = async (id: string, title: string, date: string, description: string, imageUrl: string): Promise<boolean> => {
    const editEventLocally = async () => {
      const token = localStorage.getItem("stahiza_auth_token");
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, date, description, image_url: imageUrl }),
      });

      if (!res.ok) {
        throw new Error();
      }

      const updated = await res.json();
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
    };

    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("events")
            .update({ title, date, description, image_url: imageUrl })
            .eq("id", id)
            .select()
            .single();

          if (error) throw error;
          const updated = data || { id, title, date, description, image_url: imageUrl };
          setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
        } catch (supaErr) {
          console.warn("Supabase event update failed, falling back to local server:", supaErr);
          await editEventLocally();
        }
      } else {
        await editEventLocally();
      }

      addToast("Central event parameters altered of record.", "success");
      return true;
    } catch (err) {
      addToast("Failed to write coordinates. Auth revoked?", "error");
      return false;
    }
  };

  // 6. Admin Database Operations: DELETE Event
  const handleDeleteEvent = async (id: string): Promise<boolean> => {
    const deleteEventLocally = async () => {
      const token = localStorage.getItem("stahiza_auth_token");
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error();
      }
    };

    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", id);

          if (error) throw error;
        } catch (supaErr) {
          console.warn("Supabase event delete failed, falling back to local server:", supaErr);
          await deleteEventLocally();
        }
      } else {
        await deleteEventLocally();
      }

      setEvents((prev) => prev.filter((e) => e.id !== id));
      addToast("Target event purged from central calendar.", "success");
      return true;
    } catch (err) {
      addToast("Command denied. Credentials clearance required.", "error");
      return false;
    }
  };

  // 7. Admin Database Operations: DELETE Inappropriate Shoutout
  const handleDeleteShoutout = async (id: string): Promise<boolean> => {
    const deleteShoutoutLocally = async () => {
      const token = localStorage.getItem("stahiza_auth_token");
      const res = await fetch(`/api/shoutouts/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error();
      }
    };

    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase
            .from("shoutouts")
            .delete()
            .eq("id", id);

          if (error) throw error;
        } catch (supaErr) {
          console.warn("Supabase shoutout delete failed, falling back to local server:", supaErr);
          await deleteShoutoutLocally();
        }
      } else {
        await deleteShoutoutLocally();
      }

      setShoutouts((prev) => prev.filter((s) => s.id !== id));
      addToast("Transmission purged by moderator directive.", "success");
      return true;
    } catch (err) {
      addToast("Moderator sequence failed. Auth token error.", "error");
      return false;
    }
  };

  // 8. Admin Database Operations: CREATE Gallery Image
  const handleAddGalleryImage = async (url: string, caption?: string): Promise<boolean> => {
    const defaultCaption = (caption || "").trim() || "Independent Broadcast";
    const timestamp = new Date().toISOString();

    const saveGalleryLocally = async () => {
      const token = localStorage.getItem("stahiza_auth_token");
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          url, 
          caption: defaultCaption, 
          created_at: timestamp 
        })
      });
      if (!res.ok) throw new Error();
      const newImg = await res.json();
      const normalizedImg = {
        ...newImg,
        url: newImg.url || newImg.image_url
      };
      setGallery((prev) => [normalizedImg, ...prev]);
    };

    try {
      if (isSupabaseConfigured && supabase) {
        try {
          let insertSuccess = false;
          let insertionData: any = null;

          // Cascade combination retry attempts to bypass missing database columns or stale schema caches
          
          // Try 1: Ideal model schema ('url' and 'caption')
          try {
            const { data, error } = await supabase
              .from("gallery")
              .insert([{ url, caption: defaultCaption, created_at: timestamp }])
              .select()
              .single();
            if (!error) {
              insertionData = data;
              insertSuccess = true;
            } else {
              throw error;
            }
          } catch (e1) {
            console.warn("Gallery insert attempt 1 (url + caption) failed, trying configuration 2:", e1);
            
            // Try 2: Alternative standard schema ('image_url' and 'caption')
            try {
              const { data, error } = await supabase
                .from("gallery")
                .insert([{ image_url: url, caption: defaultCaption, created_at: timestamp }])
                .select()
                .single();
              if (!error) {
                insertionData = data;
                insertSuccess = true;
              } else {
                throw error;
              }
            } catch (e2) {
              console.warn("Gallery insert attempt 2 (image_url + caption) failed, trying configuration 3:", e2);
              
              // Try 3: Caption-less backup with alternative column ('image_url' only)
              try {
                const { data, error } = await supabase
                  .from("gallery")
                  .insert([{ image_url: url, created_at: timestamp }])
                  .select()
                  .single();
                if (!error) {
                  insertionData = data;
                  insertSuccess = true;
                } else {
                  throw error;
                }
              } catch (e3) {
                console.warn("Gallery insert attempt 3 (image_url only) failed, trying configuration 4:", e3);
                
                // Try 4: Caption-less backup with standard column ('url' only)
                try {
                  const { data, error } = await supabase
                    .from("gallery")
                    .insert([{ url, created_at: timestamp }])
                    .select()
                    .single();
                  if (!error) {
                    insertionData = data;
                    insertSuccess = true;
                  } else {
                    throw error;
                  }
                } catch (e4) {
                  console.error("All dynamic Supabase insert combinations failed:", e4);
                  throw e4;
                }
              }
            }
          }

          if (insertSuccess) {
            const normalized = insertionData || { id: `gal-${Date.now()}`, url, caption: defaultCaption, created_at: timestamp };
            setGallery((prev) => [
              { ...normalized, url: normalized.url || normalized.image_url, caption: normalized.caption || defaultCaption },
              ...prev
            ]);
          } else {
            throw new Error("Unable to establish table insertion with active schema properties.");
          }
        } catch (supaErr: any) {
          console.warn("Supabase gallery insert failed, falling back to local server storage:", supaErr);
          await saveGalleryLocally();
        }
      } else {
        await saveGalleryLocally();
      }
      addToast("High-tech image broadcasted to gallery grid!", "success");
      return true;
    } catch (e: any) {
      console.error("Gallery commit fault:", e);
      addToast(`Failed to upload image. Check auth clearance. ${e?.message || ""}`, "error");
      return false;
    }
  };

  // 9. Admin Database Operations: DELETE Gallery Image
  const handleDeleteGalleryImage = async (id: string): Promise<boolean> => {
    const deleteGalleryLocally = async () => {
      const token = localStorage.getItem("stahiza_auth_token");
      const res = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
    };

    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase
            .from("gallery")
            .delete()
            .eq("id", id);
          if (error) throw error;
        } catch (supaErr) {
          console.warn("Supabase gallery delete failed, falling back to local server:", supaErr);
          await deleteGalleryLocally();
        }
      } else {
        await deleteGalleryLocally();
      }
      setGallery((prev) => prev.filter((img) => img.id !== id));
      addToast("Gallery capture purged from main archives.", "success");
      return true;
    } catch (e) {
      addToast("Failed to delete imagery. Auth credentials issue.", "error");
      return false;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {preloaderActive && (
          <FuturisticDJPreloader onLoaded={() => {
            setPreloaderActive(false);
            navigateTo("home");
          }} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-dark-bg flex flex-col justify-between text-gray-200 selection:bg-neon-purple selection:text-white">
      
      {/* GLOBAL TOAST FLOATER ZONE */}
      <div id="toast-floater-zone" className="fixed top-20 right-4 z-50 flex flex-col gap-2 w-full max-w-xs sm:max-w-md pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast message={toast} onClose={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* BRAND HEADER */}
      <Header 
        currentView={currentView} 
        onNavigate={navigateTo} 
        adminUser={adminUser} 
        onLogout={handleLogout} 
      />

      {/* CORE DISPLAY WINDOW */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 md:py-12 relative">
        
        {loading ? (
          /* SKELETON LOADING LOOPS */
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
            <div className="w-10 h-10 border-4 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono text-gray-500 animate-pulse">SYNCHRONIZING AUDIO-VISUAL ARRAYS...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === "home" && (
                <HomeView 
                  events={events} 
                  shoutouts={shoutouts} 
                  gallery={gallery} 
                  onNavigate={navigateTo} 
                />
              )}

              {currentView === "events" && (
                <EventsView events={events} />
              )}

              {currentView === "gallery" && (
                <GalleryView gallery={gallery} />
              )}

              {currentView === "shoutouts" && (
                <ShoutoutsView 
                  shoutouts={shoutouts} 
                  onAddShoutout={handleAddShoutout} 
                />
              )}

              {currentView === "admin-login" && (
                <AdminLoginView onLoginSuccess={handleLoginSuccess} />
              )}

              {currentView === "admin-dashboard" && (
                adminUser ? (
                  <AdminDashboardView
                    events={events}
                    shoutouts={shoutouts}
                    gallery={gallery}
                    adminUser={adminUser}
                    onLogout={handleLogout}
                    onCreateEvent={handleCreateEvent}
                    onEditEvent={handleEditEvent}
                    onDeleteEvent={handleDeleteEvent}
                    onDeleteShoutout={handleDeleteShoutout}
                    onAddGalleryImage={handleAddGalleryImage}
                    onDeleteGalleryImage={handleDeleteGalleryImage}
                  />
                ) : (
                  /* Redirection node for unauthorized paths */
                  <div className="max-w-md mx-auto p-8 rounded-3xl bg-dark-card border border-neon-pink/20 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-neon-pink mx-auto animate-pulse" />
                    <h3 className="font-display font-bold text-lg text-white uppercase tracking-tight">Security Fault Caught</h3>
                    <p className="text-xs text-gray-400">
                      Unauthenticated route request. Authentication must be verified dynamically at security nodes.
                    </p>
                    <button
                      onClick={() => navigateTo("admin-login")}
                      className="px-4 py-2 bg-dark-bg hover:bg-neon-pink/10 border border-neon-pink/30 text-[10px] font-mono text-neon-pink hover:text-white rounded-xl transition-all"
                    >
                      Authenticate Credentials Now
                    </button>
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* SYSTEM FOOTER */}
      <Footer onNavigate={navigateTo} />
    </div>
    </>
  );
}
