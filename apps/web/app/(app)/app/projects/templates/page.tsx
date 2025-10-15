import AppSection from '@/components/app/AppSection';

export default function ProjectTemplatesPage() {
  return (
    <AppSection
      title="Шаблоны проектов"
      description="Готовые шаблоны стартов, спринтов и командных ритуалов."
      actions={[
        { label: 'Создать шаблон', message: 'TODO: Создать шаблон проекта' },
        { label: 'Поделиться шаблоном', message: 'TODO: Поделиться шаблоном' }
      ]}
    />
  );
}
