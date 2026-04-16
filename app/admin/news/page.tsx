import { db } from '@/lib/db';
import { news } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';
import { ArrowLeft, Megaphone, Trash2, CalendarDays } from 'lucide-react';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// 🔥 TU WEBHOOK DIRECTO
const CF_WEBHOOK = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/956a24bd-f0e1-4c7d-9ac7-2a051bdbda4c";

const getCachedNews = unstable_cache(
  async () => {
    return await db.select().from(news).orderBy(desc(news.createdAt));
  },
  ["admin-news-list"],
  { revalidate: 3600, tags: ["news"] }
);

export default async function NewsAdminPage() {
  const allNews = await getCachedNews();

  async function createNews(formData: FormData) {
    'use server';
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const type = formData.get("type") as string;

    if (!title) return;

    await db.insert(news).values({ title, content, type });
    
    // 🚀 AVISAR A CLOUDFLARE
    fetch(CF_WEBHOOK, { method: 'POST' }).catch(console.error);

    revalidatePath("/admin/news");
    revalidatePath("/");
  }

  async function deleteNews(formData: FormData) {
    'use server';
    const id = parseInt(formData.get("id") as string);
    
    if (!id) return;

    await db.delete(news).where(eq(news.id, id));

    // 🚀 AVISAR A CLOUDFLARE
    fetch(CF_WEBHOOK, { method: 'POST' }).catch(console.error);

    revalidatePath("/admin/news");
    revalidatePath("/");
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'game': return '🎮';
      case 'update': return '🚀';
      case 'fix': return '🔧';
      case 'alert': return '⚠️';
      default: return '📢';
    }
  };

  return (
    <div className="min-h-screen bg-[#e6e0e3] p-6 md:p-12 font-sans text-[#2d1b30]">
      
      {/* Botón Volver */}
      <Link 
        href="/admin" 
        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#9b62a6] font-bold rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all mb-8"
      >
        <ArrowLeft size={20} />
        Volver al Panel
      </Link>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA: Formulario de Creación */}
        <div className="bg-white p-8 rounded-[3rem] border border-[#dfb4b9]/50 shadow-sm h-fit">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-[#e8c4df] rounded-2xl flex items-center justify-center text-[#9b62a6] shadow-inner">
              <Megaphone size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Publicar Noticia</h2>
              <p className="text-sm text-[#a87ca0] font-medium">Avisa a los usuarios de novedades.</p>
            </div>
          </div>

          <form action={createNews} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-[#9b62a6] uppercase tracking-wider mb-2">Tipo de Aviso</label>
              <select 
                name="type" 
                className="w-full p-4 rounded-2xl bg-[#f4eff3] border-none text-[#2d1b30] font-bold focus:ring-2 focus:ring-[#9b62a6] outline-none"
                required
              >
                <option value="game">🎮 Nuevo Juego / Repack</option>
                <option value="update">🚀 Mejora en la Web</option>
                <option value="fix">🔧 Arreglo / Fix</option>
                <option value="alert">⚠️ Aviso Importante</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#9b62a6] uppercase tracking-wider mb-2">Título (Obligatorio)</label>
              <input
                type="text"
                name="title"
                placeholder="Ej: Hemos actualizado el catálogo..."
                className="w-full p-4 rounded-2xl bg-[#f4eff3] border-none text-[#2d1b30] font-medium focus:ring-2 focus:ring-[#9b62a6] outline-none placeholder-[#a87ca0]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#9b62a6] uppercase tracking-wider mb-2">Contenido (Opcional)</label>
              <textarea
                name="content"
                rows={3}
                placeholder="Da más detalles sobre la noticia..."
                className="w-full p-4 rounded-2xl bg-[#f4eff3] border-none text-[#2d1b30] font-medium focus:ring-2 focus:ring-[#9b62a6] outline-none placeholder-[#a87ca0] resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="mt-2 bg-[#9b62a6] hover:bg-[#c47b98] text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg w-full"
            >
              Publicar Ahora
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: Lista de Noticias */}
        <div className="bg-white p-8 rounded-[3rem] border border-[#dfb4b9]/50 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
            <CalendarDays className="text-[#9b62a6]" />
            Noticias Recientes
          </h2>

          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
            {allNews.length === 0 ? (
              <p className="text-center text-[#a87ca0] py-10 font-medium">No hay noticias publicadas aún.</p>
            ) : (
              allNews.map((n) => (
                <div key={n.id} className="bg-[#f4eff3] p-5 rounded-3xl flex items-start justify-between gap-4 group hover:bg-[#e8c4df]/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getTypeIcon(n.type)}</span>
                      <h3 className="font-bold text-lg leading-tight">{n.title}</h3>
                    </div>
                    {n.content && (
                      <p className="text-sm text-[#6d4b73] mt-2 line-clamp-2">{n.content}</p>
                    )}
                    <p className="text-xs text-[#a87ca0] font-bold mt-3">
                      {new Date(n.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <form action={deleteNews}>
                    <input type="hidden" name="id" value={n.id} />
                    <button 
                      type="submit"
                      className="p-3 bg-white text-red-400 hover:bg-red-500 hover:text-white rounded-xl shadow-sm transition-colors opacity-50 group-hover:opacity-100"
                      title="Borrar noticia"
                    >
                      <Trash2 size={18} />
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}