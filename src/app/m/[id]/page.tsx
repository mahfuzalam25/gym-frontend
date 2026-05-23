import { Metadata } from 'next';
import MachinePageClient from './MachinePageClient';

// --- PWA Metadata ---
// This tells iOS/Android to treat this page like a native app
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
    userScalable: false, // Prevents zooming, making it feel more like a native app
  },
};

export default function Page() {
  // This loads all of your unchanged design and logic from the other file!
  return <MachinePageClient />;
}