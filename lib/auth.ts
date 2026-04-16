import { SignJWT } from "jose";

export const generateAccessToken = async ({
  username,
}: {
  username: string;
}) => {
  return await new SignJWT({ username: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
};
