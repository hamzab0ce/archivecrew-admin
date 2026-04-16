//"use server";
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
    username: formData.get("username"),
    password: formData.get("password"),
  };

  if (!fields.username || !fields.password) {
    return { error: "Los campos no pueden estar vacíos" };
  }

  if (
    fields.username !== process.env.ADMIN_USERNAME ||
    fields.password !== process.env.ADMIN_PASSWORD
  ) {
    return { error: "El usuario o la contraseña son incorrectos" };
  }  

  const accessToken = await generateAccessToken({ username: fields.username });  
  const cookieStore = await cookies();
  
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });  

  // REDIRECCIÓN CORREGIDA:
  redirect("/panel");
}