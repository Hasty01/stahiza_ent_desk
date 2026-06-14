import { useState, MouseEvent } from "react";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Maximize2, Calendar, ZoomIn, Play, Film, Minimize2, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GalleryImage } from "../types";

// Helper to check if a URL represents a video
function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const cleanUrl = url.toLowerCase().split('?')[0].split('#')[0];
  if (
    cleanUrl.endsWith('.mp4') || 
    cleanUrl.endsWith('.webm') || 
    cleanUrl.endsWith('.ogg') || 
    cleanUrl.endsWith('.mov') || 
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.endsWith('.quicktime')
  ) {
    return true;
  }
  if (
    url.includes('youtube.com/watch') || 
    url.includes('youtu.be/') || 
    url.includes('youtube.com/embed/') || 
    url.includes('vimeo.com/')
  ) {
    return true;
  }
  if (url.startsWith('data:video/')) {
    return true;
  }
  return false;
}

// Extract YouTube ID and return quality thumbnail
function getVideoThumbnail(url: string, defaultFallback: string = ""): string {
  if (!url) return defaultFallback;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return defaultFallback;
}

// Convert video URL to an iframe embed code for YouTube
function getYoutubeEmbedUrl(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  }
  return url;
}

interface GalleryViewProps {
  gallery: GalleryImage[];
}

