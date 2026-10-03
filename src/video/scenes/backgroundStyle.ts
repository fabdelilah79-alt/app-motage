import type { CSSProperties } from 'react';
import type { Background } from '../../shared/schema';

/** Convertit le fond d'une scène en style CSS (fonction pure). */
export const backgroundStyle = (background: Background): CSSProperties => {
  switch (background.type) {
    case 'color':
      return { backgroundColor: background.color };
    case 'linear-gradient': {
      const stops = background.stops.map((stop) => `${stop.color} ${stop.position}%`).join(', ');
      return { backgroundImage: `linear-gradient(${background.angle}deg, ${stops})` };
    }
  }
};
