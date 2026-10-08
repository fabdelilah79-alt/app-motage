import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AppCrash } from './AppCrash';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Filet de sécurité de l'éditeur : en cas d'erreur inattendue, un message clair et un bouton
 * « Recharger » remplacent l'écran blanc. (React n'offre cette fonction qu'en composant classe.)
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  override render() {
    return this.state.error ? <AppCrash error={this.state.error} /> : this.props.children;
  }
}
