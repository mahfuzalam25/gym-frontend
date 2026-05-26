import { Metadata } from 'next';
import MachinePageClient from './MachinePageClient';

export const metadata: Metadata = {
  title: 'Gym Instructions',
  description: 'Interactive machine instructions and video tutorials.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gym QR',
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: '#f4f5f7',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function Page() {
  return <MachinePageClient />;
}