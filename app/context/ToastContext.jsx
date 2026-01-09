"use client";
import { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

const ToastItem = ({ message, type, onClose }) => {
  const styles = {
    success: {
      bg: "bg-[#1A2F24]", 
      border: "border-sage-green",
      icon: <CheckCircle2 size={20} className="text-sage-green" />,
      title: "Success"
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: <AlertCircle size={20} className="text-red-500" />,
      title: "Error",
      textColor: "text-red-800"
    },
    info: {
      bg: "bg-white",
      border: "border-gray-200",
      icon: <Info size={20} className="text-[#1A2F24]" />,
      title: "Info",
      textColor: "text-gray-800"
    }
  };

  const currentStyle = styles[type] || styles.success;
  const isDark = type === "success";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`
        pointer-events-auto w-80 p-4 rounded-xl border shadow-xl backdrop-blur-md flex items-start gap-3 relative overflow-hidden
        ${currentStyle.bg} ${currentStyle.border}
      `}
    >
      
        {isDark && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl -mr-8 -mt-8"></div>
        )}

      <div className="shrink-0 mt-0.5">{currentStyle.icon}</div>
      
      <div className="flex-1">
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isDark ? "text-sage-green" : currentStyle.textColor}`}>
            {currentStyle.title}
        </h4>
        <p className={`text-sm font-medium leading-snug ${isDark ? "text-white/90" : "text-gray-600"}`}>
            {message}
        </p>
      </div>

      <button 
        onClick={onClose} 
        className={`shrink-0 p-1 rounded-full transition-colors ${isDark ? "text-white/30 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-800 hover:bg-gray-100"}`}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export const useToast = () => useContext(ToastContext);