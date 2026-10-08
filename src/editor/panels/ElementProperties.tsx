import { Copy, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SceneElement } from '../../shared/schema';
import { useEditorStore } from '../store/editorStore';
import { useProject } from '../store/selectors';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AnimationTab } from './AnimationTab';
import { FieldControl } from './FieldControl';
import { fieldsFor, type FieldDescriptor, type FieldValue } from './fieldDescriptors';
import { FontPicker } from './text/FontPicker';
import { ChartItemsEditor } from './science/ChartItemsEditor';
import { DiagramParamsEditor } from './science/DiagramParamsEditor';
import { MathEditor } from './science/MathEditor';
import { PlotEditor } from './science/PlotEditor';
import { RichTextEditor } from './text/RichTextEditor';
import { SimulationEditor } from './simulation/SimulationEditor';
import { Scene3DEditor } from './three/Scene3DEditor';
import { StylePresetPicker } from './text/StylePresetPicker';
import { SuggestedDuration } from './text/SuggestedDuration';
import { TextEffectsEditor } from './text/TextEffectsEditor';

type Props = { element: SceneElement; fps: number };

/** Propriétés de l'élément sélectionné : Contenu · Style · Animation. */
export const ElementProperties = ({ element, fps }: Props) => {
  const { t } = useTranslation();
  const { format } = useProject();
  const updateElement = useEditorStore((state) => state.updateElement);
  const removeElement = useEditorStore((state) => state.removeElement);
  const duplicateElement = useEditorStore((state) => state.duplicateElement);
  const fields = fieldsFor(element);

  const onChange = (descriptor: FieldDescriptor<SceneElement>, value: FieldValue) =>
    updateElement(element.id, (draft) => descriptor.set(draft, value));

  const renderTab = (tab: 'content' | 'style') =>
    fields
      .filter((descriptor) => descriptor.tab === tab)
      .map((descriptor) => (
        <FieldControl
          key={descriptor.id}
          descriptor={descriptor}
          element={element}
          fps={fps}
          onChange={onChange}
        />
      ));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 p-3">
        <h2 className="text-sm font-semibold">{t(`elementTypes.${element.type}`)}</h2>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => duplicateElement(element.id)}
            aria-label={t('properties.duplicate')}
          >
            <Copy size={16} aria-hidden />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => removeElement(element.id)}
            aria-label={t('properties.delete')}
            data-testid="delete-element"
          >
            <Trash2 size={16} aria-hidden />
          </Button>
        </div>
      </div>
      <Tabs defaultValue="content" className="flex min-h-0 flex-1 flex-col">
        <TabsList>
          <TabsTrigger value="content">{t('properties.content')}</TabsTrigger>
          <TabsTrigger value="style">{t('properties.style')}</TabsTrigger>
          <TabsTrigger value="animation">{t('properties.animation')}</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="flex flex-col gap-3">
          {element.type === 'text' || element.type === 'callout' ? (
            <RichTextEditor element={element} />
          ) : null}
          {element.type === 'math' ? <MathEditor element={element} fps={fps} /> : null}
          {element.type === 'plot2d' ? <PlotEditor element={element} fps={fps} /> : null}
          {element.type === 'chart' ? <ChartItemsEditor element={element} /> : null}
          {element.type === 'diagram' ? <DiagramParamsEditor element={element} /> : null}
          {element.type === 'scene3d' ? <Scene3DEditor element={element} fps={fps} /> : null}
          {element.type === 'simulation' ? <SimulationEditor element={element} fps={fps} /> : null}
          {element.type === 'text' ? <SuggestedDuration element={element} fps={fps} /> : null}
          {renderTab('content')}
        </TabsContent>
        <TabsContent value="style" className="flex flex-col gap-4">
          {element.type === 'text' ? <StylePresetPicker element={element} format={format} /> : null}
          {element.type === 'text' ? <FontPicker element={element} /> : null}
          <div className="grid grid-cols-2 content-start gap-3">{renderTab('style')}</div>
          {element.type === 'text' ? <TextEffectsEditor element={element} /> : null}
        </TabsContent>
        <TabsContent value="animation">
          <AnimationTab element={element} fps={fps} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
