import Image from "next/image";
import CarruselExperiencias from "@/components/CarruselExperiencias";
import ExperienciasPopulares from "@/components/ExperienciasPopulares";
import BotonCTA2 from "@/components/botonCTA2";

// Definir la forma de los datos de Excursión desde la API de WP
interface Excursion {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  precio: string; // El campo personalizado que añadimos
  tagline: string; // El campo personalizado que añadimos
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
  link: string;
}

import { Settings } from "@/types/settings";
import { sortExcursionsByTitleAsc } from "@/lib/excursionSort";

// ... (Excursion interface remains)

async function getSettings(): Promise<Settings> {
  const apiUrl = (process.env.WP_BUILD_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://back.mayaadrenaline.com.mx') || 'https://back.mayaadrenaline.com.mx');
  try {
    const res = await fetch(`${apiUrl}/wp-json/maya-adrenaline/v1/settings`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch settings");
    return res.json();
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {} as Settings;
  }
}

async function getExcursiones(): Promise<Excursion[]> {
  // ... (unchanged fetch logic)
  const apiUrl = (process.env.WP_BUILD_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://back.mayaadrenaline.com.mx') || 'https://back.mayaadrenaline.com.mx');
  const res = await fetch(`${apiUrl}/wp-json/wp/v2/excursion?_embed`, {
    next: { revalidate: 10 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export default async function Home() {
  const settingsData = getSettings();
  const excursionesData = getExcursiones();

  // Fetch in parallel. Handle excursiones error gracefully to allow render
  const [settings, excursionesResult] = await Promise.allSettled([settingsData, excursionesData]);

  const excursiones = sortExcursionsByTitleAsc(
    excursionesResult.status === 'fulfilled' ? excursionesResult.value : []
  );
  const fetchedSettings = settings.status === 'fulfilled' ? settings.value : {} as Settings;

  // Fallback URLs
  const defaultUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://back.mayaadrenaline.com.mx') || '';
  const heroImage = fetchedSettings.home_hero_image || `${defaultUrl}/wp-content/uploads/2026/02/hero.webp`;
  const ctaImage = fetchedSettings.home_cta_image || `${defaultUrl}/wp-content/uploads/2026/02/bannerCTA.webp`;
  const vistazoHImage = fetchedSettings.home_vistazo_h_image || `${defaultUrl}/wp-content/uploads/2026/02/imgIzq.webp`;
  const vistazoVImage = fetchedSettings.home_vistazo_v_image || `${defaultUrl}/wp-content/uploads/2026/02/imgDer.webp`;

  if (excursionesResult.status === 'rejected') {
    console.error("Error loading excursions:", excursionesResult.reason);
    // Optional: Render error state if needed, but for now we proceed with empty list or previous behavior
  }


  return (
    <div className="min-h-screen font-sans">
      {/* Header eliminado: manejado por el layout */}

      {/* Sección Hero */}
      <section
        className="bg-black/30 bg-blend-overlay text-white pt-40 pb-20 md:py-20 text-center bg-cover bg-no-repeat min-h-screen flex items-center justify-center flex-col"
        style={{ backgroundImage: `url('${heroImage}')` }}
      >
        <div className="container mx-auto px-4">
          <h2 className="font-nunito md:text-7xl text-5xl font-extrabold mb-16 md:mb-8 text-center md:text-left text-white leading-tight">Historia <br /> y aventura</h2>

          <ExperienciasPopulares />

        </div>
      </section>

      {/* Sección Grid */}
      <main className="container mx-auto px-4 py-12 bg-ma-gris-claro w-full min-h-screen">


        <CarruselExperiencias excursiones={excursiones} />
      </main>



      { /* CTA  */}

      <section className="bg-ma-verdeazul py-24">
        <div className="container mx-auto px-4">
          <h3 className="text-white text-center text-2xl md:text-4xl font-bold mb-16 max-w-5xl mx-auto leading-tight font-nunito">
            Siempre nos esforzamos por transmitir la adrenalina
            de nuestras experiencias y la paz de la naturaleza.
          </h3>

          <div
            className="w-full max-w-6xl mx-auto bg-white rounded-[20px] md:rounded-[40px] p-8 md:p-20 relative overflow-hidden text-ma-verdeazul shadow-2xl"
            style={{
              backgroundImage: `url('${ctaImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative z-10 flex flex-col items-center">
              <p className="text-xl md:text-4xl font-extrabold text-center mb-8 md:mb-12 leading-snug font-nunito">
                “Fui con toda mi familia a MayaAdrenaline, fue la mejor desicion de mi vida, volveremos.”
              </p>

              <div className="w-full flex justify-end">
                <div className="text-right">
                  <p className="font-bold text-lg md:text-xl italic">Andrea Andrada</p>
                  <p className="text-md md:text-lg italic">Experiencia Full Day</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Vistazo Rápido */}
      <section className="py-24 bg-ma-gris-claro">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Columna Izquierda */}
            <div className="flex flex-col gap-8">
              <div className="relative w-full aspect-[4/3] rounded-[40px] overflow-hidden shadow-lg">
                <Image
                  src={vistazoHImage}
                  alt="Vista de las instalaciones"
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-ma-verdeazul mb-6 font-nunito">
                  Un vistazo rápido
                </h2>
                <p className="text-lg md:text-xl italic text-ma-verdeazul mb-8 font-montserrat max-w-lg">
                  Somos una empresa de turismo local, con más de 10 años de experiencia operando excursiones y actividades en la Riviera Maya.
                </p>

                <div className="flex justify-start">
                  <BotonCTA2 text="Conocenos" href="/nosotros" />
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="relative w-full h-[600px] md:h-[700px] group">
              {/* Image Container with Mask */}
              <div className="absolute inset-0 rounded-[40px] overflow-hidden shadow-lg">
                <Image
                  src={vistazoVImage}
                  alt="Explorando la naturaleza"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Overlay Card - Protruding */}
              <div className="absolute top-12 -right-6 md:-right-12 bg-ma-verde-fondo text-white p-8 md:p-10 rounded-[40px] max-w-[350px] md:max-w-[400px] shadow-2xl z-20">
                <h3 className="text-2xl md:text-4xl font-extrabold leading-tight font-nunito">
                  12 años creando experiencias increíbles
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer eliminado: manejado por el layout */}
    </div>
  );
}
