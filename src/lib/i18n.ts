export function tr(labels: Record<string, string> | undefined, locale: string, fallback?: string) {
    if (!labels) return fallback ?? '';
    return labels[locale] ?? labels['en'] ?? Object.values(labels)[0] ?? fallback ?? '';
}