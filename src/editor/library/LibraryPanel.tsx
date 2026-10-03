import { ImageIcon, Type } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MediaLibrary } from './MediaLibrary';
import { TextLibrary } from './TextLibrary';

/** Bibliothèque : on clique sur un élément pour l'ajouter au centre de la scène. */
export const LibraryPanel = () => {
  const { t } = useTranslation();
  return (
    <aside className="flex w-64 shrink-0 flex-col border-e border-slate-800 bg-slate-900">
      <Tabs defaultValue="text" className="flex min-h-0 flex-1 flex-col">
        <TabsList>
          <TabsTrigger value="text" className="flex items-center gap-1.5">
            <Type size={14} aria-hidden />
            {t('library.text')}
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-1.5" data-testid="tab-media">
            <ImageIcon size={14} aria-hidden />
            {t('library.media')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="text">
          <TextLibrary />
        </TabsContent>
        <TabsContent value="media">
          <MediaLibrary />
        </TabsContent>
      </Tabs>
    </aside>
  );
};
