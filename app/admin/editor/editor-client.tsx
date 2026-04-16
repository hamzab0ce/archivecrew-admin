"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateGame, deleteGame } from '@/app/actions/editor-actions';
import { 
  Trash2, Save, Gamepad2, Plus, X, Search as SearchIcon, 
  BookOpen, RotateCcw, Cpu, DownloadCloud, Search, Edit3, ImageIcon, Layers 
} from 'lucide-react';
import toast from "react-hot-toast";

const theme = {
  bgApp: 'bg-[#e6e0e3]', 
  bgCard: 'bg-white',
  textMain: 'text-[#2d1b30]', 
  textMuted: 'text-[#9b62a6]', 
  border: 'border-[#dfb4b9]/50', 
  btnPurple: 'bg-[#9b62a6] hover:bg-[#83528c] text-white', 
  btnPink: 'bg-[#c47b98] hover:bg-[#b06a87] text-white'
};

const EXACT_GENRES = [
  "ACCIÓN", "INDIE", "AVENTURA", "SIMULACIÓN", "ROL (RPG)", 
  "ESTRATEGIA", "CASUAL", "SHOOTER", "CARRERAS", "DEPORTES", 
  "PLATAFORMAS", "PUZLES", "ARCADE", "LUCHA", "OTROS"
];

