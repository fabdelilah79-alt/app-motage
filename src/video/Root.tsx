import type { FC } from 'react';
import { Composition } from 'remotion';
import demoTemplate from '../../templates/demo.json';
import { parseProject } from '../shared/schema';
import { ProjectVideo } from './ProjectVideo';
import { calculateProjectMetadata } from './projectMetadata';

// Projet affiché par défaut ; lors d'un export, le serveur fournit le vrai projet (inputProps).
const defaultProject = parseProject(demoTemplate);

export const RemotionRoot: FC = () => (
  <Composition
    id="ProjectVideo"
    component={ProjectVideo}
    durationInFrames={1}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{ project: defaultProject }}
    calculateMetadata={calculateProjectMetadata}
  />
);
