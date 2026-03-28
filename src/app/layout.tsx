import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import LayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "Tenchi S&OP - Sales & Operations Planning",
  description: "AI-powered Sales and Operations Planning platform for intelligent demand forecasting and inventory optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#0f172a',
          colorText: '#ffffff',
          colorInputBackground: '#1e293b',
          colorInputText: '#ffffff',
        },
        elements: {
          formButtonPrimary: 'bg-indigo-500 hover:bg-indigo-600',
          card: 'bg-slate-900 border border-slate-800',
          headerTitle: 'text-white',
          headerSubtitle: 'text-slate-400',
          formFieldLabel: 'text-slate-300',
          formFieldInput: 'bg-slate-800 border-slate-700 text-white',
          footerActionLink: 'text-indigo-400 hover:text-indigo-300',
        },
      }}
    >
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
    </ClerkProvider>
  );
}
