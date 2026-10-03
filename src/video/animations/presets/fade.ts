import { z } from 'zod';
import { definePreset } from '../definePreset';
import { NEUTRAL_FRAME } from '../types';

const noParams = z.object({});

export const enterFade = definePreset({
  id: 'enter.fade',
  name: { fr: 'Fondu', ar: 'ظهور تدريجي', en: 'Fade' },
  category: 'enter',
  defaultDuration: 15,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramsSchema: noParams,
  apply: (progress) => ({ ...NEUTRAL_FRAME, opacity: progress }),
});

export const exitFade = definePreset({
  id: 'exit.fade',
  name: { fr: 'Fondu', ar: 'اختفاء تدريجي', en: 'Fade' },
  category: 'exit',
  defaultDuration: 15,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramsSchema: noParams,
  apply: (progress) => ({ ...NEUTRAL_FRAME, opacity: 1 - progress }),
});
