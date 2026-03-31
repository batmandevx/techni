'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

// Check if Clerk is configured
const isClerkConfigured = 
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') &&
  process.env.CLERK_SECRET_KEY?.startsWith('sk_');

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  const [ClerkProvider, setClerkProvider] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only try to load Clerk on client side and if configured
    if (isClerkConfigured && typeof window !== 'undefined') {
      import('@clerk/nextjs')
        .then((clerk) => {
          setClerkProvider(() => clerk.ClerkProvider);
          setIsLoaded(true);
        })
        .catch(() => {
          console.warn('[Clerk] Failed to load ClerkProvider');
          setIsLoaded(true);
        });
    } else {
      setIsLoaded(true);
    }
  }, []);

  // Show nothing during initial load to prevent hydration mismatch
  if (!isLoaded) {
    return <>{children}</>;
  }

  // If Clerk is not loaded/configured, render children without wrapper
  if (!ClerkProvider) {
    return <>{children}</>;
  }

  // Render with ClerkProvider
  return <ClerkProvider>{children}</ClerkProvider>;
}

// Export for use in other components
export { isClerkConfigured };
