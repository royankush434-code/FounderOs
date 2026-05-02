import type { Metadata } from 'next';
import { DM_Sans, Syne } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';

const dmSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FounderOS | Startup Validation AI',
  description: 'Know if your startup idea will succeed before you build it.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
      </head>
      <body className={`${dmSans.variable} ${syne.variable} font-sans antialiased selection:bg-[#ff4d2e] selection:text-white`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}