import { useState, MouseEvent } from "react";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Maximize2, Calendar, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GalleryImage } from "../types";

interface GalleryViewProps {
  gallery: GalleryImage[];
}

export default function GalleryView({ gallery }: GalleryViewProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setActiveIdx(index);
  };

  const closeLightbox = () => {
    setActiveIdx(null);
  };

  const prevImage = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : gallery.length - 1));
  };

  const nextImage = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev !== null && prev < gallery.length - 1 ? prev + 1 : 0));
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
          {gallery.map((img, idx) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(idx * 0.04, 0.4) }}
              onClick={() => openLightbox(idx)}
              className="group relative rounded-2xl overflow-hidden aspect-square border border-white/5 bg-white/3 cursor-pointer shadow-md hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/5 transition-all duration-300"
            >
              <img
                src={img.url}
                alt={img.caption || "STAHIZA event capture"}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
              />
              
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
          ))}
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
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            {/* Close trigger */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-3 rounded-lg bg-black/40 border border-white/10 text-white hover:text-red-400 hover:border-red-400/40 hover:bg-red-500/5 transition-all z-50 cursor-pointer"
              aria-label="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Main Stage */}
            <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              
              {/* Navigation Left */}
              <button
                onClick={prevImage}
                className="absolute left-2 sm:-left-16 p-2 rounded-xl bg-black/40 border border-white/10 text-white hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition-all z-20 cursor-pointer touch-none"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Main Image frame */}
              <div className="relative max-w-full max-h-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center shadow-2xl">
                <img
                  src={gallery[activeIdx].url}
                  alt={gallery[activeIdx].caption || "STAHIZA visual projection"}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[70vh] object-contain rounded-xl select-none"
                />
              </div>

              {/* Navigation Right */}
              <button
                onClick={nextImage}
                className="absolute right-2 sm:-right-16 p-2 rounded-xl bg-black/40 border border-white/10 text-white hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition-all z-20 cursor-pointer touch-none"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Meta Info bar */}
            <div 
              className="w-full max-w-3xl mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-2"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
