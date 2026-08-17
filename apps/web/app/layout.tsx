import type { Metadata } from 'next';
import './globals.css';
import AppLayoutWrapper from './AppLayoutWrapper';

export const metadata: Metadata = {
  title: 'Enlight Sales OS — Automated Draft Invoice Generation System',
  description: 'AI-Powered Invoice Automation, Validation & Accounting System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}
