import Link from 'next/link';
import { UploadCloud, Edit3, Gamepad2, Megaphone } from 'lucide-react';

export default function AdminHub() {
  
  return (
    <div className="min-h-screen bg-[#e6e0e3] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Decoración de fondo */}
      <Gamepad2 className="absolute -bottom-20 -left-20 w-96 h-96 text-[#dfb4b9] opacity-20 -rotate-12 pointer-events-none" />
      
      <div className="text-center mb-12 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl md:text-5xl font-black text-[#2d1b30] uppercase tracking-tighter">
          Panel Central
        </h1>
        <p className="text-[#9b62a6] font-bold text-xs md:text-sm uppercase tracking-widest mt-2">
          Gestión de ArchiveCrew
        </p>
      </div>
      
      {/* BOTONES PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* BOTÓN SUBIR JUEGO */}
        <Link 
          href="/admin/new-game" 
          className="bg-white p-12 rounded-[3rem] border border-[#dfb4b9]/50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group flex flex-col items-center justify-center gap-6"
        >
          <div className="w-24 h-24 bg-[#e8c4df] rounded-[2rem] flex items-center justify-center text-[#9b62a6] group-hover:bg-[#9b62a6] group-hover:text-white transition-colors duration-300 shadow-inner">
            <UploadCloud size={40} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-[#2d1b30] uppercase tracking-tight mb-2">Subir Juego</h2>
            <p className="text-sm text-[#a87ca0] font-medium leading-relaxed">
              Añade un nuevo título a la base de datos.
            </p>
          </div>
        </Link>

        {/* BOTÓN EDITAR CATÁLOGO */}
        <Link 
          href="/admin/editor" 
          className="bg-white p-12 rounded-[3rem] border border-[#dfb4b9]/50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group flex flex-col items-center justify-center gap-6"
        >
          <div className="w-24 h-24 bg-[#e8c4df] rounded-[2rem] flex items-center justify-center text-[#9b62a6] group-hover:bg-[#c47b98] group-hover:text-white transition-colors duration-300 shadow-inner">
            <Edit3 size={40} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-[#2d1b30] uppercase tracking-tight mb-2">Editar Catálogo</h2>
            <p className="text-sm text-[#a87ca0] font-medium leading-relaxed">
              Modifica o borra juegos existentes.
            </p>
          </div>
        </Link>

        {/* BOTÓN NOTICIAS (NUEVO) */}
        <Link 
          href="/admin/news" 
          className="bg-white p-12 rounded-[3rem] border border-[#dfb4b9]/50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group flex flex-col items-center justify-center gap-6"
        >
          <div className="w-24 h-24 bg-[#e8c4df] rounded-[2rem] flex items-center justify-center text-[#9b62a6] group-hover:bg-[#a87ca0] group-hover:text-white transition-colors duration-300 shadow-inner">
            <Megaphone size={40} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-[#2d1b30] uppercase tracking-tight mb-2">Noticias</h2>
            <p className="text-sm text-[#a87ca0] font-medium leading-relaxed">
              Publica avisos o actualizaciones de la web.
            </p>
          </div>
        </Link>

      </div>
    </div>
  );
}