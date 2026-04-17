"use client";

import { useActionState, useState } from "react";
import loginAction from "@/app/actions/login";
import { User, KeyRound, ShieldAlert, Fingerprint, Terminal } from "lucide-react";

export default function HqAccessPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  
  // 🔥 Nuevo estado para cambiar la interfaz entre tú y tus amigos
  const [isHelper, setIsHelper] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-[#0d080e] flex justify-center items-center overflow-hidden font-mono text-[#e6e0e3]">
      
      {/* Fondo animado estilo Matrix/Cyberpunk */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#9b62a6] via-[#0d080e] to-[#0d080e]"></div>

      <form
        action={action}
        className="relative z-10 w-full max-w-md bg-[#160e18]/80 backdrop-blur-xl border border-[#9b62a6]/40 p-10 rounded-2xl shadow-[0_0_40px_-10px_rgba(155,98,166,0.4)] animate-in fade-in zoom-in-95 duration-500"
      >
        {/* Header Terminal */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full border border-[#c47b98] flex items-center justify-center mb-4 bg-[#9b62a6]/10 shadow-[0_0_15px_rgba(196,123,152,0.5)]">
            <Terminal className="text-[#c47b98]" size={28} />
          </div>
          <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#c47b98] to-[#9b62a6]">
            ARCHIVECREW
          </h2>
          <p className="text-[10px] tracking-[0.4em] text-[#9b62a6] mt-2 opacity-80">
            SYSTEM_OVERRIDE_ENABLED
          </p>
        </div>

        {/* 🚀 Selector de Rol (Admin vs Ayudante) */}
        <div className="flex bg-[#0d080e] rounded-lg p-1 mb-8 border border-[#9b62a6]/30">
          <button 
            type="button"
            onClick={() => setIsHelper(false)}
            className={`flex-1 py-2 text-[10px] font-bold tracking-widest rounded-md transition-all ${!isHelper ? 'bg-[#9b62a6] text-white shadow-[0_0_10px_rgba(155,98,166,0.5)]' : 'text-[#a87ca0] hover:text-white hover:bg-[#1e1321]'}`}
          >
            ADMIN
          </button>
          <button 
            type="button"
            onClick={() => setIsHelper(true)}
            className={`flex-1 py-2 text-[10px] font-bold tracking-widest rounded-md transition-all ${isHelper ? 'bg-[#c47b98] text-white shadow-[0_0_10px_rgba(196,123,152,0.5)]' : 'text-[#a87ca0] hover:text-white hover:bg-[#1e1321]'}`}
          >
            AYUDANTE
          </button>
        </div>

        <div className="space-y-6">
          {/* Usuario / Quién eres */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#c47b98] uppercase tracking-widest flex items-center gap-2">
              <User size={14} /> {isHelper ? "Identificación (Tu nombre)" : "ID de Administrador"}
            </label>
            <input
              name="username"
              className="w-full bg-[#0d080e] border border-[#9b62a6]/30 focus:border-[#c47b98] focus:ring-1 focus:ring-[#c47b98] p-3.5 rounded-lg text-sm outline-none text-white placeholder-[#a87ca0]/50 transition-all"
              type="text"
              placeholder={isHelper ? "Ej: Benslay..." : "admin_root"}
              required
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#c47b98] uppercase tracking-widest flex items-center gap-2">
              <KeyRound size={14} /> Clave de Seguridad
            </label>
            <input
              name="password"
              className="w-full bg-[#0d080e] border border-[#9b62a6]/30 focus:border-[#c47b98] focus:ring-1 focus:ring-[#c47b98] p-3.5 rounded-lg text-sm outline-none text-white placeholder-[#a87ca0]/50 tracking-[0.2em] transition-all"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Botón */}
        <button
          className="w-full mt-8 bg-gradient-to-r from-[#9b62a6] to-[#c47b98] hover:from-[#83528c] hover:to-[#b06a87] text-white py-4 rounded-lg text-[11px] uppercase font-black tracking-widest shadow-[0_0_20px_rgba(155,98,166,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          type="submit"
          disabled={pending}
        >
          {pending ? (
            <span className="animate-pulse">Desencriptando...</span>
          ) : (
            <>
              <Fingerprint size={16} /> INICIAR CONEXIÓN
            </>
          )}
        </button>

        {/* Alerta de Error */}
        {state?.error && (
          <div className="mt-6 p-4 bg-red-950/50 border border-red-500/50 rounded-lg backdrop-blur-sm animate-in fade-in duration-300">
            <p className="text-[10px] text-red-400 font-bold text-center uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldAlert size={14} /> {state.error}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}