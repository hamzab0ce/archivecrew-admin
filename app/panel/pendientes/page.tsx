import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { eq, desc, and, gte } from "drizzle-orm"; // 🔥 Añadimos 'and' y 'gte' (mayor o igual)
import Link from "next/link";
import { ArrowLeft, Check, X, Eye, User, Calendar } from "lucide-react";
import { approveGame, rejectGame } from "@/app/actions/admin-actions";

export default async function PendientesPage() {
  // 🔥 LA FECHA DE CORTE: 18 de Abril de 2026 (Hora 00:00)
  const fechaCorte = new Date('2026-04-18T00:00:00Z');

  // Buscamos solo los que están esperando revisión Y son nuevos
  const pendientes = await db.query.games.findMany({
    where: and(
      eq(games.status, 'pending'),
      gte(games.createdAt, fechaCorte) // 🚀 Solo de la fecha de corte en adelante
    ),
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
                  {/* Ver detalles (Corregido para ir a tu buscador de letras) */}
                  <Link href={`/panel/editor?letra=${juego.title.charAt(0).toUpperCase()}`} className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-[#9b62a6] hover:text-white transition-all shadow-sm">
                    <Eye size={20} />
                  </Link>

                  {/* Botón Rechazar */}
                  <form action={async () => { "use server"; await rejectGame(juego.id); }}>
                    <button className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
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