import { redirect } from 'next/navigation';

type LegacyProjectParams = {
  params: {
    id: string;
    segments?: string[];
  };
};

export default function LegacyProjectRouteRedirect({ params }: LegacyProjectParams) {
  const { id, segments = [] } = params;
  const suffix = segments.length ? `/${segments.join('/')}` : '';

  redirect(`/app/project/${id}${suffix}`);
}
