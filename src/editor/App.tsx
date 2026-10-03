import { DirectionProvider } from '@radix-ui/react-direction';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useHashRoute } from './hooks/useHashRoute';
import { uiDirection } from './i18n';
import { EditorScreen } from './screens/EditorScreen';
import { HomeScreen } from './screens/HomeScreen';

export const App: FC = () => {
  const { i18n } = useTranslation();
  const route = useHashRoute();

  return (
    <DirectionProvider dir={uiDirection(i18n.language)}>
      {route.name === 'project' ? (
        <EditorScreen key={route.projectId} projectId={route.projectId} />
      ) : (
        <HomeScreen />
      )}
    </DirectionProvider>
  );
};
