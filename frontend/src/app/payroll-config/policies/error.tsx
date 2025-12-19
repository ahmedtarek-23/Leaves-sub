'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function PoliciesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Policies Error:', error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md border border-red-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Policies</h2>
        <p className="text-gray-600 mb-6">{error.message || 'An error occurred'}</p>
        <Button onClick={reset} variant="default">Try again</Button>
      </div>
    </div>
  );
}

