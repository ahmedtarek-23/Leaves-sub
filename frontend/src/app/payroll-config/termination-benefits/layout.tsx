'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function TerminationBenefitsContent({
  children,
  create,
  edit,
  status,
}: {
  children: React.ReactNode;
  create: React.ReactNode;
  edit: React.ReactNode;
  status: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const hasOverlay = searchParams.get('create') === 'true' || 
                     searchParams.get('edit') || 
                     searchParams.get('status');

  return (
    <>
      <div className={hasOverlay ? 'blur-sm pointer-events-none transition-all duration-200' : 'transition-all duration-200'}>
        {children}
      </div>
      {create}
      {edit}
      {status}
    </>
  );
}

export default function TerminationBenefitsLayout({
  children,
  create,
  edit,
  status,
}: {
  children: React.ReactNode;
  create: React.ReactNode;
  edit: React.ReactNode;
  status: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>{children}{create}{edit}{status}</>}>
      <TerminationBenefitsContent create={create} edit={edit} status={status}>
        {children}
      </TerminationBenefitsContent>
    </Suspense>
  );
}

