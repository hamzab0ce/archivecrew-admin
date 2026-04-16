import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. DEJAR PASAR RECURSOS DEL SISTEMA Y LA API DE LOGIN
  if (
    path.startsWith('/_next') || 
    path.startsWith('/api/auth') || 
    path === '/favicon.ico' || 
    path === '/favicon.png'
  ) {
    return NextResponse.next();
  }

  // 2. VERIFICAR SI HAY UN TOKEN VÁLIDO
  const token = request.cookies.get("access_token")?.value;
  let isAuth = false;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || "";
      await jwtVerify(token, new TextEncoder().encode(secret));
      isAuth = true; 
    } catch (error) {
      isAuth = false; 
    }
  }

  // 3. LÓGICA ESTRICTA DE REDIRECCIÓN (PANEL PRIVADO)
  
  // Si NO estás logueado y no estás ya en la pantalla de login (/admin)...
  if (!isAuth && path !== '/admin') {
    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.delete("access_token"); // Borra token por si estaba caducado
    return response;
  }

  // Si SÍ estás logueado y vas a la pantalla de login o la raíz...
  if (isAuth && (path === '/admin' || path === '/')) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  // Si estás logueado y vas al /panel, crear juegos, etc... ¡Adelante!
  return NextResponse.next();
}

// ESTO SE APLICA A TODO EL PROYECTO
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};