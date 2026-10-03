import { useEffect, useState } from 'react';

export type Route = { name: 'home' } | { name: 'project'; projectId: string };

const PROJECT_PREFIX = '#/projet/';

const parseHash = (hash: string): Route =>
  hash.startsWith(PROJECT_PREFIX) && hash.length > PROJECT_PREFIX.length
    ? { name: 'project', projectId: decodeURIComponent(hash.slice(PROJECT_PREFIX.length)) }
    : { name: 'home' };

/** Navigation simple par l'adresse : #/ (accueil) ou #/projet/<id> (éditeur). */
export const useHashRoute = (): Route => {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
};

export const openProject = (projectId: string) => {
  window.location.hash = `${PROJECT_PREFIX}${encodeURIComponent(projectId)}`;
};

export const goHome = () => {
  window.location.hash = '#/';
};
