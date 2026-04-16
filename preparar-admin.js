const fs = require('fs');
const path = require('path');

// --- UTILIDADES ---
function deleteItem(itemPath) {
    if (fs.existsSync(itemPath)) {
        const stats = fs.lstatSync(itemPath);
        if (stats.isDirectory()) {
            fs.rmSync(itemPath, { recursive: true, force: true });
            console.log(`🗑️  Carpeta eliminada: ${itemPath}`);
        } else {
            fs.rmSync(itemPath, { force: true });
            console.log(`🗑️  Archivo eliminado: ${itemPath}`);
        }
    }
}

function renameItem(oldPath, newPath) {
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`🔄 Renombrado: ${oldPath} ➔ ${newPath}`);
    }
}

function overwriteFile(filePath, content) {
    if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`📝 Archivo reescrito: ${filePath}`);
    }
}

// --- 1. BORRAR LA WEB PÚBLICA ---
const itemsToDelete = [
    'app/about', 'app/ayuda', 'app/category', 'app/contact', 
    'app/game', 'app/genre', 'app/mantenimiento', 'app/platform', 
    'app/privacy', 'app/request', 'app/api',
    'components/Home', 'components/Game', 'components/Footer.tsx',
    'stores', 'backup', 'aura.js'
];

console.log("Iniciando protocolo de limpieza...");
itemsToDelete.forEach(item => deleteItem(path.join(__dirname, item)));

// --- 2. RESUCITAR EL ADMIN ---
renameItem(path.join(__dirname, 'app/_admin'), path.join(__dirname, 'app/admin'));
renameItem(path.join(__dirname, 'app/_panel'), path.join(__dirname, 'app/panel'));
renameItem(path.join(__dirname, 'app/_api'), path.join(__dirname, 'app/api'));
renameItem(path.join(__dirname, 'middleware.ts.bak'), path.join(__dirname, 'middleware.ts'));

// --- 3. REDIRECCIÓN DIRECTA A /ADMIN ---
const pageContent = `import { redirect } from "next/navigation";

export default function Home() {
  // Redirige automáticamente al panel de administración
  redirect("/admin");
}
`;
overwriteFile(path.join(__dirname, 'app/page.tsx'), pageContent);

// --- 4. LIMPIAR EL LAYOUT (Para que no busque el Header/Footer borrados) ---
const layoutContent = `import type { Metadata } from "next";
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
      <body className={\`\${montserratSans.variable} min-h-screen w-full font-sans text-primary bg-background antialiased flex flex-col\`}>
        <Toaster />
        <main className="flex-1 w-full">
           {children}
        </main>
      </body>
    </html>
  );
}
`;
overwriteFile(path.join(__dirname, 'app/layout.tsx'), layoutContent);

// --- 5. QUITAR EL CANDADO ESTÁTICO DE NEXT.CONFIG ---
const nextConfigPath = path.join(__dirname, 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
    let configContent = fs.readFileSync(nextConfigPath, 'utf8');
    // Busca y destruye la línea de output: 'export'
    configContent = configContent.replace(/output:\s*['"]export['"],?/g, '');
    fs.writeFileSync(nextConfigPath, configContent, 'utf8');
    console.log(`🔓 Cerrojo estático quitado de next.config.ts`);
}

console.log("✅ ¡PROYECTO LISTO! Ya puedes subir esto a Vercel.");