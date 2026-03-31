'use client';

import { ComponentType, ReactNode, useEffect, useState } from 'react';

// Types for Clerk components
type ShowProps = { when: string; children: ReactNode };
type UserButtonProps = { appearance?: { elements?: Record<string, string> } };

// Check if we're in a Clerk-enabled environment
function isClerkEnabled(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: check env vars
    return !!(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') &&
      process.env.CLERK_SECRET_KEY?.startsWith('sk_')
    );
  }
  // Client-side: check if Clerk is loaded
  return !!(window as unknown as Record<string, unknown>).__clerk_internal_publishable_key ||
         document.querySelector('[data-clerk-loaded]') !== null;
}

// Hook to check Clerk status
export function useClerkStatus(): { isLoaded: boolean; isEnabled: boolean } {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkClerk = () => {
      const enabled = isClerkEnabled();
      setIsEnabled(enabled);
      setIsLoaded(true);
    };
    
    // Check immediately and after a short delay for hydration
    checkClerk();
    const timer = setTimeout(checkClerk, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return { isLoaded, isEnabled };
}

// Internal Clerk components (loaded dynamically)
let ClerkShow: ComponentType<ShowProps> | null = null;
let ClerkUserButton: ComponentType<UserButtonProps> | null = null;

// Try to load Clerk components
if (typeof window !== 'undefined' || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  try {
    const clerk = require('@clerk/nextjs');
    ClerkShow = clerk.Show;
    ClerkUserButton = clerk.UserButton;
  } catch {
    // Clerk not available
  }
}

// Safe Show component
export function Show({ when, children }: ShowProps): ReactNode {
  const { isLoaded, isEnabled } = useClerkStatus();
  
  // During SSR/hydration, render nothing until we know Clerk status
  if (!isLoaded) return null;
  
  // If Clerk is not enabled, always show content (demo mode treats everyone as signed out)
  if (!isEnabled) {
    return when === 'signed-out' ? children : null;
  }

  // Clerk is enabled - use the real component
  if (!ClerkShow) return null;
  return <ClerkShow when={when}>{children}</ClerkShow>;
}

// Safe UserButton component
export function UserButton(props: UserButtonProps): ReactNode {
  const { isLoaded, isEnabled } = useClerkStatus();
  
  if (!isLoaded || !isEnabled || !ClerkUserButton) return null;

  return <ClerkUserButton {...props} />;
}
