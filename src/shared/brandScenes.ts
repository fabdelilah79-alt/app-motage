import { createScene, randomId, type IdGenerator } from './factories';
import type { Lang, Project, Scene, SceneElement } from './schema';

const OUTRO_TEXT: Record<Lang, string> = {
  fr: 'Merci de votre attention',
  ar: 'شكرا على انتباهكم',
  en: 'Thank you for watching',
};

/**
 * Scène d'introduction (titre du projet) ou de conclusion (remerciement) avec le logo du
 * kit de marque, aux couleurs du thème.
 */
export const createBrandScene = (
  project: Project,
  kind: 'intro' | 'outro',
  newId: IdGenerator = randomId,
): Scene => {
  const { format, defaultLang, brand } = project;
  const scene = createScene(format, newId);
  const duration = 3 * format.fps;
  const logo = brand?.logoAssetId
    ? project.assets.find((asset) => asset.id === brand.logoAssetId)
    : undefined;
  const logoSize = Math.round(Math.min(format.width, format.height) * 0.3);
  const enter = {
    presetId: 'enter.pop',
    duration: 18,
    delay: 0,
    easing: 'smooth' as const,
    params: {},
    repeat: 1,
  };
  const elements: SceneElement[] = [];
  if (logo) {
    elements.push({
      id: `logo-${newId()}`,
      type: 'image',
      name: logo.name,
      locked: false,
      hidden: false,
      assetId: logo.id,
      fit: 'contain',
      mask: 'none',
      cornerRadius: 0,
      shadow: false,
      crop: { top: 0, right: 0, bottom: 0, left: 0 },
      kenBurns: { zoom: 1, panX: 0, panY: 0 },
      transform: {
        x: Math.round((format.width - logoSize) / 2),
        y: Math.round(format.height * 0.18),
        width: logoSize,
        height: logoSize,
        rotation: 0,
        scale: 1,
        opacity: 1,
      },
      timing: { from: 0, duration },
      animations: { enter, emphasis: [] },
    });
  }
  elements.push({
    id: `text-${newId()}`,
    type: 'text',
    name: '',
    locked: false,
    hidden: false,
    lang: defaultLang,
    direction: 'auto',
    transform: {
      x: Math.round(format.width * 0.1),
      y: Math.round(format.height * (logo ? 0.6 : 0.4)),
      width: Math.round(format.width * 0.8),
      height: Math.round(format.height * 0.2),
      rotation: 0,
      scale: 1,
      opacity: 1,
    },
    timing: { from: 0, duration },
    animations: { enter: { ...enter, presetId: 'enter.fade', delay: 8 }, emphasis: [] },
    content: [{ kind: 'text', text: kind === 'intro' ? project.title : OUTRO_TEXT[defaultLang] }],
    style: {
      fontSize: Math.round(format.height / 12),
      fontWeight: 700,
      color: 'theme.text',
      align: 'center',
      lineHeight: 1.3,
      letterSpacing: 0,
      textTransform: 'none',
      effects: {},
    },
  });
  return { ...scene, name: '', durationInFrames: duration, elements };
};
