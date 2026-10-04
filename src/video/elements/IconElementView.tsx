import type { FC } from 'react';
import type { IconElement } from '../../shared/schema';
import { ICON_CATALOG } from '../media/iconCatalog';

/** Icône vectorielle de la bibliothèque intégrée. */
export const IconElementView: FC<{ element: IconElement }> = ({ element }) => {
  const Icon = ICON_CATALOG[element.iconId];
  if (!Icon) {
    return null;
  }
  return (
    <Icon
      width="100%"
      height="100%"
      color={element.color}
      strokeWidth={element.strokeWidth}
      style={{ display: 'block' }}
    />
  );
};
