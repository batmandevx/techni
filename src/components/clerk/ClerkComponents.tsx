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

// Internal Clerk components - loaded lazily only when needed
let ClerkShow: ComponentType<ShowProps> | null = null;
let ClerkUserButton: ComponentType<UserButtonProps> | null = null;
let clerkLoaded = false;

// Function to load Clerk components dynamically
function loadClerkComponents() {
  if (clerkLoaded) return;
  if (typeof window === 'undefined') return;
  
  try {
    // Only try to load if Clerk seems to be enabled
    if (!isClerkEnabled()) {
      clerkLoaded = true;
      return;
    }
    
    const clerk = require('@clerk/nextjs');
    ClerkShow = clerk.Show;
    ClerkUserButton = clerk.UserButton;
    clerkLoaded = true;
  } catch {
    // Clerk not available
    clerkLoaded = true;
  }
}

// Safe Show component - NEVER uses Clerk hooks internally
export function Show({ when, children }: ShowProps): ReactNode {
  const { isLoaded, isEnabled } = useClerkStatus();
  
  // During SSR/hydration, render nothing until we know Clerk status
  if (!isLoaded) return null;
  
  // If Clerk is not enabled, always show content (demo mode treats everyone as signed out)
  if (!isEnabled) {
    return when === 'signed-out' ? children : null;
  }

  // Clerk is enabled - load components and use them
  loadClerkComponents();
  
  if (!ClerkShow) {
    // Clerk enabled but components failed to load
    return when === 'signed-out' ? children : null;
  }
  
  // Only render Clerk component on client side
  if (typeof window === 'undefined') return null;
  
  return <ClerkShow when={when}>{children}</ClerkShow>;
}

// Safe UserButton component - NEVER uses Clerk hooks internally
export function UserButton(props: UserButtonProps): ReactNode {
  const { isLoaded, isEnabled } = useClerkStatus();
  
  if (!isLoaded || !isEnabled) return null;

  // Clerk is enabled - load components
  loadClerkComponents();
  
  if (!ClerkUserButton) return null;
  
  // Only render on client side
  if (typeof window === 'undefined') return null;
  
  return <ClerkUserButton {...props} />;
}

// Hook to get auth state safely
export function useSafeAuth() {
  const { isLoaded, isEnabled } = useClerkStatus();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!isEnabled || !isLoaded) {
      setIsSignedIn(false);
      setUser(null);
      return;
    }

    // Try to get Clerk's auth state
    try {
      const clerk = (window as any).Clerk;
      if (clerk) {
        setIsSignedIn(!!clerk.user);
        setUser(clerk.user);
      }
    } catch {
      setIsSignedIn(false);
      setUser(null);
    }
  }, [isEnabled, isLoaded]);

  return { isLoaded, isEnabled, isSignedIn, user };
}
