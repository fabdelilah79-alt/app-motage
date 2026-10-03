import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { Project } from '../../src/shared/schema';
import { buildOutputFileName } from './outputFileName';
import type { RenderCallbacks, RenderFunction } from './renderProject';

export type RenderStatus = 'bundling' | 'rendering' | 'done' | 'error' | 'cancelled';

export type RenderJobState = {
  id: string;
  status: RenderStatus;
  /** Progression de 0 à 1 (arrondie au centième). */
  progress: number;
  outputPath: string;
  error: string | null;
};

type Listener = (state: RenderJobState) => void;

type Job = {
  state: RenderJobState;
  cancelRequested: boolean;
  cancelCallbacks: (() => void)[];
  listeners: Set<Listener>;
};

export const isFinished = (status: RenderStatus): boolean =>
  status === 'done' || status === 'error' || status === 'cancelled';

export type RenderJobManager = {
  start: (project: Project) => RenderJobState;
  get: (id: string) => RenderJobState | undefined;
  /** Abonnement aux changements d'un rendu ; renvoie la fonction de désabonnement. */
  subscribe: (id: string, listener: Listener) => (() => void) | undefined;
  cancel: (id: string) => boolean;
};

type ManagerOptions = {
  render: RenderFunction;
  exportsDir: string;
  now?: () => Date;
};

/** Suivi des rendus en cours : état, progression, annulation. */
export const createRenderJobManager = ({
  render,
  exportsDir,
  now = () => new Date(),
}: ManagerOptions): RenderJobManager => {
  const jobs = new Map<string, Job>();

  const update = (job: Job, patch: Partial<RenderJobState>) => {
    job.state = { ...job.state, ...patch };
    for (const listener of job.listeners) {
      listener(job.state);
    }
  };

  const start = (project: Project): RenderJobState => {
    const id = randomUUID();
    const outputPath = path.join(exportsDir, buildOutputFileName(project.title, now()));
    const job: Job = {
      state: { id, status: 'bundling', progress: 0, outputPath, error: null },
      cancelRequested: false,
      cancelCallbacks: [],
      listeners: new Set(),
    };
    jobs.set(id, job);

    const callbacks: RenderCallbacks = {
      onStage: (stage) => update(job, { status: stage }),
      onProgress: (progress) => {
        const rounded = Math.floor(progress * 100) / 100;
        if (rounded !== job.state.progress) {
          update(job, { progress: rounded });
        }
      },
      // Si l'annulation a déjà été demandée, le rendu est arrêté dès son démarrage.
      cancelSignal: (onCancel) => {
        if (job.cancelRequested) {
          onCancel();
        } else {
          job.cancelCallbacks.push(onCancel);
        }
      },
    };

    const onSuccess = () => {
      if (job.cancelRequested) {
        update(job, { status: 'cancelled' });
      } else {
        update(job, { status: 'done', progress: 1 });
      }
    };
    const onFailure = (error: unknown) => {
      if (job.cancelRequested) {
        update(job, { status: 'cancelled' });
      } else {
        const message = error instanceof Error ? error.message : String(error);
        update(job, { status: 'error', error: message });
      }
    };
    render(project, outputPath, callbacks).then(onSuccess, onFailure);

    return job.state;
  };

  const cancel = (id: string): boolean => {
    const job = jobs.get(id);
    if (!job || isFinished(job.state.status)) {
      return false;
    }
    job.cancelRequested = true;
    for (const onCancel of job.cancelCallbacks) {
      onCancel();
    }
    return true;
  };

  const subscribe = (id: string, listener: Listener) => {
    const job = jobs.get(id);
    if (!job) {
      return undefined;
    }
    job.listeners.add(listener);
    return () => {
      job.listeners.delete(listener);
    };
  };

  return { start, get: (id) => jobs.get(id)?.state, subscribe, cancel };
};
