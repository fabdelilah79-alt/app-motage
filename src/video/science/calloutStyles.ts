import { AlertTriangle, BookOpen, Lightbulb, ListChecks, Star } from 'lucide-react';
import type { CalloutKind, Lang } from '../../shared/schema';

/** Apparence et titre par défaut de chaque encadré pédagogique. */
export const CALLOUT_STYLES = {
  definition: {
    color: '#2563eb',
    Icon: BookOpen,
    title: { fr: 'Définition', ar: 'تعريف', en: 'Definition' },
  },
  remember: {
    color: '#16a34a',
    Icon: Star,
    title: { fr: 'À retenir', ar: 'لنتذكر', en: 'Remember' },
  },
  warning: {
    color: '#dc2626',
    Icon: AlertTriangle,
    title: { fr: 'Attention', ar: 'انتبه', en: 'Warning' },
  },
  example: {
    color: '#9333ea',
    Icon: Lightbulb,
    title: { fr: 'Exemple', ar: 'مثال', en: 'Example' },
  },
  method: {
    color: '#0d9488',
    Icon: ListChecks,
    title: { fr: 'Méthode', ar: 'طريقة', en: 'Method' },
  },
} satisfies Record<CalloutKind, { color: string; Icon: unknown; title: Record<Lang, string> }>;

export const calloutTitle = (kind: CalloutKind, lang: Lang, custom: string) =>
  custom.trim() || CALLOUT_STYLES[kind].title[lang];
