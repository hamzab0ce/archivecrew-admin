import Link from 'next/link';

export default function NotFound() {
  return (
    // pt-32 y pb-16 gestionan el espaciado para evitar choque con header/footer.
    // min-h-screen asegura centrado vertical profesional.
    <main className="flex min-h-screen flex-col items-center justify-center pt-32 pb-16 px-4 text-center font-sans">
      
      {/* 404 en el color morado de la paleta (imagen 2) */}
      <h1 className="text-8xl md:text-9xl font-extrabold tracking-tighter text-[#A66BA7] mb-2">
        404
      </h1>

      {/* Título en NEGRO para máxima accesibilidad, más pequeño y limpio */}
      <h2 className="text-3xl md:text-4xl font-bold text-black mb-8 tracking-tight">
        Página no encontrada
      </h2>
      
      {/* CUADRO BLANCO CON LETRAS NEGRAS - Máxima accesibilidad y visibilidad */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 text-left shadow-lg max-w-2xl mx-auto mb-12">
        <p className="font-semibold text-xl text-black mb-5">
          ¿Por qué ha pasado esto?
        </p>
        
        {/* Lista de causas en NEGRO puro */}
        <ul className="list-disc pl-6 space-y-3 text-base text-black leading-relaxed">
          <li>
            <span className="font-medium">Juego renombrado:</span> Es posible que hayamos actualizado el nombre del juego y la URL antigua ya no funcione.
          </li>
          <li>
            <span className="font-medium">Juego borrado:</span> El juego ha podido ser eliminado de la base de datos.
          </li>
          <li>
            <span className="font-medium">Error tipográfico:</span> Comprueba si has escrito mal la dirección en la barra del navegador.
          </li>
          <li>
            <span className="font-medium">Link incorrecto:</span> Si has llegado desde un enlace compartido, verifica que te lo hayan pasado completo.
          </li>
        </ul>
      </div>

      {/* Un solo botón profesional usando el color morado de la paleta (imagen 2) */}
      <Link 
        href="/"
        className="px-8 py-3 bg-[#A66BA7] text-white font-semibold rounded-full shadow-md hover:bg-[#8D578F] transition-all duration-200 text-base md:text-lg"
      >
        Volver a la página principal
      </Link>

    </main>
  );
}