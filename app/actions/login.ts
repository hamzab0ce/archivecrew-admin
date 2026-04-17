'use server';

import { generateAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginFormState =
  | {
      error: string;
    }
  | undefined;

export default async function Login(state: LoginFormState, formData: FormData) {
  const fields = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  if (!fields.username || !fields.password) {
    return { error: "IDENTIFICACIÓN RECHAZADA: Campos vacíos" };
  }

  let role = "";
  let finalUsername = "";

  // 👑 1. RUTA DEL ADMINISTRADOR SUPREMO (Tú)
  if (
    fields.username === process.env.ADMIN_USERNAME &&
    fields.password === process.env.ADMIN_PASSWORD
  ) {
    role = "admin";
    finalUsername = fields.username;
  } 
  // 🛠️ 2. RUTA DEL AYUDANTE GLOBOTROTTER (Benslay y los demás)
  // Nota: Cualquiera que ponga la contraseña de ayudante entra, pero se guarda el nombre que hayan escrito.
  else if (fields.password === process.env.HELPER_PASSWORD) {
    role = "helper";
    // Limpiamos espacios y capitalizamos la primera letra por si escriben "benslay" en vez de "Benslay"
    finalUsername = fields.username.trim().charAt(0).toUpperCase() + fields.username.trim().slice(1);
  } 
  // ❌ 3. INTRUSO
  else {
    return { error: "ACCESO DENEGADO: Credenciales incorrectas" };
  }

  // 🎟️ CREAMOS EL PASE VIP CON SU NOMBRE Y SU ROL
  // (Nota: asegúrate de que en lib/auth tu función acepte el rol, si no, solo guardará el username y ya está bien por ahora)
  const accessToken = await generateAccessToken({ 
    username: finalUsername,
    role: role 
  });  

  const cookieStore = await cookies();
  
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 día entero
    path: "/",
  });  

  // REDIRECCIÓN A LA BASE DE OPERACIONES
  redirect("/panel");
}