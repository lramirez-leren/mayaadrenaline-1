'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { sortExcursionsByTitleAsc } from '@/lib/excursionSort';

interface Category {
    id: number;
    name: string;
    slug: string;
    imagen: string | null;
    count: number;
}

interface Activity {
    id: number;
    name: string;
    slug: string;
    imagen: string | null;
    count: number;
}

interface Excursion {
    id: number;
    slug: string;
    title: {
        rendered: string;
    };
    excerpt: {
        rendered: string;
    };
    categoria_excursion: number[]; // IDs of categories
    actividad_excursion: number[]; // IDs of activities
    _embedded?: {
        "wp:featuredmedia"?: Array<{
            source_url: string;
            alt_text: string;
        }>;
    };
}

interface ExcursionGridProps {
    excursiones: Excursion[];
    categories: Category[];
    activities: Activity[];
}

function matchesFilterQuery(name: string, slug: string, q: string) {
    const n = name.toLowerCase();
    const s = slug.toLowerCase();
    return n.includes(q) || s.includes(q);
}

export default function ExcursionGrid({ excursiones, categories, activities }: ExcursionGridProps) {
    const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterQuery, setFilterQuery] = useState('');
    const filterContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isFilterOpen) setFilterQuery('');
    }, [isFilterOpen]);

    useEffect(() => {
        if (!isFilterOpen) return;
        const handlePointerDown = (e: PointerEvent) => {
            const root = filterContainerRef.current;
            if (root && !root.contains(e.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('pointerdown', handlePointerDown, true);
        return () => document.removeEventListener('pointerdown', handlePointerDown, true);
    }, [isFilterOpen]);

    const filteredCategories = useMemo(() => {
        const q = filterQuery.trim().toLowerCase();
        if (!q) return categories;
        return categories.filter((c) => matchesFilterQuery(c.name, c.slug, q));
    }, [categories, filterQuery]);

    const filteredActivities = useMemo(() => {
        const q = filterQuery.trim().toLowerCase();
        if (!q) return activities;
        return activities.filter((a) => matchesFilterQuery(a.name, a.slug, q));
    }, [activities, filterQuery]);

    const hasSearch = filterQuery.trim().length > 0;
    const noSearchResults =
        hasSearch && filteredCategories.length === 0 && filteredActivities.length === 0;

    const excursionesOrdenadas = useMemo(
        () => sortExcursionsByTitleAsc(excursiones),
        [excursiones]
    );

    const filteredExcursiones = useMemo(() => {
        if (activeFilter === 'all') return excursionesOrdenadas;
        return excursionesOrdenadas.filter(
            (exc) =>
                exc.categoria_excursion?.includes(activeFilter) ||
                exc.actividad_excursion?.includes(activeFilter)
        );
    }, [excursionesOrdenadas, activeFilter]);

    const activeFilterName = activeFilter === 'all'
        ? 'Todas'
        : (categories.find(c => c.id === activeFilter)?.name || activities.find(a => a.id === activeFilter)?.name || 'Todas');


    return (
        <div className='w-full'>
            {/* Overlay for mobile when filter is open */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsFilterOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* Header and Filter */}
            <div className={`flex flex-col md:flex-row items-center justify-between mb-12 md:mb-16 gap-6 relative ${isFilterOpen ? 'z-50' : 'z-30'}`}>
                <h2 className="text-3xl md:text-4xl font-extrabold text-ma-verdeazul font-nunito text-center md:text-left leading-tight">
                    Explora nuestras propuestas
                </h2>

                <div ref={filterContainerRef} className="relative w-full md:w-auto flex justify-center md:justify-end">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center justify-between md:justify-start gap-4 bg-ma-verdeazul text-white px-6 md:px-8 py-3 rounded-full hover:bg-opacity-90 transition-all font-montserrat italic min-w-[200px] md:min-w-0 shadow-lg"
                    >
                        <span className="truncate max-w-[150px]">{activeFilter === 'all' ? 'Filtrar por categoría' : activeFilterName}</span>
                        <svg className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4H20L12 14L4 4Z" fill="currentColor" opacity="0.5" />
                            <path d="M12 14V20L15 22V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95, x: '-50%' }}
                                animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                                exit={{ opacity: 0, y: 10, scale: 0.95, x: '-50%' }}
                                className="absolute top-full mt-3 bg-ma-verde-fondo rounded-2xl shadow-2xl z-50 p-4 md:p-5
                                           w-[min(100%,22rem)] max-w-[92vw] md:w-[28rem]
                                           left-1/2 md:left-auto md:right-0
                                           md:translate-x-0"
                            >
                                <div className="flex justify-between items-center gap-3 mb-3 pb-2 border-b border-white/10">
                                    <h4 className="text-white font-bold font-nunito text-sm md:text-base">Filtros</h4>
                                    <button type="button" onClick={() => setIsFilterOpen(false)} className="md:hidden text-white/60 hover:text-white text-lg leading-none p-1" aria-label="Cerrar">
                                        ✕
                                    </button>
                                </div>

                                <label className="block mb-3">
                                    <span className="sr-only">Buscar categoría o actividad</span>
                                    <div className="relative">
                                        <svg
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45 pointer-events-none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            aria-hidden
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                        </svg>
                                        <input
                                            type="search"
                                            value={filterQuery}
                                            onChange={(e) => setFilterQuery(e.target.value)}
                                            placeholder="Buscar categoría o actividad…"
                                            autoComplete="off"
                                            className="w-full rounded-lg bg-white/10 border border-white/20 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-ma-amarillo/50 focus:border-ma-amarillo/60"
                                        />
                                    </div>
                                </label>

                                <div className="max-h-[min(55vh,24rem)] overflow-y-auto overscroll-contain pr-1 space-y-4">
                                    {noSearchResults && (
                                        <p className="text-xs text-white/55 text-center py-4 font-montserrat">
                                            No hay coincidencias. Prueba con otras palabras.
                                        </p>
                                    )}

                                    {categories.length > 0 && !noSearchResults && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-white/45 font-semibold mb-2">Categorías</p>
                                            {filteredCategories.length === 0 && hasSearch ? (
                                                <p className="text-[11px] text-white/45 italic py-1">Ninguna categoría coincide.</p>
                                            ) : (
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {filteredCategories.map(cat => {
                                                    const selected = activeFilter === cat.id;
                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => { setActiveFilter(cat.id); setIsFilterOpen(false); }}
                                                            className={`flex items-center gap-2.5 min-w-0 rounded-lg px-2.5 py-2 text-left transition-colors border
                                                                ${selected
                                                                    ? 'border-ma-amarillo bg-white/10 text-white'
                                                                    : 'border-white/15 text-white/90 hover:border-white/35 hover:bg-white/5'}`}
                                                        >
                                                            <div className={`relative shrink-0 w-9 h-9 rounded-full border flex items-center justify-center overflow-hidden
                                                                ${selected ? 'border-ma-amarillo bg-white/10' : 'border-white/25'}`}>
                                                                {cat.imagen ? (
                                                                    <Image
                                                                        src={cat.imagen}
                                                                        alt={cat.name}
                                                                        fill
                                                                        sizes="36px"
                                                                        className={`object-contain p-1.5 transition-all ${selected ? '' : 'brightness-0 invert opacity-75'}`}
                                                                    />
                                                                ) : (
                                                                    <span className="text-[10px] font-bold text-white/90">{cat.name.substring(0, 2)}</span>
                                                                )}
                                                            </div>
                                                            <span className={`text-xs font-montserrat leading-snug line-clamp-2 min-w-0 ${selected ? 'text-ma-amarillo font-semibold' : 'text-white/85'}`}>
                                                                {cat.name}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            )}
                                        </div>
                                    )}

                                    {activities.length > 0 && !noSearchResults && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-white/45 font-semibold mb-2">Actividades</p>
                                            {filteredActivities.length === 0 && hasSearch ? (
                                                <p className="text-[11px] text-white/45 italic py-1">Ninguna actividad coincide.</p>
                                            ) : (
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {filteredActivities.map(act => {
                                                    const selected = activeFilter === act.id;
                                                    return (
                                                        <button
                                                            key={act.id}
                                                            type="button"
                                                            onClick={() => { setActiveFilter(act.id); setIsFilterOpen(false); }}
                                                            className={`flex items-center gap-2.5 min-w-0 rounded-lg px-2.5 py-2 text-left transition-colors border
                                                                ${selected
                                                                    ? 'border-ma-amarillo bg-white/10 text-white'
                                                                    : 'border-white/15 text-white/90 hover:border-white/35 hover:bg-white/5'}`}
                                                        >
                                                            <div className={`relative shrink-0 w-9 h-9 rounded-full border flex items-center justify-center overflow-hidden
                                                                ${selected ? 'border-ma-amarillo bg-white/10' : 'border-white/25'}`}>
                                                                {act.imagen ? (
                                                                    <Image
                                                                        src={act.imagen}
                                                                        alt={act.name}
                                                                        fill
                                                                        sizes="36px"
                                                                        className={`object-contain p-1.5 transition-all ${selected ? '' : 'brightness-0 invert opacity-75'}`}
                                                                    />
                                                                ) : (
                                                                    <span className="text-[10px] font-bold text-white/90">{act.name.substring(0, 2)}</span>
                                                                )}
                                                            </div>
                                                            <span className={`text-xs font-montserrat leading-snug line-clamp-2 min-w-0 ${selected ? 'text-ma-amarillo font-semibold' : 'text-white/85'}`}>
                                                                {act.name}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex justify-between items-center gap-2 border-t border-white/10 pt-3">
                                    <span className="text-[9px] text-white/35 uppercase tracking-widest font-bold truncate">Maya Adrenaline</span>
                                    <button
                                        type="button"
                                        onClick={() => { setActiveFilter('all'); setIsFilterOpen(false); }}
                                        className={`shrink-0 text-[11px] md:text-xs font-montserrat uppercase tracking-wide transition-colors px-3 py-1.5 rounded-md border ${activeFilter === 'all' ? 'border-ma-amarillo text-ma-amarillo' : 'border-white/20 text-white/70 hover:text-white hover:border-white/50'}`}
                                    >
                                        Todas
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>


            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredExcursiones.map(excursion => {
                        const imageUrl = excursion._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
                            "https://dummyimage.com/600x800/e0e0e0/000000.png&text=No+Image";
                        const imageAlt = excursion._embedded?.["wp:featuredmedia"]?.[0]?.alt_text || excursion.title.rendered;

                        return (
                            <motion.div
                                key={excursion.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="group relative rounded-[40px] overflow-hidden h-[500px] shadow-lg cursor-pointer bg-[#F4F1E8]" // Using beige bg
                            >
                                <Link href={`/excursiones/${excursion.slug}`} className="block w-full h-full relative">

                                    {/* Top Content (Visible on Hover) */}
                                    <div className="absolute top-0 left-0 w-full h-[45%] p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 z-10 flex flex-col justify-start">
                                        <div className="flex justify-end mb-4">
                                            {/* Arrow Icon - Rotated on hover */}
                                            <div className="bg-white rounded-full p-3 w-12 h-12 flex items-center justify-center shadow-sm">
                                                {/* Using a down/left arrow or rotating the up-right one */}
                                                <img
                                                    src={`https://back.mayaadrenaline.com.mx/wp-content/uploads/2026/02/flechaUp.svg`}
                                                    alt="Arrow"
                                                    className="w-5 h-5 rotate-180"
                                                />
                                            </div>
                                        </div>
                                        <div
                                            className="text-ma-verdeazul text-sm font-montserrat font-medium italic leading-relaxed line-clamp-6"
                                            dangerouslySetInnerHTML={{ __html: excursion.excerpt.rendered }}
                                        />
                                    </div>

                                    {/* Static Arrow for Normal State (Fades out on hover) */}
                                    <div className="absolute top-6 right-6 bg-white rounded-full p-3 w-12 h-12 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0 z-20">
                                        <img src={`https://back.mayaadrenaline.com.mx/wp-content/uploads/2026/02/flechaUp.svg`} alt="Arrow" className="w-5 h-5" />
                                    </div>


                                    {/* Image Wrapper */}
                                    <div className="absolute inset-0 w-full h-full transition-all duration-500 ease-in-out group-hover:h-[55%] group-hover:top-[45%] rounded-t-[0px] group-hover:rounded-t-[40px] overflow-hidden">
                                        <Image
                                            src={imageUrl}
                                            alt={imageAlt}
                                            fill
                                            className="object-cover"
                                        />
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-ma-verdeazul/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                        {/* Title Content - Inside Image Wrapper to move with it */}
                                        <div className="absolute bottom-0 left-0 w-full p-8 text-white z-20">
                                            <h3
                                                className="text-3xl font-extrabold font-nunito leading-tight"
                                                dangerouslySetInnerHTML={{ __html: excursion.title.rendered }}
                                            />
                                        </div>
                                    </div>

                                </Link>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {filteredExcursiones.length === 0 && (
                <div className="text-center py-20 opacity-60">
                    <p>No se encontraron excursiones en esta categoría.</p>
                </div>
            )}

        </div>
    );
}
