import { z } from 'zod';
import type { AnimatableNumber } from '../../shared/schema';
import { scopeAt } from '../science/plot/animatable';

const scopeSchema = z.record(z.string(), z.number());

/** Clé des valeurs des paramètres à une frame : identique tant que rien n'est animé. */
export const scopeKeyAt = (params: Readonly<Record<string, AnimatableNumber>>, frame: number) =>
  JSON.stringify(scopeAt(params, frame));

/** Relit les paramètres depuis leur clé (dans un useMemo). */
export const scopeFromKey = (key: string) => scopeSchema.parse(JSON.parse(key));
