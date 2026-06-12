import { PartyPopper, Calendar, Image as ImageIcon, Megaphone, ShieldCheck, Sparkles, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  adminUser: any | null;
  onLogout: () => void;
}

export default function Header({ currentView, onNavigate, adminUser, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Sparkles },
    { id: "events", label: "Events", icon: Calendar },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "shoutouts", label: "Shoutouts", icon: Megaphone },
  ];

  return (
    <header id="app-header" className="relative h-20 px-4 sm:px-8 flex items-center justify-between border-b border-white/5 bg-white/2 backdrop-blur-md sticky top-0 z-50">
      {/* Top ambient color-bar gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-cyan-400 to-green-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>

      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        {/* LOGO */}
        <div 
          onClick={() => onNavigate("home")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-transform group-hover:scale-105">
            <span className="font-black text-xl text-white">S</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none text-white">
              STAHIZA <span className="text-cyan-400 font-normal italic">ENT DESK</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Student Entertainment Platform</p>
          </div>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-sm font-medium transition-colors ${
                  isActive 
                    ? "text-cyan-400" 
                    : "text-white/60 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="w-px h-6 bg-white/10 mx-2"></div>
        </nav>

        {/* ADMIN BTN DECK */}
        <div className="hidden md:flex items-center gap-3">
          {adminUser ? (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 pl-3 pr-1.5 py-1 rounded-full">
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-white">{adminUser.full_name}</span>
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider">{adminUser.role.split(" ")[0]}</span>
              </div>
              <button 
                onClick={() => onNavigate("admin-dashboard")}
                className={`p-1.5 rounded-full border text-xs font-mono transition-all ${
                  currentView === "admin-dashboard"
                    ? "bg-cyan-500 text-black border-cyan-500"
                    : "bg-white/5 border-white/10 text-gray-300 hover:text-white"
                }`}
                title="Go to Admin Dashboard"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
              <button 
                onClick={onLogout}
                className="p-1.5 rounded-full bg-white/5 border border-white/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate("admin-login")}
              className={`px-5 py-2 hover:bg-white/10 border border-purple-500/30 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.1)] text-white hover:border-purple-400 transition-all`}
            >
              Admin Login
            </button>
          )}
        </div>

        {/* MOBILE MENU TRIGGER */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-dark-card border border-dark-border text-gray-400 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pt-4 border-t border-dark-border overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? "text-black bg-neon-cyan font-semibold" 
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}

              <div className="h-[1px] bg-dark-border my-2"></div>

              {adminUser ? (
                <div className="flex flex-col gap-2 p-2 bg-dark-card border border-dark-border rounded-xl">
                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">{adminUser.full_name}</span>
                      <span className="text-[10px] font-mono text-neon-cyan">{adminUser.role}</span>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-neon-green" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      onClick={() => {
                        onNavigate("admin-dashboard");
                        setMobileMenuOpen(false);
                      }}
                      className="px-3 py-2 text-center text-xs font-mono bg-neon-purple text-white rounded-lg hover:bg-neon-purple-hover transition-all"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="px-3 py-2 text-center text-xs font-mono bg-dark-bg text-neon-pink border border-neon-pink/30 rounded-lg hover:bg-neon-pink/10 transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onNavigate("admin-login");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-neon-purple/15 hover:bg-neon-purple/25 border border-neon-purple/40 text-xs font-mono rounded-xl text-white transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-neon-purple animate-pulse" />
                  Committee Member Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
