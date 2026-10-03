import type { z } from 'zod';
import type { AnimationPreset, PresetDefinition } from './types';

/** Enregistre un préréglage ; des paramètres invalides sont remplacés par les défauts. */
export const definePreset = <Schema extends z.ZodType>(
  definition: PresetDefinition<Schema>,
): AnimationPreset => {
  const { apply, ...metadata } = definition;
  return {
    ...metadata,
    run: (progress, rawParams) => {
      const parsed = definition.paramsSchema.safeParse(rawParams ?? {});
      const params = parsed.success ? parsed.data : definition.paramsSchema.parse({});
      return apply(progress, params);
    },
  };
};
