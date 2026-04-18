import Link from 'next/link';
import { UploadCloud, Edit3, Gamepad2, Megaphone, ListChecks, ClipboardList } from 'lucide-react';
import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';

export default async function AdminHub() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  let role = "helper"; 
  let username = "Agente";

  if (token) {
    try {
      const decoded = decodeJwt(token);
      role = decoded.role as string;
      username = decoded.username as string;
    } catch (e) {
      console.error("Error leyendo el token");
    }
  }

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-[#e6e0e3] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      <Gamepad2 className="absolute -bottom-20 -left-20 w-96 h-96 text-[#dfb4b9] opacity-20 -rotate-12 pointer-events-none" />
      
      <div className="text-center mb-12 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl md:text-5xl font-black text-[#2d1b30] uppercase tracking-tighter">
          Panel Central
        </h1>
        <p className="text-[#9b62a6] font-bold text-xs md:text-sm uppercase tracking-widest mt-2">
          {isAdmin ? `GESTIÓN TOTAL - ADMIN ${username}` : `MODO AYUDANTE - ${username}`}
        </p>
      </div>
      
      {/* Rejilla dinámica: 4 columnas para admin, 3 para ayudantes */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8 w-full max-w-7xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700`}>
        
        {/* ========================================== */}
        {/* ZONA PÚBLICA (LO VEN TODOS)                */}
        {/* ========================================== */}

        {/* 1. BOTÓN SUBIR JUEGO */}
        <Link 
          href="/panel/new-game" 
          className="bg-white p-8 lg:p-12 rounded-[3rem] border border-[#dfb4b9]/50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group flex flex-col items-center justify-center gap-6"
        >
          <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#e8c4df] rounded-[2rem] flex items-center justify-center text-[#9b62a6] group-hover:bg-[#9b62a6] group-hover:text-white transition-colors duration-300 shadow-inner">
            <UploadCloud size={40} />
          </div>
          <div className="text-center">
            <h2 className="text-lg lg:text-xl font-black text-[#2d1b30] uppercase tracking-tight mb-2">Subir Juego</h2>
            <p className="text-xs lg:text-sm text-[#a87ca0] font-medium leading-relaxed">
              Añade un nuevo título a la base de datos.
            </p>
          </div>
        </Link>

        {/* 2. BOTÓN EDITOR GLOBAL (¡Ahora lo ven los helpers para arreglar links!) */}
        <Link 
          href="/panel/editor" 
          className="bg-white p-8 lg:p-12 rounded-[3rem] border border-[#dfb4b9]/50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group flex flex-col items-center justify-center gap-6"
        >
          <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#e8c4df] rounded-[2rem] flex items-center justify-center text-[#9b62a6] group-hover:bg-[#c47b98] group-hover:text-white transition-colors duration-300 shadow-inner">
            <Edit3 size={40} />
          </div>
          <div className="text-center">
            <h2 className="text-lg lg:text-xl font-black text-[#2d1b30] uppercase tracking-tight mb-2">Editor Global</h2>
            <p className="text-xs lg:text-sm text-[#a87ca0] font-medium leading-relaxed">
              Busca y modifica cualquier título del catálogo.
            </p>
          </div>
        </Link>


        {/* ========================================== */}
        {/* ZONA EXCLUSIVA AYUDANTES                   */}
        {/* ========================================== */}

        {/* 3. BOTÓN MIS APORTES (¡Tú ya no lo ves!) */}
        {!isAdmin && (
          <Link 
            href="/panel/mis-aportes" 
            className="bg-white p-8 lg:p-12 rounded-[3rem] border border-[#dfb4b9]/50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group flex flex-col items-center justify-center gap-6"
          >
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#e8c4df] rounded-[2rem] flex items-center justify-center text-[#9b62a6] group-hover:bg-[#8D578F] group-hover:text-white transition-colors duration-300 shadow-inner">
              <ClipboardList size={40} />
            </div>
            <div className="text-center">
              <h2 className="text-lg lg:text-xl font-black text-[#2d1b30] uppercase tracking-tight mb-2">Mis Aportes</h2>
              <p className="text-xs lg:text-sm text-[#a87ca0] font-medium leading-relaxed">
                Revisa el estado de tus subidas.
              </p>
            </div>
          </Link>
        )}


        {/* ========================================== */}
        {/* 🔥 ZONA EXCLUSIVA PARA EL ADMINISTRADOR 🔥 */}
        {/* ========================================== */}
        {isAdmin && (
          <>
            <Link 
              href="/panel/pendientes" 
              className="bg-white p-8 lg:p-12 rounded-[3rem] border border-[#dfb4b9]/50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group flex flex-col items-center justify-center gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-red-500"></div>
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                <ListChecks size={40} />
              </div>
              <div className="text-center">
                <h2 className="text-lg lg:text-xl font-black text-[#2d1b30] uppercase tracking-tight mb-2">Revisar Limbo</h2>
                <p className="text-xs lg:text-sm text-[#a87ca0] font-medium leading-relaxed">
                  Aprueba o rechaza juegos de ayudantes.
                </p>
              </div>
            </Link>

            <Link 
              href="/panel/news" 
              className="bg-white p-8 lg:p-12 rounded-[3rem] border border-[#dfb4b9]/50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group flex flex-col items-center justify-center gap-6"
            >
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#e8c4df] rounded-[2rem] flex items-center justify-center text-[#9b62a6] group-hover:bg-[#a87ca0] group-hover:text-white transition-colors duration-300 shadow-inner">
                <Megaphone size={40} />
              </div>
              <div className="text-center">
                <h2 className="text-lg lg:text-xl font-black text-[#2d1b30] uppercase tracking-tight mb-2">Noticias</h2>
                <p className="text-xs lg:text-sm text-[#a87ca0] font-medium leading-relaxed">
                  Publica avisos o actualizaciones.
                </p>
              </div>
            </Link>
          </>
        )}

      </div>
    </div>
  );
}