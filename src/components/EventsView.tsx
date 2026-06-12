import { useState } from "react";
import { Calendar, Search, MapPin, Clock, ListFilter, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { StahizaEvent } from "../types";

interface EventsViewProps {
  events: StahizaEvent[];
}

export default function EventsView({ events }: EventsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "upcoming" | "past">("all");

  const now = Date.now();

  const filteredEvents = events.filter((e) => {
    // 1. Filter by search query
    const matchesSearch = 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Filter by status (upcoming or past)
    const eventTime = new Date(e.date).getTime();
    if (filterType === "upcoming") {
      return eventTime > now;
    } else if (filterType === "past") {
      return eventTime <= now;
    }

    return true;
  });

  // Sort: upcoming events first, closest to now first. Past events at the end.
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();
    
    const aIsUpcoming = aTime > now;
    const bIsUpcoming = bTime > now;

    if (aIsUpcoming && !bIsUpcoming) return -1;
    if (!aIsUpcoming && bIsUpcoming) return 1;

    // If both are upcoming, sort ascending (closest first)
    if (aIsUpcoming && bIsUpcoming) return aTime - bTime;
    
    // If both are past, sort descending (most recent past first)
    return bTime - aTime;
  });

  return (
    <div id="events-view" className="space-y-8 font-sans">
      {/* HEADER BAR */}
      <div className="space-y-2">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight flex items-center gap-2">
          STAHIZA Event Horizon
        </h2>
        <p className="text-sm text-gray-400">Review upcoming parties, head-to-head soundclashes, and student talent showcases</p>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="bg-white/2 backdrop-blur-md p-4 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="relative md:col-span-6">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search party vibes or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        </div>

        {/* Tab filters */}
        <div className="flex bg-black/30 p-1 rounded-xl border border-white/5 md:col-span-6 justify-self-stretch md:justify-self-end">
          {[
            { id: "all", label: "All Vibe Dates" },
            { id: "upcoming", label: "Upcoming Only" },
            { id: "past", label: "Historic Events" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-4 py-2 text-xs font-mono rounded-lg transition-all ${
                filterType === tab.id
                  ? "bg-cyan-500 text-black font-bold shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS DECK */}
      {sortedEvents.length === 0 ? (
        <div className="bg-white/2 border border-white/5 rounded-2xl py-16 px-4 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-gray-500 mx-auto animate-pulse" />
          <p className="text-sm text-gray-400 font-mono">No matching event frequencies detected.</p>
          <button 
            onClick={() => { setSearchQuery(""); setFilterType("all"); }}
            className="px-3.5 py-1.5 bg-black/40 hover:bg-white/5 border border-white/5 text-xs font-mono text-gray-300 rounded-lg transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((evt, idx) => {
            const isUpcoming = new Date(evt.date).getTime() > now;
            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 flex flex-col group relative"
              >
                {/* Status indicator tag */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  {isUpcoming ? (
                    <span className="bg-green-500/90 backdrop-blur-xs text-black font-semibold text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md">
                      Status: Upcoming
                    </span>
                  ) : (
                    <span className="bg-white/10 backdrop-blur-xs text-gray-400 text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md">
                      Status: Concluded
                    </span>
                  )}
                </div>

                {/* Banner Image */}
                <div className="aspect-video relative overflow-hidden bg-black/40">
                  <img
                    src={evt.image_url}
                    alt={evt.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                </div>

                {/* Content info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-purple-400 font-mono font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        {new Date(evt.date).toLocaleDateString(undefined, { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                      <span className="flex items-center gap-1 text-gray-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(evt.date).toLocaleTimeString(undefined, {
                          hour: 'numeric', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <h3 className="font-display font-extrabold text-lg sm:text-xl text-white group-hover:text-cyan-400 transition-colors tracking-tight">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-gray-400 leading-relaxed font-sans line-clamp-4">
                      {evt.description}
                    </p>
                  </div>

                  {/* Vibe coordinates footer */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      Main Campus Field
                    </span>
                    <span className="text-gray-600">ID: {evt.id.split("-")[1] || evt.id}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