export default function GalleryView({ gallery }: GalleryViewProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isImmersive, setIsImmersive] = useState<boolean>(false);

  const openLightbox = (index: number) => {
    setActiveIdx(index);
    setIsImmersive(false);
  };

  const closeLightbox = () => {
    setActiveIdx(null);
    setIsImmersive(false);
  };

  const prevImage = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : gallery.length - 1));
    setIsImmersive(false);
  };

  const nextImage = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev !== null && prev < gallery.length - 1 ? prev + 1 : 0));
    setIsImmersive(false);
  };

  return (
    <div id="gallery-view" className="space-y-8 font-sans">
      {/* HEADER BLOCK */}
      <div className="space-y-2">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight flex items-center gap-2">
          STAHIZA Visual Deck
        </h2>
        <p className="text-sm text-gray-400">Archived photographic frequencies captured live from our electronic party halls.</p>
      </div>

      {/* PHOTO GRID */}
      {gallery.length === 0 ? (
        <div className="bg-white/2 border border-white/5 rounded-2xl p-16 text-center space-y-3">
          <ImageIcon className="w-10 h-10 text-gray-600 mx-auto animate-pulse" />
          <p className="text-sm text-gray-500 font-mono">No imagery in active visual drive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((img, idx) => {
            const isVideoSelected = isVideoUrl(img.url);
            const isYoutube = img.url.includes("youtube.com") || img.url.includes("youtu.be");
            const thumbUrl = isYoutube ? getVideoThumbnail(img.url, img.url) : img.url;

            return (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                onClick={() => openLightbox(idx)}
                className="group relative rounded-2xl overflow-hidden aspect-square border border-white/5 bg-white/3 cursor-pointer shadow-md hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/5 hover:scale-[1.025] transition-all duration-300"
              >
                {isVideoSelected && !isYoutube ? (
                  <video
                    src={img.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <img
                    src={thumbUrl}
                    alt={img.caption || "STAHIZA event capture"}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Video Play Badge overlay */}
                {isVideoSelected && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 rounded-lg border border-white/10 text-[9px] font-mono font-bold text-cyan-400 flex items-center gap-1.5 shadow-md z-10 group-hover:border-cyan-400/50 transition-colors">
                    <Play className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                    <span>VIDEO</span>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 z-10">
                  <div className="self-end p-1.5 bg-black/80 rounded-lg border border-white/10 text-white">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white text-sm font-semibold font-display line-clamp-2 leading-tight">
                      {img.caption || "Untitled Broadcast"}
                    </p>
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">
                      {new Date(img.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* HIGH-TECH LIGHTBOX POPUP */}
      <AnimatePresence>
        {activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-colors duration-300"
          >
            {/* Close trigger - hide in immersive */}
            {!isImmersive && (
              <button
                id="lightbox-close-btn"
                onClick={closeLightbox}
                className="absolute top-4 right-4 p-3 rounded-lg bg-black/40 border border-white/10 text-white hover:text-red-400 hover:border-red-400/40 hover:bg-red-500/5 transition-all z-50 cursor-pointer"
                aria-label="Close viewer"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Main Stage */}
            <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center animate-none" onClick={(e) => e.stopPropagation()}>
              
              {/* Navigation Left - hide in immersive */}
              {!isImmersive && (
                <button
                  id="lightbox-prev-btn"
                  onClick={prevImage}
                  className="absolute left-2 sm:-left-16 p-2 rounded-xl bg-black/40 border border-white/10 text-white hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition-all z-20 cursor-pointer touch-none"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Main Image/Video frame */}
              <motion.div
                layout
                id="lightbox-main-stage"
                onClick={() => setIsImmersive(!isImmersive)}
                className={`relative overflow-hidden flex items-center justify-center bg-black/40 shadow-2xl transition-all duration-300 ${
                  isImmersive 
                    ? "fixed inset-0 z-[100] w-screen h-screen max-w-none max-h-none rounded-none border-none cursor-zoom-out" 
                    : "max-w-full max-h-full rounded-2xl border border-white/10 cursor-zoom-in"
                }`}
              >
                {isVideoUrl(gallery[activeIdx].url) ? (
                  gallery[activeIdx].url.includes("youtube.com") || gallery[activeIdx].url.includes("youtu.be") ? (
                    <div className={`aspect-video overflow-hidden bg-black transition-all duration-300 ${isImmersive ? "w-screen h-screen" : "w-full max-w-4xl rounded-xl"}`}>
                      <iframe
                        src={getYoutubeEmbedUrl(gallery[activeIdx].url)}
                        title={gallery[activeIdx].caption || "STAHIZA YouTube Video"}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  ) : (
                    <video
                      src={gallery[activeIdx].url}
                      controls
                      autoPlay
                      referrerPolicy="no-referrer"
                      className={`transition-all duration-300 select-none ${isImmersive ? "w-screen h-screen object-contain" : "max-w-full max-h-[70vh] rounded-xl"}`}
                    />
                  )
                ) : (
                  <motion.img
                    layout
                    src={gallery[activeIdx].url}
                    alt={gallery[activeIdx].caption || "STAHIZA visual projection"}
                    referrerPolicy="no-referrer"
                    className={`transition-all duration-300 select-none ${isImmersive ? "w-screen h-[100dvh] object-contain" : "max-w-full max-h-[70vh] object-contain rounded-xl"}`}
                  />
                )}

                {/* Info Overlay on Zoom Hint */}
                {!isImmersive && (
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="p-3 bg-black/85 rounded-full border border-white/20 text-white flex items-center gap-2 text-xs font-mono">
                      <ZoomIn className="w-4 h-4 text-cyan-400" />
                      <span>Click to expand full screen</span>
                    </div>
                  </div>
                )}

                {/* Exit indicator inside immersive */}
                {isImmersive && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-[110]" onClick={(e) => e.stopPropagation()}>
                    <button
                      id="lightbox-minimize-btn"
                      onClick={() => setIsImmersive(false)}
                      className="p-3 rounded-lg bg-black/60 border border-white/20 text-white hover:text-cyan-400 hover:border-cyan-400/30 hover:bg-cyan-400/10 transition-all cursor-pointer flex items-center gap-1.5"
                      title="Exit Full Screen"
                    >
                      <Minimize2 className="w-4 h-4" />
                      <span className="text-xs font-mono">Exit Full Screen</span>
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Navigation Right - hide in immersive */}
              {!isImmersive && (
                <button
                  id="lightbox-next-btn"
                  onClick={nextImage}
                  className="absolute right-2 sm:-right-16 p-2 rounded-xl bg-black/40 border border-white/10 text-white hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition-all z-20 cursor-pointer touch-none"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Meta Info bar - hide in immersive */}
            {!isImmersive && (
              <div 
                id="lightbox-meta-bar"
                className="w-full max-w-3xl mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-2 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-white font-display text-base font-bold">
                  {gallery[activeIdx].caption || "STAHIZA Broadcast Feed"}
                </p>
                <div className="flex items-center justify-center gap-4 text-xs font-mono text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(gallery[activeIdx].created_at).toLocaleDateString(undefined, { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </span>
                  <span>•</span>
                  <span className="text-neon-cyan uppercase font-semibold">Frame {activeIdx + 1} of {gallery.length}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
