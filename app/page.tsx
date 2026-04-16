import { redirect } from "next/navigation";

export default function Home() {
  // Redirige automáticamente al panel de administración
  redirect("/admin");
}
