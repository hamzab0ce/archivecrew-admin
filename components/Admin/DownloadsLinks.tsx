"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

export type LinkInput = {
  label: string;
  link: string;
  type?: string;
};

const theme = {
  inputBg: 'bg-white',
};

export default function DownloadLinksForm({
  onChange,
}: {
  onChange?: (links: LinkInput[]) => void;
}) {
  const [mainUrl, setMainUrl] = useState("");
  const [mirror1Url, setMirror1Url] = useState("");
  const [mirror2Url, setMirror2Url] = useState("");

  useEffect(() => {
    const newLinks: LinkInput[] = [];

    if (mainUrl) newLinks.push({ label: "Link Directo", link: mainUrl, type: "MAIN" });
    if (mirror1Url) newLinks.push({ label: "Mirror 1", link: mirror1Url, type: "MIRROR" });
    if (mirror2Url) newLinks.push({ label: "Mirror 2", link: mirror2Url, type: "MIRROR" });

    onChange?.(newLinks);
  }, [mainUrl, mirror1Url, mirror2Url, onChange]);

  return (
    <div className="flex flex-col gap-4">
      {/* 🌟 LINK DIRECTO (PRINCIPAL) */}
      <div className="group">
        <label className="text-[9px] text-[#0ea5e9] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 pl-1">
           <Zap size={10} /> Link Directo (Principal)
        </label>
        {/* Aquí está la magia: overflow-hidden y border en el contenedor padre */}
        <div className="flex shadow-sm transition-all group-hover:shadow-md rounded-2xl overflow-hidden border border-[#2d1b30]">
          <div className="w-24 bg-[#2d1b30] text-white text-[9px] font-black px-3 flex items-center justify-center uppercase tracking-widest select-none border-r border-white/10">
            Link Directo
          </div>
          <input
            type="url"
            placeholder="https://... (Obligatorio)"
            className="flex-1 bg-[#2d1b30] text-white placeholder-[#a87ca0] px-4 py-3 text-xs font-mono outline-none"
            value={mainUrl}
            onChange={(e) => setMainUrl(e.target.value)}
            required
          />
        </div>
      </div>

      {/* 🔗 MIRROR 1 (SECUNDARIO) */}
      <div className="group">
        <label className="text-[9px] text-[#9b62a6] font-black uppercase tracking-widest mb-1.5 pl-1">
           Mirror 1 (Opcional)
        </label>
        <div className="flex shadow-sm rounded-2xl overflow-hidden border border-[#dfb4b9]/50 focus-within:border-[#9b62a6] transition-all">
          <div className="w-24 bg-[#9b62a6] text-white text-[9px] font-bold px-3 flex items-center justify-center uppercase tracking-widest select-none">
            Mirror 1
          </div>
          <input
            type="url"
            placeholder="https://..."
            className={`flex-1 ${theme.inputBg} text-[#2d1b30] placeholder-[#a87ca0] px-4 py-2.5 text-xs font-mono outline-none`}
            value={mirror1Url}
            onChange={(e) => setMirror1Url(e.target.value)}
          />
        </div>
      </div>

      {/* 🔗 MIRROR 2 (SECUNDARIO) */}
      <div className="group">
         <label className="text-[9px] text-[#9b62a6] font-black uppercase tracking-widest mb-1.5 pl-1">
           Mirror 2 (Opcional)
        </label>
        <div className="flex shadow-sm rounded-2xl overflow-hidden border border-[#dfb4b9]/50 focus-within:border-[#9b62a6] transition-all">
          <div className="w-24 bg-[#5c4b5f] text-white text-[9px] font-bold px-3 flex items-center justify-center uppercase tracking-widest select-none">
            Mirror 2
          </div>
          <input
            type="url"
            placeholder="https://..."
            className={`flex-1 ${theme.inputBg} text-[#2d1b30] placeholder-[#a87ca0] px-4 py-2.5 text-xs font-mono outline-none`}
            value={mirror2Url}
            onChange={(e) => setMirror2Url(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}