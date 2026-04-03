import Image from 'next/image';
import { Settings } from '@/types/settings';

import ExcursionGrid from '@/components/ExcursionGrid';
import HeroCategoriesCarousel from '@/components/HeroCategoriesCarousel';

// Interface for Category from WP API
interface Category {
    id: number;
    name: string;
    slug: string;
    imagen: string | null;
    count: number;
}

// Interface for Activity from WP API (new taxonomy)
interface Activity {
    id: number;
    name: string;
    slug: string;
    imagen: string | null;
    count: number;
}

// Interface for Excursion
interface Excursion {
    id: number;
    slug: string;
    title: {
        rendered: string;
    };
    excerpt: {
        rendered: string;
    };
    categoria_excursion: number[];
    actividad_excursion: number[]; // Added new taxonomy
    _embedded?: {
        "wp:featuredmedia"?: Array<{
            source_url: string;
            alt_text: string;
        }>;
    };
}

// Fetch categories from WP API
async function getCategories(): Promise<Category[]> {
    try {
        const apiUrl = (process.env.WP_BUILD_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://back.mayaadrenaline.com.mx') || 'https://back.mayaadrenaline.com.mx');
        const res = await fetch(`${apiUrl}/wp-json/wp/v2/categoria_excursion?per_page=100`, {
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            console.error("Failed to fetch categories:", res.status, res.statusText);
            return [];
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching categories:", error);
        // Mock data to unblock build
        return [
            { id: 1, name: "Aventura", slug: "aventura", imagen: null, count: 5 },
            { id: 2, name: "Cultura", slug: "cultura", imagen: null, count: 3 }
        ];
    }
}

// Fetch activities from WP API
async function getActivities(): Promise<Activity[]> {
    try {
        const apiUrl = (process.env.WP_BUILD_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://back.mayaadrenaline.com.mx') || 'https://back.mayaadrenaline.com.mx');
        const res = await fetch(`${apiUrl}/wp-json/wp/v2/actividad_excursion?per_page=100`, {
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            // It might fail if no activities exist yet or taxonomy not registered on endpoint
            // console.error("Failed to fetch activities:", res.status, res.statusText);
            return [];
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching activities:", error);
        return [];
    }
}

// Fetch Excursions from WP API
async function getExcursiones(): Promise<Excursion[]> {
    try {
        const apiUrl = (process.env.WP_BUILD_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://back.mayaadrenaline.com.mx') || 'https://back.mayaadrenaline.com.mx');
        const res = await fetch(`${apiUrl}/wp-json/wp/v2/excursion?_embed&per_page=100&orderby=menu_order&order=asc`, {
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            console.error("Failed to fetch excursiones:", res.status, res.statusText);
            return [];
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching excursiones:", error);
        // Return nothing if fails, page will act as if empty
        return [];
    }
}



// Fetch Settings
async function getSettings(): Promise<Settings> {
    const apiUrl = (process.env.WP_BUILD_URL || (process.env.NEXT_PUBLIC_API_URL || 'https://back.mayaadrenaline.com.mx') || 'https://back.mayaadrenaline.com.mx');
    try {
        const res = await fetch(`${apiUrl}/wp-json/maya-adrenaline/v1/settings`, { next: { revalidate: 60 } });
        if (!res.ok) throw new Error("Failed to fetch settings");
        return res.json();
    } catch (error) {
        console.error("Error fetching settings:", error);
        return {} as Settings;
    }
}

export default async function ExcursionesPage() {
    const categoriesData = getCategories();
    const activitiesData = getActivities();
    const excursionesData = getExcursiones();
    const settingsData = getSettings();

    const [categories, activities, excursiones, settings] = await Promise.all([
        categoriesData,
        activitiesData,
        excursionesData,
        settingsData
    ]);

    const heroImage = settings.experiencias_hero_image || `/wp-content/uploads/2026/02/tulum4-scaled.webp`;


    return (
        <div className="font-sans">
            {/* Hero Section */}
            <section className="relative h-[85vh] w-full mt-[-100px]">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src={heroImage}
                        alt="Hero Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Overlay gradient/tint if needed */}
                    <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
                </div>

                {/* Hero Content */}
                {/* We need margin-top to clear the fixed header area effectively if the content is overlapping */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between pt-32 pb-0">
                    {/* Top Content (Optional, mainly navbar, handled by Layout usually) */}
                    <div></div>

                    {/* Bottom Bar: Categories & Title */}
                    <div className="bg-ma-verde-fondo text-white py-12">
                        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">

                            {/* Title */}
                            <div className="text-left max-w-lg">
                                <h1 className="text-4xl md:text-5xl font-extrabold font-nunito leading-tight">
                                    Muchas excursiones <br /> para todos
                                </h1>
                            </div>

                            <HeroCategoriesCarousel categories={categories} />

                        </div>
                    </div>
                </div>
            </section>

            {/* Grid Section */}
            <main className="container mx-auto px-4 py-24 bg-ma-gris-claro">
                <ExcursionGrid excursiones={excursiones} categories={categories} activities={activities} />
            </main>
        </div>
    );
}


