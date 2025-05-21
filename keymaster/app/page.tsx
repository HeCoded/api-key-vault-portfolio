'use client';

import { KeyMaster } from "./components/keymaster";
import { useEffect, useState } from 'react';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <KeyMaster />
    </div>
  );
}
