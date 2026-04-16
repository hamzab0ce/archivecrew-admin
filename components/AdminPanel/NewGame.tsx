"use client";

import { useState } from "react";
import toast from "react-hot-toast";

// Formulario de Links intacto (tu archivo externo)
import DownloadLinksForm, { LinkInput } from "./DownloadsLinks"; 
import { Image as ImageIcon, Info, Layers, Link as LinkIcon, Edit3, Search, BookOpen, RotateCcw, Cpu, DownloadCloud } from "lucide-react";

const theme = {
  bgApp: 'bg-[#e6e0e3]', 
  bgCard: 'bg-white',
  textMain: 'text-[#2d1b30]', 
  textMuted: 'text-[#9b62a6]', 
  border: 'border-[#dfb4b9]/50', 
  btnPurple: 'bg-[#9b62a6] hover:bg-[#83528c] text-white', 
  btnPink: 'bg-[#c47b98] hover:bg-[#b06a87] text-white', 
  btnLight: 'bg-[#e8c4df] hover:bg-[#dfb4b9] text-[#2d1b30]' 
};

const EXACT_GENRES = [
  "ACCIÓN", "INDIE", "AVENTURA", "SIMULACIÓN", "ROL (RPG)", 
  "ESTRATEGIA", "CASUAL", "SHOOTER", "CARRERAS", "DEPORTES", 
  "PLATAFORMAS", "PUZLES", "ARCADE", "LUCHA", "OTROS"
];

const PLATFORMS = ["PC", "ANDROID"];

const INSTRUCTION_TEMPLATES = [
  { 
    label: "Portable", 
    text: "1. Descarga todas las partes y extrae el juego.\n2. Entra en la carpeta extraída.\n3. Ejecuta el archivo principal (.exe) como Administrador.\n\n📌 ¡A jugar! Versión portable, no requiere instalación ni aplicar cracks." 
  },
  { 
    label: "Instalador / ISO", 
    text: "1. Descarga y extrae los archivos RAR.\n2. Monta el archivo .ISO (en Windows 10/11 basta con hacer doble clic sobre él).\n3. Ejecuta el 'Setup.exe' e instala el juego.\n4. Ve a la unidad que montaste, entra en la carpeta 'Crack' (RUNE, FLT, TENOKE...), copia todos los archivos y pégalos en la carpeta de instalación.\n\n📌 Recuerda ejecutar siempre el juego como Administrador." 
  }
];

// --- FUNCION TRADUCTORA DE RAWG (Igual que en el Script) ---
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


