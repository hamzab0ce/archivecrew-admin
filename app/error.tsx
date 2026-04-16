"use client";

import { useEffect } from "react";
import { Gamepad2 } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 1. Detectamos si es el bug de Vercel/Next.js
    const esErrorDeCache = error.message.includes("Failed to find Server Action") || error.message.includes("digest");
    
    // 2. Miramos la memoria del navegador para ver si ya hemos intentado hacer F5 automático
    const yaRecargo = sessionStorage.getItem("auto-recarga-hecha");

    if (esErrorDeCache && !yaRecargo) {
      // Si es el bug y NO hemos recargado aún: dejamos una nota y hacemos F5 automático rápido
      sessionStorage.setItem("auto-recarga-hecha", "true");
      window.location.reload();
    } else {
      // Si ya habíamos hecho F5 y sigue fallando, borramos la nota y nos quedamos quietos
      sessionStorage.removeItem("auto-recarga-hecha");
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#e6e0e3] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <Gamepad2 className="absolute -bottom-10 -left-10 w-96 h-96 text-[#dfb4b9] opacity-30 -rotate-12 pointer-events-none" />

      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl max-w-lg w-full border border-[#dfb4b9]/50 relative z-10 animate-in fade-in slide-in-from-bottom-8">
        <div className="w-20 h-20 bg-[#f4eff3] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <span className="text-4xl">🔌</span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-black text-[#2d1b30] uppercase tracking-tight mb-4">
          ¡Un pequeño enganchón!
        </h2>
        
        <p className="text-[#a87ca0] font-medium text-lg mb-8 leading-relaxed">
          O te has quedado sin conexión, o nuestros servidores están actualizando el catálogo.
        </p>
        
        <button
          onClick={() => {
            sessionStorage.removeItem("auto-recarga-hecha");
            window.location.reload();
          }}
          className="bg-[#9b62a6] hover:bg-[#c47b98] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 shadow-md w-full"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}