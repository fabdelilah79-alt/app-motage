import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { goHome } from '../hooks/useHashRoute';
import { EditorLayout } from '../layout/EditorLayout';
import { useEditorStore } from '../store/editorStore';
import { Button } from '../ui/button';

/** Charge le projet depuis le serveur puis affiche l'éditeur. */
export const EditorScreen = ({ projectId }: { projectId: string }) => {
  const { t } = useTranslation();
  const loaded = useEditorStore((state) => state.project?.id === projectId);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    api.getProject(projectId).then(
      (project) => active && useEditorStore.getState().loadProject(project),
      () => active && setFailed(true),
    );
    return () => {
      active = false;
      useEditorStore.getState().closeProject();
    };
  }, [projectId]);

  if (failed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-rose-400">{t('errors.loadProject')}</p>
        <Button onClick={goHome}>{t('common.backHome')}</Button>
      </div>
    );
  }
  if (!loaded) {
    return <p className="p-8 text-slate-400">{t('common.loading')}</p>;
  }
  return <EditorLayout />;
};
