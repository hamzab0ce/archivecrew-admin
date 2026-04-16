"use client"

// import loginAction from "@/app/actions/login"; // 🔥 DESCONECTADO PARA STATIC EXPORT
import { Lock, User, KeyRound, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  // const [state, action, pending] = useActionState(loginAction, undefined); // 🔥 DESCONECTADO
  
  // 🔥 FALLBACK ESTÁTICO PARA EXPORT
  const action = (formData: FormData) => { console.log("Login deshabilitado en static export"); };
  const pending = false;

  return (
    <form
      action={action}
      className="w-full max-w-sm bg-white border border-[#dfb4b9]/50 shadow-2xl rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Barra decorativa superior */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#9b62a6] to-[#c47b98]"></div>

      {/* Cabecera del Login */}
      <div className="flex flex-col items-center mb-8 mt-2">
        <div className="w-16 h-16 bg-[#e8c4df] rounded-2xl flex items-center justify-center text-[#9b62a6] mb-4 shadow-inner">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-[#2d1b30] text-center text-2xl font-black uppercase tracking-tight">
          ArchiveCrew
        </h2>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9b62a6] mt-1">
          Acceso Restringido
        </p>
      </div>

      <div className="space-y-5">
        {/* Usuario */}
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black text-[#9b62a6] uppercase tracking-widest flex items-center gap-1.5">
            <User size={12} /> Nombre de usuario
          </label>
          <input
            name="username"
            className="w-full bg-[#e6e0e3] border border-transparent focus:border-[#dfb4b9] p-4 rounded-2xl text-xs outline-none text-[#2d1b30] placeholder-[#a87ca0] font-medium transition-all shadow-inner"
            type="text"
            placeholder="Admin..."
            required
          />
        </div>

        {/* Contraseña */}
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black text-[#9b62a6] uppercase tracking-widest flex items-center gap-1.5">
            <KeyRound size={12} /> Contraseña
          </label>
          <input
            name="password"
            className="w-full bg-[#e6e0e3] border border-transparent focus:border-[#dfb4b9] p-4 rounded-2xl text-xs outline-none text-[#2d1b30] placeholder-[#a87ca0] font-medium transition-all shadow-inner"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      {/* Botón Submit */}
      <button
        className="w-full mt-8 bg-[#9b62a6] hover:bg-[#83528c] text-white py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest shadow-md hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
        type="submit"
        disabled={pending}
      >
        {pending ? (
          <span className="animate-pulse">Verificando...</span>
        ) : (
          <>
            <Lock size={14} /> Iniciar Sesión
          </>
        )}
      </button>

      {/* Alerta de Error */}
      {/* El login está deshabilitado en export estático, no mostramos errores de servidor */}
    </form>
  );
}