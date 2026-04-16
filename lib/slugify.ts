export function cleanSlug(text: string) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // Separa los acentos de las letras (ej. á -> a + ´)
    .replace(/[\u0300-\u036f]/g, "") // Aniquila los acentos
    .replace(/[^\w\s-]/g, "") // Destruye TODO lo que no sea letra, número o guion (adiós ®, ™, :, etc)
    .replace(/[\s_-]+/g, "-") // Convierte los espacios en guiones
    .replace(/^-+|-+$/g, ""); // Quita guiones sobrantes en las puntas
}

export function generateSafeUrl(title: string) {
  let slug = cleanSlug(title || "juego-sin-titulo");
  if (!slug.endsWith("-descargar-gratis")) {
    slug += "-descargar-gratis";
  }
  return slug;
}