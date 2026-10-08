import { ArrowLeft, CircleHelp, Clapperboard, Film, Palette, Redo2, Save, Settings, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExportDialog } from '../export/ExportDialog';
import { useRenderJob } from '../export/useRenderJob';
import { goHome } from '../hooks/useHashRoute';
import type { SaveStatus } from '../hooks/useAutosave';
import { useEditorStore } from '../store/editorStore';
import { redo, undo, useHistoryAvailability } from '../store/history';
import { useProject } from '../store/selectors';
import { ThemeDialog } from '../themes/ThemeDialog';
import { useTourStore } from '../tour/tourStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ProjectSettingsDialog } from './ProjectSettingsDialog';

type Props = { saveStatus: SaveStatus; onSave: () => void };

export const TopBar = ({ saveStatus, onSave }: Props) => {
  const { t } = useTranslation();
  const project = useProject();
  const renameProject = useEditorStore((state) => state.renameProject);
  const previewMode = useEditorStore((state) => state.previewMode);
  const setPreviewMode = useEditorStore((state) => state.setPreviewMode);
  const { canUndo, canRedo } = useHistoryAvailability();
  const render = useRenderJob();
  const [exportOpen, setExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const startTour = useTourStore((state) => state.start);


  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-900 px-3">
      <Button size="icon" variant="ghost" onClick={goHome} aria-label={t('common.backHome')}>
        <ArrowLeft size={18} className="rtl:rotate-180" aria-hidden />
      </Button>
      <Input
        key={project.title}
        data-testid="project-title"
        className="h-8 w-64 font-semibold"
        defaultValue={project.title}
        aria-label={t('topBar.projectName')}
        onBlur={(event) => {
          if (event.target.value.trim()) renameProject(event.target.value.trim());
          else event.target.value = project.title;
        }}
        onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
      />
      <Button
        size="icon"
        variant="ghost"
        onClick={undo}
        disabled={!canUndo}
        aria-label={t('topBar.undo')}
      >
        <Undo2 size={18} className="rtl:-scale-x-100" aria-hidden />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={redo}
        disabled={!canRedo}
        aria-label={t('topBar.redo')}
      >
        <Redo2 size={18} className="rtl:-scale-x-100" aria-hidden />
      </Button>
      <Button size="sm" variant="ghost" onClick={onSave} data-testid="save-status">
        <Save size={14} aria-hidden />
        {t(`topBar.save.${saveStatus}`)}
      </Button>

      <div className="ms-auto flex items-center gap-2">
        <Button
          size="sm"
          variant={previewMode === 'full' ? 'primary' : 'ghost'}
          onClick={() => setPreviewMode(previewMode === 'full' ? 'scene' : 'full')}
          data-testid="preview-mode"
        >
          {previewMode === 'full' ? (
            <Clapperboard size={14} aria-hidden />
          ) : (
            <Film size={14} aria-hidden />
          )}
          {t(previewMode === 'full' ? 'topBar.backToScene' : 'topBar.previewAll')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setThemeOpen(true)} data-testid="theme-button" data-tour="theme">
          <Palette size={14} aria-hidden />
          {t('themes.open')}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setSettingsOpen(true)}
          aria-label={t('projectSettings.open')}
          data-testid="project-settings"
        >
          <Settings size={18} aria-hidden />
        </Button>
        <Button size="icon" variant="ghost" onClick={startTour} aria-label={t('tour.open')} data-testid="tour-button">
          <CircleHelp size={18} aria-hidden />
        </Button>
        <LanguageSwitcher />
        <Button variant="primary" onClick={() => setExportOpen(true)} data-testid="export-button" data-tour="export">
          {t('topBar.export')}
        </Button>
      </div>

      <ProjectSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ThemeDialog open={themeOpen} onOpenChange={setThemeOpen} />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} project={project} render={render} />
    </header>
  );
};