export default function NewGameForm() {
  const [formState, setFormState] = useState<{ error: any | null }>({ error: null });

  // Estados controlados
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [captura, setCaptura] = useState("");
  const [requeriments, setRequirements] = useState("Bajos"); // La Categoría antigua
  const [reqMinimos, setReqMinimos] = useState(""); // NUEVO: El texto largo
  const [downloadLinks, setDownloadLinks] = useState<LinkInput[]>([]);
  const [platform, setPlatform] = useState("PC");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [size, setSize] = useState("");      
  const [version, setVersion] = useState(""); 
  const [creditSource, setCreditSource] = useState(""); 
  const [password, setPassword] = useState("");

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]);
  };

  const handleSearchCover = () => {
    if (!title) return toast.error("Escribe un título primero", { style: { borderRadius: '1rem' }});
    window.open(`https://www.steamgriddb.com/search/grids?term=${encodeURIComponent(title)}`, '_blank');
  };

  const handleSearchCaptura = () => {
    if (!title) return toast.error("Escribe un título primero", { style: { borderRadius: '1rem' }});
    window.open(`https://www.steamgriddb.com/search/heroes?term=${encodeURIComponent(title)}`, '_blank');
  };

  const handleFetchWikipedia = async () => {
    if (!title) return toast.error("Escribe el Título del juego arriba primero.", { style: { borderRadius: '1rem' }});
    const loadingToast = toast.loading("Leyendo la Wikipedia...", { style: { borderRadius: '1rem' }});
    try {
      const res = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      if (!res.ok) throw new Error("No encontrado");
      const data = await res.json();
      if (data.extract) {
        setDescription(data.extract);
        toast.success("¡Texto extraído con éxito!", { id: loadingToast, style: { borderRadius: '1rem' }});
      } else {
        throw new Error("Sin contenido");
      }
    } catch (error) {
      toast.error("No se encontró en Wikipedia. Usa el texto por defecto.", { id: loadingToast, style: { borderRadius: '1rem' }});
    }
  };

  const handleDefaultDescription = () => {
    if (!title) return toast.error("Escribe el Título del juego arriba primero.", { style: { borderRadius: '1rem' }});
    setDescription(`Descarga ${title} para PC en ArchiveCrew.`);
    toast.success("Texto por defecto aplicado", { icon: '✨', style: { borderRadius: '1rem' }});
  };

  // ✨ MAGIA: Función para extraer requisitos de RAWG
  const handleFetchRawgReqs = async () => {
    if (!title) return toast.error("Escribe el Título del juego arriba primero.", { style: { borderRadius: '1rem' }});
    const loadingToast = toast.loading("Buscando en RAWG...", { style: { borderRadius: '1rem' }});
    
    // 🔥 IMPORTANTE: Debes asegurarte de poner tu API Key real de RAWG aquí o sacarla del .env
    const RAWG_API_KEY = "fb2e089631fa42b38e2eae725740998c"; 
    
    try {
      const searchRes = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(title)}&key=${RAWG_API_KEY}&page_size=3`);
      const searchData = await searchRes.json();

      if (!searchData.results || searchData.results.length === 0) {
        throw new Error("No encontrado");
      }

      let bestMatch = searchData.results[0];
      for (const res of searchData.results) {
        if (res.name.toLowerCase() === title.toLowerCase()) {
          bestMatch = res;
          break;
        }
      }

      const detailRes = await fetch(`https://api.rawg.io/api/games/${bestMatch.id}?key=${RAWG_API_KEY}`);
      const detailData = await detailRes.json();

      let rawReqs = null;
      if (detailData.platforms) {
        const pcPlatform = detailData.platforms.find((p: any) => p.platform.slug === 'pc' || p.platform.id === 4);
        if (pcPlatform && pcPlatform.requirements) {
          if (typeof pcPlatform.requirements === 'string') rawReqs = pcPlatform.requirements;
          else if (pcPlatform.requirements.minimum) rawReqs = pcPlatform.requirements.minimum;
        }
      }

      if (rawReqs && rawReqs.length > 10) {
        const textoTraducido = translateRawgRequirements(rawReqs);
        setReqMinimos(textoTraducido || "");
        toast.success("¡Requisitos extraídos y traducidos!", { id: loadingToast, style: { borderRadius: '1rem' }});
      } else {
        throw new Error("Sin requisitos de PC");
      }
    } catch (error) {
      toast.error("RAWG no tiene los requisitos. ¡Escríbelos a mano!", { id: loadingToast, style: { borderRadius: '1rem' }});
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedGenres.length === 0) {
      return toast.error("⚠️ DEBES seleccionar al menos 1 GÉNERO.", { style: { borderRadius: '1rem', background: '#fee2e2', color: '#991b1b' }});
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("cover_url", coverUrl);
    formData.append("captura", captura);
    formData.append("password", password);
    formData.append("description", description);
    formData.append("requeriments", requeriments); // Categoría (Bajos/Medios/Altos)
    formData.append("reqMinimos", reqMinimos); // NUEVO: Texto Largo de RAWG
    formData.append("download_links", JSON.stringify(downloadLinks));
    formData.append("platform", platform);
    formData.append("genres", selectedGenres.join(", "));
    formData.append("instructions", instructions);
    formData.append("fileSize", size); 
    formData.append("version", version);
    formData.append("creditSource", creditSource);

    const loadingToast = toast.loading("Subiendo juego al catálogo...", { style: { borderRadius: '1rem', background: '#333', color: '#fff' }});

    try {
      const response = await fetch("/api/games", { method: "POST", body: formData });
      const result = await response.json();
      setFormState(result);

      toast.dismiss(loadingToast);
      if (response.ok) toast.success("¡Juego creado correctamente!", { icon: '🚀', style: { borderRadius: '1rem', background: '#9b62a6', color: '#fff' }});
      if (result.error) toast.error("Error al crear el juego", { style: { borderRadius: '1rem' }});
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Fallo de conexión", { style: { borderRadius: '1rem' }});
    }
  };

  return (
    <div className={`min-h-screen py-12 px-6 md:px-12 font-sans flex justify-center ${theme.bgApp}`}>
      
      <form onSubmit={handleSubmit} className={`w-full max-w-5xl ${theme.bgCard} border ${theme.border} shadow-sm rounded-[2.5rem] p-8 md:p-10 flex flex-col gap-8`}>
        
        <div className="border-b border-[#dfb4b9]/30 pb-4 mb-2">
          <h1 className={`text-3xl font-black ${theme.textMain} tracking-tight uppercase`}>Subir Nuevo Juego</h1>
          <p className={`${theme.textMuted} text-xs font-bold uppercase tracking-widest mt-1`}>Catálogo Principal ArchiveCrew</p>
        </div>

        {/* --- 1. DATOS GENERALES --- */}
        <div className="space-y-5">
          <SectionTitle icon={<Info size={16}/>} title="Datos Generales" />
          
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
            <InputField label="Título del Juego *" value={title} onChange={(e:any) => setTitle(e.target.value)} placeholder="Ej: Silent Hill, Call of Duty..." required autoFocus />
            <ThemedPillSelector label="Plataforma *" options={PLATFORMS} selected={platform} onChange={setPlatform} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="Tamaño (Peso) *" value={size} onChange={(e:any) => setSize(e.target.value)} placeholder="Ej: 45.2 GB" required />
            <InputField label="Versión o Release *" value={version} onChange={(e:any) => setVersion(e.target.value)} placeholder="Ej: ElAmigos v1.4" required />
            <ThemedPillSelector label="Categoría de Recursos *" options={["Bajos", "Medios", "Altos"]} selected={requeriments} onChange={setRequirements} />
          </div>

          <ThemedPillSelector label="Géneros (Mínimo 1) *" options={EXACT_GENRES} selected={selectedGenres} onChange={toggleGenre} isMultiple />
        </div>

        <hr className="border-[#dfb4b9]/30" />

        {/* --- NUEVA SECCIÓN: REQUISITOS (TEXTO LARGO) --- */}
        <div className="space-y-3 flex flex-col h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
                <SectionTitle icon={<Cpu size={16}/>} title="Requisitos del Sistema" />
                
                {/* BOTÓN MÁGICO DE RAWG */}
                <button type="button" onClick={handleFetchRawgReqs} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all shadow-sm bg-white text-[#9b62a6] border border-[#dfb4b9]/50 hover:border-[#dfb4b9]`} title="Buscar en RAWG">
                    <DownloadCloud size={12} /> Extraer RAWG
                </button>
            </div>
            <textarea
                rows={5}
                onChange={(e) => setReqMinimos(e.target.value)}
                value={reqMinimos}
                placeholder="Pulsa el botón 'Extraer RAWG' o escribe/pega los requisitos a mano aquí (Opcional, si lo dejas en blanco usará la plantilla)."
                className={`w-full flex-1 ${theme.bgApp} border border-transparent focus:${theme.border} p-4 rounded-[1.5rem] text-sm outline-none ${theme.textMain} font-mono placeholder-[#a87ca0] resize-y custom-scrollbar shadow-inner leading-relaxed`}
            ></textarea>
        </div>

        <hr className="border-[#dfb4b9]/30" />

        {/* --- 2. MULTIMEDIA Y ACCESOS --- */}
        <div className="space-y-5">
          <SectionTitle icon={<ImageIcon size={16}/>} title="Multimedia y Credenciales" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest mb-2 flex justify-between items-center`}>
                    URL Portada (Pequeña) *
                    <button type="button" onClick={handleSearchCover} className="text-[#c47b98] hover:text-[#9b62a6] flex items-center gap-1 bg-[#f8f5f5] px-2 py-1 rounded-md transition-colors">
                        <Search size={12}/> Buscar Grids
                    </button>
                </label>
                <input required className={`w-full ${theme.bgApp} border border-transparent focus:${theme.border} p-3.5 rounded-2xl text-sm outline-none ${theme.textMain} font-mono placeholder-[#a87ca0] transition-all shadow-inner`} value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div>
                <label className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest mb-2 flex justify-between items-center`}>
                    URL Captura (Fondo) *
                    <button type="button" onClick={handleSearchCaptura} className="text-[#c47b98] hover:text-[#9b62a6] flex items-center gap-1 bg-[#f8f5f5] px-2 py-1 rounded-md transition-colors">
                        <Search size={12}/> Buscar Heroes
                    </button>
                </label>
                <input required className={`w-full ${theme.bgApp} border border-transparent focus:${theme.border} p-3.5 rounded-2xl text-sm outline-none ${theme.textMain} font-mono placeholder-[#a87ca0] transition-all shadow-inner`} value={captura} onChange={(e) => setCaptura(e.target.value)} placeholder="https://..." />
            </div>

            <InputField label="Contraseña (Opcional)" value={password} onChange={(e:any) => setPassword(e.target.value)} placeholder="Ej: archivecrew.com" />
            <InputField label="Fuente / Créditos *" value={creditSource} onChange={(e:any) => setCreditSource(e.target.value)} placeholder="Ej: ElAmigos, GOG, Comunidad..." required />
          </div>
        </div>

        <hr className="border-[#dfb4b9]/30" />

        {/* --- 3. ENLACES Y TEXTOS --- */}
        <div className="space-y-6">
          <div>
              <SectionTitle icon={<LinkIcon size={16}/>} title="Enlaces de Descarga" />
              <div className="bg-[#f8f5f5] p-5 rounded-[2rem] border border-[#dfb4b9]/50 mt-3">
                  <DownloadLinksForm onChange={setDownloadLinks} /> 
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
            
            {/* --- INSTRUCCIONES --- */}
            <div className="flex flex-col h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <SectionTitle icon={<Layers size={16}/>} title="Instrucciones *" />
                <div className="flex gap-2">
                  {INSTRUCTION_TEMPLATES.map((t, idx) => (
                    <button key={idx} type="button" onClick={() => setInstructions(t.text)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all shadow-sm ${instructions === t.text ? theme.btnPink : 'bg-white text-[#a87ca0] border border-[#dfb4b9]/50 hover:border-[#dfb4b9]'}`}>
                        {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                required
                rows={6}
                onChange={(e) => setInstructions(e.target.value)}
                value={instructions}
                placeholder="Haz clic en una plantilla arriba o escribe las tuyas propias... (Obligatorio)"
                className={`w-full flex-1 ${theme.bgApp} border border-transparent focus:${theme.border} p-4 rounded-[1.5rem] text-sm outline-none ${theme.textMain} font-mono placeholder-[#a87ca0] resize-y custom-scrollbar shadow-inner`}
              ></textarea>
            </div>

            {/* --- DESCRIPCIÓN --- */}
            <div className="flex flex-col h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <SectionTitle icon={<Edit3 size={16}/>} title="Descripción *" />
                  
                  <div className="flex gap-2">
                    <button type="button" onClick={handleFetchWikipedia} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all shadow-sm bg-white text-[#9b62a6] border border-[#dfb4b9]/50 hover:border-[#dfb4b9]`}>
                        <BookOpen size={12} /> Extraer Wiki
                    </button>
                    <button type="button" onClick={handleDefaultDescription} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all shadow-sm bg-white text-[#c47b98] border border-[#dfb4b9]/50 hover:border-[#dfb4b9]`}>
                        <RotateCcw size={12} /> Reset/Default
                    </button>
                  </div>
              </div>

              <textarea
                required
                rows={6}
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                placeholder="Extrae la Wiki, usa el texto por defecto o escribe a mano..."
                className={`w-full flex-1 ${theme.bgApp} border border-transparent focus:${theme.border} p-4 rounded-[1.5rem] text-sm outline-none ${theme.textMain} placeholder-[#a87ca0] resize-y custom-scrollbar shadow-inner`}
              ></textarea>
            </div>

          </div>
        </div>

        {formState.error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-xs font-bold space-y-1">
            {!Array.isArray(formState.error) && typeof formState.error === "object"
              ? Object.entries(formState.error).map(([key, value]) => (
                  <p key={key}>⚠️ {Array.isArray(value) ? (value as string[]).join(", ") : (value as string)}</p>
                ))
              : Array.isArray(formState.error) && (formState.error as string[]).map((error, index) => <p key={index}>⚠️ {error}</p>)}
          </div>
        )}

        <button type="submit" className={`w-full mt-4 ${theme.btnPurple} py-5 rounded-[2rem] text-sm uppercase font-black tracking-widest shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all`}>
          Guardar y Subir Juego
        </button>
      </form>
    </div>
  );
}

// --- SUB-COMPONENTES ---

function SectionTitle({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <h2 className={`text-sm font-black ${theme.textMain} uppercase tracking-widest flex items-center gap-2 mb-1`}>
      <span className={theme.textMuted}>{icon}</span> {title}
    </h2>
  )
}

function InputField({ label, ...props }: any) {
  return (
    <div>
      <label className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest mb-2 block`}>{label}</label>
      <input 
        className={`w-full ${theme.bgApp} border border-transparent focus:${theme.border} p-3.5 rounded-2xl text-sm outline-none ${theme.textMain} placeholder-[#a87ca0] font-medium transition-all shadow-inner`}
        {...props}
      />
    </div>
  )
}

function ThemedPillSelector({ label, options, selected, onChange, isMultiple = false }: any) {
  return (
    <div>
      <label className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest mb-2 block`}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => {
          const isSelected = isMultiple ? selected.includes(opt) : selected === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isSelected 
                  ? `${theme.btnPurple} shadow-md` 
                  : `bg-white ${theme.textMuted} border border-[#dfb4b9]/50 hover:bg-[#e8c4df]/30`
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}