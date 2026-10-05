import { useTranslation } from 'react-i18next';
import { THEMES } from '../../video/themes/themes';
import { useEditorStore } from '../store/editorStore';
import { useProject } from '../store/selectors';
import { Dialog } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BrandKitEditor } from './BrandKitEditor';
import { PaletteEditor } from './PaletteEditor';
import { ThemeCard } from './ThemeCard';

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

/** Thème visuel du projet (un clic), couleurs du thème et kit de marque. */
export const ThemeDialog = ({ open, onOpenChange }: Props) => {
  const { t } = useTranslation();
  const project = useProject();
  const applyTheme = useEditorStore((state) => state.applyTheme);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('themes.title')} wide>
      <Tabs defaultValue="themes" className="flex max-h-[70vh] flex-col">
        <TabsList>
          <TabsTrigger value="themes">{t('themes.tabThemes')}</TabsTrigger>
          <TabsTrigger value="palette">{t('themes.tabPalette')}</TabsTrigger>
          <TabsTrigger value="brand">{t('themes.tabBrand')}</TabsTrigger>
        </TabsList>
        <TabsContent value="themes">
          <p className="mb-3 text-xs text-slate-400">{t('themes.help')}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {THEMES.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                active={project.themeId === theme.id}
                onSelect={() => applyTheme(theme.id)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="palette">
          <PaletteEditor />
        </TabsContent>
        <TabsContent value="brand">
          <BrandKitEditor />
        </TabsContent>
      </Tabs>
    </Dialog>
  );
};
