import { AudioLines, ImageIcon, Shapes, Type } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AudioPanel } from '../audio/AudioPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MediaLibrary } from './MediaLibrary';
import { ShapesLibrary } from './ShapesLibrary';
import { TextLibrary } from './TextLibrary';

const TABS = [
  { value: 'text', icon: Type, labelKey: 'library.text' },
  { value: 'media', icon: ImageIcon, labelKey: 'library.media' },
  { value: 'shapes', icon: Shapes, labelKey: 'library.shapes' },
  { value: 'audio', icon: AudioLines, labelKey: 'library.audio' },
] as const;

/** Bibliothèque : on clique sur un élément pour l'ajouter au centre de la scène. */
export const LibraryPanel = () => {
  const { t } = useTranslation();
  return (
    <aside className="flex w-72 shrink-0 flex-col border-e border-slate-800 bg-slate-900">
      <Tabs defaultValue="text" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="px-1">
          {TABS.map(({ value, icon: Icon, labelKey }) => (
            <TabsTrigger
              key={value}
              value={value}
              data-testid={`tab-${value}`}
              title={t(labelKey)}
              className="flex flex-1 flex-col items-center gap-0.5 px-1 py-1.5 text-[11px]"
            >
              <Icon size={16} aria-hidden />
              {t(labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="text">
          <TextLibrary />
        </TabsContent>
        <TabsContent value="media">
          <MediaLibrary />
        </TabsContent>
        <TabsContent value="shapes">
          <ShapesLibrary />
        </TabsContent>
        <TabsContent value="audio">
          <AudioPanel />
        </TabsContent>
      </Tabs>
    </aside>
  );
};
