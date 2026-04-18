"use client";

import { useActionState, useState } from "react";
import loginAction from "@/app/actions/login";
import { User, KeyRound, ShieldAlert, Fingerprint, Terminal } from "lucide-react";

export default function HqAccessPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  
  // 🔥 Estado para cambiar la interfaz entre roles
  const [isHelper, setIsHelper] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-[#f3f4f6] flex justify-center items-center overflow-hidden font-sans text-[#1f2937]">
      
      {/* Fondo limpio con un patrón sutil (Opcional, da textura) */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#1f2937 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

      <form
        action={action}
        className="relative z-10 w-full max-w-md bg-white border border-gray-200 p-10 rounded-3xl shadow-xl animate-in fade-in zoom-in-95 duration-500"
      >
        {/* Header Terminal */}
        <div className="flex flex-col items-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-colors duration-300 ${isHelper ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
            <Terminal size={28} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900">
            ARCHIVECREW
          </h2>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-gray-400 mt-1 uppercase">
            Panel de Acceso
          </p>
        </div>

        {/* 🚀 Selector de Rol (Admin vs Ayudante) */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
          <button 
            type="button"
            onClick={() => setIsHelper(false)}
            className={`flex-1 py-2.5 text-[11px] font-bold tracking-wider uppercase rounded-lg transition-all duration-200 ${!isHelper ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Admin
          </button>
          <button 
            type="button"
            onClick={() => setIsHelper(true)}
            className={`flex-1 py-2.5 text-[11px] font-bold tracking-wider uppercase rounded-lg transition-all duration-200 ${isHelper ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Ayudante
          </button>
        </div>

        <div className="space-y-5">
          {/* Usuario / Quién eres */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <User size={14} className={isHelper ? 'text-emerald-500' : 'text-blue-500'}/> 
              {isHelper ? "Identificación" : "ID Administrador"}
            </label>
            <input
              name="username"
              className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 focus:ring-0 p-3.5 rounded-xl text-sm outline-none text-gray-900 placeholder-gray-400 transition-all font-medium"
              type="text"
              placeholder={isHelper ? "Ej: Benslay" : "Usuario Root"}
              required
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <KeyRound size={14} className={isHelper ? 'text-emerald-500' : 'text-blue-500'}/> 
              Clave de Acceso
            </label>
            <input
              name="password"
              className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 focus:ring-0 p-3.5 rounded-xl text-sm outline-none text-gray-900 placeholder-gray-400 tracking-[0.2em] transition-all font-medium"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Botón */}
        <button
          className={`w-full mt-8 text-white py-4 rounded-xl text-[12px] uppercase font-bold tracking-widest shadow-md transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70 ${isHelper ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
          type="submit"
          disabled={pending}
        >
          {pending ? (
            <span className="animate-pulse">Verificando...</span>
          ) : (
            <>
              <Fingerprint size={16} /> Iniciar Sesión
            </>
          )}
        </button>

        {/* Alerta de Error */}
        {state?.error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl animate-in fade-in duration-300">
            <p className="text-[11px] text-red-600 font-bold text-center uppercase tracking-wider flex items-center justify-center gap-2">
              <ShieldAlert size={14} /> {state.error}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}