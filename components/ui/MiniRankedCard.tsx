import Link from "next/link";
import Image from "next/image";
import { generateSafeUrl } from "@/lib/slugify";

interface MiniRankedCardProps {
  id: number | string;
  title: string;
  image: string;
  rank: number;
  platform: string;
}

export default function MiniRankedCard({
  id,
  title,
  image,
  rank,
  platform,
}: MiniRankedCardProps) {
  const slug = generateSafeUrl(title);

  return (
    // Cambiado bg-slate por bg-background/80
    <Link
      prefetch={false}
      href={`/game/${slug}/${id}`}
      className="group flex items-center gap-4 w-full rounded-xl bg-background/80 hover:bg-surface border border-border/50 transition-colors px-4 py-3 shadow-sm"
    >
      {/* Círculo del número adaptado al color accent */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-[11px] font-black text-white shadow-inner">
        {rank}
      </div>

      <div className="relative w-14 h-18 overflow-hidden rounded-md flex-shrink-0 aspect-[3/4]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
        />
      </div>

      <div className="flex-1 min-w-0">
        {/* Texto cambiado a text-primary */}
        <p className="truncate text-[13px] font-semibold text-primary">
          {title}
        </p>
        {/* Etiqueta de plataforma adaptada */}
        <span className="mt-1 inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-secundary border border-border/30 uppercase">
          {platform}
        </span>
      </div>
    </Link>
  );
}