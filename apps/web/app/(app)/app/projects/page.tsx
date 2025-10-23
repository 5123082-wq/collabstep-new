import FeatureComingSoon from '@/components/app/FeatureComingSoon';
import { isFeatureEnabled } from '@/lib/utils';
import ProjectsOverviewPlaceholder from './projects-overview-placeholder';

export default function ProjectsOverviewPage() {
  const featureEnabled = isFeatureEnabled('FEATURE_PROJECTS_OVERVIEW');

  if (!featureEnabled) {
    return (
      <FeatureComingSoon
        title="Обзор проектов скоро откроется"
        description="Мы собираем данные о проектах и готовим новый интерфейс. Как только раздел будет готов, здесь появится полный список инициатив."
      />
    );
  }

  return <ProjectsOverviewPlaceholder />;
}
