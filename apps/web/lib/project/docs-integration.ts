import { useCallback } from 'react';
import { toast } from '@/lib/ui/toast';
import { useUI } from '@/stores/ui';
import type { WizardSelection } from './create-wizard-schemas';

// [PLAN:S3-docs] Placeholder hook for Documents integration entrypoint.
export function useProjectDocsIntegration() {
  const openDrawer = useUI((state) => state.openDrawer);

  return useCallback(
    (selection: WizardSelection) => {
      const payload = {
        mode: selection.mode,
        template: selection.templateId
      };
      console.info('[wizard] Запрошена интеграция документов', payload);
      openDrawer('document');
      toast('Документ проекта открыт в правой панели', 'info');
    },
    [openDrawer]
  );
}
