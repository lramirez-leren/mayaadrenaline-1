'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';

export interface HeroCategory {
    id: number;
    name: string;
    slug: string;
    imagen: string | null;
    count: number;
}

export default function HeroCategoriesCarousel({ categories }: { categories: HeroCategory[] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: categories.length > 5,
        align: 'start',
        dragFree: false,
    });

    const viewportRef = useRef<HTMLDivElement | null>(null);
    const [slidePx, setSlidePx] = useState(0);

    const setViewportRef = useCallback(
        (node: HTMLDivElement | null) => {
            viewportRef.current = node;
            if (typeof emblaRef === 'function') {
                emblaRef(node);
            } else if (emblaRef && 'current' in emblaRef) {
                (emblaRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
        },
        [emblaRef]
    );

    useLayoutEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const measure = () => {
            const w = el.offsetWidth;
            if (w <= 0) return;
            setSlidePx(w / 5);
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (emblaApi && slidePx > 0) emblaApi.reInit();
    }, [emblaApi, slidePx]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    if (categories.length === 0) {
        return <p className="text-sm italic opacity-70">Cargando categorías...</p>;
    }

    return (
        <div className="relative w-full max-w-3xl md:max-w-none md:flex-1 min-w-0 flex flex-col gap-3">
            <div className="overflow-hidden" ref={setViewportRef}>
                <div className="flex touch-pan-y">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="min-w-0 shrink-0 flex flex-col items-center px-1 box-border"
                            style={
                                slidePx > 0
                                    ? { flex: `0 0 ${slidePx}px` }
                                    : { flex: '0 0 20%' }
                            }
                        >
                            <div className="relative w-full max-w-[4.5rem] mx-auto aspect-square rounded-full flex items-center justify-center bg-white/5 border border-white/10 overflow-hidden">
                                {cat.imagen ? (
                                    <Image
                                        src={cat.imagen}
                                        alt={cat.name}
                                        fill
                                        className="object-contain p-2.5"
                                    />
                                ) : (
                                    <span className="text-[10px] font-bold text-white/90">{cat.name.substring(0, 2)}</span>
                                )}
                            </div>
                            <span className="mt-1 text-[9px] md:text-[10px] text-center text-white/80 leading-tight line-clamp-2 max-w-full font-montserrat px-0.5">
                                {cat.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {categories.length > 5 && (
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={scrollPrev}
                        className="rounded-full bg-white/10 border border-white/20 p-2 hover:bg-white/20 transition-colors"
                        aria-label="Anterior"
                    >
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={scrollNext}
                        className="rounded-full bg-white/10 border border-white/20 p-2 hover:bg-white/20 transition-colors"
                        aria-label="Siguiente"
                    >
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
