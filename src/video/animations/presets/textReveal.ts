import { z } from 'zod';
import type { Lang } from '../../../shared/schema';
import { definePreset } from '../definePreset';
import { NEUTRAL_FRAME, type RevealMode } from '../types';

const noParams = z.object({});

const textReveal = (
  mode: RevealMode,
  name: Record<Lang, string>,
  defaultDuration: number,
  arabicCompatible = true,
) =>
  definePreset({
    id: `enter.${mode}`,
    name,
    category: 'enter',
    defaultDuration,
    compatibleElements: ['text'],
    arabicCompatible,
    paramsSchema: noParams,
    apply: (progress) => ({ ...NEUTRAL_FRAME, reveal: { mode, progress } }),
  });

/** Machine à écrire : sous-chaînes de graphèmes, la forme des lettres arabes reste correcte. */
export const enterTypewriter = textReveal(
  'typewriter',
  { fr: 'Machine à écrire', ar: 'آلة كاتبة', en: 'Typewriter' },
  45,
);

export const enterWord = textReveal(
  'word',
  { fr: 'Mot par mot', ar: 'كلمة بكلمة', en: 'Word by word' },
  30,
);

export const enterLine = textReveal(
  'line',
  { fr: 'Ligne par ligne', ar: 'سطرًا بسطر', en: 'Line by line' },
  30,
);

/** Lettre par lettre : réservé au latin ; en arabe, repli automatique sur « mot par mot ». */
export const enterLetter = textReveal(
  'letter',
  { fr: 'Lettre par lettre (latin)', ar: 'حرفًا بحرف (لاتيني)', en: 'Letter by letter (Latin)' },
  30,
  false,
);

/** Rideau : le texte est dévoilé dans le sens de lecture. */
export const enterMask = textReveal(
  'mask',
  { fr: 'Rideau (sens de lecture)', ar: 'ستار (باتجاه القراءة)', en: 'Wipe (reading direction)' },
  25,
);
