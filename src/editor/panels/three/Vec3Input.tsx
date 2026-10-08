import type { Vec3 } from '../../../shared/schema';
import { Field } from '../../ui/field';
import { NumberInput } from '../../ui/number-input';

/** Trois nombres (x, y, z). */
export const Vec3Input = ({ label, value, onChange }: { label: string; value: Vec3; onChange: (next: Vec3) => void }) => (
  <Field label={label}>
    <div className="grid grid-cols-3 gap-1" dir="ltr">
      {value.map((component, index) => (
        <NumberInput
          key={index}
          step={0.5}
          aria-label={`${label} ${'xyz'[index] ?? ''}`}
          value={component}
          onValueChange={(next) => {
            const copy: Vec3 = [...value];
            copy[index] = next;
            onChange(copy);
          }}
        />
      ))}
    </div>
  </Field>
);
