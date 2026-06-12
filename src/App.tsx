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

export default function App() {
  const [currentView, setCurrentView] = useState<string>("home");
  
  // Data States
  const [events, setEvents] = useState<StahizaEvent[]>([]);
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [adminUser, setAdminUser] = useState<any | null>(null);

  // Layout Loading State
  const [loading, setLoading] = useState<boolean>(true);

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
        // Fetch all components concurrently
        const [eventsRes, shoutsRes, galRes] = await Promise.all([
          fetch("/api/events").then(r => r.json()),
          fetch("/api/shoutouts").then(r => r.json()),
          fetch("/api/gallery").then(r => r.json())
        ]);

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
    try {
      const res = await fetch("/api/shoutouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_name: studentName, message, song_request: songRequest }),
      });

      if (!res.ok) {
        throw new Error();
      }

      const newShoutout = await res.json();
      // Add immediately to local state so the board updates nicely
      setShoutouts((prevshout) => [newShoutout, ...prevshout]);
      addToast("Signal broadcasted successfully!", "success");
      return true;
    } catch (err) {
      addToast("Network drop. Failed to deliver transmission.", "error");
      return false;
    }
  };

  // 4. Admin Database Operations: CREATE Event
  const handleCreateEvent = async (title: string, date: string, description: string, imageUrl: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("stahiza_auth_token");
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, date, description, image_url: imageUrl }),
      });

      if (!res.ok) {
        throw new Error();
      }

      const newEvent = await res.json();
      setEvents((prev) => [newEvent, ...prev]);
      
      // Concurrently add this image to the Gallery is standard fun UX for Stahiza
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
            const newImg = await galRes.json();
            setGallery((prev) => [newImg, ...prev]);
          }
        } catch (e) {
          console.error("Gallery sync ignored", e);
        }
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
    try {
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
      addToast("Central event parameters altered of record.", "success");
      return true;
    } catch (err) {
      addToast("Failed to write coordinates. Auth revoked?", "error");
      return false;
    }
  };

  // 6. Admin Database Operations: DELETE Event
  const handleDeleteEvent = async (id: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("stahiza_auth_token");
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error();
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
    try {
      const token = localStorage.getItem("stahiza_auth_token");
      const res = await fetch(`/api/shoutouts/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error();
      }

      setShoutouts((prev) => prev.filter((s) => s.id !== id));
      addToast("Transmission purged by moderator directive.", "success");
      return true;
    } catch (err) {
      addToast("Moderator sequence failed. Auth token error.", "error");
      return false;
    }
  };

  return (
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
                    adminUser={adminUser}
                    onLogout={handleLogout}
                    onCreateEvent={handleCreateEvent}
                    onEditEvent={handleEditEvent}
                    onDeleteEvent={handleDeleteEvent}
                    onDeleteShoutout={handleDeleteShoutout}
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
  );
}
