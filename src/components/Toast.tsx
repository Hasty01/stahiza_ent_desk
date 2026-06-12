import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type ToastType = "success" | "error";

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(message.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      id={`toast-${message.id}`}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl max-w-sm w-full font-sans backdrop-blur-md ${
        message.type === "success"
          ? "bg-dark-card/90 border-neon-green/30 text-neon-green shadow-neon-green/5"
          : "bg-dark-card/90 border-neon-pink/30 text-neon-pink shadow-neon-pink/5"
      }`}
    >
      {message.type === "success" ? (
        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-neon-green animate-pulse" />
      ) : (
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-neon-pink animate-pulse" />
      )}
      <p className="text-sm font-medium flex-1 text-gray-200">{message.text}</p>
      <button
        onClick={() => onClose(message.id)}
        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all text-gray-400 hover:text-white"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
