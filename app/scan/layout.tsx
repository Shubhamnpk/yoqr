import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scan QR Codes - YOQR | Free QR Code Scanner Online',
  description: 'Scan QR codes instantly with your camera. Support for all QR code types including URLs, text, WiFi, contacts, and more. Privacy-focused, no data collection.',
  keywords: 'scan qr code, qr code scanner, qr code reader, online qr scanner, free qr scanner, camera qr scanner, qr code detector',
  openGraph: {
    title: 'Scan QR Codes - YOQR | Free QR Code Scanner Online',
    description: 'Scan QR codes instantly with your camera. Support for all QR code types. Privacy-focused.',
    url: 'https://yoqr.netlify.app/scan',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scan QR Codes - YOQR',
    description: 'Scan QR codes instantly with your camera',
  },
  alternates: {
    canonical: 'https://yoqr.netlify.app/scan',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}