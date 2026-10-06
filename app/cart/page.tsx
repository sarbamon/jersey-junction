'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/shop');
  }, [router]);

  return null;
}
