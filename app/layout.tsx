import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const montserratSans = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin - ArchiveCrew",
  description: "Panel de administración exclusivo",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="es">
      <body className={`${montserratSans.variable} min-h-screen w-full font-sans text-primary bg-background antialiased flex flex-col`}>
        <Toaster />
        <main className="flex-1 w-full">
           {children}
        </main>
      </body>
    </html>
  );
}
