import { Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SFX_IDS } from '../../shared/schema';
import { Button } from '../ui/button';

/** Effets sonores intégrés : écoute ; ils s'ajoutent à un élément dans l'onglet Animation. */
export const SfxSection = () => {
  const { t } = useTranslation();
  // Écoute dans l'éditeur seulement (la vidéo utilise les composants audio de Remotion).
  const listen = (id: string) => void new Audio(`/sfx/${id}.wav`).play().catch(() => undefined);

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-slate-300">{t('audio.sfx')}</h3>
      <p className="text-xs text-slate-400">{t('audio.sfxHelp')}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {SFX_IDS.map((id) => (
          <Button key={id} size="sm" variant="ghost" onClick={() => listen(id)}>
            <Volume2 size={14} aria-hidden />
            {t(`sfx.${id}`)}
          </Button>
        ))}
      </div>
    </section>
  );
};
