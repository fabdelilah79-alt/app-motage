import { Copy, FolderOpen, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, type ProjectSummary } from '../api/client';
import { openProject } from '../hooks/useHashRoute';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';
import { Button } from '../ui/button';
import { NewProjectDialog } from './NewProjectDialog';

type LoadState = 'loading' | 'ready' | 'error';

/** Accueil : projets récents, nouveau projet, ouvrir, dupliquer. */
export const HomeScreen = () => {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;
    api.listProjects().then(
      (list) => {
        if (!active) return;
        setProjects(list);
        setLoadState('ready');
      },
      () => active && setLoadState('error'),
    );
    return () => {
      active = false;
    };
  }, []);

  const duplicate = async (project: ProjectSummary) => {
    const title = t('home.copyTitle', { title: project.title });
    const copy = await api.duplicateProject(project.id, title);
    openProject(copy.id);
  };

  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-8 overflow-y-auto p-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('app.name')}</h1>
          <p className="text-slate-400">{t('app.tagline')}</p>
        </div>
        <LanguageSwitcher />
      </header>

      <div>
        <Button variant="primary" onClick={() => setCreating(true)} data-testid="new-project">
          <Plus size={18} aria-hidden />
          {t('home.newProject')}
        </Button>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t('home.recentProjects')}</h2>
        {loadState === 'loading' ? <p className="text-slate-400">{t('common.loading')}</p> : null}
        {loadState === 'error' ? (
          <p className="text-rose-400">{t('errors.serverUnreachable')}</p>
        ) : null}
        {loadState === 'ready' && projects.length === 0 ? (
          <p className="text-slate-400">{t('home.noProjects')}</p>
        ) : null}
        <ul className="flex flex-col gap-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900 p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{project.title}</p>
                <p className="text-xs text-slate-400">
                  {t('home.updatedAt', { date: dateFormat.format(new Date(project.updatedAt)) })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => void duplicate(project)}>
                  <Copy size={14} aria-hidden />
                  {t('home.duplicate')}
                </Button>
                <Button size="sm" variant="primary" onClick={() => openProject(project.id)}>
                  <FolderOpen size={14} aria-hidden />
                  {t('home.open')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {creating ? <NewProjectDialog open onOpenChange={setCreating} /> : null}
    </div>
  );
};
