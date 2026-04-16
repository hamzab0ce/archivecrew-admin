"use client";

interface PillSelectorProps {
  label: string;
  options: string[];
  selected: string | string[]; // Acepta uno o varios seleccionados
  onChange: (option: string) => void;
}

export default function PillSelector({
  label,
  options,
  selected,
  onChange,
}: PillSelectorProps) {
  
  // Función para saber si un botón debe estar pintado de azul
  const isActive = (option: string) => {
    if (Array.isArray(selected)) {
      return selected.includes(option);
    }
    return selected === option;
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      
      <div className="flex flex-wrap gap-2 p-3 bg-black/20 rounded-lg border border-zinc-800">
        {options.map((option) => {
          const active = isActive(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-200 select-none ${
                active
                  ? "bg-cyan-500 text-black border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-cyan-500 hover:text-white"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
