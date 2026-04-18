import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import Link from "next/link";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Gamepad2,
  ExternalLink
} from "lucide-react";

export default async function MisAportesPage() {
  // 1. IDENTIFICAR AL AYUDANTE
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  let username = "";
  if (token) {
    const decoded = decodeJwt(token);
    username = decoded.username as string;
  }

  // 2. BUSCAR SOLO SUS JUEGOS EN LA BASE DE DATOS
  const misJuegos = await db
    .select()
    .from(games)
    .where(eq(games.uploader, username))
    .orderBy(desc(games.createdAt));

  return (
    <div className="min-h-screen bg-[#e6e0e3] p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <Link 
              href="/panel" 
              className="flex items-center gap-2 text-[#9b62a6] font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all mb-2"
            >
              <ArrowLeft size={16} /> Volver al Panel
            </Link>
            <h1 className="text-3xl font-black text-[#2d1b30] uppercase tracking-tighter">
              Mis Aportes
            </h1>
            <p className="text-[#a87ca0] text-sm font-medium">
              Gestiona y revisa el estado de los juegos que has subido.
            </p>
          </div>
          
          <div className="bg-white/50 px-6 py-3 rounded-2xl border border-[#dfb4b9]/30 backdrop-blur-sm">
            <p className="text-[10px] font-black text-[#9b62a6] uppercase tracking-[0.2em]">Sesión Activa</p>
            <p className="text-[#2d1b30] font-bold">{username}</p>
          </div>
        </div>

        {/* LISTADO DE JUEGOS */}
        <div className="grid gap-4">
          {misJuegos.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-20 border border-dashed border-[#dfb4b9] flex flex-col items-center justify-center text-center">
              <Gamepad2 size={48} className="text-[#dfb4b9] mb-4 opacity-50" />
              <p className="text-[#a87ca0] font-bold">Aún no has subio ningún juego.</p>
              <Link href="/panel/new-game" className="mt-4 text-[#9b62a6] font-black uppercase text-xs underline">
                Subir mi primer juego
              </Link>
            </div>
          ) : (
            misJuegos.map((juego) => (
              <div 
                key={juego.id} 
                className="bg-white rounded-3xl p-5 md:p-6 border border-[#dfb4b9]/30 shadow-sm flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow"
              >
                {/* Miniatura */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-inner">
                  <img 
                    src={juego.cover_url} 
                    alt={juego.title} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info Principal */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-black text-[#2d1b30] uppercase leading-none mb-1">
                    {juego.title}
                  </h3>
                  <p className="text-[#a87ca0] text-[10px] font-bold uppercase tracking-widest">
                    {juego.platform} • {new Date(juego.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* SEMÁFORO DE ESTADO */}
                <div className="flex flex-wrap justify-center gap-3">
                  {juego.status === 'pending' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                      <Clock size={16} />
                      <span className="text-[10px] font-black uppercase tracking-wider">Pendiente</span>
                    </div>
                  )}
                  {juego.status === 'approved' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] font-black uppercase tracking-wider">Aprobado</span>
                    </div>
                  )}
                  {juego.status === 'rejected' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
                      <XCircle size={16} />
                      <span className="text-[10px] font-black uppercase tracking-wider">Rechazado</span>
                    </div>
                  )}
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex gap-2">
                  {/* Botón Corregir / Editar */}
                  <Link 
                    href={`/panel/editor/${juego.id}`}
                    className="flex items-center gap-2 px-5 py-3 bg-[#f8f5f5] hover:bg-[#9b62a6] hover:text-white text-[#9b62a6] rounded-2xl transition-all duration-200 group"
                  >
                    <Edit3 size={18} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Corregir</span>
                  </Link>
                  
                  {/* Link a la web si ya está aprobado */}
                  {juego.status === 'approved' && (
                    <Link 
                      href={`/games/${juego.slug}`}
                      target="_blank"
                      className="p-3 bg-white border border-[#dfb4b9]/50 text-[#a87ca0] hover:text-[#9b62a6] rounded-2xl transition-colors"
                    >
                      <ExternalLink size={20} />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}