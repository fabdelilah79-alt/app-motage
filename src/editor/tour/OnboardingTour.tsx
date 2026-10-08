import { X } from 'lucide-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { bubblePosition, type Rect } from './bubblePosition';
import { TOUR_STEPS, tourAlreadySeen, useTourStore } from './tourStore';

const BUBBLE = { width: 320, height: 190 };

/**
 * Guide d'utilisation : au premier lancement, une bulle présente chaque zone de l'éditeur
 * (bibliothèque, canevas, propriétés, timeline, thème, export). Relançable avec « ? ».
 */
export const OnboardingTour = () => {
  const { t } = useTranslation();
  const { index, start, next, previous, close } = useTourStore();
  const [rect, setRect] = useState<Rect | null>(null);
  const step = index === null ? undefined : TOUR_STEPS[index];

  useEffect(() => {
    if (!tourAlreadySeen()) start();
  }, [start]);

  useLayoutEffect(() => {
    if (!step) return;
    const measure = () => {
      const target = document.querySelector(`[data-tour="${step}"]`);
      const box = target?.getBoundingClientRect();
      setRect(box ? { x: box.x, y: box.y, width: box.width, height: box.height } : null);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [step]);

  if (!step || index === null) return null;
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const position = bubblePosition(rect, BUBBLE, viewport);

  return (
    <div className="fixed inset-0 z-50" data-testid="tour">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      {rect ? (
        <div
          className="pointer-events-none absolute rounded-lg ring-4 ring-sky-400"
          style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
        />
      ) : null}
      <div
        role="dialog"
        aria-label={t(`tour.steps.${step}.title`)}
        className="absolute flex flex-col gap-2 rounded-xl border border-sky-400 bg-slate-900 p-4 text-sm shadow-2xl"
        style={{ left: position.x, top: position.y, width: BUBBLE.width }}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-sky-300">{t(`tour.steps.${step}.title`)}</h2>
          <button type="button" aria-label={t('tour.skip')} className="text-slate-400 hover:text-white" onClick={close}>
            <X size={16} aria-hidden />
          </button>
        </div>
        <p className="text-slate-200">{t(`tour.steps.${step}.text`)}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {index + 1} / {TOUR_STEPS.length}
          </span>
          <span className="flex gap-2">
            {index > 0 ? (
              <Button size="sm" variant="ghost" onClick={previous}>
                {t('tour.previous')}
              </Button>
            ) : null}
            <Button size="sm" variant="primary" onClick={next} data-testid="tour-next">
              {index === TOUR_STEPS.length - 1 ? t('tour.finish') : t('tour.next')}
            </Button>
          </span>
        </div>
      </div>
    </div>
  );
};
