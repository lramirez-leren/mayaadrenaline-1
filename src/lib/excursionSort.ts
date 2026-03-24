/** Quita etiquetas HTML básicas para ordenar por texto visible. */
export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim();
}

export function compareByExcursionTitleRendered(
    a: { title: { rendered: string } },
    b: { title: { rendered: string } }
): number {
    return stripHtml(a.title.rendered).localeCompare(stripHtml(b.title.rendered), 'es', {
        sensitivity: 'base',
    });
}

export function sortExcursionsByTitleAsc<T extends { title: { rendered: string } }>(items: T[]): T[] {
    return [...items].sort(compareByExcursionTitleRendered);
}

/** Para títulos ya como string (p. ej. tabla de precios), por si vienen con HTML del CMS. */
export function compareByExcursionTitlePlain(a: string, b: string): number {
    return stripHtml(a).localeCompare(stripHtml(b), 'es', { sensitivity: 'base' });
}
