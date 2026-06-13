import { useState, useEffect } from "react";
import { 
  Music, Film, Newspaper, RefreshCw, TrendingUp, 
  MapPin, Globe, Flame, ShieldCheck, Zap, Info, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Song {
  rank: number;
  title: string;
  artist: string;
  genre?: string;
}

interface Movie {
  rank: number;
  title: string;
  genre: string;
  description: string;
}

interface NewsItem {
  title: string;
  source: string;
  summary: string;
  category: string;
}

interface TrendsData {
  billboard_songs: Song[];
  uganda_songs: Song[];
  trending_movies: Movie[];
  uganda_news: NewsItem[];
  world_news: NewsItem[];
  last_updated: string;
}

export default function Trends() {
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const fetchTrends = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg("");
    try {
      const url = forceRefresh ? "/api/trends?refresh=true" : "/api/trends";
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to capture active trends cluster");
      }
      const data = await res.json();
      setTrends(data);
    } catch (err: any) {
      console.error("Trends retrieval failure:", err);
      setErrorMsg("Unable to synchronize with internet data nodes. Exhibiting standard fallbacks.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const handleRefresh = () => {
    fetchTrends(true);
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
    if (rank === 2) return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]";
    if (rank === 3) return "bg-pink-500/10 text-pink-400 border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.2)]";
    return "bg-white/5 text-gray-400 border-white/10";
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-t-2 border-b-2 border-cyan-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-l-2 border-r-2 border-purple-500 rounded-full animate-pulse opacity-50 scale-105"></div>
        </div>
        <div className="text-center space-y-1.5">
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400 animate-pulse">Syncing Intel Grid</h3>
          <p className="text-gray-400 text-xs px-4">Contacting global repositories and Ugandan chart clusters...</p>
        </div>
      </div>
    );
  }

  const lastUpdatedString = trends?.last_updated 
    ? new Date(trends.last_updated).toLocaleString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    : "Static fallback cache";

  const billboardSongs = trends?.billboard_songs || [];
  const ugandaSongs = trends?.uganda_songs || [];
  const trendingMovies = trends?.trending_movies || [];
  const ugandaNews = trends?.uganda_news || [];
  const worldNews = trends?.world_news || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER NODES */}
      <div className="relative rounded-3xl bg-radial from-white/5 to-transparent border border-white/5 p-6 sm:p-8 overflow-hidden">
        {/* Subtle decorative mesh background lines */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-400/20 rounded-md text-[9px] font-mono text-cyan-400 tracking-wider uppercase flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 fill-cyan-400 text-cyan-400 animate-pulse" />
                Live Grounded Context
              </span>
              <span className="text-[10px] font-mono text-white/40">v2.1.2</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white font-display">
              TRENDING <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">ENTERTAINMENT & SPORTS</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl">
              Grounded search results directly mapping global billboard placements, East African afrobeat networks, viral cinema, and live local/global news feeds.
            </p>
          </div>

          {/* Sync Trigger Box */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            <div className="text-left md:text-right space-y-1">
              <span className="text-[10px] font-mono text-gray-500 block uppercase tracking-wider">INDEX STAMP</span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span className="text-xs font-mono text-cyan-400" id="trends-updated-time">
                  {lastUpdatedString}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-cyan-500 text-black hover:bg-cyan-400 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-cyan-400/10 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Syncing..." : "Sync Live Deck"}
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-xs font-mono">
          <Info className="w-4 h-4 shrink-0 text-red-400 animate-bounce" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* FILTER CONTROL SEGMENTS */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
        <div className="flex bg-white/3 border border-white/5 p-1 rounded-2xl gap-1 shrink-0">
          {[
            { id: "all", label: "Intel Overview", icon: TrendingUp },
            { id: "billboard", label: "Billboard Hot 100", icon: Music },
            { id: "uganda", label: "Uganda Hitlist", icon: MapPin },
            { id: "movies", label: "Box Office Movies", icon: Film },
            { id: "news", label: "News Feed (Sports & Ent)", icon: Newspaper }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono tracking-wide transition-all uppercase cursor-pointer whitespace-nowrap ${
                  isSelected 
                    ? "bg-gradient-to-r from-purple-600 via-cyan-400 to-green-400 text-black font-black" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* OVERVIEW MODULE */}
        {activeTab === "all" && (
          <motion.div
            key="all-overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* 1. Global Billboard mini */}
            <div className="bg-dark-card/40 border border-white/5 rounded-3xl p-5 flex flex-col space-y-4 hover:border-cyan-400/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-400/10 rounded-lg text-cyan-400">
                    <Music className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">Billboard Top 5</h3>
                </div>
                <button onClick={() => setActiveTab("billboard")} className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1">
                  View full
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {billboardSongs.slice(0, 5).map((song) => (
                  <div key={`mini-billboard-${song.rank}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 truncate">
                      <span className={`w-6 h-6 rounded-md border text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${getRankBadgeColor(song.rank)}`}>
                        {song.rank}
                      </span>
                      <div className="truncate">
                        <p className="text-white text-xs font-semibold truncate leading-tight">{song.title}</p>
                        <p className="text-[10px] text-gray-500 truncate leading-none mt-1">{song.artist}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Uganda Hitlist mini */}
            <div className="bg-dark-card/40 border border-white/5 rounded-3xl p-5 flex flex-col space-y-4 hover:border-purple-400/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-400/10 rounded-lg text-purple-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">Uganda Top 5</h3>
                </div>
                <button onClick={() => setActiveTab("uganda")} className="text-xs font-mono text-purple-400 hover:underline flex items-center gap-1">
                  View full
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {ugandaSongs.slice(0, 5).map((song) => (
                  <div key={`mini-uganda-${song.rank}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 truncate">
                      <span className={`w-6 h-6 rounded-md border text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${getRankBadgeColor(song.rank)}`}>
                        {song.rank}
                      </span>
                      <div className="truncate w-full">
                        <div className="flex items-center gap-2 justify-between">
                          <p className="text-white text-xs font-semibold truncate leading-tight max-w-[70%]">{song.title}</p>
                          {song.genre && (
                            <span className="bg-white/5 border border-white/10 px-1 py-0.5 rounded text-[8px] font-mono text-cyan-400 scale-90 shrink-0 uppercase tracking-widest">{song.genre}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 truncate leading-none mt-1">{song.artist}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Movies Mini */}
            <div className="bg-dark-card/40 border border-white/5 rounded-3xl p-5 flex flex-col space-y-4 hover:border-pink-400/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-pink-400/10 rounded-lg text-pink-400">
                    <Film className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">Top 5 Movies</h3>
                </div>
                <button onClick={() => setActiveTab("movies")} className="text-xs font-mono text-pink-400 hover:underline flex items-center gap-1">
                  View full
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {trendingMovies.slice(0, 5).map((movie) => (
                  <div key={`mini-movie-${movie.rank}`} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 truncate">
                    <span className={`w-6 h-6 rounded-md border text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${getRankBadgeColor(movie.rank)}`}>
                      {movie.rank}
                    </span>
                    <div className="truncate">
                      <p className="text-white text-xs font-semibold truncate leading-tight">{movie.title}</p>
                      <p className="text-[10px] text-gray-500 truncate mt-1 leading-none">{movie.genre}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Cross Column: News Flash Overview */}
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Local News Mini */}
              <div className="bg-dark-card/30 border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-white text-xs font-mono uppercase tracking-widest text-cyan-400">Uganda Entertainment & Sports Feed</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  {ugandaNews.slice(0, 2).map((news, idx) => (
                    <div key={`mini-ug-news-${idx}`} className="space-y-1">
                      <p className="text-xs font-bold text-white leading-snug hover:text-cyan-400 transition-colors">{news.title}</p>
                      <p className="text-[11px] text-gray-400 line-clamp-2">{news.summary}</p>
                      <div className="flex items-center gap-2 pt-1 text-[9px] font-mono text-gray-500">
                        <span className="text-cyan-400 font-bold uppercase">{news.category}</span>
                        <span>•</span>
                        <span>{news.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* World News Mini */}
              <div className="bg-dark-card/30 border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <h3 className="font-bold text-white text-xs font-mono uppercase tracking-widest text-purple-400">Global Pop & Athletics Feed</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  {worldNews.slice(0, 2).map((news, idx) => (
                    <div key={`mini-wd-news-${idx}`} className="space-y-1">
                      <p className="text-xs font-bold text-white leading-snug hover:text-purple-400 transition-colors">{news.title}</p>
                      <p className="text-[11px] text-gray-400 line-clamp-2">{news.summary}</p>
                      <div className="flex items-center gap-2 pt-1 text-[9px] font-mono text-gray-500">
                        <span className="text-purple-400 font-bold uppercase">{news.category}</span>
                        <span>•</span>
                        <span>{news.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* BILLBOARD TAB VIEW */}
        {activeTab === "billboard" && (
          <motion.div
            key="billboard-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-400" />
                Billboard Hot 100 placements
              </h3>
              <p className="text-xs text-gray-400 pb-2">The premier benchmark of music recordings globally. Displaying current Top 10.</p>
              
              <div className="space-y-2">
                {billboardSongs.map((song) => (
                  <div
                    key={`b-full-${song.rank}`}
                    className="flex items-center justify-between p-4 bg-dark-card/30 border border-white/5 rounded-2xl group hover:border-cyan-400/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`w-9 h-9 rounded-xl border text-sm font-mono font-bold flex items-center justify-center shrink-0 ${getRankBadgeColor(song.rank)}`}>
                        {song.rank}
                      </span>
                      <div className="truncate">
                        <p className="text-white text-sm font-bold group-hover:text-cyan-400 transition-colors max-w-[280px] sm:max-w-md truncate">{song.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{song.artist}</p>
                      </div>
                    </div>
                    {song.rank <= 3 && (
                      <span className="text-[10px] font-mono text-amber-400/70 py-0.5 px-2 bg-amber-400/5 rounded-lg border border-amber-400/10 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />
                        HOT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Billboard Insights Sidebar */}
            <div className="bg-gradient-to-br from-white/3 to-transparent border border-white/5 rounded-3xl p-6 h-fit space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 font-bold">
                <Zap className="w-3.5 h-3.5" />
                CHART INSIGHTS
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                The global music spectrum is heavily influenced by alternative pop hooks and progressive rap anthems. Streaming parameters and physical broadcast distributions maintain highest placement ratings.
              </p>
              <div className="h-px bg-white/5 my-2"></div>
              <p className="text-[10px] font-mono text-gray-500">
                Grounding database index utilizes active web crawling across Billboard and streaming statistics to register current Top placements.
              </p>
            </div>
          </motion.div>
        )}

        {/* UGANDA HITS TAB VIEW */}
        {activeTab === "uganda" && (
          <motion.div
            key="uganda-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                Uganda Top Hits
              </h3>
              <p className="text-xs text-gray-400 pb-2">Tracking local hits, Afrobeat anthems, Kidandali vibes, and TikTok viral tracks across Uganda.</p>

              <div className="space-y-2">
                {ugandaSongs.map((song) => (
                  <div
                    key={`u-full-${song.rank}`}
                    className="flex items-center justify-between p-4 bg-dark-card/30 border border-white/5 rounded-2xl group hover:border-purple-400/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={`w-9 h-9 rounded-xl border text-sm font-mono font-bold flex items-center justify-center shrink-0 ${getRankBadgeColor(song.rank)}`}>
                        {song.rank}
                      </span>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-bold group-hover:text-purple-400 transition-colors truncate max-w-[200px] sm:max-w-md">{song.title}</p>
                          {song.genre && (
                            <span className="bg-purple-400/5 border border-purple-400/10 px-1.5 py-0.5 rounded text-[8px] font-mono text-purple-300 uppercase tracking-widest scale-90 shrink-0">
                              {song.genre}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{song.artist}</p>
                      </div>
                    </div>
                    {song.rank <= 3 && (
                      <span className="text-[10px] font-mono text-purple-400 py-0.5 px-2 bg-purple-400/5 rounded-lg border border-purple-400/10 flex items-center gap-1 animate-pulse">
                        🔥 LOCAL HEAT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Uganda Music Insights Sidebar */}
            <div className="bg-gradient-to-br from-white/3 to-transparent border border-white/5 rounded-3xl p-6 h-fit space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-purple-400 flex items-center gap-1.5 font-bold">
                <MapPin className="w-3.5 h-3.5" />
                UGANDAN SOUNDWAVES
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Kidandali-fusion and fresh Afro-dancehall dominate Kampala's active sound systems. Collaborations between traditional stalwarts and new-generation acts drive mainstream digital streaming statistics.
              </p>
              <div className="h-px bg-white/5 my-2"></div>
              <p className="text-[10px] font-mono text-gray-500">
                Grounding database utilizes YouTube local trends, Kampala FM charts, and regional Spotify charts to curate highly accurate local lists.
              </p>
            </div>
          </motion.div>
        )}

        {/* MOVIES TAB VIEW */}
        {activeTab === "movies" && (
          <motion.div
            key="movies-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-pink-400" />
                Trending Movies Worldwide
              </h3>
              <p className="text-xs text-gray-400 pb-2">Tracking blockbusters, premium releases, and trending cinematic events dominating the current landscape.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingMovies.map((movie) => (
                <div
                  key={`m-full-${movie.rank}`}
                  className="p-5 bg-dark-card/30 border border-white/5 rounded-2xl relative overflow-hidden group hover:border-pink-500/25 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-white font-bold text-base group-hover:text-pink-400 transition-colors">{movie.title}</h4>
                        <span className="inline-block bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-[9px] font-mono text-pink-400 uppercase tracking-widest">
                          {movie.genre}
                        </span>
                      </div>
                      <span className={`w-8 h-8 rounded-lg border text-sm font-mono font-bold flex items-center justify-center shrink-0 ${getRankBadgeColor(movie.rank)}`}>
                        {movie.rank}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">{movie.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* NEWS TAB VIEW */}
        {activeTab === "news" && (
          <motion.div
            key="news-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-green-400" />
                Live Sports & Entertainment News
              </h3>
              <p className="text-xs text-gray-400 pb-2">Highly accurate internet feed mapping current regional developments in Uganda and top sports storylines around the globe.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Local Area News Feed */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2 bg-white/3 border border-white/5 px-4 py-2 rounded-xl">
                  <MapPin className="w-3.5 h-3.5" />
                  UGANDA INTEL FEED
                </h4>
                <div className="space-y-4">
                  {ugandaNews.map((news, idx) => (
                    <div
                      key={`news-ug-${idx}`}
                      className="p-5 bg-dark-card/25 border border-white/5 rounded-2xl space-y-2.5 hover:border-cyan-400/20 transition-all duration-300"
                    >
                      <span className="px-2 py-0.5 bg-cyan-400/5 border border-cyan-400/20 rounded-md text-[8px] font-mono text-cyan-400 uppercase tracking-widest">
                        {news.category}
                      </span>
                      <h5 className="text-white font-bold text-sm leading-snug">{news.title}</h5>
                      <p className="text-xs text-gray-400 leading-relaxed">{news.summary}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1">
                        <span>Source: {news.source}</span>
                        <span className="flex items-center gap-1 text-cyan-400/70 hover:text-cyan-400 cursor-pointer">
                          Direct Feed
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Global Sphere News Feed */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2 bg-white/3 border border-white/5 px-4 py-2 rounded-xl">
                  <Globe className="w-3.5 h-3.5" />
                  GLOBAL INTEL FEED
                </h4>
                <div className="space-y-4">
                  {worldNews.map((news, idx) => (
                    <div
                      key={`news-wd-${idx}`}
                      className="p-5 bg-dark-card/25 border border-white/5 rounded-2xl space-y-2.5 hover:border-purple-400/20 transition-all duration-300"
                    >
                      <span className="px-2 py-0.5 bg-purple-400/5 border border-purple-400/20 rounded-md text-[8px] font-mono text-purple-400 tracking-widest uppercase">
                        {news.category}
                      </span>
                      <h5 className="text-white font-bold text-sm leading-snug">{news.title}</h5>
                      <p className="text-xs text-gray-400 leading-relaxed">{news.summary}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1">
                        <span>Source: {news.source}</span>
                        <span className="flex items-center gap-1 text-purple-400/70 hover:text-purple-400 cursor-pointer">
                          Direct Feed
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
