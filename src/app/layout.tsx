import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import LayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "Tenchi S&OP - Sales & Operations Planning",
  description: "AI-powered Sales and Operations Planning platform for intelligent demand forecasting and inventory optimization",
};

// Check if Clerk is configured
const isClerkConfigured = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') &&
  process.env.CLERK_SECRET_KEY?.startsWith('sk_');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme) {
                    document.documentElement.setAttribute('data-theme', theme);
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased" style={{ background: '#080d1a' }}>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );

  // Only wrap with ClerkProvider if properly configured
  if (isClerkConfigured) {
    return (
      <ClerkProvider>
        {content}
      </ClerkProvider>
    );
  }

  // Fallback without auth
  console.warn('[Layout] Clerk not configured, running without authentication');
  return content;
}
