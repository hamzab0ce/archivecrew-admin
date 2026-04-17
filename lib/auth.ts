import { SignJWT } from "jose";

export const generateAccessToken = async ({
  username,
  role, // 🔥 1. Recibimos el rol
}: {
  username: string;
  role?: string; // 🔥 2. Le decimos a TypeScript que el rol existe (y es opcional)
}) => {
  // 🔥 3. Metemos el username Y el role dentro del token
  return await new SignJWT({ username: username, role: role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
};