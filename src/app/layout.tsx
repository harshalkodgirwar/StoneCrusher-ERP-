import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StoneCrusher ERP | Industrial Production & Weighbridge Control',
  description:
    'Internal Command ERP for Stone Crusher Operations, Weighbridge Automation, FIFO Queue Dispatch, and Decoupled WhatsApp external communication.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
