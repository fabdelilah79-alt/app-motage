import { useCallback, useEffect, useRef, useState } from 'react';
import type { Project } from '../../shared/schema';
import { api } from '../api/client';

export type SaveStatus = 'saved' | 'pending' | 'saving' | 'error';

const AUTOSAVE_DELAY_MS = 5000;

/** Sauvegarde automatique 5 s après la dernière modification ; `saveNow` pour Ctrl+S. */
export const useAutosave = (project: Project | null) => {
  const [status, setStatus] = useState<SaveStatus>('saved');
  const lastSaved = useRef<Project | null>(project);
  const latest = useRef<Project | null>(project);
  latest.current = project;

  const saveNow = useCallback(async () => {
    const toSave = latest.current;
    if (!toSave || toSave === lastSaved.current) return;
    setStatus('saving');
    try {
      await api.saveProject(toSave);
      lastSaved.current = toSave;
      setStatus(latest.current === toSave ? 'saved' : 'pending');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!project || project === lastSaved.current) return;
    // Un autre projet vient d'être ouvert : rien à sauvegarder.
    if (lastSaved.current?.id !== project.id) {
      lastSaved.current = project;
      setStatus('saved');
      return;
    }
    setStatus('pending');
    const timer = window.setTimeout(() => void saveNow(), AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [project, saveNow]);

  // En quittant l'éditeur (retour à l'accueil), les dernières modifications sont enregistrées.
  useEffect(() => () => void saveNow(), [saveNow]);

  // Avertit avant de fermer l'onglet si des modifications ne sont pas encore enregistrées.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (latest.current && latest.current !== lastSaved.current) {
        event.preventDefault();
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  return { status, saveNow };
};
