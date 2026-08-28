'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-xl text-gray-500 font-semibold">Loading API Documentation...</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-white">
      <div className="pt-8 px-4 bg-white">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">PetPass SL API Documentation</h1>
        <p className="text-center text-gray-500 mb-8">
          Interactive documentation for the PetPass SL RESTful API. Use the &quot;Try it out&quot; buttons to test endpoints directly.
        </p>
      </div>
      <SwaggerUI url="/api/swagger" />
    </div>
  );
}
