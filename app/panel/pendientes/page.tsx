import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Check, X, Eye, User, Calendar } from "lucide-react";
import { approveGame, rejectGame } from "@/app/actions/admin-actions";

export default async function PendientesPage() {
  const pendientes = await db.query.games.findMany({
    where: eq(games.status, 'pending'),
    orderBy: [desc(games.createdAt)],
  });

  return (
    <div className="min-h-screen bg-[#e6e0e3] p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-10">
          <Link href="/panel" className="flex items-center gap-2 text-[#9b62a6] font-bold text-xs uppercase mb-2 hover:gap-3 transition-all">
            <ArrowLeft size={16} /> Volver al Panel
          </Link>
          <h1 className="text-3xl font-black text-[#2d1b30] uppercase tracking-tighter">Limbo de Revisión</h1>
          <p className="text-[#a87ca0] text-sm font-medium">Tienes {pendientes.length} juegos esperando tu aprobación.</p>
        </div>

        <div className="grid gap-4">
          {pendientes.length === 0 ? (
            <div className="bg-white/50 border-2 border-dashed border-[#dfb4b9] rounded-[2rem] p-20 text-center">
              <p className="text-[#9b62a6] font-bold uppercase tracking-widest text-sm">☕ ¡Todo al día! No hay nada pendiente.</p>
            </div>
          ) : (
            pendientes.map((juego) => (
              <div key={juego.id} className="bg-white rounded-3xl p-5 border border-[#dfb4b9]/30 shadow-sm flex flex-col md:flex-row items-center gap-6">
                
                <img src={juego.cover_url} className="w-16 h-20 object-cover rounded-xl shadow-md" alt="" />

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-black text-[#2d1b30] uppercase leading-none mb-2">{juego.title}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9b62a6] uppercase">
                      <User size={12} /> {juego.uploader || "Admin"}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#a87ca0] uppercase">
                      <Calendar size={12} /> {new Date(juego.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Botón Detalles */}
                  <Link href={`/panel/editor?letra=${juego.title.charAt(0).toUpperCase()}&gameId=${juego.id}`} className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-[#9b62a6] hover:text-white transition-all shadow-sm">
                    <Eye size={20} />
                  </Link>

                  {/* 🔥 Botón Rechazar CON INPUT DE MOTIVO */}
                  <form action={async (formData) => { 
                    "use server"; 
                    await rejectGame(juego.id, formData); 
                  }} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      name="reason" 
                      placeholder="Motivo de rechazo..." 
                      required 
                      className="text-[10px] p-3 rounded-2xl border border-rose-200 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 bg-rose-50/50 text-rose-700 w-32 md:w-48 placeholder-rose-300 font-bold uppercase tracking-widest shadow-inner transition-all"
                    />
                    <button type="submit" title="Rechazar" className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                      <X size={20} />
                    </button>
                  </form>

                  {/* Botón Aprobar */}
                  <form action={async () => { "use server"; await approveGame(juego.id); }}>
                    <button className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                      <Check size={20} />
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}