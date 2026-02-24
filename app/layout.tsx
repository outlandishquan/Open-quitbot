import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeToggle/ThemeProvider';

export const metadata: Metadata = {
  title: 'OpenGradient IQ Board',
  description:
    'Gamified IQ + protocol literacy quiz — test yourself, get your rank, share your card.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
