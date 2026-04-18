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

  // 2. VERIFICAR SI HAY UN TOKEN VÁLIDO Y EXTRAER EL ROL
  const token = request.cookies.get("access_token")?.value;
  let isAuth = false;
  let userRole = "helper"; // Por defecto, el rol más bajo

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || "";
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      isAuth = true; 
      userRole = payload.role as string; // 🔥 AQUÍ LEEMOS SI ES ADMIN
    } catch (error) {
      isAuth = false; 
    }
  }

  // 3. LÓGICA ESTRICTA DE REDIRECCIÓN (PANEL PRIVADO)
  
  // Si NO estás logueado y no estás ya en la pantalla secreta (/hq-access)...
  if (!isAuth && path !== '/hq-access') {
    const response = NextResponse.redirect(new URL("/hq-access", request.url));
    response.cookies.delete("access_token"); // Borra token por si estaba caducado
    return response;
  }

  // Si SÍ estás logueado y vas a la pantalla de login o la raíz...
  if (isAuth && (path === '/hq-access' || path === '/')) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  // 🛡️ 4. LA MURALLA VIP: PROTEGER RUTAS DE ADMIN
  // Añade aquí todas las rutas donde un ayudante NO deba pisar jamás
  const adminOnlyRoutes = ['/panel/pendientes']; 
  const isTryingToAccessAdminRoute = adminOnlyRoutes.some(r => path.startsWith(r));

  if (isAuth && isTryingToAccessAdminRoute && userRole !== 'admin') {
    console.log(`🛡️ Bloqueado acceso a ${path} para usuario con rol: ${userRole}`);
    // Patada de vuelta al panel principal
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  // Si estás logueado y vas al /panel permitido... ¡Adelante!
  return NextResponse.next();
}

// ESTO SE APLICA A TODO EL PROYECTO
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};