const PLATFORMS = ["PC", "ANDROID"];
const ABECEDARIO = ["#", "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

// --- DICCIONARIO TRADUCTOR ---
function translateRawgRequirements(rawText: string | null | undefined): string | null {
  if (!rawText) return null;
  let translated = rawText.replace(/Minimum:/gi, '').replace(/Recommended:/gi, '').replace(/<[^>]*>?/gm, '');
  const dictionary: Record<string, string> = {
    "OS:": "SO:", "Processor:": "Procesador:", "Memory:": "Memoria:",
    "Graphics:": "Gráficos:", "Storage:": "Almacenamiento:", "Network:": "Red:",
    "Sound Card:": "Tarjeta de sonido:", "Additional Notes:": "Notas adicionales:",
    "Video Card:": "Tarjeta de video:", "DirectX:": "DirectX:" 
  };
  for (const [eng, spa] of Object.entries(dictionary)) {
    translated = translated.replace(new RegExp(eng.replace(':', '\\:'), 'gi'), spa);
  }
  const contextDict: Record<string, string> = {
    "available space": "de espacio disponible", "Broadband Internet connection": "Conexión a Internet de banda ancha",
    "Requires a 64-bit processor and operating system": "Requiere un procesador y sistema operativo de 64 bits",
    "or equivalent": "o equivalente", "or better": "o superior",
    "Dual Core": "Doble Núcleo", "Quad Core": "Cuatro Núcleos"
  };
  for (const [eng, spa] of Object.entries(contextDict)) {
    translated = translated.replace(new RegExp(eng, 'gi'), spa);
  }
  translated = translated.replace(/(\d+\s*[GMK]B)\s*RAM/gi, '$1 de RAM');
  return translated.replace(/\n\s*\n/g, '\n').trim();
}

export default function EditorClient({ initialGames, letraActual }: { initialGames: any[], letraActual: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Sincroniza la letra local con la URL
  const [currentLetra, setCurrentLetra] = useState<string>(letraActual);
  const [games, setGames] = useState(initialGames);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChangingLetter, setIsChangingLetter] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); 
  const [instructions, setInstructions] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [captura, setCaptura] = useState("");
  const [requeriments, setRequirements] = useState("Bajos"); 
  const [reqMinimos, setReqMinimos] = useState("");
  const [platform, setPlatform] = useState("PC");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]); 
  const [size, setSize] = useState(""); 
  const [version, setVersion] = useState(""); 
  const [creditSource, setCreditSource] = useState(""); 
  const [password, setPassword] = useState("");
  const [links, setLinks] = useState<any[]>([]); 

  // Sincroniza currentLetra con letraActual cuando cambia (desde el servidor)
  useEffect(() => {
    setCurrentLetra(letraActual);
  }, [letraActual]);

  useEffect(() => {
    setGames(initialGames);
    setIsChangingLetter(false);
  }, [initialGames]);

  useEffect(() => {
    if (selectedGame) {
      setTitle(selectedGame.title || "");
      setCoverUrl(selectedGame.cover_url || "");
      setCaptura(selectedGame.captura || "");
      setPlatform(selectedGame.platform || "PC");
      setRequirements(selectedGame.requeriments || "Bajos");
      setReqMinimos(selectedGame.reqMinimos || "");
      setSize(selectedGame.fileSize || "");
      setVersion(selectedGame.version || "");
      setPassword(selectedGame.password || "");
      setCreditSource(selectedGame.creditSource || "");
      setDescription(selectedGame.content || ""); 
      setInstructions(selectedGame.instructions || "");
      setLinks(selectedGame.links_descarga || []);
      const extraidos = selectedGame.games_genres?.map((g: any) => g.genre).filter(Boolean) || [];
      setSelectedGenres(extraidos);
    }
  }, [selectedGame]);

  const handleSearchCover = () => {
    if (!title) return toast.error("Escribe un título primero");
    window.open(`https://www.steamgriddb.com/search/grids?term=${encodeURIComponent(title)}`, '_blank');
  };

  const handleSearchCaptura = () => {
    if (!title) return toast.error("Escribe un título primero");
    window.open(`https://www.steamgriddb.com/search/heroes?term=${encodeURIComponent(title)}`, '_blank');
  };

  const handleFetchWikipedia = async () => {
    if (!title) return toast.error("Escribe el Título primero.");
    const loadingToast = toast.loading("Leyendo Wikipedia...");
    try {
      const res = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      const data = await res.json();
      if (data.extract) {
        setDescription(data.extract);
        toast.success("¡Wiki extraída!", { id: loadingToast });
      } else throw new Error();
    } catch {
      toast.error("No se encontró en Wikipedia.", { id: loadingToast });
    }
  };

  const handleFetchRawgReqs = async () => {
    if (!title) return toast.error("Escribe el Título primero.");
    const loadingToast = toast.loading("Buscando en RAWG...");
    const RAWG_API_KEY = "fb2e089631fa42b38e2eae725740998c"; 
    try {
      const sRes = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(title)}&key=${RAWG_API_KEY}&page_size=3`);
      const sData = await sRes.json();
      if (!sData.results?.length) throw new Error();
      const bestId = sData.results[0].id;
      const dRes = await fetch(`https://api.rawg.io/api/games/${bestId}?key=${RAWG_API_KEY}`);
      const dData = await dRes.json();
      let raw = dData.platforms?.find((p: any) => p.platform.slug === 'pc')?.requirements?.minimum;
      if (raw) {
        setReqMinimos(translateRawgRequirements(raw) || "");
        toast.success("¡Requisitos actualizados!", { id: loadingToast });
      } else throw new Error();
    } catch {
      toast.error("Sin datos en RAWG.", { id: loadingToast });
    }
  };

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedGame) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('cover_url', coverUrl);
    formData.append('captura', captura);
    formData.append('platform', platform);
    formData.append('requeriments', requeriments);
    formData.append('reqMinimos', reqMinimos); 
    formData.append('fileSize', size);
    formData.append('version', version);
    formData.append('password', password);
    formData.append('creditSource', creditSource);
    formData.append('content', description); 
    formData.append('instructions', instructions);
    formData.append('genres', selectedGenres.join(", ")); 
    formData.append('links_json', JSON.stringify(links));
    const res = await updateGame(selectedGame.id, formData);
    if (res.success) {
      toast.success("Juego actualizado");
      setGames(games.map(g => g.id === selectedGame.id ? { ...g, title, cover_url: coverUrl, platform } : g));
    } else toast.error(res.message);
    setLoading(false);
  }

  const toggleGenre = (genre: string) => setSelectedGenres((prev) => prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]);
  const handleLinkChange = (index: number, key: string, value: string) => { const newLinks = [...links]; newLinks[index] = { ...newLinks[index], [key]: value }; setLinks(newLinks); };
  const addLink = () => setLinks([...links, { label: "NUEVO LINK", link: "", type: "MAIN" }]);
  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index));
  const handleCambiarLetra = (letra: string) => { if (letra === currentLetra) return; setIsChangingLetter(true); setSelectedGame(null); router.push(`?letra=${letra}`); };
  async function handleDelete() { if (!selectedGame) return; if (window.confirm(`¿Borrar "${selectedGame.title}"?`)) { setLoading(true); const res = await deleteGame(selectedGame.id); if (res.success) { setGames(games.filter(g => g.id !== selectedGame.id)); setSelectedGame(null); } setLoading(false); } }

  const filteredGames = games.filter(g => g.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`flex h-screen ${theme.bgApp} font-sans overflow-hidden pt-[80px]`}>
      
      {/* LATERAL (ABECEDARIO) */}
      <aside className="w-72 lg:w-80 border-r border-[#dfb4b9]/40 flex flex-col bg-[#f8f5f5] z-10 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-4 border-b border-[#dfb4b9]/40 bg-white flex flex-col gap-3">
          <div className="flex overflow-x-auto custom-scrollbar pb-1 gap-1">
            {ABECEDARIO.map(letra => (
              <button key={letra} onClick={() => handleCambiarLetra(letra)} className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all ${currentLetra === letra ? 'bg-[#9b62a6] text-white shadow-sm' : 'bg-[#f8f5f5] text-[#a87ca0] hover:bg-[#e8c4df] border border-transparent hover:border-[#dfb4b9]'}`}>{letra}</button>
            ))}
          </div>
          <div className="relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a87ca0]" />
            <input type="text" placeholder={`Buscar en ${currentLetra}...`} className={`w-full bg-white border border-[#c47b98] rounded-xl pl-9 pr-3 py-2 text-xs font-bold ${theme.textMain} placeholder-[#a87ca0] focus:outline-none focus:ring-1 focus:ring-[#dfb4b9] shadow-sm`} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {isChangingLetter && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9b62a6]"></div></div>}
          {filteredGames.map(game => (
            <div key={game.id} onClick={() => setSelectedGame(game)} className={`p-3 border-b border-[#dfb4b9]/30 cursor-pointer flex items-center gap-3 transition-colors ${selectedGame?.id === game.id ? 'bg-[#e8c4df]/50 border-l-4 border-l-[#9b62a6]' : 'hover:bg-[#e8c4df]/20 border-l-4 border-l-transparent'}`}>
               <div className="w-10 h-14 bg-white rounded-lg overflow-hidden shrink-0 border border-[#dfb4b9]/50 shadow-sm flex items-center justify-center">{game.cover_url ? <img src={game.cover_url} className="w-full h-full object-cover"/> : <div className="text-[10px] text-[#a87ca0] font-bold">?</div>}</div>
               <div className="overflow-hidden flex-1">
                 <p className={`text-[11px] font-black truncate ${theme.textMain} uppercase tracking-tight`}>{game.title}</p>
                 <span className={`inline-block mt-1 text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${game.platform === 'PS2' ? 'bg-blue-100 text-blue-700' : 'bg-[#e6e0e3] text-[#9b62a6]'}`}>{game.platform || 'PC'}</span>
               </div>
            </div>
          ))}
        </div>
      </aside>

      {/* EDITOR */}
      <main className="flex-1 p-3 md:p-6 overflow-hidden flex flex-col bg-[#e6e0e3]">
        {selectedGame ? (
          <form onSubmit={handleUpdate} className={`w-full h-full flex flex-col ${theme.bgCard} rounded-2xl shadow-sm border ${theme.border} overflow-hidden animate-in fade-in`}>
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#dfb4b9]/40 bg-[#f8f5f5] shrink-0">
              <h2 className={`text-xl font-black ${theme.textMain} truncate uppercase tracking-tight flex items-center gap-2`}>✏️ {title || 'Editando...'}</h2>
              <div className="flex gap-3 shrink-0">
                <button type="button" onClick={handleDelete} disabled={loading} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"><Trash2 className="w-3.5 h-3.5" /> Borrar</button>
                <button type="submit" disabled={loading} className={`px-5 py-2 ${theme.btnPurple} rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-1.5`}>{loading ? 'Guardando...' : <><Save className="w-3.5 h-3.5" /> Guardar Cambios</>}</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2"><InputField label="Título" value={title} onChange={(e:any) => setTitle(e.target.value)} required /></div>
                <div><ThemedPillSelector label="Plataforma" options={PLATFORMS} selected={platform} onChange={setPlatform} /></div>
                <div><InputField label="Peso" value={size} onChange={(e:any) => setSize(e.target.value)} /></div>
                <div><InputField label="Versión" value={version} onChange={(e:any) => setVersion(e.target.value)} /></div>
              </div>

              {/* REQUISITOS (BOTÓN GRANDE) */}
              <div className="bg-[#f8f5f5] p-5 rounded-2xl border border-[#dfb4b9]/30 space-y-3">
                <div className="flex justify-between items-center">
                  <label className={`text-[11px] font-black ${theme.textMuted} uppercase tracking-widest flex items-center gap-2`}><Cpu size={15}/> Requisitos del Sistema (Texto)</label>
                  <button 
                    type="button" 
                    onClick={handleFetchRawgReqs} 
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-md bg-[#9b62a6] text-white hover:bg-[#83528c] hover:scale-105 active:scale-95"
                  >
                    <DownloadCloud size={14} /> Extraer RAWG
                  </button>
                </div>
                <textarea rows={4} value={reqMinimos} onChange={(e) => setReqMinimos(e.target.value)} className={`w-full ${theme.bgApp} border border-transparent focus:${theme.border} p-4 rounded-xl text-xs outline-none ${theme.textMain} font-mono resize-y shadow-inner`} placeholder="Pega aquí los requisitos traducidos..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
                <div><ThemedPillSelector label="Géneros" options={EXACT_GENRES} selected={selectedGenres} onChange={toggleGenre} isMultiple /></div>
                <div><ThemedPillSelector label="Categoría Recursos" options={["Bajos", "Medios", "Altos"]} selected={requeriments} onChange={setRequirements} /></div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 bg-[#f8f5f5] p-5 rounded-2xl border border-[#dfb4b9]/30">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest`}>Portada (Grid)</label>
                      <button 
                        type="button" 
                        onClick={handleSearchCover} 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-[#e8c4df] text-[#2d1b30] hover:bg-[#dfb4b9] transition-all shadow-sm"
                      >
                        <Search size={12}/> Buscar Grids
                      </button>
                    </div>
                    <div className="flex gap-2"><div className="w-12 h-16 bg-white rounded-lg border overflow-hidden shrink-0 shadow-sm">{coverUrl && <img src={coverUrl} className="w-full h-full object-cover" />}</div><input className={`flex-1 ${theme.bgApp} p-3 rounded-xl text-xs outline-none ${theme.textMain} font-mono shadow-inner`} value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest`}>Fondo (Hero)</label>
                      <button 
                        type="button" 
                        onClick={handleSearchCaptura} 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-[#e8c4df] text-[#2d1b30] hover:bg-[#dfb4b9] transition-all shadow-sm"
                      >
                        <Search size={12}/> Buscar Heroes
                      </button>
                    </div>
                    <div className="flex gap-2"><div className="w-20 h-12 bg-white rounded-lg border overflow-hidden shrink-0 shadow-sm">{captura && <img src={captura} className="w-full h-full object-cover" />}</div><input className={`flex-1 ${theme.bgApp} p-3 rounded-xl text-xs outline-none ${theme.textMain} font-mono shadow-inner`} value={captura} onChange={(e) => setCaptura(e.target.value)} /></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <InputField label="Contraseña" value={password} onChange={(e:any) => setPassword(e.target.value)} />
                  <InputField label="Fuente / Créditos" value={creditSource} onChange={(e:any) => setCreditSource(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={`text-[11px] font-black ${theme.textMuted} uppercase tracking-widest`}>Descripción</label>
                    <button 
                      type="button" 
                      onClick={handleFetchWikipedia} 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-md bg-[#c47b98] text-white hover:bg-[#b06a87]"
                    >
                      <BookOpen size={14}/> Extraer Wikipedia
                    </button>
                  </div>
                  <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} required className={`w-full ${theme.bgApp} border border-transparent focus:${theme.border} p-4 rounded-2xl text-xs outline-none ${theme.textMain} resize-y shadow-inner leading-relaxed`} />
                </div>
                <div>
                  <label className={`text-[11px] font-black ${theme.textMuted} uppercase tracking-widest mb-1.5 block`}>Instrucciones</label>
                  <textarea rows={6} value={instructions} onChange={(e) => setInstructions(e.target.value)} required className={`w-full ${theme.bgApp} border border-transparent focus:${theme.border} p-4 rounded-2xl text-xs outline-none ${theme.textMain} font-mono resize-y shadow-inner`} />
                </div>
              </div>

              {/* LINKS */}
              <div className="border border-[#dfb4b9]/50 rounded-2xl p-5 bg-white">
                <div className="flex justify-between items-center mb-4"><label className={`text-[11px] font-black ${theme.textMuted} uppercase tracking-widest`}>Enlaces de Descarga</label><button type="button" onClick={addLink} className={`px-4 py-2 ${theme.btnPink} rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-2 hover:scale-105 active:scale-95 transition-all`}><Plus size={14} /> Añadir Link</button></div>
                <div className="space-y-2">
                  {links.map((link: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input type="text" value={link.label} onChange={(e) => handleLinkChange(index, 'label', e.target.value)} className="bg-[#f8f5f5] text-[#9b62a6] font-black uppercase text-[10px] rounded-lg px-3 py-2.5 w-32 border outline-none text-center shadow-sm" />
                      <input type="text" value={link.link} onChange={(e) => handleLinkChange(index, 'link', e.target.value)} className={`flex-1 ${theme.bgApp} text-[#2d1b30] text-xs rounded-lg px-3 py-2.5 border outline-none font-mono shadow-inner`} />
                      <button type="button" onClick={() => removeLink(index)} className="bg-red-50 hover:bg-red-500 text-red-400 hover:text-white p-2.5 rounded-lg transition-colors shadow-sm"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </form>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#c47b98] opacity-40"><Gamepad2 className="w-20 h-20 mb-4" /><h2 className="text-xl font-black uppercase tracking-widest">Selecciona un juego</h2></div>
        )}
      </main>
    </div>
  )
}

function InputField({ label, ...props }: any) {
  return (
    <div>
      <label className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest mb-1.5 block`}>{label}</label>
      <input className={`w-full ${theme.bgApp} border border-transparent focus:${theme.border} p-3 rounded-xl text-xs outline-none ${theme.textMain} font-medium transition-all shadow-inner`} {...props} />
    </div>
  )
}

function ThemedPillSelector({ label, options, selected, onChange, isMultiple = false }: any) {
  return (
    <div>
      <label className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest mb-1.5 block`}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => {
          const isSelected = isMultiple ? selected.includes(opt) : selected === opt;
          return (
            <button key={opt} type="button" onClick={() => onChange(opt)} className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? `${theme.btnPurple} shadow-md` : `bg-[#f8f5f5] ${theme.textMuted} border border-[#dfb4b9]/50 hover:bg-[#e8c4df]/30 hover:border-[#dfb4b9]`}`}>{opt}</button>
          )
        })}
      </div>
    </div>
  )
}